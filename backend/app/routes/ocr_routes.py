"""Google AI persistence path: POST /api/v1/ocr/commit-register.

Person 1's Service B (backend/app/routes/ai.py, POST /api/v1/ocr/upload) runs
Gemini Vision OCR and returns a ClinicRegisterExtractionResult but never
writes to Postgres. This is the other half of that flow: it takes the same
extraction shape and commits it across all three pillars in one transaction.

The request model below is a field-for-field mirror of
ai_engine/ocr/schema.py's ClinicRegisterExtractionResult/ExtractedMedicine/
ExtractedBeds/ExtractedStaff - deliberately NOT imported from ai_engine.
backend/Dockerfile only COPYs `app` and `db` (Service A stays ~185MB and has
no asyncpg-incompatible ML deps); reaching across to ai_engine would break
that image. Field names, types, and defaults are kept identical on purpose -
this is a mirror, not a reshape.
"""
from datetime import date

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import get_db

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR Ingest"])


class CommitMedicine(BaseModel):
    item_code: str
    generic_name: str
    batch_number: str
    expiry_date: str
    quantity: int = Field(..., ge=0)
    unit: str = "tablets"
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0)


class CommitBeds(BaseModel):
    general_total: int = Field(default=20, ge=0)
    general_occupied: int = Field(default=12, ge=0)
    icu_total: int = Field(default=4, ge=0)
    icu_occupied: int = Field(default=2, ge=0)


class CommitStaff(BaseModel):
    doctors_present: int = Field(default=2, ge=0)
    doctors_expected: int = Field(default=2, ge=0)
    nurses_present: int = Field(default=5, ge=0)
    nurses_expected: int = Field(default=6, ge=0)


class CommitRegisterRequest(BaseModel):
    facility_id: str
    country_code: str = "IND"
    date_of_record: str
    medicines: list[CommitMedicine] = Field(default_factory=list)
    beds: CommitBeds = Field(default_factory=CommitBeds)
    staff: CommitStaff = Field(default_factory=CommitStaff)
    raw_text_summary: str | None = None
    processing_time_ms: float = 0.0


_BATCH_UPSERT = """
INSERT INTO inventory_batches (facility_id, item_code, batch_number, quantity_available, expiry_date)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (facility_id, item_code, batch_number) DO UPDATE
SET quantity_available = EXCLUDED.quantity_available,
    expiry_date = EXCLUDED.expiry_date
WHERE inventory_batches.quantity_available IS DISTINCT FROM EXCLUDED.quantity_available
   OR inventory_batches.expiry_date IS DISTINCT FROM EXCLUDED.expiry_date
RETURNING batch_id;
"""

_BEDS_UPSERT = """
INSERT INTO facility_beds (facility_id, general_total, general_occupied, icu_total, icu_occupied)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (facility_id) DO UPDATE
SET general_total = EXCLUDED.general_total,
    general_occupied = EXCLUDED.general_occupied,
    icu_total = EXCLUDED.icu_total,
    icu_occupied = EXCLUDED.icu_occupied,
    updated_at = NOW();
"""

_STAFF_UPSERT = """
INSERT INTO staff_attendance (facility_id, record_date, doctors_present, doctors_expected, nurses_present, nurses_expected)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (facility_id, record_date) DO UPDATE
SET doctors_present = EXCLUDED.doctors_present,
    doctors_expected = EXCLUDED.doctors_expected,
    nurses_present = EXCLUDED.nurses_present,
    nurses_expected = EXCLUDED.nurses_expected;
"""


