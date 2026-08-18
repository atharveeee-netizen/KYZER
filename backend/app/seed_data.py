"""
BRICS multi-country seeder.

Loads real data shipped by Person 1 in `ai_engine/data/` — never invents
facility or stock numbers. Sources used, and exactly what is (and isn't)
real in each:

- `ai_engine/data/brics_facilities_seed.json`
    18 real facilities (IND/ZAF/BRA) with id, name, lat/lng, bed counts,
    staff establishment, and country. This is the canonical facility list.
    `region_state`/`district`/`facility_type` are NOT columns in that file;
    they are derived below from the facility_id prefix and the `is_dh` flag
    (the prefixes PHC-PUN- / CHC-TSH- / UBS-AMZ- and the Pune/Tshwane/Manaus
    district groupings come straight from the header comments in Person 1's
    `ai_engine/data/seed_generator.py`, not guessed).

- `ai_engine/data/brics_consumption_history_seed.csv`
    365 days x 18 facilities x 7 items of real consumption/stock history.
    We take the most recent `stock_remaining` per (facility, item) as the
    starting `quantity_available` for that pair — a real number from the
    seed data, not fabricated.

- `ai_engine/data/cached_registers/PHC-PUN-002.json`
    A real OCR-digitized register snapshot: exact batch numbers, expiry
    dates, quantities, bed occupancy and staff attendance for one facility
    on 2026-08-18. Used verbatim wherever it overlaps with the CSV/JSON
    above, since it is more precise (it's a real register read, not an
    aggregate). NOTE: the sibling cache file `PHC-Shirur-001.json` does not
    match any facility_id in brics_facilities_seed.json (closest is
    PHC-PUN-001, "Shirur Sub-District Hospital") — rather than guess that
    mapping, it is skipped. Flag this to Person 1 if it should line up.

Two fields the source data does not carry at all, because Postgres requires
them NOT NULL: `batch_number` and `expiry_date` for CSV-derived batches (no
per-batch bookkeeping exists in a daily consumption time series). These are
filled with an explicit, clearly-synthetic convention rather than left
blank — called out here so it's never mistaken for real batch data.

To demonstrate FEFO (allocate_fefo_stock in db/schema.sql needs multiple
batches per facility/item to have anything to order by expiry), each
CSV-derived pair's single `stock_remaining` total is split into 1-3 batches
by `_split_batches()` below: the parts always sum to exactly the original
total (nothing invented), batch numbers get a `-1`/`-2`/`-3` suffix, and
expiry dates are staggered via `SYNTHETIC_EXPIRY_OFFSETS_DAYS` so ORDER BY
expiry_date ASC has something meaningful to demonstrate. The 5 real
OCR-derived batches (PHC-PUN-002) are deliberately left unsplit — that
register recorded one real batch reading per item, and splitting it would
fabricate batch-level detail the source document doesn't contain.

Batch inserts use ON CONFLICT (facility_id, item_code, batch_number) DO
NOTHING so reseeding is always additive, never destructive: once real OCR
ingest starts writing rows for facilities beyond PHC-PUN-002, a rerun of
this seeder must not be able to touch them. The one exception is a
one-time, narrowly-targeted delete of the pre-split single-batch rows this
seeder itself used to write (exact match on the old `SEED-<facility>-
<item>` name, no suffix) — needed so an already-seeded database doesn't end
up with both the old single batch and the new split batches double-counting
the same stock. It only ever matches this seeder's own old naming, never a
real ingested batch, and becomes a permanent no-op after the first rerun.
"""
import asyncio
import csv
import json
from datetime import date, timedelta
from pathlib import Path

import asyncpg

from app.config import get_settings
from app.database import close_db, connect_db, get_pool

DATA_DIR = Path(__file__).resolve().parents[2] / "ai_engine" / "data"
FACILITIES_JSON = DATA_DIR / "brics_facilities_seed.json"
CONSUMPTION_CSV = DATA_DIR / "brics_consumption_history_seed.csv"
CACHED_REGISTERS_DIR = DATA_DIR / "cached_registers"

