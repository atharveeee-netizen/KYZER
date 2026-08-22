"""
Autonomous Anomaly & Systemic Risk Detector Agent.
Evaluates statistical consumption anomalies and compound 3-pillar risk (Medicines + Beds + Staff),
and triggers lateral supply redistribution when cascade thresholds are breached.
"""

import pandas as pd
import numpy as np
from pathlib import Path

from ai_engine.config import DATA_DIR
from ai_engine.agents.base import BaseKYZERAgent
from ai_engine.agents.state import MultiAgentBlackboardState
from ai_engine.detector.isolation_forest import HealthInventoryAnomalyDetector
from ai_engine.detector.cascade_detector import SystemicCascadeAnalyzer

class DetectorAgent(BaseKYZERAgent):
    """Specialized Agent responsible for operational risk and anomaly detection."""

    def __init__(self):
        super().__init__(
            agent_name="DetectorAgent",
            role_description="Multi-Pillar Compound Systemic Risk Assessment & Anomaly Detection"
        )
        self.anomaly_detector = HealthInventoryAnomalyDetector()

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Processes forecasts and telemetry to identify vulnerabilities and trigger intervention.
        """
        self.logger.info("Executing 3-pillar compound risk and anomaly detection...")
        
        # Load historical series for anomaly detector
        csv_path = DATA_DIR / "brics_consumption_history_seed.csv"
        if csv_path.exists():
            df_all = pd.read_csv(csv_path)
            df_fac = df_all[
                (df_all["facility_id"] == state.target_facility_id) & 
                (df_all["item_code"] == state.target_item_code)
            ].copy()
            if len(df_fac) == 0:
                df_fac = df_all[df_all["item_code"] == state.target_item_code].copy()
        else:
            df_fac = pd.DataFrame({
                "consumption": [25.0] * 20,
                "stock_remaining": [80.0] * 20
            })

        anomaly_res = self.anomaly_detector.detect_anomalies(df_fac)
        state.anomaly_report = anomaly_res

        # Extract bed and staff telemetry from OCR if available
        ocr = state.raw_register_extracted
        gen_occ = ocr.beds.general_occupied if ocr else 19
        gen_tot = ocr.beds.general_total if ocr else 24
        icu_occ = ocr.beds.icu_occupied if ocr else 3
        icu_tot = ocr.beds.icu_total if ocr else 4
        doc_pres = ocr.staff.doctors_present if ocr else 2
        doc_exp = ocr.staff.doctors_expected if ocr else 2
        nurse_pres = ocr.staff.nurses_present if ocr else 5
        nurse_exp = ocr.staff.nurses_expected if ocr else 6

        # Days of stock left estimate
        days_left = 2.5
        if state.demand_forecast and state.demand_forecast.total_expected_demand > 0:
            daily_rate = state.demand_forecast.total_expected_demand / 7.0
            current_stock = 85.0
            days_left = current_stock / max(daily_rate, 1.0)

        risk_score = SystemicCascadeAnalyzer.evaluate_facility(
            facility_id=state.target_facility_id,
            country_code=state.country_code,
            stock_days_left=days_left,
            general_occupied=gen_occ,
            general_total=gen_tot,
            icu_occupied=icu_occ,
            icu_total=icu_tot,
            doctors_present=doc_pres,
            doctors_expected=doc_exp,
            nurses_present=nurse_pres,
            nurses_expected=nurse_exp
        )

        state.compound_risk = risk_score
        
        # Decision logic: Trigger Allocator if risk is P0 or P1, or forecast is HIGH risk
        needs_redist = (
            risk_score.risk_tier in ["P0_CRITICAL", "P1_HIGH"] or 
            (state.demand_forecast and state.demand_forecast.stockout_risk_level in ["HIGH", "CRITICAL"])
        )
        state.requires_emergency_redistribution = needs_redist

        # Emit standard diagnostic risk message
        self.emit_message(
            state=state,
            recipient="SupervisorAgent",
            message_type="DIAGNOSTIC_RISK_EVALUATED",
            payload={
                "facility_id": state.target_facility_id,
                "risk_tier": risk_score.risk_tier,
                "composite_score": risk_score.composite_cascade_risk_score,
                "requires_emergency_redistribution": needs_redist
            },
            priority="HIGH" if needs_redist else "NORMAL"
        )

        if needs_redist:
            self.emit_message(
                state=state,
                recipient="AllocatorAgent",
                message_type="EMERGENCY_REDISTRIBUTION_TRIGGERED",
                payload={
                    "facility_id": state.target_facility_id,
                    "risk_tier": risk_score.risk_tier,
                    "composite_score": risk_score.composite_cascade_risk_score,
                    "recommended_action": "Execute Quantum QUBO & OR-Tools lateral replenishment"
                },
                priority="CRITICAL_P0"
            )
        else:
            self.emit_message(
                state=state,
                recipient="ExplainerAgent",
                message_type="MONITORING_NORMAL",
                payload={"status": "Routine stock levels sufficient"},
                priority="NORMAL"
            )

        return state