@router.post("/commit-register")
async def commit_register(
    payload: CommitRegisterRequest,
    db: asyncpg.Connection = Depends(get_db),
):
    facility = await db.fetchrow(
        "SELECT 1 FROM facilities WHERE facility_id = $1", payload.facility_id
    )
    if facility is None:
        raise HTTPException(status_code=404, detail=f"Unknown facility_id '{payload.facility_id}'")

    try:
        record_date = date.fromisoformat(payload.date_of_record)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"date_of_record must be YYYY-MM-DD, got '{payload.date_of_record}'",
        )

    known_items = {
        r["item_code"]
        for r in await db.fetch(
            "SELECT item_code FROM item_masters WHERE item_code = ANY($1::varchar[])",
            [med.item_code for med in payload.medicines],
        )
    }

    medicines_written: list[dict] = []
    skipped_unknown_items: list[dict] = []
    ledger_rows_written = 0

    async with db.transaction():
        for med in payload.medicines:
            if med.item_code not in known_items:
                skipped_unknown_items.append({
                    "item_code": med.item_code,
                    "generic_name": med.generic_name,
                    "reason": (
                        "unknown item_code - no item_masters entry. Not auto-created: "
                        "item_masters.category is NOT NULL and the OCR extraction carries "
                        "no category field, so auto-creating would mean fabricating data."
                    ),
                })
                continue

            try:
                expiry = date.fromisoformat(med.expiry_date)
            except ValueError:
                skipped_unknown_items.append({
                    "item_code": med.item_code,
                    "generic_name": med.generic_name,
                    "reason": f"malformed expiry_date '{med.expiry_date}', expected YYYY-MM-DD",
                })
                continue

            # Determine insert/update/unchanged for the response by reading
            # prior state under the row lock the upsert below will reuse.
            # This does NOT drive the ledger write - that's gated purely on
            # whether the upsert's RETURNING produced a row (see _BATCH_UPSERT's
            # WHERE ... IS DISTINCT FROM), so an exact repost genuinely writes
            # zero ledger rows regardless of what this pre-check computes.
            existing = await db.fetchrow(
                "SELECT quantity_available, expiry_date FROM inventory_batches "
                "WHERE facility_id = $1 AND item_code = $2 AND batch_number = $3 FOR UPDATE",
                payload.facility_id, med.item_code, med.batch_number,
            )
            if existing is None:
                action = "inserted"
            elif existing["quantity_available"] == med.quantity and existing["expiry_date"] == expiry:
                action = "unchanged"
            else:
                action = "updated"

            # NOTE: quantity_available is set to exactly what the register
            # reports, which overwrites whatever value was there - including
            # any of it that was quantity_reserved by a FEFO allocation.
            # A register read is a snapshot of physical stock on the shelf
            # right now; it has no notion of "reserved for an in-flight
            # transfer" and shouldn't invent one. Register-reports-current-
            # truth is the right call for this timeline: it means a FEFO
            # reservation can be silently orphaned by a later OCR commit
            # (the reservation's quantity_reserved isn't touched here, but
            # the shelf count it was reserved against may no longer match
            # reality). No reconciliation between the two is built - that's
            # a deliberate scope cut, not an oversight.
            row = await db.fetchrow(
                _BATCH_UPSERT,
                payload.facility_id, med.item_code, med.batch_number, med.quantity, expiry,
            )

            if row is not None:
                await db.execute(
                    "INSERT INTO inventory_ledger "
                    "(transaction_type, from_facility_id, to_facility_id, item_code, batch_number, batch_id, quantity) "
                    "VALUES ('OCR_INGEST', NULL, $1, $2, $3, $4, $5)",
                    payload.facility_id, med.item_code, med.batch_number, row["batch_id"], med.quantity,
                )
                ledger_rows_written += 1

            medicines_written.append({
                "item_code": med.item_code,
                "batch_number": med.batch_number,
                "action": action,
                "quantity_available": med.quantity,
            })

        # Beds and staff are gauges, not counters: ON CONFLICT DO UPDATE always
        # overwrites with what the register reports, so reposting the same
        # register never double-counts. No RETURNING/ledger bookkeeping is
        # needed here the way it is for batches.
        await db.execute(
            _BEDS_UPSERT,
            payload.facility_id, payload.beds.general_total, payload.beds.general_occupied,
            payload.beds.icu_total, payload.beds.icu_occupied,
        )
        await db.execute(
            _STAFF_UPSERT,
            payload.facility_id, record_date, payload.staff.doctors_present, payload.staff.doctors_expected,
            payload.staff.nurses_present, payload.staff.nurses_expected,
        )

    return {
        "facility_id": payload.facility_id,
        "date_of_record": payload.date_of_record,
        "medicines_written": medicines_written,
        "skipped_unknown_items": skipped_unknown_items,
        "beds_updated": True,
        "staff_updated": True,
        "ledger_rows_written": ledger_rows_written,
    }