SEED_DATE = date(2026, 8, 18)  # matches the cached register's date_of_record

# Synthetic expiry offsets from SEED_DATE, keyed by how many sub-batches a
# facility/item pair is split into (see _split_batches). Index 0 is the
# earliest-expiring (oldest) portion, the last is the freshest. n=1 keeps
# the original single 180-day shelf life for pairs too small to split.
SYNTHETIC_EXPIRY_OFFSETS_DAYS = {
    1: [180],
    2: [90, 210],
    3: [60, 150, 240],
}


def _split_batches(qty: int) -> list[int]:
    """Partition a real stock_remaining total into 1-3 batches without
    inventing quantity: the parts always sum to exactly `qty`."""
    if qty < 10:
        n = 1
    elif qty < 30:
        n = 2
    else:
        n = 3
    base = qty // n
    parts = [base] * n
    parts[-1] += qty - base * n  # remainder absorbed into the freshest batch
    return parts

# Transcribed verbatim from ai_engine/data/real_data_loader.py's
# ATC_TO_CAREDOM_MEDICINES (the canonical 7-item formulary used to generate
# the consumption CSV). Not imported directly because that module has an
# unrelated pandas/DATA_DIR import-time bug and pulls in heavy ML deps that
# backend/ has no other need for — see requirements.txt, which stays light.
CATALOG_FROM_ATC = [
    {"item_code": "MED-PCM-500", "generic_name": "Paracetamol 500mg Tablets", "category": "Analgesic/Antipyretic", "unit": "Tablet"},
    {"item_code": "MED-IBU-400", "generic_name": "Ibuprofen 400mg Tablets", "category": "NSAID Anti-inflammatory", "unit": "Tablet"},
    {"item_code": "MED-DIC-50", "generic_name": "Diclofenac 50mg Tablets", "category": "Anti-inflammatory", "unit": "Tablet"},
    {"item_code": "MED-ASP-75", "generic_name": "Aspirin 75mg Gastro-resistant", "category": "Antithrombotic", "unit": "Tablet"},
    {"item_code": "MED-SAL-100", "generic_name": "Salbutamol 100mcg Inhaler", "category": "Respiratory/Bronchodilator", "unit": "Inhaler"},
    {"item_code": "MED-CET-10", "generic_name": "Cetirizine 10mg Tablets", "category": "Antihistamine", "unit": "Tablet"},
    {"item_code": "MED-DZP-5", "generic_name": "Diazepam 5mg Tablets", "category": "Anxiolytic/Sedative", "unit": "Tablet"},
]

# The 4 additional items only seen in the cached OCR registers. `unit` comes
# straight from the register; `category` is standard pharmacology
# classification (Amoxicillin=antibiotic, Insulin=antidiabetic, etc.) since
# the register JSON doesn't carry a category field.
CATALOG_FROM_REGISTERS = [
    {"item_code": "MED-AMX-250", "generic_name": "Amoxicillin 250mg Capsules", "category": "Antibiotic", "unit": "Capsule"},
    {"item_code": "MED-ORS-PKG", "generic_name": "Oral Rehydration Salts (WHO Formula)", "category": "Rehydration Therapy", "unit": "Packet"},
    {"item_code": "MED-ART-60", "generic_name": "Artesunate 60mg Injection (Antimalarial)", "category": "Antimalarial", "unit": "Vial"},
    {"item_code": "MED-INS-REG", "generic_name": "Regular Human Insulin 100IU/ml (Cold-Chain)", "category": "Antidiabetic", "unit": "Vial"},
]

ITEM_CATALOG = CATALOG_FROM_ATC + CATALOG_FROM_REGISTERS

# facility_id prefix -> (country_code, region_state, district, base facility_type)
# Sourced from the section headers in ai_engine/data/seed_generator.py:
#   "INDIA (Maharashtra - Pune/Satara District)"
#   "SOUTH AFRICA (Gauteng - Tshwane/Pretoria District)"
#   "BRAZIL (Amazonas - Manaus Riverine Region)"
PREFIX_GEO = {
    "PHC-PUN": ("IND", "Maharashtra", "Pune", "PRIMARY_HEALTH_CENTRE"),
    "CHC-TSH": ("ZAF", "Gauteng", "Tshwane", "COMMUNITY_HEALTH_CENTRE"),
    "UBS-AMZ": ("BRA", "Amazonas", "Manaus", "PRIMARY_HEALTH_CENTRE"),
}


