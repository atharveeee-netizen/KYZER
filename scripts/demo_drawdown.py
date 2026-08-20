#!/usr/bin/env python3
"""CareDOM demo rehearsal driver.

Drives and verifies the live "stock drawdown -> P0 alert -> redistribution
suggestion" demo sequence against the DEPLOYED caredom-db-service, so the
sequence can be rehearsed and then run again, identically, during recording.

Standalone script - not a FastAPI route, not imported by the backend. Talks to
the deployed service over HTTPS (stdlib urllib) for everything that already
has an endpoint, and to Neon directly (asyncpg) only for the two things no
endpoint exposes: reading facility_item_consumption.avg_daily_consumption
(Stage 2's arithmetic) and reversing a `run`'s /inventory/allocate call. There
is no unreserve/transfer endpoint in this build - allocate_fefo_stock
(backend/db/schema.sql) only ever moves stock from quantity_available into
quantity_reserved and writes a RESERVE ledger row; nothing reverses that. So
without `reset`, a `run` spends the only rehearsal this facility has before
someone has to fix the DB by hand.

Usage:
    python scripts/demo_drawdown.py run
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

BASE_URL = "https://caredom-db-service.onrender.com"
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
# State file (records what a `run` did, so `reset` can undo exactly that and
# nothing else)
# ---------------------------------------------------------------------------

def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def load_state() -> dict:
    if not STATE_FILE.exists():
        fatal(f"No state file at {STATE_FILE} - nothing to reset (or it was already reset).")
    state = json.loads(STATE_FILE.read_text())
    if state["facility_id"] != FACILITY_ID or state["item_code"] != ITEM_CODE:
        fatal(
            f"State file references {state['facility_id']}/{state['item_code']}, "
            f"but this script only ever touches {FACILITY_ID}/{ITEM_CODE}. Refusing."
        )
    return state


def clear_state():
    if STATE_FILE.exists():
        STATE_FILE.unlink()


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


def stage3_allocate(allocate_qty: int) -> dict:
    print("=== Stage 3: POST /api/v1/inventory/allocate ===")
    status, payload, elapsed = post_json("/api/v1/inventory/allocate", {
        "facility_id": FACILITY_ID,
        "item_code": ITEM_CODE,
        "quantity": allocate_qty,
    })
    print(f"  POST /api/v1/inventory/allocate -> {status} in {elapsed:.2f}s")
    if status != 200:
        fatal(f"allocate failed: {payload}")

    print(f"  status: {payload['status']}")
    print(f"  requested_quantity: {payload['requested_quantity']}")
    n = len(payload["allocations"])
    print(f"  FEFO split, earliest expiry drained first ({n} batch{'es' if n != 1 else ''}):")
    for i, alloc in enumerate(payload["allocations"], 1):
        print(f"    {i}. batch {alloc['batch_number']:<20} qty={alloc['allocated_qty']:>5}  expiry={alloc['expiry_date']}  batch_id={alloc['batch_id']}")

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

            save_state({
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
# `reset`
# ---------------------------------------------------------------------------

async def do_reset(state: dict):
    db_url = get_db_url()
    conn = await asyncpg.connect(db_url)
    try:
        window_start = datetime.fromisoformat(state["window_start"])
        window_end = datetime.fromisoformat(state["window_end"])
        allocations = state["allocations"]

        print(f"This will change {len(allocations)} batch(es) for {FACILITY_ID}/{ITEM_CODE} only:\n")
        for a in allocations:
            print(f"  batch_id {a['batch_id']}: quantity_available += {a['allocated_qty']}, quantity_reserved -= {a['allocated_qty']}")
        print(
            f"\n  DELETE FROM inventory_ledger WHERE transaction_type='RESERVE' "
            f"AND from_facility_id='{FACILITY_ID}' AND item_code='{ITEM_CODE}'"
            f"\n    AND batch_id/quantity matching the {len(allocations)} row(s) above"
            f"\n    AND created_at BETWEEN {window_start.isoformat()} AND {window_end.isoformat()}"
            f"\n  (this run's own window only - earlier RESERVE rows from other testing are untouched)\n"
        )

        confirm = input("Type RESET to apply these changes: ")
        if confirm.strip() != "RESET":
            print("Aborted - no changes made.")
            sys.exit(1)

        async with conn.transaction():
            deleted_total = 0
            for a in allocations:
                tag = await conn.execute(
                    """UPDATE inventory_batches
                       SET quantity_available = quantity_available + $1,
                           quantity_reserved = quantity_reserved - $1
                       WHERE batch_id = $2 AND facility_id = $3 AND item_code = $4""",
                    a["allocated_qty"], a["batch_id"], FACILITY_ID, ITEM_CODE,
                )
                if tag != "UPDATE 1":
                    raise RuntimeError(f"expected to update exactly 1 batch row for {a['batch_id']}, got: {tag}")

                result = await conn.execute(
                    """DELETE FROM inventory_ledger
                       WHERE transaction_type = 'RESERVE'
                         AND batch_id = $1
                         AND quantity = $2
                         AND from_facility_id = $3
                         AND item_code = $4
                         AND created_at BETWEEN $5 AND $6""",
                    a["batch_id"], a["allocated_qty"], FACILITY_ID, ITEM_CODE, window_start, window_end,
                )
                deleted_total += int(result.split()[-1])

        print(f"\nCommitted. {len(allocations)} batch(es) restored, {deleted_total} ledger row(s) deleted.")
    finally:
        await conn.close()


def verify_reset() -> bool:
    print("\n=== Verifying reset against the live API ===")
    status, facilities, _ = get_json("/api/v1/facilities")
    facility = None
    if status == 200:
        facility = next((f for f in facilities["facilities"] if f["facility_id"] == FACILITY_ID), None)
    ok_fac = bool(facility) and facility["current_stock_pcm500"] == EXPECTED_BASELINE_STOCK and facility["risk_tier"] == EXPECTED_BASELINE_TIER
    print(
        f"  GET /api/v1/facilities -> {FACILITY_ID}: "
        f"current_stock_pcm500={facility['current_stock_pcm500'] if facility else '?'} "
        f"risk_tier={facility['risk_tier'] if facility else '?'}  [{'PASS' if ok_fac else 'FAIL'}]"
    )

    status, alerts, _ = get_json("/api/v1/alerts")
    ok_alerts = status == 200 and alerts.get("count") == 0
    print(f"  GET /api/v1/alerts -> count={alerts.get('count')}  [{'PASS' if ok_alerts else 'FAIL'}]")

    return ok_fac and ok_alerts


def cmd_reset(_args):
    state = load_state()
    asyncio.run(do_reset(state))

    if not verify_reset():
        fatal(
            "reset committed in the DB but the live API doesn't show the clean baseline. "
            "State file kept (not cleared) so this can be investigated - do not run `run` again yet."
        )

    clear_state()
    print("\nReset verified - DB and live API are back to the clean baseline. State file cleared.\n")


# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("run", help="Drive the drawdown demo sequence against the deployed service.")
    sub.add_parser("reset", help="Reverse the last `run`'s allocation and restore the clean baseline.")
    args = parser.parse_args()

    if args.command == "run":
        cmd_run(args)
    elif args.command == "reset":
        cmd_reset(args)


if __name__ == "__main__":
    main()
