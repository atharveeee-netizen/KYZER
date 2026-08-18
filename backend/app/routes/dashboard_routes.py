"""Unified facilities overview: one row per facility with its beds, latest
staff attendance, and current in-stock inventory, in a single query (LATERAL
joins + json_agg) rather than one query per facility."""
import json

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.database import get_db

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

_DASHBOARD_QUERY = """
SELECT
    f.facility_id, f.name, f.country_code, f.region_state, f.district,
    f.facility_type, ST_Y(f.location_geom) AS lat, ST_X(f.location_geom) AS lng,
    b.general_total, b.general_occupied, b.icu_total, b.icu_occupied,
    s.record_date, s.doctors_present, s.doctors_expected,
    s.nurses_present, s.nurses_expected,
    COALESCE(inv.items, '[]'::json) AS inventory
FROM facilities f
LEFT JOIN facility_beds b ON b.facility_id = f.facility_id
LEFT JOIN LATERAL (
    SELECT record_date, doctors_present, doctors_expected, nurses_present, nurses_expected
    FROM staff_attendance sa
    WHERE sa.facility_id = f.facility_id
    ORDER BY record_date DESC
    LIMIT 1
) s ON true
LEFT JOIN LATERAL (
    SELECT json_agg(
        json_build_object(
            'item_code', ib.item_code,
            'generic_name', im.generic_name,
            'unit', im.unit,
            'quantity_available', ib.quantity_available,
            'nearest_expiry', ib.expiry_date
        ) ORDER BY ib.expiry_date
    ) AS items
    FROM inventory_batches ib
    JOIN item_masters im ON im.item_code = ib.item_code
    WHERE ib.facility_id = f.facility_id AND ib.quantity_available > 0
) inv ON true
WHERE f.is_active = true
  AND ($1::varchar IS NULL OR f.country_code = $1)
ORDER BY f.facility_id;
"""


def _row_to_dict(row: asyncpg.Record) -> dict:
    return {
        "facility_id": row["facility_id"],
        "name": row["name"],
        "country_code": row["country_code"],
        "region_state": row["region_state"],
        "district": row["district"],
        "facility_type": row["facility_type"],
        "location": {"lat": row["lat"], "lng": row["lng"]},
        "beds": {
            "general_total": row["general_total"],
            "general_occupied": row["general_occupied"],
            "icu_total": row["icu_total"],
            "icu_occupied": row["icu_occupied"],
        },
        "staff": {
            "record_date": str(row["record_date"]) if row["record_date"] else None,
            "doctors_present": row["doctors_present"],
            "doctors_expected": row["doctors_expected"],
            "nurses_present": row["nurses_present"],
            "nurses_expected": row["nurses_expected"],
        },
        "inventory": json.loads(row["inventory"]) if isinstance(row["inventory"], str) else row["inventory"],
    }


@router.get("")
async def get_facilities_dashboard(
    country_code: str | None = Query(default=None, min_length=3, max_length=3),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(_DASHBOARD_QUERY, country_code)
    return {"count": len(rows), "facilities": [_row_to_dict(r) for r in rows]}
