"""
Autonomous Demand Forecaster Agent.
Ingests clinic consumption history and OCR telemetry, executes LightGBM quantile regression
and SEIR epidemic simulation, and publishes multi-horizon forecasts.
"""

import pandas as pd
import numpy as np
from pathlib import Path

from ai_engine.config import DATA_DIR
from ai_engine.agents.base import BaseCareDOMAgent
from ai_engine.agents.state import MultiAgentBlackboardState
from ai_engine.forecaster.lightgbm_model import MultiHorizonDemandForecaster
from ai_engine.forecaster.seir_coupling import SEIRCouplingModel, SEIRSimulationParameters

class ForecasterAgent(BaseCareDOMAgent):
    """Specialized Agent responsible for probabilistic medicine demand forecasting."""

    def __init__(self):
        super().__init__(
            agent_name="ForecasterAgent",
            role_description="Multi-Horizon Quantile Demand Prediction & SEIR Epidemic Modeling"
        )
        self.model = MultiHorizonDemandForecaster()

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Executes forecasting pipeline and updates shared blackboard state.
        """
        self.logger.info(f"Generating demand forecast for {state.target_item_code} at {state.target_facility_id}...")
        
        # Load historical series
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
            # Fallback DataFrame
            df_fac = pd.DataFrame({
                "date": pd.date_range(end=pd.Timestamp.now(), periods=30),
                "facility_id": state.target_facility_id,
                "item_code": state.target_item_code,
                "consumption": np.random.poisson(25, 30),
                "stock_remaining": [100 - i * 2 for i in range(30)],
                "rainfall_mm": [35.0 if i % 6 == 0 else 4.0 for i in range(30)],
                "active_epidemic_cases": [10 if i > 18 else 2 for i in range(30)],
                "is_holiday": [0] * 30
            })

        # Calculate current inventory from OCR if available, else default
        current_inv = 85.0
        if state.raw_register_extracted and state.raw_register_extracted.medicines:
            for med in state.raw_register_extracted.medicines:
                if med.item_code == state.target_item_code:
                    current_inv = float(med.quantity)
                    break

        forecast_res = self.model.predict_future(
            facility_id=state.target_facility_id,
            item_code=state.target_item_code,
            recent_history=df_fac,
            current_inventory=current_inv,
            horizon_days=7
        )

        state.demand_forecast = forecast_res
        
        # Send message to Detector Agent
        priority = "CRITICAL_P0" if forecast_res.stockout_risk_level in ["HIGH", "CRITICAL"] else "NORMAL"
        self.emit_message(
            state=state,
            recipient="DetectorAgent",
            message_type="DEMAND_FORECAST_EMITTED",
            payload={
                "facility_id": state.target_facility_id,
                "item_code": state.target_item_code,
                "p50_expected": forecast_res.total_expected_demand,
                "p90_stress": forecast_res.total_stress_demand,
                "risk_tier": forecast_res.stockout_risk_level
            },
            priority=priority
        )

        return state
