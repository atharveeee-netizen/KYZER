"""
Google Gemini Multilingual Natural Language Decision Narrator.
Translates mathematical SHAP values and optimization plans into plain-English and Hindi
actionable guidance for frontline health workers and District Health Officers.
"""

import os
import json
import logging
import urllib.request
from typing import Dict, Any, Optional

from ai_engine.config import settings
from ai_engine.explainer.shap_explainer import DecisionExplanationReport

logger = logging.getLogger("ai_engine.explainer.narrator")

class GeminiDecisionNarrator:
    """Uses Google Gemini 1.5 Flash to synthesize clinical rationale."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_MODEL_TEXT
        self.endpoint_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

    def narrate_explanation(
        self,
        explanation: DecisionExplanationReport,
        target_language: str = "en"
    ) -> Dict[str, str]:
        """
        Generates intuitive plain-text summaries in English and Hindi.
        """
        if not self.api_key:
            return self._generate_simulated_narrative(explanation, target_language)

        prompt = f"""
        You are an AI Clinical Assistant explaining an automated medicine restocking recommendation to a District Health Officer in India.
        Translate these mathematical metrics into a concise 2-3 sentence clinical briefing:
        - Medicine: {explanation.item_code}
        - Base Daily Consumption: {explanation.base_expected_consumption} units
        - Predicted Demand Spike: {explanation.predicted_demand} units
        - Key Factor: {explanation.primary_driver_summary}
        - Top Factors: {json.dumps([f.model_dump() for f in explanation.top_contributing_factors])}

        Provide two sections:
        1. 'english_narrative': Professional 2-sentence explanation.
        2. 'hindi_narrative': Simple Hindi translation in Devanagari script for local ASHA workers.
        Return strictly JSON with keys "english_narrative" and "hindi_narrative".
        """

        try:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                f"{self.endpoint_url}?key={self.api_key}",
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = json.loads(response.read().decode("utf-8"))
            
            cand_text = res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
            if cand_text.startswith("```json"):
                cand_text = cand_text[7:]
            if cand_text.endswith("```"):
                cand_text = cand_text[:-3]
            cand_text = cand_text.strip()
            
            return json.loads(cand_text)

        except Exception as e:
            logger.warning(f"Gemini narrator call failed ({e}). Returning high-fidelity template narrative.")
            return self._generate_simulated_narrative(explanation, target_language)

    def _generate_simulated_narrative(
        self,
        explanation: DecisionExplanationReport,
        target_language: str
    ) -> Dict[str, str]:
        """High-fidelity template fallback for offline demo."""
        en = (
            f"Demand for {explanation.item_code} at {explanation.facility_id} is projected to surge from "
            f"{explanation.base_expected_consumption} to {explanation.predicted_demand} units. "
            f"{explanation.primary_driver_summary} Automated lateral transfer from neighboring surplus clinic is recommended."
        )
        hi = (
            f"{explanation.facility_id} पर {explanation.item_code} की मांग {explanation.base_expected_consumption} से बढ़कर "
            f"{explanation.predicted_demand} होने का अनुमान है। भारी बारिश और मौसमी बीमारी के कारण मांग में वृद्धि हुई है। "
            f"पास के स्वास्थ्य केंद्र से तुरंत अतिरिक्त दवा भेजने की सिफारिश की जाती है।"
        )
        return {
            "english_narrative": en,
            "hindi_narrative": hi
        }
