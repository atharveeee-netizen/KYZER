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
        """High-fidelity dynamic template fallback matching actual TreeSHAP attribution drivers."""
        
        # Extract top feature driver
        top_driver_name = "general_demand"
        top_factor_desc_en = "observed clinic consumption patterns"
        top_factor_desc_hi = "हाल के उपभोग के रुझानों"

        if explanation.top_contributing_factors:
            top_f = explanation.top_contributing_factors[0]
            top_driver_name = top_f.feature_name
            val = top_f.feature_value

            if "rainfall" in top_driver_name or "rain" in top_driver_name:
                if val > 5.0:
                    top_factor_desc_en = f"heavy local rainfall ({val:.1f} mm) accelerating waterborne cases"
                    top_factor_desc_hi = f"भारी वर्षा ({val:.1f} मिमी) और मौसमी जलभराव"
                else:
                    top_factor_desc_en = "dry-weather clinical distribution cycles"
                    top_factor_desc_hi = "सामान्य मौसमी वितरण चक्र"
            elif "epidemic" in top_driver_name or "cases" in top_driver_name:
                top_factor_desc_en = f"regional epidemiological surge (growth rate {val:+.1f}%)"
                top_factor_desc_hi = f"क्षेत्रीय बीमारी में तीव्र वृद्धि (वृद्धि दर {val:+.1f}%)"
            elif "rolling_mean" in top_driver_name or "rolling" in top_driver_name:
                top_factor_desc_en = f"sustained 7-day rolling consumption baseline ({val:.1f} units/day)"
                top_factor_desc_hi = f"पिछले 7 दिनों की निरंतर उच्च मांग ({val:.1f} यूनिट/दिन)"
            elif "lag" in top_driver_name:
                top_factor_desc_en = f"recent historical dispensing velocity ({val:.1f} units)"
                top_factor_desc_hi = f"हाल ही में दवाओं की बढ़ी हुई खपत ({val:.1f} यूनिट)"
            elif "is_weekend" in top_driver_name or "day_of_week" in top_driver_name:
                top_factor_desc_en = "weekend clinic patient volume influx"
                top_factor_desc_hi = "सप्ताहांत में मरीजों की बढ़ी हुई संख्या"

        en = (
            f"Demand for {explanation.item_code} at {explanation.facility_id} is projected to change from "
            f"{explanation.base_expected_consumption} to {explanation.predicted_demand} units, primarily driven by {top_factor_desc_en}. "
            f"Automated lateral inventory transfer from surplus neighboring facilities is scheduled."
        )
        
        hi = (
            f"{explanation.facility_id} पर {explanation.item_code} की मांग {explanation.base_expected_consumption} से बदलकर "
            f"{explanation.predicted_demand} यूनिट होने का अनुमान है। मुख्य कारण {top_factor_desc_hi} है। "
            f"अतिरिक्त स्टॉक वाले निकटवर्ती स्वास्थ्य केंद्र से स्वचालित पुनर्वितरण की सिफारिश की जाती है।"
        )
        
        return {
            "english_narrative": en,
            "hindi_narrative": hi
        }
