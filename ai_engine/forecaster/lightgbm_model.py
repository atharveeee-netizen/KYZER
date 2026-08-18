"""
Multi-Horizon Quantile Demand Forecaster (P10, P50, P90).
Uses pre-trained model bundles (from `ai_engine/models/`) or on-the-fly training
with LightGBM / GradientBoosting to output probabilistic confidence intervals.
"""

import logging
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field

from ai_engine.config import settings, AI_ENGINE_DIR
from ai_engine.forecaster.features import DemandFeatureEngineer

logger = logging.getLogger("ai_engine.forecaster")
MODELS_DIR = AI_ENGINE_DIR / "models"

class QuantileForecastResult(BaseModel):
    """Result of multi-horizon quantile demand prediction."""
    facility_id: str
    item_code: str
    horizon_days: int
    forecast_dates: List[str]
    p10_lower_bound: List[float]
    p50_median_expected: List[float]
    p90_upper_stress: List[float]
    total_expected_demand: float
    total_stress_demand: float
    stockout_risk_level: str
    feature_importances: Dict[str, float] = Field(default_factory=dict)

class MultiHorizonDemandForecaster:
    """Trains and executes multi-quantile gradient boosting models for medicine demand."""

    def __init__(self, alphas: Optional[List[float]] = None):
        self.alphas = alphas or settings.QUANTILE_ALPHAS
        self.models: Dict[float, Any] = {}
        self.feature_names: List[str] = []
        self.is_trained: bool = False
        
        # Check if pre-trained model exists
        bundle_file = MODELS_DIR / "forecaster_models_bundle.pkl"
        if bundle_file.exists():
            try:
                with open(bundle_file, "rb") as f:
                    bundle = pickle.load(f)
                self.models = bundle.get("models", {})
                self.feature_names = bundle.get("feature_names", [])
                self.alphas = bundle.get("alphas", self.alphas)
                self.is_trained = len(self.models) > 0
                logger.info("Loaded pre-trained Forecaster model bundle from disk.")
            except Exception as e:
                logger.warning(f"Could not load pre-trained bundle ({e}), will train dynamically.")

    def train(self, df_history: pd.DataFrame) -> Dict[str, Any]:
        """Trains models for each quantile alpha (0.1, 0.5, 0.9)."""
        X, y, self.feature_names = DemandFeatureEngineer.create_features_from_history(df_history)
        
        if len(X) < 10:
            self.is_trained = True
            return {"status": "trained_heuristic", "samples": len(X)}

        from sklearn.ensemble import GradientBoostingRegressor
        for alpha in self.alphas:
            model = GradientBoostingRegressor(
                loss="quantile",
                alpha=alpha,
                n_estimators=60,
                learning_rate=0.05,
                max_depth=3,
                random_state=42
            )
            model.fit(X, y)
            self.models[alpha] = model

        self.is_trained = True
        return {
            "status": "success",
            "engine": "Scikit-Learn GradientBoosting",
            "samples": len(X),
            "features": self.feature_names
        }

    def predict_future(
        self,
        facility_id: str,
        item_code: str,
        recent_history: pd.DataFrame,
        current_inventory: float,
        horizon_days: int = 7
    ) -> QuantileForecastResult:
        """Generates 7-day multi-horizon quantile forecast."""
        if not self.is_trained or not self.models:
            self.train(recent_history)

        X, y, feat_cols = DemandFeatureEngineer.create_features_from_history(recent_history)
        
        if len(X) > 0 and 0.50 in self.models:
            latest_feature_vector = X.iloc[[-1]].copy()
            p10_val = max(1.0, float(self.models[0.10].predict(latest_feature_vector)[0]))
            p50_val = max(p10_val, float(self.models[0.50].predict(latest_feature_vector)[0]))
            p90_val = max(p50_val, float(self.models[0.90].predict(latest_feature_vector)[0]))
        else:
            base_cons = float(recent_history["consumption"].iloc[-7:].mean()) if "consumption" in recent_history.columns else 20.0
            p10_val = base_cons * 0.8
            p50_val = base_cons * 1.1
            p90_val = base_cons * 1.6

        p10_seq, p50_seq, p90_seq, dates = [], [], [], []
        start_date = pd.Timestamp.now().floor('D')
        
        for d in range(1, horizon_days + 1):
            future_dt = start_date + pd.Timedelta(days=d)
            dates.append(future_dt.strftime("%Y-%m-%d"))
            multiplier = 0.75 if future_dt.dayofweek in [5, 6] else 1.05
            p10_seq.append(round(p10_val * multiplier, 1))
            p50_seq.append(round(p50_val * multiplier, 1))
            p90_seq.append(round(p90_val * multiplier * (1.0 + 0.03 * d), 1))

        total_expected = sum(p50_seq)
        total_stress = sum(p90_seq)
        
        lead_time_stress_demand = sum(p90_seq[:3])
        if current_inventory <= 0:
            risk = "CRITICAL"
        elif current_inventory < lead_time_stress_demand:
            risk = "HIGH"
        elif current_inventory < total_expected:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        importances = {}
        if 0.50 in self.models and hasattr(self.models[0.50], "feature_importances_"):
            raw_imp = self.models[0.50].feature_importances_
            total_imp = sum(raw_imp) if sum(raw_imp) > 0 else 1.0
            for name, val in zip(self.feature_names, raw_imp):
                importances[name] = round(float(val) / total_imp, 4)

        return QuantileForecastResult(
            facility_id=facility_id,
            item_code=item_code,
            horizon_days=horizon_days,
            forecast_dates=dates,
            p10_lower_bound=p10_seq,
            p50_median_expected=p50_seq,
            p90_upper_stress=p90_seq,
            total_expected_demand=round(total_expected, 1),
            total_stress_demand=round(total_stress, 1),
            stockout_risk_level=risk,
            feature_importances=importances
        )
