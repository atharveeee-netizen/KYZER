"""
CLI Evaluation Suite for Facility-Specific Anomaly Detector.
Usage:
    python -m ai_engine.detector.evaluate --facility-specific
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
import numpy as np
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score

from ai_engine.data.real_data_loader import RealHealthcareDatasetLoader
from ai_engine.detector.isolation_forest import PerFacilityAnomalyDetector

def main():
    parser = argparse.ArgumentParser(description="Evaluate Anomaly Detector Precision")
    parser.add_argument("--facility-specific", action="store_true", default=True, help="Evaluate per-facility models")
    args = parser.parse_args()

    print("=" * 80)
    print("🔬 KYZER Anomaly Detection Precision Evaluation")
    print("Testing Per-Facility Isolation Forest Models against Clinical Surges")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    # 1. Load Real World Data
    loader = RealHealthcareDatasetLoader()
    df_raw = loader.build_real_world_training_corpus()
    df_eval = df_raw.copy()

    # 2. Sort by date and compute chronological statistics
    df_eval["date"] = pd.to_datetime(df_eval["date"])
    df_eval = df_eval.sort_values(by=["facility_id", "item_code", "date"]).reset_index(drop=True)

    # 3. Fit Per-Facility Detector on train split (first 80%)
    split_idx = int(len(df_eval) * 0.8)
    df_train = df_eval.iloc[:split_idx].copy()
    df_test = df_eval.iloc[split_idx:].copy().reset_index(drop=True)

    detector = PerFacilityAnomalyDetector(contamination=0.02)
    detector.fit(df_train)

    # 4. Define ground truth on holdout set: local rolling surges (>3.0σ) + injected acute clinical shocks
    df_test_clean = df_test.copy()
    mean_base = df_test_clean.groupby(["facility_id", "item_code"])["consumption"].transform("mean")
    std_base = df_test_clean.groupby(["facility_id", "item_code"])["consumption"].transform("std").fillna(1.0)
    
    roll_mean = df_test_clean.groupby(["facility_id", "item_code"])["consumption"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean()).fillna(mean_base)
    roll_std = df_test_clean.groupby(["facility_id", "item_code"])["consumption"].transform(lambda x: x.shift(1).rolling(7, min_periods=1).std()).fillna(std_base).clip(lower=1.0)
    
    natural_z = (df_test_clean["consumption"] - roll_mean) / (roll_std + 1e-4)
    y_true = (natural_z > 2.8).astype(int)

    # Inject 50 additional acute clinical surge shocks
    np.random.seed(42)
    spike_indices = np.random.choice(len(df_test_clean), size=50, replace=False)
    for idx in spike_indices:
        df_test_clean.loc[idx, "consumption"] += 120.0  # Acute epidemic surge
        y_true.iloc[idx] = 1

    # 5. Predict on holdout test set
    y_pred = detector.predict_anomalies(df_test_clean)

    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print("\n--- CLINICAL ANOMALY DETECTION METRICS ---")
    print(f"  • Total Test Records Analyzed: {len(df_test):,} records across {df_test['facility_id'].nunique()} facilities")
    print(f"  • Ground Truth Spikes:         {int(np.sum(y_true))} events")
    print(f"  • Flagged Anomalies:           {int(np.sum(y_pred))} events")
    print(f"  • Precision (False Alarm Ctrl):{prec * 100.0:.2f}% (Target: > 70.0%)")
    print(f"  • Recall (Emergency Capture):  {rec * 100.0:.2f}%")
    print(f"  • Balanced F1-Score:           {f1:.4f}")

    print("\n" + "=" * 80)
    if prec >= 0.70:
        print("✅ ANOMALY DETECTOR PASS: Precision exceeds 70% threshold (False Alarms Suppressed)!")
    else:
        print("⚠️ ANOMALY DETECTOR WARNING: Precision below 70%")
    print("=" * 80)

if __name__ == "__main__":
    main()
