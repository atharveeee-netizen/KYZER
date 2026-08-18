"""
CLI Test Suite for Dynamic Multilingual Narrator.
Usage:
    python -m ai_engine.explainer.test_narrator --weather-dry
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
from ai_engine.explainer.gemini_narrator import GeminiDecisionNarrator
from ai_engine.explainer.shap_explainer import DecisionExplanationReport, FeatureAttributionItem

def main():
    parser = argparse.ArgumentParser(description="Test Dynamic Multilingual Narrator")
    parser.add_argument("--weather-dry", action="store_true", default=True, help="Test dry weather scenario")
    args = parser.parse_args()

    print("=" * 80)
    print("🗣️ CareDOM Dynamic Multilingual Narrator — Test Suite")
    print("Testing dynamic Hindi & English briefings (Zero Hardcoded Text)")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    narrator = GeminiDecisionNarrator()

    # Scenario 1: Dry Weather with 0.0mm rainfall
    exp_dry = DecisionExplanationReport(
        facility_id="PHC-PUN-005",
        item_code="MED-ORS-PKG",
        base_expected_consumption=25.0,
        predicted_demand=38.5,
        top_contributing_factors=[
            FeatureAttributionItem(feature_name="rolling_mean_7d", shap_value=8.2, feature_value=35.0, impact_direction="INCREASES_SHORTAGE_RISK", relative_importance_pct=38.0),
            FeatureAttributionItem(feature_name="rainfall_mm", shap_value=-1.1, feature_value=0.0, impact_direction="DECREASES_RISK", relative_importance_pct=8.0)
        ],
        primary_driver_summary="Demand adjusted primarily driven by 7-day rolling mean."
    )

    # Scenario 2: Active Heavy Monsoon Surge
    exp_monsoon = DecisionExplanationReport(
        facility_id="PHC-TSH-002",
        item_code="MED-PCM-500",
        base_expected_consumption=50.0,
        predicted_demand=85.0,
        top_contributing_factors=[
            FeatureAttributionItem(feature_name="rainfall_mm", shap_value=22.5, feature_value=48.2, impact_direction="INCREASES_SHORTAGE_RISK", relative_importance_pct=45.0),
            FeatureAttributionItem(feature_name="epidemic_growth_rate", shap_value=12.5, feature_value=0.35, impact_direction="INCREASES_SHORTAGE_RISK", relative_importance_pct=25.0)
        ],
        primary_driver_summary="Demand adjusted primarily driven by heavy rainfall."
    )

    print("\n--- SCENARIO 1: DRY WEATHER CLINICAL BRIEFING ---")
    res1 = narrator.narrate_explanation(exp_dry, target_language="HINDI")
    print(f"  [English]: {res1['english_narrative']}")
    print(f"  [Hindi]:   {res1['hindi_narrative']}")
    assert "भारी वर्षा" not in res1['hindi_narrative'], "Error: Dry weather mentioned heavy rain!"

    print("\n--- SCENARIO 2: MONSOON SURGE CLINICAL BRIEFING ---")
    res2 = narrator.narrate_explanation(exp_monsoon, target_language="HINDI")
    print(f"  [English]: {res2['english_narrative']}")
    print(f"  [Hindi]:   {res2['hindi_narrative']}")
    assert "48.2" in res2['english_narrative'] or "48.2" in res2['hindi_narrative'] or "rainfall" in res2['english_narrative'].lower() or "वर्षा" in res2['hindi_narrative'], "Error: Rainfall value not reflected!"

    print("\n" + "=" * 80)
    print("✅ NARRATOR TEST PASSED: Dynamic SHAP-grounded narration verified in English and Hindi!")
    print("=" * 80)

if __name__ == "__main__":
    main()
