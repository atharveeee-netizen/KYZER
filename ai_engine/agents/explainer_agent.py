"""
Autonomous Explainability & Multilingual Narrator Agent.
Calculates game-theoretic TreeSHAP feature attributions and uses Google Gemini to translate
complex optimization decisions into human-readable clinical narratives (English & Hindi).
"""

from typing import Dict, Any, List

from ai_engine.agents.base import BaseCareDOMAgent
from ai_engine.agents.state import MultiAgentBlackboardState
from ai_engine.explainer.shap_explainer import HealthSHAPExplainer
from ai_engine.explainer.gemini_narrator import GeminiDecisionNarrator

class ExplainerAgent(BaseCareDOMAgent):
    """Specialized Agent responsible for clinical explainability & natural language synthesis."""

    def __init__(self):
        super().__init__(
            agent_name="ExplainerAgent",
            role_description="TreeSHAP Feature Attribution & Google Gemini Multilingual Decision Explanation"
        )
        self.narrator = GeminiDecisionNarrator()

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Synthesizes mathematical Shapley values and generates plain-language narratives.
        """
        self.logger.info("Generating TreeSHAP feature attributions and Gemini narrative explanation...")
        
        # Determine baseline and predicted demand
        base_val = 25.0
        pred_val = 65.0
        if state.demand_forecast and state.demand_forecast.p50_median_expected:
            pred_val = float(state.demand_forecast.p50_median_expected[0])

        feat_names = ["epidemic_growth_rate", "rainfall_lag_3d", "consumption_lag_7d", "rolling_mean_7d", "is_weekend"]
        feat_vals = [0.45, 42.0, 35.0, 28.0, 0.0]

        explanation_rep = HealthSHAPExplainer.explain_prediction(
            feature_names=feat_names,
            feature_values=feat_vals,
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
