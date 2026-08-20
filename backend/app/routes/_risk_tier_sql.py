"""Single source of truth for the MED-PCM-500 days-to-stockout risk_tier CASE,
shared by facilities_routes.py and alerts_routes.py so the dashboard and the
alert panel can never classify the same facility into two different tiers.

facilities_routes.py is explicitly off-limits for edits (verified against the
deployed URL — see its own comments), so it keeps its own inline copy of this
CASE rather than importing this constant. This module exists so alerts_routes.py
has a named, reviewable copy to reuse instead of re-typing the thresholds a
second time from scratch. The two copies are kept honest by a runtime
cross-check, not by a shared import: /api/v1/alerts's VERIFY step confirms that
any facility it flags as P0/P1 is also reported as P0_CRITICAL/P1_WARNING by
/api/v1/facilities for the same MED-PCM-500 state. If this text and
facilities_routes.py's _FACILITIES_QUERY CASE ever drift, that cross-check is
what catches it.

Thresholds are not invented here either: 3 and 7 are
CRITICAL_STOCKOUT_THRESHOLD_DAYS and FORECAST_HORIZON_DAYS from
ai_engine/config.py (cited by name, not imported — Service A must never import
ai_engine, see main.py). 30 is the same arbitrary P2_SURPLUS display cutoff
facilities_routes.py uses; it's irrelevant to alerts_routes.py since P2/P3 are
never alerts, but the branch is kept so this CASE's output values are
identical to the one it's meant to mirror.
"""

RISK_TIER_CASE_SQL = """
    CASE
        WHEN dts.raw_days IS NULL THEN 'P3_NORMAL'
        WHEN dts.raw_days < 3 THEN 'P0_CRITICAL'
        WHEN dts.raw_days < 7 THEN 'P1_WARNING'
        WHEN dts.raw_days > 30 THEN 'P2_SURPLUS'
        ELSE 'P3_NORMAL'
    END
"""
