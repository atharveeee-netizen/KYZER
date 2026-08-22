#!/usr/bin/env python3
"""KYZER demo rehearsal driver.

Drives and verifies two independent live demo sequences against the DEPLOYED
kyzer-db-service, so each can be rehearsed and then run again, identically,
during recording:

  run  - stock drawdown -> P0 alert -> redistribution suggestion, on
         PHC-PUN-002/MED-PCM-500 (single-batch, no FEFO split to show).
  fefo - a clean two-batch FEFO split on PHC-PUN-001/MED-PCM-500 (three
         batches, staggered expiry), for the FEFO slide `run` can't provide.

Standalone script - not a FastAPI route, not imported by the backend. Talks to
the deployed service over HTTPS (stdlib urllib) for everything that already
has an endpoint, and to Neon directly (asyncpg) only for the things no
endpoint exposes: reading facility_item_consumption.avg_daily_consumption
(`run`'s Stage 2 arithmetic), reading individual batch rows (`fefo`'s Stage 1
and Stage 4 - /api/v1/facilities only reports aggregate current_stock_pcm500,
not per-batch state), and reversing an /inventory/allocate call for either
pair. There is no unreserve/transfer endpoint in this build - allocate_fefo_stock
(backend/db/schema.sql) only ever moves stock from quantity_available into
quantity_reserved and writes a RESERVE ledger row; nothing reverses that. So
without `reset`, a `run` or `fefo` spends the only rehearsal its facility has
before someone has to fix the DB by hand.

`reset` restores whichever of the two demos have pending state - one, both, or
neither - in a single transaction, and is safe to call when only one was run.

Usage:
    python scripts/demo_drawdown.py run
    python scripts/demo_drawdown.py fefo
    python scripts/demo_drawdown.py reset

Requires: asyncpg (`pip install asyncpg`). Everything else is stdlib.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

import asyncpg

BASE_URL = "https://kyzer-db-service.onrender.com"
FACILITY_ID = "PHC-PUN-002"
ITEM_CODE = "MED-PCM-500"

# 2.5 days, not e.g. 2.9: comfortably under the 3-day CRITICAL_STOCKOUT_THRESHOLD_DAYS
# (ai_engine/config.py, cited by name - Service A never imports ai_engine) so the
# resulting days_to_stockout reads clearly as P0 on camera, not borderline.
TARGET_DAYS_REMAINING = 2.5

# The known-clean baseline for PHC-PUN-002/MED-PCM-500 - all 18 seeded facilities
# start in P3_NORMAL/P2_SURPLUS with no stockout in the seeded consumption history.
# `run` refuses to proceed if the live state doesn't match this: it means a
# previous run's allocation was never reset, so drawing down further would
# corrupt the arithmetic (and the ledger-window scoping `reset` depends on).
EXPECTED_BASELINE_STOCK = 1450
EXPECTED_BASELINE_TIER = "P2_SURPLUS"

# Arbitrary and only used to exercise /redistribution/suggest's read-only
# donor search (it doesn't reserve anything) - both known donors' available
# stock is >100, so any modest value clears the b.quantity_available >= needed_qty
# filter in both the domestic and cross-border queries without tuning it further.
NEEDED_QTY_FOR_SUGGEST = 50

DOMESTIC_DONOR_ID = "PHC-PUN-004"
DOMESTIC_DONOR_KM = 9.8
CROSS_BORDER_DONOR_ID = "CHC-TSH-004"
# ~6,970 km per spec; PostGIS ST_Distance on this fixed 18-facility dataset is
# deterministic, the range only absorbs float-formatting/rounding slack.
CROSS_BORDER_DONOR_KM_RANGE = (6900.0, 7050.0)

# `fefo`'s pair: PHC-PUN-002/MED-PCM-500 has a single batch (see the Task 1
# analysis this was picked over), so it can't demonstrate FEFO batch-splitting.
# PHC-PUN-001/MED-PCM-500 has three - a deliberate second, independent demo
# target, same item so the on-camera story stays about one medicine.
FEFO_FACILITY_ID = "PHC-PUN-001"
FEFO_ITEM_CODE = "MED-PCM-500"

# Person 2's notebook trace was 784+116=900 (784 fully drains batch1, 116 is
# ~15% of a 784-unit batch2). That number is NOT reproduced here on purpose -
# per spec this is derived live as batch1_qty + roughly-half of batch2_qty,
# which will not equal 900 unless batch2 happens to be ~232 units. `fefo`
# prints both numbers side by side so the mismatch is visible, not silent.
FEFO_NOTEBOOK_REQUEST_QTY = 900
FEFO_NOTEBOOK_BATCH2_PULL = 116

STATE_FILE = Path(__file__).resolve().parent / ".demo_drawdown_state.json"
BACKEND_ENV_FILE = Path(__file__).resolve().parent.parent / "backend" / ".env"
FALLBACK_ENV_TXT = Path.home() / "Downloads" / "env.txt"
NEON_HOST = "ep-winter-star-azvhv4we.c-3.ap-southeast-1.aws.neon.tech"


# ---------------------------------------------------------------------------
# HTTP helpers (stdlib only - urllib, not requests)
# ---------------------------------------------------------------------------

def _http(method: str, path: str, body: dict | None = None, timeout: float = 90.0):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    start = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed = time.monotonic() - start
            return resp.status, json.loads(resp.read()), elapsed
    except urllib.error.HTTPError as exc:
        elapsed = time.monotonic() - start
        try:
            payload = json.loads(exc.read())
        except Exception:
            payload = {"detail": exc.reason}
        return exc.code, payload, elapsed
    except urllib.error.URLError as exc:
        elapsed = time.monotonic() - start
        return None, {"detail": str(exc.reason)}, elapsed


def get_json(path: str, timeout: float = 90.0):
    return _http("GET", path, timeout=timeout)


def post_json(path: str, body: dict, timeout: float = 90.0):
    return _http("POST", path, body, timeout=timeout)


def fatal(msg: str):
    print(f"\nFATAL: {msg}")
    sys.exit(1)


# ---------------------------------------------------------------------------
# DATABASE_URL resolution
# ---------------------------------------------------------------------------

def _parse_env_file(path: Path) -> dict:
    values = {}
    if not path.exists():
        return values
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def get_db_url() -> str:
    env = _parse_env_file(BACKEND_ENV_FILE)
    if env.get("DATABASE_URL"):
        return env["DATABASE_URL"]

    fallback = _parse_env_file(FALLBACK_ENV_TXT)
    user, password = fallback.get("PGUSER"), fallback.get("PGPASSWORD")
    if not user or not password:
        fatal(
            f"DATABASE_URL not found in {BACKEND_ENV_FILE} and PGUSER/PGPASSWORD "
            f"not found in {FALLBACK_ENV_TXT}. Can't reach Neon."
        )
    # Direct host, not -pooler: asyncpg's prepared statements break through pgbouncer.
    return f"postgresql://{user}:{password}@{NEON_HOST}/neondb?sslmode=require"


# ---------------------------------------------------------------------------
# State file (records what `run` / `fefo` did, so `reset` can undo exactly
# that and nothing else). Keyed by "facility_id|item_code" so the two demo
# pairs persist independently - either, both, or neither can be pending at
# once, and `reset` restores whatever it finds.
# ---------------------------------------------------------------------------

ALLOWED_PAIRS = {(FACILITY_ID, ITEM_CODE), (FEFO_FACILITY_ID, FEFO_ITEM_CODE)}


def _run_key(facility_id: str, item_code: str) -> str:
    return f"{facility_id}|{item_code}"


def _load_all_runs() -> dict:
    if not STATE_FILE.exists():
        return {}
    return json.loads(STATE_FILE.read_text())


def _write_all_runs(runs: dict):
    if runs:
        STATE_FILE.write_text(json.dumps(runs, indent=2))
    elif STATE_FILE.exists():
        STATE_FILE.unlink()


def save_run_state(facility_id: str, item_code: str, entry: dict):
    runs = _load_all_runs()
    runs[_run_key(facility_id, item_code)] = entry
    _write_all_runs(runs)


def load_pending_runs() -> dict:
    """All pending run entries, keyed by 'facility_id|item_code'. Refuses
    (rather than silently ignoring) any entry outside this script's two known
    pairs - same "no flags to widen scope" guarantee as before, extended to
    both pairs instead of hardcoded to one."""
    runs = _load_all_runs()
    for entry in runs.values():
        pair = (entry["facility_id"], entry["item_code"])
        if pair not in ALLOWED_PAIRS:
            fatal(
                f"State file contains an entry for {entry['facility_id']}/{entry['item_code']}, which is not "
                f"one of this script's two known pairs ({sorted(ALLOWED_PAIRS)}). Refusing to touch it."
            )
    return runs


def clear_run_state(facility_id: str, item_code: str):
    runs = _load_all_runs()
    runs.pop(_run_key(facility_id, item_code), None)
    _write_all_runs(runs)


# ---------------------------------------------------------------------------
# `run`
# ---------------------------------------------------------------------------

def wait_for_200(path: str, label: str, max_attempts: int = 4) -> dict:
    for attempt in range(1, max_attempts + 1):
        status, payload, elapsed = get_json(path)
        print(f"  [{label}] attempt {attempt}/{max_attempts}: status={status} in {elapsed:.1f}s")
        if status == 200:
            return payload
        if attempt < max_attempts:
            time.sleep(2)
    fatal(f"{label} never returned 200 after {max_attempts} attempts.")


def stage0_warmup():
    print("=== Stage 0: warm-up ===")
    print("Free-tier instance can cold-start in ~50s on the first call - that's expected, not a failure.\n")
    wait_for_200("/health", "GET /health")
    wait_for_200("/api/v1/facilities", "GET /api/v1/facilities")
    wait_for_200("/api/v1/alerts", "GET /api/v1/alerts")
    print("\nStage 0 OK - all three endpoints warm.\n")


def stage1_pre_state() -> int:
    print("=== Stage 1: pre-state ===")
    status, facilities, _ = get_json("/api/v1/facilities")
    if status != 200:
        fatal(f"/api/v1/facilities returned {status}: {facilities}")
    facility = next((f for f in facilities["facilities"] if f["facility_id"] == FACILITY_ID), None)
    if facility is None:
        fatal(f"{FACILITY_ID} not found in /api/v1/facilities response.")

    current_stock = facility["current_stock_pcm500"]
    days_to_stockout = facility["days_to_stockout"]
    risk_tier = facility["risk_tier"]
    print(f"  {FACILITY_ID}: current_stock_pcm500={current_stock}  days_to_stockout={days_to_stockout}  risk_tier={risk_tier}")

    status, alerts, _ = get_json("/api/v1/alerts")
    if status != 200:
        fatal(f"/api/v1/alerts returned {status}: {alerts}")
    print(f"  /api/v1/alerts: count={alerts['count']}")

    if current_stock != EXPECTED_BASELINE_STOCK or risk_tier != EXPECTED_BASELINE_TIER:
        fatal(
            f"pre-state is not the expected clean baseline ({EXPECTED_BASELINE_STOCK} units / "
            f"{EXPECTED_BASELINE_TIER}). Got current_stock_pcm500={current_stock}, risk_tier={risk_tier}.\n"
            f"       This means a previous `run` was never reset. Run "
            f"`python {Path(__file__).name} reset` first, then try again."
        )
    if alerts["count"] != 0:
        fatal(f"/api/v1/alerts count is {alerts['count']}, expected 0. A previous run was not reset.")

    print("\nStage 1 OK - clean baseline confirmed.\n")
    return current_stock


async def fetch_avg_daily_consumption(conn: asyncpg.Connection) -> float:
    row = await conn.fetchrow(
        "SELECT avg_daily_consumption FROM facility_item_consumption WHERE facility_id = $1 AND item_code = $2",
        FACILITY_ID, ITEM_CODE,
    )
    if row is None:
        fatal(f"No facility_item_consumption row for {FACILITY_ID}/{ITEM_CODE}.")
    return float(row["avg_daily_consumption"])


def stage2_compute_allocation(current_stock: int, avg_daily_consumption: float) -> int:
    print("=== Stage 2: compute drawdown (arithmetic, no calls yet) ===")
    # floor(), not round(): rounding up the remaining target would risk landing
    # the resulting days_to_stockout AT or just over the 3-day P0 line instead
    # of comfortably under it.
    remaining_target = math.floor(avg_daily_consumption * TARGET_DAYS_REMAINING)
    allocate_qty = current_stock - remaining_target
    resulting_days = remaining_target / avg_daily_consumption

    print(f"  current_stock_pcm500        = {current_stock}  (from live /api/v1/facilities)")
    print(f"  avg_daily_consumption       = {avg_daily_consumption:.4f} units/day  (from live facility_item_consumption)")
    print(f"  target_days_remaining       = {TARGET_DAYS_REMAINING}  (must read comfortably under the 3-day P0_CRITICAL line)")
    print(f"  remaining_target            = floor({avg_daily_consumption:.4f} * {TARGET_DAYS_REMAINING}) = {remaining_target} units")
    print(f"  allocate_qty                = current_stock - remaining_target = {current_stock} - {remaining_target} = {allocate_qty}")
    print(f"  resulting days_to_stockout  = remaining_target / avg_daily_consumption = {remaining_target} / {avg_daily_consumption:.4f} = {resulting_days:.2f} days")

    if not (0 < allocate_qty < current_stock):
        fatal(f"computed allocate_qty={allocate_qty} is out of range for current_stock={current_stock}.")
    if resulting_days >= 3:
        fatal(f"computed resulting days_to_stockout={resulting_days:.2f} is not under the 3-day threshold.")

    print("\nStage 2 OK.\n")
    return allocate_qty


def post_allocate(facility_id: str, item_code: str, quantity: int) -> dict:
    status, payload, elapsed = post_json("/api/v1/inventory/allocate", {
        "facility_id": facility_id,
        "item_code": item_code,
        "quantity": quantity,
    })
    print(f"  POST /api/v1/inventory/allocate -> {status} in {elapsed:.2f}s")
    if status != 200:
        fatal(f"allocate failed: {payload}")

    print(f"  status: {payload['status']}")
    print(f"  requested_quantity: {payload['requested_quantity']}")
    n = len(payload["allocations"])
    print(f"  FEFO split, earliest expiry drained first ({n} batch{'es' if n != 1 else ''}):")
    # width=20 matches `run`'s original fixed padding exactly for its short
    # "B240812"-style batch numbers; `fefo`'s much longer "SEED-..." names
    # (up to 31 chars) widen it automatically instead of getting truncated.
    width = max(20, max((len(a["batch_number"]) for a in payload["allocations"]), default=20))
    for i, alloc in enumerate(payload["allocations"], 1):
        print(f"    {i}. batch {alloc['batch_number']:<{width}} qty={alloc['allocated_qty']:>5}  expiry={alloc['expiry_date']}  batch_id={alloc['batch_id']}")
    return payload


def stage3_allocate(allocate_qty: int) -> dict:
    print("=== Stage 3: POST /api/v1/inventory/allocate ===")
    payload = post_allocate(FACILITY_ID, ITEM_CODE, allocate_qty)
    print("\nStage 3 OK.\n")
    return payload


def check(label: str, ok: bool, detail: str = "") -> bool:
    mark = "PASS" if ok else "FAIL"
    print(f"  [{mark}] {label}" + (f"  ({detail})" if detail else ""))
    return ok


def stage4_verify() -> bool:
    print("=== Stage 4: verify downstream effects ===")
    all_ok = True

    status, facilities, _ = get_json("/api/v1/facilities")
    facility = None
    if status == 200:
        facility = next((f for f in facilities["facilities"] if f["facility_id"] == FACILITY_ID), None)
    ok = bool(facility) and facility["risk_tier"] == "P0_CRITICAL" and facility["days_to_stockout"] < 3
    all_ok &= check(
        "GET /api/v1/facilities -> PHC-PUN-002 P0_CRITICAL, days_to_stockout < 3",
        ok,
        f"risk_tier={facility['risk_tier']} days_to_stockout={facility['days_to_stockout']}" if facility else f"status={status}",
    )

    status, alerts, _ = get_json("/api/v1/alerts")
    alert = None
    if status == 200 and alerts.get("count") == 1:
        alert = alerts["alerts"][0]
    ok = alert is not None and alert["severity"] == "P0" and alert["facility_id"] == FACILITY_ID
    all_ok &= check(
        "GET /api/v1/alerts -> count 1, severity P0, facility PHC-PUN-002",
        ok,
        f"count={alerts.get('count')}" + (f" severity={alert['severity']} facility_id={alert['facility_id']}" if alert else ""),
    )

    status, suggest, _ = get_json(
        f"/api/v1/redistribution/suggest?requesting_facility_id={FACILITY_ID}&item_code={ITEM_CODE}&needed_qty={NEEDED_QTY_FOR_SUGGEST}"
    )
    donor = suggest.get("suggested_donor") if status == 200 else None
    ok = bool(donor) and donor["facility_id"] == DOMESTIC_DONOR_ID and donor["distance_km"] == DOMESTIC_DONOR_KM
    all_ok &= check(
        f"GET /redistribution/suggest -> domestic donor {DOMESTIC_DONOR_ID} at {DOMESTIC_DONOR_KM} km",
        ok,
        f"donor={donor['facility_id']} distance_km={donor['distance_km']}" if donor else f"status={status}",
    )

    status, suggest_cb, _ = get_json(
        f"/api/v1/redistribution/suggest?requesting_facility_id={FACILITY_ID}&item_code={ITEM_CODE}"
        f"&needed_qty={NEEDED_QTY_FOR_SUGGEST}&allow_cross_border=true"
    )
    cb_donor = suggest_cb.get("cross_border_donor") if status == 200 else None
    ok = (
        bool(cb_donor)
        and cb_donor["facility_id"] == CROSS_BORDER_DONOR_ID
        and CROSS_BORDER_DONOR_KM_RANGE[0] <= cb_donor["distance_km"] <= CROSS_BORDER_DONOR_KM_RANGE[1]
    )
    all_ok &= check(
        f"GET /redistribution/suggest?allow_cross_border=true -> cross-border donor {CROSS_BORDER_DONOR_ID} at ~6,970 km",
        ok,
        f"donor={cb_donor['facility_id']} distance_km={cb_donor['distance_km']}" if cb_donor else f"status={status}",
    )

    print()
    if all_ok:
        print("Stage 4 OK - all downstream effects verified.\n")
    else:
        print("Stage 4: one or more checks FAILED - do not record yet, investigate first.\n")
    return all_ok


def cmd_run(_args):
    stage0_warmup()
    wall_start = time.monotonic()

    current_stock = stage1_pre_state()

    async def _stage23():
        db_url = get_db_url()
        conn = await asyncpg.connect(db_url)
        try:
            avg_daily_consumption = await fetch_avg_daily_consumption(conn)
            allocate_qty = stage2_compute_allocation(current_stock, avg_daily_consumption)

            # Window bounds come from Neon's own clock (via this connection), not
            # this machine's - the RESERVE ledger rows this run writes get their
            # created_at from the same server clock, so there's no local/remote
            # clock-skew risk when `reset` later scopes its DELETE by this window.
            window_start = await conn.fetchval("SELECT NOW()")
            payload = stage3_allocate(allocate_qty)
            window_end = await conn.fetchval("SELECT NOW()")

            save_run_state(FACILITY_ID, ITEM_CODE, {
                "facility_id": FACILITY_ID,
                "item_code": ITEM_CODE,
                "window_start": window_start.isoformat(),
                "window_end": window_end.isoformat(),
                "allocations": [
                    {"batch_id": a["batch_id"], "allocated_qty": a["allocated_qty"]}
                    for a in payload["allocations"]
                ],
            })
        finally:
            await conn.close()

    asyncio.run(_stage23())

    all_ok = stage4_verify()
    wall_elapsed = time.monotonic() - wall_start
    print(f"Total wall-clock for stages 1-4: {wall_elapsed:.1f}s")

    if not all_ok:
        sys.exit(1)


# ---------------------------------------------------------------------------
# `fefo`
# ---------------------------------------------------------------------------

async def fefo_stage1_pre_state(conn: asyncpg.Connection) -> list[dict]:
    print("=== Stage 1: pre-state (direct DB read - no per-batch API endpoint exists) ===")
    batches = await conn.fetch(
        """SELECT batch_id, batch_number, expiry_date, quantity_available, quantity_reserved
           FROM inventory_batches
           WHERE facility_id = $1 AND item_code = $2
           ORDER BY expiry_date ASC""",
        FEFO_FACILITY_ID, FEFO_ITEM_CODE,
    )
    if len(batches) < 2:
        fatal(f"{FEFO_FACILITY_ID}/{FEFO_ITEM_CODE} has fewer than 2 batches - can't demonstrate a multi-batch FEFO split.")

    for b in batches:
        print(f"  batch {b['batch_number']:<35} expiry={b['expiry_date']}  quantity_available={b['quantity_available']:>5}  quantity_reserved={b['quantity_reserved']}")

    if any(b["quantity_reserved"] != 0 for b in batches):
        fatal(
            f"{FEFO_FACILITY_ID}/{FEFO_ITEM_CODE} has nonzero quantity_reserved on at least one batch - "
            f"a previous `fefo` run was not reset. Run `python {Path(__file__).name} reset` first."
        )

    notebook_expected = [784, 784, 785]
    live_qtys = [b["quantity_available"] for b in batches[:3]]
    if live_qtys != notebook_expected:
        print(f"\n  Note: live quantities {live_qtys} differ from the notebook's {notebook_expected} - using the real numbers below.")

    print("\nStage 1 OK - clean baseline confirmed, batches read from live DB.\n")
    return [dict(b) for b in batches]


def fefo_stage2_compute(batches: list[dict]) -> tuple[int, int]:
    print("=== Stage 2: compute the two-batch split (arithmetic, no calls yet) ===")
    batch1, batch2, batch3 = batches[0], batches[1], batches[2]
    batch1_qty = batch1["quantity_available"]
    batch2_qty = batch2["quantity_available"]

    # "roughly half", per spec - NOT the notebook's fixed 900. See
    # FEFO_NOTEBOOK_REQUEST_QTY's comment: this will only equal 900 if
    # batch2_qty happens to be ~232, which it isn't for the current seed data.
    batch2_slice = batch2_qty // 2
    request_qty = batch1_qty + batch2_slice

    print(f"  batch1 ({batch1['batch_number']}, expiry {batch1['expiry_date']})  quantity_available = {batch1_qty}")
    print(f"  batch2 ({batch2['batch_number']}, expiry {batch2['expiry_date']})  quantity_available = {batch2_qty}")
    print(f"  batch3 ({batch3['batch_number']}, expiry {batch3['expiry_date']})  quantity_available = {batch3['quantity_available']}  (must stay untouched)")
    print(f"  batch2_slice  = floor(batch2_qty / 2) = floor({batch2_qty} / 2) = {batch2_slice}   (\"roughly half\", per spec)")
    print(f"  request_qty   = batch1_qty + batch2_slice = {batch1_qty} + {batch2_slice} = {request_qty}")
    print(f"  batch2 remaining after allocation = {batch2_qty} - {batch2_slice} = {batch2_qty - batch2_slice}")

    notebook_pull_pct = FEFO_NOTEBOOK_BATCH2_PULL / 784 * 100
    derived_pull_pct = batch2_slice / batch2_qty * 100 if batch2_qty else 0
    print(
        f"\n  Note: your notebook's trace was {784}+{FEFO_NOTEBOOK_BATCH2_PULL}={FEFO_NOTEBOOK_REQUEST_QTY} "
        f"(batch2 pull = {FEFO_NOTEBOOK_BATCH2_PULL}, {notebook_pull_pct:.1f}% of a 784-unit batch2) - not "
        f"\"roughly half\". This run uses the roughly-half derivation you specified instead: request_qty="
        f"{request_qty} (batch2_slice={batch2_slice}, {derived_pull_pct:.1f}% of batch2)."
    )

    if not (0 < request_qty < batch1_qty + batch2_qty):
        fatal(f"computed request_qty={request_qty} would not produce a clean two-batch split (batch1={batch1_qty}, batch2={batch2_qty}).")

    print("\nStage 2 OK.\n")
    return request_qty, batch2_slice


def fefo_stage3_allocate(request_qty: int) -> dict:
    print("=== Stage 3: POST /api/v1/inventory/allocate ===")
    payload = post_allocate(FEFO_FACILITY_ID, FEFO_ITEM_CODE, request_qty)
    print("\nStage 3 OK.\n")
    return payload


async def fefo_stage4_verify(conn: asyncpg.Connection, pre_batches: list[dict], payload: dict, batch2_slice: int) -> bool:
    print("=== Stage 4: verify the two-batch FEFO split ===")
    all_ok = True
    batch1, batch2, batch3 = pre_batches[0], pre_batches[1], pre_batches[2]
    allocations = payload["allocations"]

    ok = len(allocations) == 2
    all_ok &= check("exactly 2 batches touched (batch3 untouched by this allocation)", ok, f"got {len(allocations)}")

    ok1 = len(allocations) > 0 and allocations[0]["batch_id"] == str(batch1["batch_id"])
    all_ok &= check(
        "earliest-expiry batch (batch1) allocated first",
        ok1,
        f"allocations[0].batch_id={allocations[0]['batch_id'] if allocations else '?'} vs batch1.batch_id={batch1['batch_id']}",
    )

    ok2 = len(allocations) > 1 and allocations[1]["batch_id"] == str(batch2["batch_id"])
    all_ok &= check(
        "second-earliest-expiry batch (batch2) allocated second",
        ok2,
        f"allocations[1].batch_id={allocations[1]['batch_id'] if len(allocations) > 1 else '?'} vs batch2.batch_id={batch2['batch_id']}",
    )

    rows = await conn.fetch(
        """SELECT batch_id, quantity_available, quantity_reserved
           FROM inventory_batches WHERE facility_id = $1 AND item_code = $2""",
        FEFO_FACILITY_ID, FEFO_ITEM_CODE,
    )
    by_id = {str(r["batch_id"]): r for r in rows}

    b1_now = by_id[str(batch1["batch_id"])]
    ok = b1_now["quantity_available"] == 0 and b1_now["quantity_reserved"] == batch1["quantity_available"]
    all_ok &= check(
        "batch1 fully drained",
        ok,
        f"quantity_available={b1_now['quantity_available']} quantity_reserved={b1_now['quantity_reserved']}",
    )

    expected_b2_available = batch2["quantity_available"] - batch2_slice
    b2_now = by_id[str(batch2["batch_id"])]
    ok = (
        b2_now["quantity_available"] == expected_b2_available
        and 0 < b2_now["quantity_available"] < batch2["quantity_available"]
        and b2_now["quantity_reserved"] == batch2_slice
    )
    all_ok &= check(
        "batch2 partially consumed (not fully drained, not untouched)",
        ok,
        f"quantity_available={b2_now['quantity_available']} (expected {expected_b2_available}) quantity_reserved={b2_now['quantity_reserved']}",
    )

    b3_now = by_id[str(batch3["batch_id"])]
    ok = b3_now["quantity_available"] == batch3["quantity_available"] and b3_now["quantity_reserved"] == 0
    all_ok &= check(
        "batch3 untouched",
        ok,
        f"quantity_available={b3_now['quantity_available']} (expected {batch3['quantity_available']}) quantity_reserved={b3_now['quantity_reserved']}",
    )

    print()
    if all_ok:
        print("Stage 4 OK - clean two-batch FEFO split verified.\n")
    else:
        print("Stage 4: one or more checks FAILED - do not record yet, investigate first.\n")
    return all_ok


def cmd_fefo(_args):
    stage0_warmup()
    wall_start = time.monotonic()

    async def _stages1to4():
        db_url = get_db_url()
        conn = await asyncpg.connect(db_url)
        try:
            pre_batches = await fefo_stage1_pre_state(conn)
            request_qty, batch2_slice = fefo_stage2_compute(pre_batches)

            # Same clock-skew reasoning as `run`: window bounds come from
            # Neon's own clock via this connection, not this machine's.
            window_start = await conn.fetchval("SELECT NOW()")
            payload = fefo_stage3_allocate(request_qty)
            window_end = await conn.fetchval("SELECT NOW()")

            save_run_state(FEFO_FACILITY_ID, FEFO_ITEM_CODE, {
                "facility_id": FEFO_FACILITY_ID,
                "item_code": FEFO_ITEM_CODE,
                "window_start": window_start.isoformat(),
                "window_end": window_end.isoformat(),
                "allocations": [
                    {"batch_id": a["batch_id"], "allocated_qty": a["allocated_qty"]}
                    for a in payload["allocations"]
                ],
                # Recorded here (not hardcoded, since these quantities can
                # legitimately drift) so `reset` can verify the facility's
                # aggregate stock, not just individual batch rows.
                "expected_restored_total": sum(b["quantity_available"] for b in pre_batches),
            })

            return await fefo_stage4_verify(conn, pre_batches, payload, batch2_slice)
        finally:
            await conn.close()

    all_ok = asyncio.run(_stages1to4())
    wall_elapsed = time.monotonic() - wall_start
    print(f"Total wall-clock for stages 1-4: {wall_elapsed:.1f}s")

    if not all_ok:
        sys.exit(1)


# ---------------------------------------------------------------------------
# `reset`
# ---------------------------------------------------------------------------

async def do_reset(pending: dict):
    db_url = get_db_url()
    conn = await asyncpg.connect(db_url)
    try:
        print(f"This reset covers {len(pending)} pending demo(s), each scoped to its own facility/item/window only:\n")
        for entry in pending.values():
            fid, item = entry["facility_id"], entry["item_code"]
            allocations = entry["allocations"]
            window_start = datetime.fromisoformat(entry["window_start"])
            window_end = datetime.fromisoformat(entry["window_end"])
            print(f"  {fid}/{item} - {len(allocations)} batch(es):")
            for a in allocations:
                print(f"    batch_id {a['batch_id']}: quantity_available += {a['allocated_qty']}, quantity_reserved -= {a['allocated_qty']}")
            print(
                f"    DELETE FROM inventory_ledger WHERE transaction_type='RESERVE' "
                f"AND from_facility_id='{fid}' AND item_code='{item}'"
                f"\n      AND batch_id/quantity matching the {len(allocations)} row(s) above"
                f"\n      AND created_at BETWEEN {window_start.isoformat()} AND {window_end.isoformat()}\n"
            )
        print("(each pair's own window only - earlier RESERVE rows from other testing, and the other pair's rows, are untouched)\n")

        confirm = input("Type RESET to apply all of the above in one transaction: ")
        if confirm.strip() != "RESET":
            print("Aborted - no changes made.")
            sys.exit(1)

        async with conn.transaction():
            deleted_total = 0
            batches_touched = 0
            for entry in pending.values():
                fid, item = entry["facility_id"], entry["item_code"]
                window_start = datetime.fromisoformat(entry["window_start"])
                window_end = datetime.fromisoformat(entry["window_end"])
                for a in entry["allocations"]:
                    tag = await conn.execute(
                        """UPDATE inventory_batches
                           SET quantity_available = quantity_available + $1,
                               quantity_reserved = quantity_reserved - $1
                           WHERE batch_id = $2 AND facility_id = $3 AND item_code = $4""",
                        a["allocated_qty"], a["batch_id"], fid, item,
                    )
                    if tag != "UPDATE 1":
                        raise RuntimeError(f"expected to update exactly 1 batch row for {a['batch_id']}, got: {tag}")
                    batches_touched += 1

                    result = await conn.execute(
                        """DELETE FROM inventory_ledger
                           WHERE transaction_type = 'RESERVE'
                             AND batch_id = $1
                             AND quantity = $2
                             AND from_facility_id = $3
                             AND item_code = $4
                             AND created_at BETWEEN $5 AND $6""",
                        a["batch_id"], a["allocated_qty"], fid, item, window_start, window_end,
                    )
                    deleted_total += int(result.split()[-1])

        print(f"\nCommitted. {batches_touched} batch(es) restored across {len(pending)} demo(s), {deleted_total} ledger row(s) deleted.")
    finally:
        await conn.close()


def verify_reset(pending: dict) -> bool:
    print("\n=== Verifying reset against the live API ===")
    all_ok = True

    status, facilities, _ = get_json("/api/v1/facilities")
    fac_list = facilities["facilities"] if status == 200 else []

    for entry in pending.values():
        fid, item = entry["facility_id"], entry["item_code"]
        facility = next((f for f in fac_list if f["facility_id"] == fid), None)

        if (fid, item) == (FACILITY_ID, ITEM_CODE):
            # Unchanged guarantee: known-good hardcoded baseline for this pair.
            ok = bool(facility) and facility["current_stock_pcm500"] == EXPECTED_BASELINE_STOCK and facility["risk_tier"] == EXPECTED_BASELINE_TIER
            print(
                f"  GET /api/v1/facilities -> {fid}: "
                f"current_stock_pcm500={facility['current_stock_pcm500'] if facility else '?'} "
                f"risk_tier={facility['risk_tier'] if facility else '?'}  [{'PASS' if ok else 'FAIL'}]"
            )
        else:
            # No hardcoded baseline for this pair (quantities can drift per
            # spec) - verify against the total recorded at `fefo` time instead.
            expected_total = entry.get("expected_restored_total")
            ok = bool(facility) and facility["current_stock_pcm500"] == expected_total
            print(
                f"  GET /api/v1/facilities -> {fid}: "
                f"current_stock_pcm500={facility['current_stock_pcm500'] if facility else '?'} "
                f"(expected {expected_total})  [{'PASS' if ok else 'FAIL'}]"
            )
        all_ok = all_ok and ok

    status, alerts, _ = get_json("/api/v1/alerts")
    ok_alerts = status == 200 and alerts.get("count") == 0
    print(f"  GET /api/v1/alerts -> count={alerts.get('count')}  [{'PASS' if ok_alerts else 'FAIL'}]")
    all_ok = all_ok and ok_alerts

    return all_ok


def cmd_reset(_args):
    pending = load_pending_runs()
    if not pending:
        fatal(f"No pending demo state at {STATE_FILE} - nothing to reset (or it was already reset).")

    asyncio.run(do_reset(pending))

    if not verify_reset(pending):
        fatal(
            "reset committed in the DB but the live API doesn't show the clean baseline for at least one pair. "
            "State file kept (not cleared) so this can be investigated - do not run `run`/`fefo` again yet."
        )

    for entry in pending.values():
        clear_run_state(entry["facility_id"], entry["item_code"])
    print("\nReset verified - DB and live API are back to the clean baseline. State file cleared.\n")


# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("run", help="Drive the drawdown demo sequence against the deployed service.")
    sub.add_parser("fefo", help="Drive the two-batch FEFO split demo (PHC-PUN-001/MED-PCM-500) against the deployed service.")
    sub.add_parser("reset", help="Reverse any pending `run`/`fefo` allocations and restore the clean baseline.")
    args = parser.parse_args()

    if args.command == "run":
        cmd_run(args)
    elif args.command == "fefo":
        cmd_fefo(args)
    elif args.command == "reset":
        cmd_reset(args)


if __name__ == "__main__":
    main()
