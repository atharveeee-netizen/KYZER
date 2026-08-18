"""
Feature engineering pipeline for pharmaceutical demand forecasting.
Generates temporal lags, rolling aggregations, meteorological features, and epidemiological markers.
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any

# Global deterministic categorical mappings for LightGBM entity representations
FACILITY_ENCODING: Dict[str, int] = {
    "PHC-PUN-001": 0, "PHC-PUN-002": 1, "PHC-PUN-003": 2, "PHC-PUN-004": 3, "PHC-PUN-005": 4,
    "PHC-PUN-006": 5, "PHC-PUN-007": 6, "PHC-PUN-008": 7, "PHC-PUN-009": 8, "PHC-PUN-010": 9,
    "DH-PUN-001": 10, "PHC-TSH-001": 11, "PHC-TSH-002": 12, "PHC-TSH-003": 13, "PHC-TSH-004": 14,
    "DH-TSH-001": 15, "PHC-MAN-001": 16, "PHC-MAN-002": 17, "DH-MAN-001": 18
}

ITEM_ENCODING: Dict[str, int] = {
    "MED-PCM-500": 0, "MED-AMX-250": 1, "MED-ORS-PKG": 2, "MED-ART-60": 3,
    "MED-SAL-100": 4, "MED-CET-10": 5, "MED-DZP-5": 6
}

CATEGORY_ENCODING: Dict[str, int] = {
    "Analgesics": 0, "Antibiotics": 1, "Hydration": 2, "Antimalarials": 3,
    "Respiratory": 4, "Antihistamines": 5, "Sedatives": 6
}

class DemandFeatureEngineer:
    """Constructs multi-variate feature matrices with categorical entity features for LightGBM."""

    @staticmethod
    def create_features_from_history(
        df_history: pd.DataFrame,
        forecast_horizon: int = 7
    ) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
        """
        Takes a historical time series DataFrame with columns:
        ['date', 'facility_id', 'item_code', 'consumption', 'rainfall_mm', 'active_epidemic_cases', 'is_holiday']
        Returns (X_train, y_train, feature_names).
        """
        df = df_history.copy()
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values(by=["facility_id", "item_code", "date"]).reset_index(drop=True)

        # Categorical entity features
        df["facility_encoded"] = df["facility_id"].map(lambda x: FACILITY_ENCODING.get(str(x), 0)).astype(int)
        df["item_encoded"] = df["item_code"].map(lambda x: ITEM_ENCODING.get(str(x), 0)).astype(int)
        
        if "category" in df.columns:
            df["category_encoded"] = df["category"].map(lambda x: CATEGORY_ENCODING.get(str(x), 0)).astype(int)
        else:
            df["category_encoded"] = 0

        if "is_district_hospital" in df.columns:
            df["is_dh"] = df["is_district_hospital"].astype(int)
        else:
            df["is_dh"] = df["facility_id"].map(lambda x: 1 if "DH" in str(x) else 0).astype(int)

        # Calendar features
        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        
        # Lag features (1d, 2d, 3d, 7d, 14d)
        for lag in [1, 2, 3, 7, 14]:
            df[f"consumption_lag_{lag}d"] = df.groupby(["facility_id", "item_code"])["consumption"].shift(lag)

        # Rolling statistics (7d and 14d windows)
        grouped = df.groupby(["facility_id", "item_code"])["consumption"]
        df["rolling_mean_7d"] = grouped.transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean())
        df["rolling_std_7d"] = grouped.transform(lambda x: x.shift(1).rolling(7, min_periods=1).std().fillna(0))
        df["rolling_max_14d"] = grouped.transform(lambda x: x.shift(1).rolling(14, min_periods=1).max())
        df["rolling_mean_14d"] = grouped.transform(lambda x: x.shift(1).rolling(14, min_periods=1).mean())

        # Relative ratio dynamics
        df["lag1_to_mean7_ratio"] = df["consumption_lag_1d"] / (df["rolling_mean_7d"] + 1.0)
        df["lag7_to_mean14_ratio"] = df["consumption_lag_7d"] / (df["rolling_mean_14d"] + 1.0)

        # Weather / Monsoon interaction
        if "rainfall_mm" in df.columns:
            df["rainfall_lag_3d"] = df.groupby(["facility_id"])["rainfall_mm"].shift(3).fillna(0)
            df["heavy_rain_flag"] = (df["rainfall_mm"] > 30.0).astype(int)
        else:
            df["rainfall_lag_3d"] = 0.0
            df["heavy_rain_flag"] = 0

        # Epidemiological spike signal
        if "active_epidemic_cases" in df.columns:
            shifted_cases = df.groupby(["facility_id"])["active_epidemic_cases"].shift(1).fillna(0)
            cases_diff = df["active_epidemic_cases"] - shifted_cases
            df["epidemic_growth_rate"] = np.where(
                shifted_cases > 0,
                cases_diff / shifted_cases,
                np.where(cases_diff > 0, 1.0, 0.0)
            )
            df["epidemic_cases_level"] = df["active_epidemic_cases"].fillna(0)
        else:
            df["epidemic_growth_rate"] = 0.0
            df["epidemic_cases_level"] = 0.0

        feature_cols = [
            "facility_encoded", "item_encoded", "category_encoded", "is_dh",
            "day_of_week", "month", "is_weekend",
            "consumption_lag_1d", "consumption_lag_2d", "consumption_lag_3d",
            "consumption_lag_7d", "consumption_lag_14d",
            "rolling_mean_7d", "rolling_std_7d", "rolling_max_14d", "rolling_mean_14d",
            "lag1_to_mean7_ratio", "lag7_to_mean14_ratio",
            "rainfall_lag_3d", "heavy_rain_flag", "epidemic_growth_rate", "epidemic_cases_level"
        ]

        # Drop rows where main lags are missing
        df_clean = df.dropna(subset=["consumption_lag_1d", "consumption_lag_2d", "consumption_lag_3d", "consumption_lag_7d"]).copy()
        
        X = df_clean[feature_cols].replace([np.inf, -np.inf], 0.0).fillna(0.0).clip(-1000.0, 10000.0)
        y = df_clean["consumption"].fillna(0.0).clip(0.0, 10000.0)

        return X, y, feature_cols
