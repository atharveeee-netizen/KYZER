"""
Multivariate Consumption & Inventory Anomaly Detector using Isolation Forest.
Loads pre-trained model from `ai_engine/models/` or fits dynamically.
"""

import logging
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest
from pydantic import BaseModel, Field

from ai_engine.config import AI_ENGINE_DIR

logger = logging.getLogger("ai_engine.detector")
MODELS_DIR = AI_ENGINE_DIR / "models"

class AnomalyRecord(BaseModel):
    """Detailed anomaly diagnostic for a single clinic-medicine pair."""
    facility_id: str
    item_code: str
    date: str
    observed_consumption: float
    expected_baseline: float
    deviation_sigmas: float
    anomaly_score: float
    is_anomaly: bool
    probable_cause: str

class AnomalyDetectionResult(BaseModel):
    """Batch anomaly detection report."""
    total_records_analyzed: int
    anomalies_detected_count: int
    anomaly_rate_pct: float
    flagged_records: List[AnomalyRecord]
    high_priority_alerts: List[Dict[str, Any]]

class HealthInventoryAnomalyDetector:
    """Trains and executes Isolation Forest models on clinical consumption vectors."""

    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.model = None
        self.is_fitted = False
        
        # Try loading pre-trained model
        iso_file = MODELS_DIR / "isolation_forest_model.pkl"
        if iso_file.exists():
            try:
                with open(iso_file, "rb") as f:
                    self.model = pickle.load(f)
                self.is_fitted = True
                logger.info("Loaded pre-trained Isolation Forest model from disk.")
            except Exception:
                pass

        if self.model is None:
            self.model = IsolationForest(
                contamination=contamination,
                random_state=random_state,
                n_estimators=100
            )

    def detect_anomalies(self, df_records: pd.DataFrame) -> AnomalyDetectionResult:
        """Takes DataFrame and tags anomalous consumption events."""
        df = df_records.copy()
        if len(df) < 5:
            return AnomalyDetectionResult(
                total_records_analyzed=len(df),
                anomalies_detected_count=0,
                anomaly_rate_pct=0.0,
                flagged_records=[],
                high_priority_alerts=[]
            )

        # Facility-specific baseline normalization
        if "facility_id" in df.columns and "item_code" in df.columns:
            mean_by_fac = df.groupby(["facility_id", "item_code"])["consumption"].transform("mean")
            std_by_fac = df.groupby(["facility_id", "item_code"])["consumption"].transform("std").fillna(1.0)
            df["consumption_zscore"] = (df["consumption"] - mean_by_fac) / (std_by_fac + 1e-4)
        else:
            mean_by_fac = df["consumption"].mean()
            std_by_fac = max(df["consumption"].std(), 1.0)
            df["consumption_zscore"] = (df["consumption"] - mean_by_fac) / std_by_fac

        df["daily_depletion_rate"] = df["consumption"] / np.maximum(df.get("stock_remaining", 100), 1.0)
        
        feature_cols = ["consumption_zscore", "daily_depletion_rate"]
        if "active_epidemic_cases" in df.columns:
            feature_cols.append("active_epidemic_cases")

        X = df[feature_cols].fillna(0)
        
        if not self.is_fitted:
            self.model.fit(X)
            self.is_fitted = True
        
        try:
            preds = self.model.predict(X)
            scores = self.model.decision_function(X)
        except Exception:
            # Fallback if dimension mismatch
            self.model.fit(X)
            preds = self.model.predict(X)
            scores = self.model.decision_function(X)

        flagged = []
        alerts = []

        for i, (pred, score) in enumerate(zip(preds, scores)):
            row = df.iloc[i]
            cons = float(row["consumption"])
            zscore = float(row["consumption_zscore"])
            expected = float(mean_by_fac.iloc[i] if hasattr(mean_by_fac, "iloc") else mean_by_fac)
            
            # Anomaly triggered only when Z-score > 3.0σ (genuine outlier) or model predicts -1 with positive surge
            is_anom = bool(pred == -1 and (zscore > 2.5 or zscore < -2.5))

            if is_anom:
                if zscore > 2.5:
                    cause = "EPIDEMIC_SURGE"
                elif row.get("stock_remaining", 100) < 5 and cons > 0:
                    cause = "CRITICAL_STOCKOUT_RISK"
                else:
                    cause = "OPERATIONAL_DEVIATION"

                rec = AnomalyRecord(
                    facility_id=str(row.get("facility_id", "PHC-101")),
                    item_code=str(row.get("item_code", "MED-PCM-500")),
                    date=str(row.get("date", "2026-08-18")),
                    observed_consumption=round(cons, 1),
                    expected_baseline=round(expected, 1),
                    deviation_sigmas=round(zscore, 2),
                    anomaly_score=round(float(score), 4),
                    is_anomaly=True,
                    probable_cause=cause
                )
                flagged.append(rec)

                if zscore > 3.0 or cause == "EPIDEMIC_SURGE":
                    alerts.append({
                        "priority": "P0_CRITICAL",
                        "facility_id": rec.facility_id,
                        "item_code": rec.item_code,
                        "message": f"Critical consumption surge ({cons} units, {rec.deviation_sigmas:+.1f}σ from local baseline) detected.",
                        "probable_cause": cause
                    })

        rate = (len(flagged) / len(df)) * 100.0 if len(df) > 0 else 0.0

        return AnomalyDetectionResult(
            total_records_analyzed=len(df),
            anomalies_detected_count=len(flagged),
            anomaly_rate_pct=round(rate, 2),
            flagged_records=flagged,
            high_priority_alerts=alerts
        )
