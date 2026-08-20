"""Frontend-compat alerts endpoint, shaped to match frontend/src/types/index.ts's
SystemAlert exactly (plus timestamp_iso, see comment below). Purely additive.

Without this endpoint, frontend/src/services/api.ts's getAlerts() 404s against
GET /api/v1/alerts and the UI silently falls back to MOCK_ALERTS
(frontend/src/data/mockData.ts) — a fixed, fabricated feed unrelated to the
live database. Service B's /alerts/stream (main_ai.py) is a separate, unrelated
15-second canned WebSocket message, not a substitute for this.

An alert is any facility whose MED-PCM-500 risk_tier (see _risk_tier_sql.py)
is P0_CRITICAL or P1_WARNING — P2_SURPLUS and P3_NORMAL are never alerts. All
18 seeded facilities currently sit in P3_NORMAL (the seeded consumption
history has no stockout in it), so {"count": 0, "alerts": []} is the correct,
intended response today. The list is meant to populate live during a FEFO
drawdown demo, not be pre-populated with placeholder data."""
from datetime import datetime, timezone

import asyncpg
from fastapi import APIRouter, Depends

from app.database import get_db
from app.routes._risk_tier_sql import RISK_TIER_CASE_SQL

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

_ALERTS_QUERY = f"""
SELECT * FROM (
    SELECT
        f.facility_id,
        f.name AS facility_name,
        im.generic_name,
        COALESCE(stock.qty, 0) AS current_stock,
        c.avg_daily_consumption,
        ROUND(dts.raw_days, 1) AS days_to_stockout,
        {RISK_TIER_CASE_SQL} AS risk_tier,
        donor.facility_id AS donor_facility_id,
        donor.name AS donor_name,
        donor.distance_km AS donor_distance_km
    FROM facilities f
    JOIN item_masters im ON im.item_code = 'MED-PCM-500'
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
    -- Nearest same-country facility carrying real surplus MED-PCM-500 stock,
    -- reusing redistribution_routes.py's _SUGGEST_QUERY shape (same country,
    -- same KNN `<->` ordering, same 14-day shelf-life floor). Filtered on
    -- quantity_available > 0 rather than a specific needed_qty: an alert has
    -- no attached transfer request to size a threshold against, so this only
    -- answers "does a real donor exist nearby", not "enough for a transfer of
    -- size N" — the donor's own available_stock is returned so the reader can
    -- judge that themselves.
    LEFT JOIN LATERAL (
        SELECT
            d.facility_id,
            d.name,
            d.location_geom,
            SUM(b.quantity_available) AS available_stock,
            ROUND((ST_Distance(d.location_geom::geography, f.location_geom::geography) / 1000.0)::numeric, 1) AS distance_km
        FROM facilities d
        JOIN inventory_batches b ON b.facility_id = d.facility_id
        WHERE d.facility_id != f.facility_id
          AND d.country_code = f.country_code
          AND b.item_code = 'MED-PCM-500'
          AND b.quantity_available > 0
          AND b.expiry_date > CURRENT_DATE + INTERVAL '14 days'
        GROUP BY d.facility_id, d.name, d.location_geom
        ORDER BY d.location_geom <-> f.location_geom
        LIMIT 1
    ) donor ON true
    WHERE f.is_active = true
) alert_candidates
WHERE risk_tier IN ('P0_CRITICAL', 'P1_WARNING')
ORDER BY days_to_stockout ASC;
"""


def _row_to_dict(row: asyncpg.Record) -> dict:
    # NUMERIC columns (days_to_stockout, avg_daily_consumption, donor_distance_km)
    # come back from asyncpg as Decimal, which json can't serialise — cast
    # explicitly, same as facilities_routes.py and redistribution_routes.py do.
    days_to_stockout = float(row["days_to_stockout"])
    avg_daily_consumption = float(row["avg_daily_consumption"])
    current_stock = row["current_stock"]

    # severity is a DIFFERENT enum from risk_tier ('P0'/'P1' vs
    # 'P0_CRITICAL'/'P1_WARNING') — SystemAlert.severity only accepts the
    # short form, so the '_CRITICAL'/'_WARNING' suffix is stripped here. This
    # is not a bug: the two enums are deliberately distinct (risk_tier also
    # has P2_SURPLUS/P3_NORMAL, which severity has no member for at all since
    # those tiers never reach this endpoint).
    severity = "P0" if row["risk_tier"] == "P0_CRITICAL" else "P1"

    donor_sentence = ""
    if row["donor_facility_id"] is not None:
        donor_sentence = (
            f" Nearest facility with surplus stock is {row['donor_name']} "
            f"({float(row['donor_distance_km'])} km away)."
        )

    description_en = (
        f"{row['generic_name']} stock at {row['facility_name']} is {current_stock} units, "
        f"against measured consumption of {avg_daily_consumption:.1f} units/day "
        f"({days_to_stockout} days remaining).{donor_sentence}"
    )

    now = datetime.now(timezone.utc)
    return {
        "id": f"alt-{row['facility_id']}-MED-PCM-500",
        "facility_id": row["facility_id"],
        "facility_name": row["facility_name"],
        "severity": severity,
        # Computed live on every request against current stock — there is no
        # alerts table recording when a condition first started, so "when did
        # this begin" doesn't exist to report. "just now" is the honest
        # relative rendering of that (matches the mock's string shape, e.g.
        # "10 mins ago", without inventing an elapsed time that wasn't
        # observed). timestamp_iso alongside it carries the real UTC instant
        # this response was generated, so the data isn't lossy even though
        # the relative string can't be more specific than "now".
        "timestamp": "just now",
        "timestamp_iso": now.isoformat(),
        "title": f"{row['generic_name']} stockout in {days_to_stockout} days — {row['facility_name']}",
        "description_en": description_en,
        # description_mr / description_hi / audio_url_mr / audio_url_hi are
        # deliberately null, not missing by oversight: translation and
        # text-to-speech are Person 4's voice pipeline. This backend does not
        # machine-translate clinical alert text — a mistranslated dosage or
        # stockout figure read aloud to a clinician is a patient-safety risk,
        # not a cosmetic one. These stay null until Person 4's pipeline
        # populates them.
        "description_mr": None,
        "description_hi": None,
        "audio_url_mr": None,
        "audio_url_hi": None,
        # No acknowledgment store exists on the backend (alerts aren't
        # persisted rows — they're recomputed fresh from live stock on every
        # call), so there is nothing to have acknowledged yet. False is the
        # only truthful value here, not a placeholder.
        "acknowledged": False,
    }


@router.get("")
async def get_alerts(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch(_ALERTS_QUERY)
    return {"count": len(rows), "alerts": [_row_to_dict(r) for r in rows]}
