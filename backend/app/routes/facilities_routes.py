"""Frontend-compat facilities endpoint: one row per facility, shaped to match
frontend/src/types/index.ts's HealthFacility exactly (plus cascade_risk_source,
see comment 3 below). Purely additive — /api/v1/inventory and
dashboard_routes.py already ship a different shape (country_code vs country,
location.lat vs latitude, beds.general_total vs total_beds) and are left
untouched. Without this endpoint, frontend/src/services/api.ts's fetch to
GET /api/v1/facilities 404s and the UI silently falls back to mockData."""
import asyncpg
from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/api/v1/facilities", tags=["Facilities"])

_FACILITIES_QUERY = """
SELECT
    f.facility_id,
    f.name,
    f.district,
    f.country_code,
    ST_Y(f.location_geom) AS latitude,
    ST_X(f.location_geom) AS longitude,
    f.facility_type,
    b.general_total AS total_beds,
    b.general_occupied AS occupied_beds,
    b.icu_total AS icu_beds_total,
    b.icu_occupied AS icu_beds_occupied,
    s.doctors_present,
    s.nurses_present,
    COALESCE(stock.qty, 0) AS current_stock_pcm500,
    -- days_to_stockout: current MED-PCM-500 stock / its consumption baseline
    -- (facility_item_consumption, seeded as a CONSUMPTION_WINDOW_DAYS-day
    -- trailing mean — see seed_data.py). NULLIF guards a zero average from
    -- raising a divide-by-zero; dts.raw_days is NULL whenever no consumption
    -- row exists at all for this facility/item, which is the case this
    -- guards against (see the risk_tier CASE below for why that matters).
    ROUND(dts.raw_days, 1) AS days_to_stockout,
    -- Comment 1: thresholds are not invented. 3 and 7 are
    -- CRITICAL_STOCKOUT_THRESHOLD_DAYS and FORECAST_HORIZON_DAYS from
    -- ai_engine/config.py, cited by name so they can't silently drift from
    -- Service B's numbers. The 30-day surplus cutoff has no such source —
    -- it's an arbitrary display threshold picked to flag "clearly overstocked",
    -- not a value that appears anywhere else in the system.
    --
    -- dts.raw_days IS NULL -> P3_NORMAL: none of the 126 seeded
    -- (facility, item) pairs are missing a consumption row today, so this
    -- branch is unreachable against current seed data. It stays because the
    -- RiskTier TS union has no null-safe member — a facility added later
    -- without a consumption row would otherwise get treated as P0_CRITICAL
    -- (NULL < 3 is NULL, which reads as "not true" here) or, worse, silently
    -- excluded from every tier. P3_NORMAL is the deliberate fallback so a
    -- facility we have no consumption data for reads as "unknown", not
    -- "definitely fine" or "definitely critical" — it does NOT mean this was
    -- observed to be low-risk.
    CASE
        WHEN dts.raw_days IS NULL THEN 'P3_NORMAL'
        WHEN dts.raw_days < 3 THEN 'P0_CRITICAL'
        WHEN dts.raw_days < 7 THEN 'P1_WARNING'
        WHEN dts.raw_days > 30 THEN 'P2_SURPLUS'
        ELSE 'P3_NORMAL'
    END AS risk_tier,
    -- Comment 3: cascade_risk_score is NOT the AI risk score. The real one
    -- comes from Service B's ai_engine/detector/cascade_detector.py (an
    -- isolation forest over multi-signal facility data), which this
    -- container cannot reach (Service A never imports ai_engine — see
    -- main.py). This is a transparent SQL proxy only:
    --   0.6 * clamp(1 - days_to_stockout/30, 0, 1) + 0.4 * (occupied/total)
    -- rounded to 2dp. When days_to_stockout is NULL (see above), the stock
    -- term drops out via COALESCE(..., 0) and the score falls back to the
    -- occupancy term alone, per spec. frontend/src/data/mockData.ts has its
    -- own cascade_risk_score values for its 18 mock facilities; this formula
    -- was NOT tuned to reproduce them — any resemblance is not the goal.
    -- general_occupied/general_total is cast ::numeric because both are INT
    -- columns and plain INT/INT division in Postgres truncates (occupied is
    -- always < total here, so untyped it would floor to 0 every time).
    ROUND(
        COALESCE(0.6 * GREATEST(LEAST(1 - dts.raw_days / 30, 1), 0), 0)
        + 0.4 * COALESCE(b.general_occupied::numeric / NULLIF(b.general_total, 0), 0),
    2) AS cascade_risk_score
FROM facilities f
LEFT JOIN facility_beds b ON b.facility_id = f.facility_id
LEFT JOIN LATERAL (
    SELECT doctors_present, nurses_present
    FROM staff_attendance sa
    WHERE sa.facility_id = f.facility_id
    ORDER BY record_date DESC
    LIMIT 1
) s ON true
LEFT JOIN LATERAL (
    SELECT SUM(ib.quantity_available) AS qty
    FROM inventory_batches ib
    WHERE ib.facility_id = f.facility_id AND ib.item_code = 'MED-PCM-500'
) stock ON true
LEFT JOIN facility_item_consumption c
    ON c.facility_id = f.facility_id AND c.item_code = 'MED-PCM-500'
LEFT JOIN LATERAL (
    SELECT stock.qty / NULLIF(c.avg_daily_consumption, 0) AS raw_days
) dts ON true
WHERE f.is_active = true
ORDER BY f.facility_id;
"""


