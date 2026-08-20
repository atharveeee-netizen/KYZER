"""Hero endpoint: instant PostGIS nearest-surplus matching for an emergency
stockout. Uses the `<->` KNN distance operator against the GIST index on
facilities.location_geom so the nearest donor is found via an index scan,
not a full table sort. location_geom is `geometry(Point,4326)` (plain
lat/lng), so `<->` ranks in degrees — fine for ordering, since it's
monotonic with true distance at this regional scale. The actual displayed
distance_km casts to `::geography` instead, because ST_Distance on a bare
geometry column returns degrees, not meters — dividing degrees by 1000 would
silently report every donor as ~0 km away.

allow_cross_border=true adds a second, independent BRICS-federation search
for the nearest donor OUTSIDE the requester's country (_CROSS_BORDER_QUERY
below), returned as a sibling `cross_border_donor` field rather than merged
into one ranked pool with the domestic result — the nearest facility overall
is always domestic in this dataset (e.g. 9.8 km vs 6,983 km to the nearest
ZAF facility from PHC-PUN-002), so a merged ranking would make the flag a
silent no-op. The three BRICS regions seeded here (India/Pune,
South Africa/Tshwane, Brazil/Manaus) all sit at moderate, non-polar
latitudes with no antimeridian crossing between them, so the same
degree-plane `<->` ordering that's valid "at this regional scale" for the
domestic query also happens to produce the correct great-circle ranking
across countries for this fixed 18-facility dataset — that is a property of
this data, not a general guarantee of `<->` at intercontinental range."""
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

# Same shape as _SUGGEST_QUERY, country predicate inverted and shelf-life
# threshold widened. Only used when allow_cross_border=true, so it can never
# affect the default (already-verified) response.
_CROSS_BORDER_QUERY = """
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
  AND f.country_code != req.country_code
  AND b.item_code = $2
  AND b.quantity_available >= $3
  -- 30 days, not the domestic query's 14: MIN_SHELF_LIFE_DAYS_FOR_TRANSFER in
  -- ai_engine/config.py. A cross-border transfer implies longer transit
  -- (intercontinental, air freight — see transit_mode below), so it needs
  -- more remaining shelf life on arrival than a same-day domestic road
  -- transfer does. The domestic query's 14-day threshold already diverges
  -- from this same constant; that's left alone deliberately so
  -- allow_cross_border=false keeps returning exactly what it returns today.
  AND b.expiry_date > CURRENT_DATE + INTERVAL '30 days'
ORDER BY f.location_geom <-> req.location_geom
LIMIT 1;
"""


def _donor_dict(row: asyncpg.Record, cross_border: bool) -> dict | None:
    if row is None:
        return None
    distance_km = float(row["distance_km"])
    return {
        "facility_id": row["facility_id"],
        "facility_name": row["name"],
        "district": row["district"],
        "distance_km": distance_km,
        # distance_km * 1.8 is a road-speed heuristic (see module docstring).
        # Applied to a cross-border distance (thousands of km) it produces
        # nonsense — e.g. 6,983 km -> ~210 hours "by road". No air-freight
        # logistics model exists anywhere in this system, so rather than
        # invent an air ETA, estimated_transit_minutes is deliberately left
        # null for a cross-border donor. transit_mode records why a number
        # isn't there instead of leaving the null unexplained.
        "estimated_transit_minutes": None if cross_border else int(distance_km * 1.8),
        "source_batch": row["batch_number"],
        "batch_expiry": str(row["expiry_date"]),
        "available_stock": row["quantity_available"],
        "transit_mode": "AIR_FREIGHT_REQUIRED" if cross_border else "ROAD",
        "cross_border": cross_border,
    }


@router.get("/suggest")
async def suggest_resource_redistribution(
    requesting_facility_id: str = Query(...),
    item_code: str = Query(...),
    needed_qty: int = Query(..., gt=0),
    allow_cross_border: bool = Query(
        default=False,
        description="Also search for the nearest donor outside the requester's "
                     "country (BRICS federation). Domestic result and its shape "
                     "are unaffected either way — see module docstring.",
    ),
    db: asyncpg.Connection = Depends(get_db),
):
    requester = await db.fetchrow(
        "SELECT 1 FROM facilities WHERE facility_id = $1", requesting_facility_id
    )
    if requester is None:
        raise HTTPException(status_code=404, detail=f"Unknown facility_id '{requesting_facility_id}'")

    domestic_row = await db.fetchrow(_SUGGEST_QUERY, requesting_facility_id, item_code, needed_qty)

    if not allow_cross_border:
        # Unmodified legacy path — byte-identical to this endpoint's response
        # before cross-border matching existed. This branch is already
        # verified against the deployed URL; do not reshape it to share code
        # with the allow_cross_border=true path below.
        if not domestic_row:
            raise HTTPException(
                status_code=404,
                detail="No facility with sufficient surplus found within operational range.",
            )
        distance_km = float(domestic_row["distance_km"])
        return {
            "status": "TRANSFER_RECOMMENDED",
            "requesting_facility_id": requesting_facility_id,
            "needed_item": item_code,
            "needed_quantity": needed_qty,
            "suggested_donor": {
                "facility_id": domestic_row["facility_id"],
                "facility_name": domestic_row["name"],
                "district": domestic_row["district"],
                "distance_km": distance_km,
                "estimated_transit_minutes": int(distance_km * 1.8),
                "source_batch": domestic_row["batch_number"],
                "batch_expiry": str(domestic_row["expiry_date"]),
                "available_stock": domestic_row["quantity_available"],
            },
            "dispatch_action": "POST /api/v1/inventory/transfer",
        }

    cross_border_row = await db.fetchrow(_CROSS_BORDER_QUERY, requesting_facility_id, item_code, needed_qty)

    if not domestic_row and not cross_border_row:
        raise HTTPException(
            status_code=404,
            detail="No facility with sufficient surplus found within operational range.",
        )

    return {
        "status": "TRANSFER_RECOMMENDED",
        "requesting_facility_id": requesting_facility_id,
        "needed_item": item_code,
        "needed_quantity": needed_qty,
        # Nullable here (unlike the allow_cross_border=false path above):
        # once cross-border search is on, either side of the comparison can
        # legitimately come back empty while the other still has a valid
        # result. Only 404 when neither exists (checked above).
        "suggested_donor": _donor_dict(domestic_row, cross_border=False),
        "cross_border_donor": _donor_dict(cross_border_row, cross_border=True),
        "dispatch_action": "POST /api/v1/inventory/transfer",
    }
