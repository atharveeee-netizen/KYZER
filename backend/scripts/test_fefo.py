"""Standalone FEFO verification against the live endpoint + Neon (no pytest,
per the hackathon timeline). Run with uvicorn already up against Neon:

    .venv/bin/python scripts/test_fefo.py

1. Allocate across multiple batches, verify earliest expiry drawn first.
2. Request more than total available stock, verify clean rollback: no
   partial batch updates, no partial ledger rows.

Picks a fresh, never-yet-reserved (facility, item) pair with exactly 3
batches on each run, so it stays rerunnable for regression testing without
being tripped up by state a previous run left behind.
"""
import asyncio
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

import asyncpg

BASE_URL = "http://localhost:8000"


def load_dotenv(path: Path) -> None:
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def post(path: str, body: dict) -> tuple[int, dict]:
    req = urllib.request.Request(
        BASE_URL + path,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


async def snapshot(conn, facility_id, item_code):
    batches = await conn.fetch(
        "SELECT batch_id, batch_number, quantity_available, quantity_reserved, expiry_date "
        "FROM inventory_batches WHERE facility_id=$1 AND item_code=$2 ORDER BY expiry_date",
        facility_id, item_code,
    )
    ledger = await conn.fetch(
        "SELECT ledger_id, transaction_type, batch_id, batch_number, quantity "
        "FROM inventory_ledger WHERE from_facility_id=$1 AND item_code=$2",
        facility_id, item_code,
    )
    return batches, ledger


async def pick_untouched_triple_batch_pair(conn) -> tuple[str, str]:
    row = await conn.fetchrow("""
        SELECT facility_id, item_code
        FROM inventory_batches
        GROUP BY facility_id, item_code
        HAVING COUNT(*) = 3 AND SUM(quantity_reserved) = 0
        ORDER BY facility_id, item_code
        LIMIT 1
    """)
    if row is None:
        sys.exit("No untouched 3-batch (facility, item) pair left to test with — "
                 "reseed the database (safe/idempotent) to reset quantity_reserved.")
    return row["facility_id"], row["item_code"]


async def main():
    load_dotenv(Path("backend/.env") if Path("backend/.env").exists() else Path(".env"))
    dsn = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn=dsn)

    FACILITY, ITEM = await pick_untouched_triple_batch_pair(conn)

    print(f"=== TEST 1: allocation spanning multiple batches ({FACILITY}/{ITEM}) ===")
    batches_before, ledger_before = await snapshot(conn, FACILITY, ITEM)
    print("Batches before (earliest expiry first):")
    for b in batches_before:
        print(f"  {b['batch_number']:20s} avail={b['quantity_available']:5d} reserved={b['quantity_reserved']:5d} expiry={b['expiry_date']}")

    # Request enough to fully drain the first two batches and dip into the third.
    b1, b2 = batches_before[0], batches_before[1]
    request_qty = b1["quantity_available"] + b2["quantity_available"] + 1
    print(f"\nPOST /api/v1/inventory/allocate quantity={request_qty} (= batch1 + batch2 + 1)")
    status, resp = post("/api/v1/inventory/allocate", {
        "facility_id": FACILITY, "item_code": ITEM, "quantity": request_qty,
    })
    print(f"HTTP {status}")
    print(json.dumps(resp, indent=2))

    assert status == 200, "expected success"
    allocs = resp["allocations"]
    assert len(allocs) == 3, f"expected 3 batches touched, got {len(allocs)}"
    assert allocs[0]["batch_number"] == b1["batch_number"] and allocs[0]["allocated_qty"] == b1["quantity_available"]
    assert allocs[1]["batch_number"] == b2["batch_number"] and allocs[1]["allocated_qty"] == b2["quantity_available"]
    assert allocs[2]["allocated_qty"] == 1
    print("\nASSERTIONS PASSED: earliest-expiry batches fully drained first, third batch supplied the remainder.")

    batches_after, ledger_after = await snapshot(conn, FACILITY, ITEM)
    print("\nBatches after:")
    for b in batches_after:
        print(f"  {b['batch_number']:20s} avail={b['quantity_available']:5d} reserved={b['quantity_reserved']:5d} expiry={b['expiry_date']}")
    new_ledger_ids = {r["ledger_id"] for r in ledger_after} - {r["ledger_id"] for r in ledger_before}
    print(f"\nNew inventory_ledger rows ({len(new_ledger_ids)}):")
    for r in ledger_after:
        if r["ledger_id"] in new_ledger_ids:
            print(f"  ledger_id={r['ledger_id']} type={r['transaction_type']} batch_id={r['batch_id']} batch_number={r['batch_number']} qty={r['quantity']}")
    assert len(new_ledger_ids) == 3, "expected exactly 3 new ledger rows, one per batch touched"

    print(f"\n=== TEST 2: insufficient stock rolls back cleanly ({FACILITY}/{ITEM}) ===")
    batches_before2, ledger_before2 = await snapshot(conn, FACILITY, ITEM)
    total_available = sum(b["quantity_available"] for b in batches_before2)
    over_request = total_available + 100000
    print(f"Total available now: {total_available}. Requesting {over_request} (guaranteed insufficient).")
    status, resp = post("/api/v1/inventory/allocate", {
        "facility_id": FACILITY, "item_code": ITEM, "quantity": over_request,
    })
    print(f"HTTP {status}")
    print(json.dumps(resp, indent=2))
    assert status == 409, f"expected 409 Conflict, got {status}"

    batches_after2, ledger_after2 = await snapshot(conn, FACILITY, ITEM)
    assert batches_after2 == batches_before2, "batches changed after a failed allocation — rollback broken!"
    assert len(ledger_after2) == len(ledger_before2), "ledger rows appeared after a failed allocation — partial write!"
    print("\nASSERTIONS PASSED: no batch quantities changed, no ledger rows written after the failed allocation.")

    await conn.close()
    print("\nALL TESTS PASSED.")


asyncio.run(main())