def _row_to_dict(row: asyncpg.Record) -> dict:
    # ROUND(...) on a NUMERIC column comes back from asyncpg as Decimal,
    # which json can't serialise (dashboard_routes.py's distance_km hits the
    # same issue in redistribution_routes.py) — cast explicitly rather than
    # let one leak into the response.
    days_to_stockout = row["days_to_stockout"]
    return {
        "facility_id": row["facility_id"],
        "name": row["name"],
        "country": row["country_code"],
        "district": row["district"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        # Comment 2: facility_type_enum (schema.sql) has five values —
        # NATIONAL_DEPOT and REGIONAL_WAREHOUSE in addition to the three
        # below — but HealthFacility's facility_type union only accepts
        # three. Passed through unmapped rather than translated: the seeder
        # (seed_data.py's PREFIX_GEO/is_dh logic) only ever produces
        # PRIMARY_HEALTH_CENTRE, COMMUNITY_HEALTH_CENTRE and
        # DISTRICT_HOSPITAL today, so nothing violates the TS type in
        # practice. If a NATIONAL_DEPOT or REGIONAL_WAREHOUSE facility is
        # ever seeded, this field will silently violate HealthFacility's
        # type at the frontend boundary — there is no mapping here to catch
        # it because no such facility exists yet to write one against.
        "facility_type": row["facility_type"],
        "total_beds": row["total_beds"],
        "occupied_beds": row["occupied_beds"],
        "icu_beds_total": row["icu_beds_total"],
        "icu_beds_occupied": row["icu_beds_occupied"],
        "doctors_present": row["doctors_present"],
        "nurses_present": row["nurses_present"],
        "current_stock_pcm500": row["current_stock_pcm500"],
        "days_to_stockout": float(days_to_stockout) if days_to_stockout is not None else None,
        "risk_tier": row["risk_tier"],
        "cascade_risk_score": float(row["cascade_risk_score"]),
        # Comment 4: exists so this SQL proxy can never be mistaken for
        # Service B's actual isolation-forest output, downstream — in the
        # UI or in the deck. Every response says exactly where its
        # cascade_risk_score came from.
        "cascade_risk_source": "heuristic",
    }


@router.get("")
async def get_facilities(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch(_FACILITIES_QUERY)
    return {"count": len(rows), "facilities": [_row_to_dict(r) for r in rows]}
