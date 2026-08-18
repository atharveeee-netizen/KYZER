"""
Autonomous Explainability & Multilingual Narrator Agent.
Calculates game-theoretic TreeSHAP feature attributions and uses Google Gemini to translate
complex optimization decisions into human-readable clinical narratives (English & Hindi).
"""

import pandas as pd
from typing import Dict, Any, List

from ai_engine.agents.base import BaseCareDOMAgent
from ai_engine.agents.state import MultiAgentBlackboardState, AgentLifecycleState
from ai_engine.explainer.shap_explainer import HealthSHAPExplainer
from ai_engine.explainer.gemini_narrator import GeminiDecisionNarrator
from ai_engine.forecaster.lightgbm_model import MultiHorizonDemandForecaster

class ExplainerAgent(BaseCareDOMAgent):
    """Specialized Agent responsible for clinical explainability & natural language synthesis."""

    def __init__(self):
        super().__init__(
            agent_name="ExplainerAgent",
            role_description="TreeSHAP Feature Attribution & Google Gemini Multilingual Decision Explanation"
        )
        self.narrator = GeminiDecisionNarrator()
        self.forecaster = MultiHorizonDemandForecaster()

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Synthesizes mathematical Shapley values and generates plain-language narratives.
        """
        state.transition_to(AgentLifecycleState.EXPLAINING, self.agent_name, "Computing game-theoretic TreeSHAP attributions and Gemini clinical narratives")
        self.logger.info("Generating TreeSHAP feature attributions and Gemini narrative explanation...")
        
        fac_id = state.target_facility_id
        item_code = state.target_item_code
        base_val = 35.0
        pred_val = 45.0
        
        if state.demand_forecast and state.demand_forecast.p50_median_expected:
            pred_val = float(state.demand_forecast.p50_median_expected[0])

        # Extract genuine feature values aligned with forecaster feature names
        feat_names = self.forecaster.feature_names or [
            "facility_encoded", "item_encoded", "category_encoded", "is_dh",
            "day_of_week", "month", "is_weekend",
            "consumption_lag_1d", "consumption_lag_2d", "consumption_lag_3d",
            "consumption_lag_7d", "consumption_lag_14d",
            "rolling_mean_7d", "rolling_std_7d", "rolling_max_14d", "rolling_mean_14d",
            "lag1_to_mean7_ratio", "lag7_to_mean14_ratio",
            "rainfall_lag_3d", "heavy_rain_flag", "epidemic_growth_rate", "epidemic_cases_level"
        ]

        if state.demand_forecast and state.demand_forecast.latest_feature_vector:
            real_features = state.demand_forecast.latest_feature_vector
            feat_values = [float(real_features.get(k, 0.0)) for k in feat_names]
            feat_df = pd.DataFrame([feat_values], columns=feat_names)
        else:
            feat_df = pd.DataFrame([[25.0 if "consumption" in name or "rolling" in name else 0.0 for name in feat_names]], columns=feat_names)
        
        model_obj = self.forecaster.models.get(0.50, None)
        
        # Load empirical background data for TreeSHAP expected value reference
        bg_df = None
        from ai_engine.config import DATA_DIR
        csv_path = DATA_DIR / "brics_consumption_history_seed.csv"
        if csv_path.exists():
            try:
                from ai_engine.forecaster.features import DemandFeatureEngineer
                sample_hist = pd.read_csv(csv_path).head(300)
                bg_X, _, _ = DemandFeatureEngineer.create_features_from_history(sample_hist)
                if len(bg_X) > 10:
                    bg_df = bg_X
            except Exception:
                bg_df = None

        explanation_rep = HealthSHAPExplainer.explain_with_model(
            model=model_obj,
            feature_names=feat_names,
            feature_vector=feat_df,
            background_data=bg_df,
            facility_id=fac_id,
            item_code=item_code,
            base_value=base_val,
            predicted_value=pred_val
        )
        state.decision_explanation = explanation_rep

        # Generate Gemini English and Hindi narratives
        narratives = self.narrator.narrate_explanation(explanation_rep)
        state.multilingual_narratives = narratives

        # Emit completion message to Supervisor
        self.emit_message(
            state=state,
            recipient="SupervisorAgent",
            message_type="CLINICAL_NARRATIVE_READY",
            payload={
                "primary_driver": explanation_rep.primary_driver_summary,
                "english_narrative": narratives.get("english_narrative", ""),
                "hindi_narrative": narratives.get("hindi_narrative", "")
            },
            priority="NORMAL"
        )

        return state
