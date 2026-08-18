"""
Feature engineering pipeline for pharmaceutical demand forecasting.
Generates temporal lags, rolling aggregations, meteorological features, and epidemiological markers.
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any

class DemandFeatureEngineer:
    """Constructs multi-variate feature matrices for LightGBM and Gradient Boosting."""

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

        # Weather / Monsoon interaction
        if "rainfall_mm" in df.columns:
            df["rainfall_lag_3d"] = df.groupby(["facility_id"])["rainfall_mm"].shift(3).fillna(0)
            df["heavy_rain_flag"] = (df["rainfall_mm"] > 30.0).astype(int)
        else:
            df["rainfall_lag_3d"] = 0.0
            df["heavy_rain_flag"] = 0

        # Epidemiological spike signal
        if "active_epidemic_cases" in df.columns:
            # Avoid division by zero in pct_change
            shifted_cases = df.groupby(["facility_id"])["active_epidemic_cases"].shift(1).fillna(0)
            cases_diff = df["active_epidemic_cases"] - shifted_cases
            df["epidemic_growth_rate"] = np.where(
                shifted_cases > 0,
                cases_diff / shifted_cases,
                np.where(cases_diff > 0, 1.0, 0.0)
            )
        else:
            df["epidemic_growth_rate"] = 0.0

        feature_cols = [
            "day_of_week", "month", "is_weekend",
            "consumption_lag_1d", "consumption_lag_2d", "consumption_lag_3d",
            "consumption_lag_7d", "consumption_lag_14d",
            "rolling_mean_7d", "rolling_std_7d", "rolling_max_14d",
            "rainfall_lag_3d", "heavy_rain_flag", "epidemic_growth_rate"
        ]

        # Drop rows where main lags are missing
        df_clean = df.dropna(subset=["consumption_lag_1d", "consumption_lag_2d", "consumption_lag_3d", "consumption_lag_7d"]).copy()
        
        X = df_clean[feature_cols].replace([np.inf, -np.inf], 0.0).fillna(0.0).clip(-1000.0, 10000.0)
        y = df_clean["consumption"].fillna(0.0).clip(0.0, 10000.0)

        return X, y, feature_cols
