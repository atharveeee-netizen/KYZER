"""Hero endpoint: instant PostGIS nearest-surplus matching for an emergency
stockout. Uses the `<->` KNN distance operator against the GIST index on
facilities.location_geom so the nearest donor is found via an index scan,
not a full table sort. location_geom is `geometry(Point,4326)` (plain
lat/lng), so `<->` ranks in degrees — fine for ordering, since it's
monotonic with true distance at this regional scale. The actual displayed
distance_km casts to `::geography` instead, because ST_Distance on a bare
geometry column returns degrees, not meters — dividing degrees by 1000 would
silently report every donor as ~0 km away."""
import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import get_db

router = APIRouter(prefix="/api/v1/redistribution", tags=["Redistribution"])

_SUGGEST_QUERY = """
SELECT
    f.facility_id,
    f.name,
    f.district,
    b.batch_number,
    b.expiry_date,
    b.quantity_available,
    ROUND((ST_Distance(f.location_geom::geography, req.location_geom::geography) / 1000.0)::numeric, 1) AS distance_km
FROM facilities f
JOIN inventory_batches b ON f.facility_id = b.facility_id
CROSS JOIN (
    SELECT location_geom, country_code FROM facilities WHERE facility_id = $1
) req
WHERE f.facility_id != $1
  AND f.country_code = req.country_code
  AND b.item_code = $2
  AND b.quantity_available >= $3
  AND b.expiry_date > CURRENT_DATE + INTERVAL '14 days'
ORDER BY f.location_geom <-> req.location_geom
LIMIT 1;
"""


@router.get("/suggest")
async def suggest_resource_redistribution(
    requesting_facility_id: str = Query(...),
    item_code: str = Query(...),
    needed_qty: int = Query(..., gt=0),
    db: asyncpg.Connection = Depends(get_db),
):
    requester = await db.fetchrow(
        "SELECT 1 FROM facilities WHERE facility_id = $1", requesting_facility_id
    )
    if requester is None:
        raise HTTPException(status_code=404, detail=f"Unknown facility_id '{requesting_facility_id}'")

    row = await db.fetchrow(_SUGGEST_QUERY, requesting_facility_id, item_code, needed_qty)
    if not row:
        raise HTTPException(
            status_code=404,
            detail="No facility with sufficient surplus found within operational range.",
        )

    distance_km = float(row["distance_km"])
    return {
        "status": "TRANSFER_RECOMMENDED",
        "requesting_facility_id": requesting_facility_id,
        "needed_item": item_code,
        "needed_quantity": needed_qty,
        "suggested_donor": {
            "facility_id": row["facility_id"],
            "facility_name": row["name"],
            "district": row["district"],
            "distance_km": distance_km,
            "estimated_transit_minutes": int(distance_km * 1.8),
            "source_batch": row["batch_number"],
            "batch_expiry": str(row["expiry_date"]),
            "available_stock": row["quantity_available"],
        },
        "dispatch_action": "POST /api/v1/inventory/transfer",
    }
