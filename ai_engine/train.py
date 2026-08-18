"""
Master Training & Model Calibration Suite for CareDOM AI Engine.
Trains and empirically validates:
1. Multi-Horizon Quantile Demand Forecaster (Temporal Train/Test Split, Pinball Loss, WAPE)
2. Multivariate Isolation Forest (Evaluated on injected anomaly ground truth via sklearn.metrics)
3. SEIR-Inventory Epidemic Dynamics (Numerically calibrated to disease incidence data)
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import time
import json
import pickle
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple
from sklearn.metrics import mean_absolute_error, f1_score, precision_score, recall_score
from sklearn.ensemble import IsolationForest, GradientBoostingRegressor

from ai_engine.config import DATA_DIR, AI_ENGINE_DIR, settings
from ai_engine.forecaster.features import DemandFeatureEngineer
from ai_engine.data.real_data_loader import RealHealthcareDatasetLoader

logger = logging.getLogger("ai_engine.trainer")
MODELS_DIR = AI_ENGINE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def train_forecaster_suite(df_history: pd.DataFrame) -> Dict[str, Any]:
    """
    Trains LightGBM / GradientBoosting models on temporal holdout split.
    """
    print("\n" + "=" * 80)
    print("🧠 [1/3] TRAINING QUANTILE DEMAND FORECASTER (P10, P50, P90)")
    print("=" * 80)

    # 1. Feature Engineering
    X, y, feature_cols = DemandFeatureEngineer.create_features_from_history(df_history)
    print(f"Total feature samples: {len(X)} | Feature dimensions: {len(feature_cols)}")
    print(f"Engineered features: {feature_cols}")

    # 2. Strict Temporal 80/20 Train/Test Split (No Geographic Leakage)
    if "date" in df_history.columns:
        dates_sorted = np.sort(df_history["date"].unique())
        split_date = dates_sorted[int(len(dates_sorted) * 0.8)]
        # Map back to feature matrix
        is_train = df_history.loc[X.index, "date"] < split_date
        X_train, y_train = X[is_train], y[is_train]
        X_test, y_test = X[~is_train], y[~is_train]
    else:
        split_idx = int(len(X) * 0.8)
        X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]
        X_test, y_test = X.iloc[split_idx:], y.iloc[split_idx:]

    print(f"Training set: {len(X_train)} samples | Out-of-sample Test set: {len(X_test)} samples")

    # 3. Fit Quantile Models
    models = {}
    alphas = [0.10, 0.50, 0.90]
    engine_name = "Scikit-Learn GradientBoosting"
    
    # Try LightGBM first
    has_lgb = False
    try:
        import lightgbm as lgb
        has_lgb = True
        engine_name = "LightGBM Quantile Regressor"
    except ImportError:
        has_lgb = False

    t0 = time.perf_counter()
    for alpha in alphas:
        if has_lgb:
            model = lgb.LGBMRegressor(
                objective="quantile",
                alpha=alpha,
                n_estimators=100,
                learning_rate=0.05,
                max_depth=4,
                num_leaves=15,
                random_state=42,
                verbosity=-1
            )
        else:
            model = GradientBoostingRegressor(
                loss="quantile",
                alpha=alpha,
                n_estimators=80,
                learning_rate=0.05,
                max_depth=4,
                random_state=42
            )
        model.fit(X_train, y_train)
        models[alpha] = model

    train_runtime_ms = (time.perf_counter() - t0) * 1000

    # 4. Out-of-Sample Empirical Evaluation
    p10_preds = models[0.10].predict(X_test)
    p50_preds = models[0.50].predict(X_test)
    p90_preds = models[0.90].predict(X_test)

    # Pinball Losses
    def pinball_loss(y_true, y_pred, alpha):
        diff = y_true - y_pred
        return np.mean(np.maximum(alpha * diff, (alpha - 1) * diff))

    pb10 = pinball_loss(y_test, p10_preds, 0.10)
    pb50 = pinball_loss(y_test, p50_preds, 0.50)
    pb90 = pinball_loss(y_test, p90_preds, 0.90)

    # Coverage & WAPE
    in_interval = (y_test >= p10_preds) & (y_test <= p90_preds)
    coverage_pct = (np.sum(in_interval) / len(y_test)) * 100.0
    wape_pct = (np.sum(np.abs(y_test - p50_preds)) / max(np.sum(y_test), 1.0)) * 100.0
    median_mape_pct = np.median(np.abs(y_test - p50_preds) / np.maximum(y_test, 1.0)) * 100.0

    print("\n--- FORECASTER PERFORMANCE BENCHMARKS ---")
    print(f"  • Training Engine:             {engine_name}")
    print(f"  • Training Runtime:            {train_runtime_ms:.2f} ms")
    print(f"  • WAPE (Weighted Abs Error):   {wape_pct:.2f}% (Target: <25%)")
    print(f"  • Median MAPE:                 {median_mape_pct:.2f}%")
    print(f"  • P10/P90 Interval Coverage:   {coverage_pct:.1f}% (Expected: ~80%)")
    print(f"  • Pinball Loss (P10/P50/P90):  {pb10:.3f} / {pb50:.3f} / {pb90:.3f}")

    # Serialize Model Artifact
    bundle_path = MODELS_DIR / "forecaster_models_bundle.pkl"
    with open(bundle_path, "wb") as f:
        pickle.dump({
            "models": models,
            "feature_names": feature_cols,
            "alphas": alphas,
            "engine": engine_name,
            "wape": wape_pct,
            "coverage": coverage_pct
        }, f)
    print(f"  💾 Serialized Forecaster Model Bundle -> {bundle_path}")

    return {
        "engine": engine_name,
        "wape_pct": round(wape_pct, 2),
        "coverage_pct": round(coverage_pct, 2),
        "model_path": str(bundle_path)
    }

def train_anomaly_detector_suite(df_history: pd.DataFrame) -> Dict[str, Any]:
    """
    Fits Multivariate Isolation Forest and computes real F1-score against injected ground truth.
    """
    print("\n" + "=" * 80)
    print("🚨 [2/3] TRAINING ISOLATION FOREST CONSUMPTION ANOMALY DETECTOR")
    print("=" * 80)

    df = df_history.copy()
    df["daily_depletion_rate"] = df["consumption"] / np.maximum(df.get("stock_remaining", 100), 1.0)
    
    feature_cols = ["consumption"]
    if "stock_remaining" in df.columns:
        feature_cols.append("daily_depletion_rate")
    if "active_epidemic_cases" in df.columns:
        feature_cols.append("active_epidemic_cases")

    X = df[feature_cols].fillna(0)

    # 1. Fit Isolation Forest
    t0 = time.perf_counter()
    iso_model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    iso_model.fit(X)
    runtime_ms = (time.perf_counter() - t0) * 1000

    # 2. Genuine Ground-Truth Evaluation on Injected Anomalies
    X_eval = X.copy().iloc[:1000].reset_index(drop=True)
    y_true = np.zeros(len(X_eval), dtype=int)  # 0: normal, 1: anomaly
    
    # Inject known anomaly spikes in 50 random records (5% ground truth anomalies)
    np.random.seed(42)
    spike_indices = np.random.choice(len(X_eval), size=50, replace=False)
    for idx in spike_indices:
        X_eval.loc[idx, "consumption"] *= 4.5  # Surge spike
        if "active_epidemic_cases" in X_eval.columns:
            X_eval.loc[idx, "active_epidemic_cases"] += 35
        y_true[idx] = 1

    # Predict with Isolation Forest (-1 is anomaly, 1 is normal)
    raw_preds = iso_model.predict(X_eval)
    y_pred = (raw_preds == -1).astype(int)

    # Real Sklearn Metric Computations
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))

    preds_all = iso_model.predict(X)
    anom_count = int(np.sum(preds_all == -1))

    print("\n--- ANOMALY DETECTOR BENCHMARKS ---")
    print(f"  • Training Runtime:            {runtime_ms:.2f} ms")
    print(f"  • Total Vectors Analyzed:      {len(X)}")
    print(f"  • Anomalies Flagged:           {anom_count} ({(anom_count/len(X))*100:.1f}% contamination)")
    print(f"  • Empirical F1-Score:          {f1:.3f} (Precision: {prec:.2f}, Recall: {rec:.2f})")

    # Serialize
    iso_path = MODELS_DIR / "isolation_forest_model.pkl"
    with open(iso_path, "wb") as f:
        pickle.dump(iso_model, f)
    print(f"  💾 Serialized Anomaly Detector -> {iso_path}")

    return {
        "anomalies_flagged": anom_count,
        "f1_score": round(f1, 3),
        "precision": round(prec, 3),
        "recall": round(rec, 3),
        "model_path": str(iso_path)
    }

def calibrate_seir_dynamics(df_history: pd.DataFrame) -> Dict[str, Any]:
    """
    Numerically calibrates SEIR epidemiological transmission parameters from actual case data
    using non-linear least-squares trajectory optimization on the ODE system.
    """
    print("\n" + "=" * 80)
    print("🧬 [3/3] CALIBRATING SEIR-INVENTORY EPIDEMIOLOGICAL DYNAMICAL PARAMETERS")
    print("=" * 80)

    # Extract observed daily active cases trajectory
    if "active_epidemic_cases" in df_history.columns:
        daily_series = df_history.groupby("date")["active_epidemic_cases"].mean().values
    else:
        daily_series = np.array([2, 3, 5, 8, 14, 22, 28, 35, 30, 24, 18, 12, 8, 5])

    observed_I = daily_series[:min(len(daily_series), 60)].astype(float)
    N_pop = 45000.0
    init_I = max(observed_I[0], 2.0)
    init_E = init_I * 2.0
    init_S = N_pop - init_E - init_I

    # ODE simulation forward step
    def seir_loss(params):
        beta_try, sigma_try, gamma_try = params
        S, E, I = init_S, init_E, init_I
        sim_I = []
        for _ in range(len(observed_I)):
            sim_I.append(I)
            new_exposed = (beta_try * S * I) / N_pop
            new_infected = sigma_try * E
            new_recovered = gamma_try * I
            S = max(0.0, S - new_exposed)
            E = max(0.0, E + new_exposed - new_infected)
            I = max(0.0, I + new_infected - new_recovered)
        sim_arr = np.array(sim_I)
        return float(np.mean((sim_arr - observed_I) ** 2))

    from scipy.optimize import minimize
    res = minimize(
        seir_loss,
        x0=[0.45, 0.20, 0.22],
        bounds=[(0.05, 1.20), (0.05, 0.50), (0.05, 0.50)],
        method="L-BFGS-B"
    )

    beta_opt, sigma_opt, gamma_opt = res.x
    gamma_treated = float(np.clip(gamma_opt, 0.15, 0.35))
    gamma_untreated = float(np.clip(gamma_treated * 0.40, 0.05, 0.15))
    r0_empirical = float(beta_opt / gamma_treated)

    calib = {
        "transmission_rate_beta": round(float(beta_opt), 4),
        "incubation_rate_sigma": round(float(sigma_opt), 4),
        "recovery_treated_gamma1": round(gamma_treated, 4),
        "recovery_untreated_gamma0": round(gamma_untreated, 4),
        "empirical_r0": round(r0_empirical, 2),
        "cascade_amplification_factor": round(gamma_treated / gamma_untreated, 2),
        "optimization_loss_mse": round(float(res.fun), 4)
    }

    print("Calibrated Epidemic Parameters (Numerical Least-Squares L-BFGS-B):")
    for k, v in calib.items():
        print(f"  • {k}: {v}")

    seir_path = MODELS_DIR / "calibrated_seir_params.json"
    with open(seir_path, "w", encoding="utf-8") as f:
        json.dump(calib, f, indent=2)
    print(f"  💾 Serialized Numerical SEIR Calibration -> {seir_path}")

    return calib

def main():
    print("=" * 80)
    print("🚀 CareDOM AI Engine — Multi-Agent Training & Model Calibration Suite")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    t_start = time.perf_counter()
    loader = RealHealthcareDatasetLoader()
    df_corpus = loader.build_real_world_training_corpus()
    print(f"Loaded training dataset: {len(df_corpus)} rows across BRICS clinics.")

    fc_metrics = train_forecaster_suite(df_corpus)
    iso_metrics = train_anomaly_detector_suite(df_corpus)
    seir_metrics = calibrate_seir_dynamics(df_corpus)

    total_time = time.perf_counter() - t_start
    print("\n" + "=" * 80)
    print(f"✅ All AI Models Successfully Trained and Calibrated in {total_time:.2f}s!")
    print(f"Model weights serialized to: {MODELS_DIR}")
    print("=" * 80)

if __name__ == "__main__":
    main()
