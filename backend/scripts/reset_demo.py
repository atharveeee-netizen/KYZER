"""Demo reset: wipes only the two tables live testing/demo traffic writes to
(inventory_batches, inventory_ledger) and reseeds from ai_engine/data.

Deliberately leaves facilities, item_masters, facility_beds, and
staff_attendance untouched - the last two are upserted by (facility_id) /
(facility_id, record_date) in app.seed_data, so run_seed() below overwrites
whatever a demo run left there back to canonical seed values without needing
a truncate.

inventory_batches needs the truncate for a different reason: app.seed_data's
seed_inventory_batches() does a plain INSERT with no ON CONFLICT clause (it's
written for an empty table), so rerunning it against a table already holding
FEFO-reserved or OCR-committed rows would hit uq_batches_natural_key and
fail. inventory_ledger is truncated in the same statement because it holds
an FK to inventory_batches.batch_id (backend/db/schema.sql) - Postgres
refuses to truncate a referenced table unless the referencing table is
truncated in the same statement too.

Run with uvicorn stopped or running (TRUNCATE only touches these two tables,
nothing else is locked):

    .venv/bin/python scripts/reset_demo.py
"""
import asyncio
import os
import sys
from pathlib import Path

import asyncpg

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.seed_data import run_seed  # noqa: E402


def load_dotenv(path: Path) -> None:
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


async def main() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        load_dotenv(env_path)

    dsn = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn=dsn)

    try:
        print("Truncating inventory_ledger + inventory_batches (single statement, FK-ordered)...")
        await conn.execute("TRUNCATE TABLE inventory_ledger, inventory_batches;")

        print("Reseeding from ai_engine/data...")
        await run_seed(conn)
    finally:
        await conn.close()

    print("Demo reset complete: medicines/ledger restored to seed baseline, "
          "facilities/beds/staff untouched.")


if __name__ == "__main__":
    asyncio.run(main())