def _prefix_for(facility_id: str) -> str:
    return facility_id.rsplit("-", 1)[0]


def _load_facilities() -> list[dict]:
    with open(FACILITIES_JSON, encoding="utf-8") as f:
        return json.load(f)


def _latest_stock_by_facility_item(facility_ids: set[str]) -> dict[tuple[str, str], int]:
    """Most recent stock_remaining per (facility_id, item_code), from the real CSV."""
    latest: dict[tuple[str, str], tuple[str, int]] = {}
    with open(CONSUMPTION_CSV, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            fac, item = row["facility_id"], row["item_code"]
            if fac not in facility_ids:
                continue
            key = (fac, item)
            row_date = row["date"]
            if key not in latest or row_date > latest[key][0]:
                latest[key] = (row_date, int(float(row["stock_remaining"])))
    return {key: qty for key, (_, qty) in latest.items()}


def _load_cached_registers(valid_facility_ids: set[str]) -> dict[str, dict]:
    registers = {}
    for path in CACHED_REGISTERS_DIR.glob("*.json"):
        with open(path, encoding="utf-8") as f:
            reg = json.load(f)
        fac_id = reg["facility_id"]
        if fac_id not in valid_facility_ids:
            print(f"  [skip] cached register '{path.name}' references unknown facility_id "
                  f"'{fac_id}' (no matching row in brics_facilities_seed.json) — not loaded")
            continue
        registers[fac_id] = reg
    return registers


async def seed_item_masters(conn: asyncpg.Connection) -> None:
    await conn.executemany(
        """
        INSERT INTO item_masters (item_code, generic_name, category, unit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (item_code) DO NOTHING
        """,
        [(i["item_code"], i["generic_name"], i["category"], i["unit"]) for i in ITEM_CATALOG],
    )
    print(f"  item_masters: {len(ITEM_CATALOG)} items")


async def seed_facilities(conn: asyncpg.Connection, facilities: list[dict]) -> None:
    rows = []
    for fac in facilities:
        prefix = _prefix_for(fac["facility_id"])
        _, region_state, district, base_type = PREFIX_GEO[prefix]
        facility_type = "DISTRICT_HOSPITAL" if fac.get("is_dh") else base_type
        rows.append((
            fac["facility_id"], fac["name"], fac["country_code"],
            region_state, district, facility_type, fac["lng"], fac["lat"],
        ))
    await conn.executemany(
        """
        INSERT INTO facilities
            (facility_id, name, country_code, region_state, district, facility_type, location_geom)
        VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
        ON CONFLICT (facility_id) DO NOTHING
        """,
        rows,
    )
    print(f"  facilities: {len(rows)} facilities")


async def seed_inventory_batches(
    conn: asyncpg.Connection, facilities: list[dict], registers: dict[str, dict]
) -> None:
    facility_ids = {f["facility_id"] for f in facilities}
    latest_stock = _latest_stock_by_facility_item(facility_ids)

    rows = []
    legacy_batch_numbers = []  # one-time cleanup of the pre-split naming, see module docstring
    covered: set[tuple[str, str]] = set()

    # 1. Real batch-level data from OCR-digitized registers takes priority,
    #    and is never split (see module docstring).
    for fac_id, reg in registers.items():
        for med in reg["medicines"]:
            rows.append((
                fac_id, med["item_code"], med["batch_number"],
                med["quantity"], date.fromisoformat(med["expiry_date"]),
            ))
            covered.add((fac_id, med["item_code"]))
    print(f"  inventory_batches: {len(rows)} from real OCR registers ({list(registers.keys())})")

    # 2. Fill every other (facility, catalog item) pair from the CSV's
    #    latest known stock_remaining, split into 1-3 synthetic batches with
    #    staggered expiry (see _split_batches / SYNTHETIC_EXPIRY_OFFSETS_DAYS).
    csv_derived = 0
    for fac in facilities:
        fac_id = fac["facility_id"]
        for item in CATALOG_FROM_ATC:  # the CSV only covers the 7-item ATC formulary
            key = (fac_id, item["item_code"])
            if key in covered:
                continue
            qty = latest_stock.get(key)
            if qty is None:
                continue
            legacy_batch_numbers.append((fac_id, item["item_code"], f"SEED-{fac_id}-{item['item_code']}"))
            parts = _split_batches(qty)
            offsets = SYNTHETIC_EXPIRY_OFFSETS_DAYS[len(parts)]
            for i, (part_qty, offset) in enumerate(zip(parts, offsets), start=1):
                rows.append((
                    fac_id, item["item_code"], f"SEED-{fac_id}-{item['item_code']}-{i}",
                    part_qty, SEED_DATE + timedelta(days=offset),
                ))
                csv_derived += 1
    print(f"  inventory_batches: {csv_derived} from CSV latest stock_remaining "
          f"(split into 1-3 synthetic batches, staggered expiry)")

    await conn.executemany(
        "DELETE FROM inventory_batches WHERE facility_id = $1 AND item_code = $2 AND batch_number = $3",
        legacy_batch_numbers,
    )
    await conn.executemany(
        """
        INSERT INTO inventory_batches
            (facility_id, item_code, batch_number, quantity_available, expiry_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (facility_id, item_code, batch_number) DO NOTHING
        """,
        rows,
    )


async def seed_beds_and_staff(
    conn: asyncpg.Connection, facilities: list[dict], registers: dict[str, dict]
) -> None:
    bed_rows, staff_rows = [], []
    for fac in facilities:
        fac_id = fac["facility_id"]
        reg = registers.get(fac_id)

        general_total, icu_total = fac["gen_beds"], fac["icu_beds"]
        if reg:
            general_occupied = reg["beds"]["general_occupied"]
            icu_occupied = reg["beds"]["icu_occupied"]
        else:
            general_occupied, icu_occupied = 0, 0
        bed_rows.append((fac_id, general_total, general_occupied, icu_total, icu_occupied))

        doctors_expected, nurses_expected = fac["docs"], fac["nurses"]
        if reg:
            record_date = date.fromisoformat(reg["date_of_record"])
            doctors_present = reg["staff"]["doctors_present"]
            nurses_present = reg["staff"]["nurses_present"]
        else:
            # No live attendance snapshot for this facility yet: default to
            # full establishment strength rather than fabricating a shortfall.
            record_date = SEED_DATE
            doctors_present, nurses_present = doctors_expected, nurses_expected
        staff_rows.append((
            fac_id, record_date, doctors_present, doctors_expected, nurses_present, nurses_expected,
        ))

    await conn.executemany(
        """
        INSERT INTO facility_beds
            (facility_id, general_total, general_occupied, icu_total, icu_occupied)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (facility_id) DO NOTHING
        """,
        bed_rows,
    )
    await conn.executemany(
        """
        INSERT INTO staff_attendance
            (facility_id, record_date, doctors_present, doctors_expected, nurses_present, nurses_expected)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (facility_id, record_date) DO NOTHING
        """,
        staff_rows,
    )
    print(f"  facility_beds: {len(bed_rows)} rows, staff_attendance: {len(staff_rows)} rows")


async def run_seed(conn: asyncpg.Connection) -> None:
    facilities = _load_facilities()
    facility_ids = {f["facility_id"] for f in facilities}
    registers = _load_cached_registers(facility_ids)

    print("Seeding item_masters...")
    await seed_item_masters(conn)
    print("Seeding facilities...")
    await seed_facilities(conn, facilities)
    print("Seeding inventory_batches...")
    await seed_inventory_batches(conn, facilities, registers)
    print("Seeding facility_beds + staff_attendance...")
    await seed_beds_and_staff(conn, facilities, registers)
    print("Done.")


async def main() -> None:
    get_settings()
    await connect_db()
    try:
        async with get_pool().acquire() as conn:
            await run_seed(conn)
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
