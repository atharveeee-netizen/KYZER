"""
Main CLI entrypoint and benchmark suite for the CareDOM AI Engine (KYZER).
Demonstrates end-to-end execution of all 5 AI components with benchmarks.
"""

import sys
import io

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
import time
import pandas as pd
from ai_engine.pipeline import CareDOMAIPipeline

def main():
    print("=" * 80)
    print("CareDOM AI Engine - Autonomous Health Centre & Supply Chain System")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)
    
    pipeline = CareDOMAIPipeline()
    
    print("\n[Step 1/5] Ingesting Register via Google Gemini 1.5 Flash Vision OCR...")
    print("[Step 2/5] Running Multi-Horizon Quantile Demand Forecaster (P10/P50/P90)...")
    print("[Step 3/5] Computing 3-Pillar Compound Systemic Risk (Meds + Beds + Staff)...")
    print("[Step 4/5] Executing Quantum-Classical Hybrid Optimizer (QUBO-SA + OR-Tools)...")
    print("[Step 5/5] Generating TreeSHAP Explanations & Gemini Multilingual Narrative...")
    
    st = time.perf_counter()
    summary = pipeline.run_full_pipeline(
        country_code="IND",
        target_facility_id="PHC-PUN-002",
        target_item_code="MED-ORS-PKG"
    )
    tot_time = time.perf_counter() - st
    
    print("\n" + "=" * 80)
    print("1. OCR REGISTER EXTRACTION (Google Gemini 1.5 Flash)")
    print("=" * 80)
    if summary.ocr_result:
        print(f"Facility ID: {summary.ocr_result.facility_id} ({summary.ocr_result.country_code})")
        print(f"Extraction Latency: {summary.ocr_result.processing_time_ms} ms")
        print("Extracted Medicines:")
        for med in summary.ocr_result.medicines[:3]:
            print(f"  * [{med.item_code}] {med.generic_name} | Qty: {med.quantity} {med.unit} | Exp: {med.expiry_date} (Conf: {med.confidence_score*100:.0f}%)")
        print(f"Bed Telemetry: General {summary.ocr_result.beds.general_occupied}/{summary.ocr_result.beds.general_total} | ICU {summary.ocr_result.beds.icu_occupied}/{summary.ocr_result.beds.icu_total}")
        print(f"Staff Telemetry: Doctors {summary.ocr_result.staff.doctors_present}/{summary.ocr_result.staff.doctors_expected} | Nurses {summary.ocr_result.staff.nurses_present}/{summary.ocr_result.staff.nurses_expected}")

    print("\n" + "=" * 80)
    print("2. MULTI-HORIZON QUANTILE DEMAND FORECAST (LightGBM + SEIR)")
    print("=" * 80)
    fc = summary.forecast_result
    print(f"Item: {fc.item_code} | Facility: {fc.facility_id} | Risk Tier: {fc.stockout_risk_level}")
    print(f"7-Day Expected Demand (P50): {fc.total_expected_demand} units | Stress Demand (P90): {fc.total_stress_demand} units")
    print(f"Dates:     {fc.forecast_dates[:4]}")
    print(f"P10 Lower: {fc.p10_lower_bound[:4]}")
    print(f"P50 Exp:   {fc.p50_median_expected[:4]}")
    print(f"P90 High:  {fc.p90_upper_stress[:4]}")

    print("\n" + "=" * 80)
    print("3. COMPOUND 3-PILLAR SYSTEMIC RISK ASSESSMENT")
    print("=" * 80)
    cr = summary.compound_risk_score
    print(f"Overall Risk Tier: {cr.risk_tier} (Composite Score: {cr.composite_cascade_risk_score:.3f}/1.000)")
    print(f"  - Medicine Stockout Velocity Risk: {cr.medicine_risk_score:.3f}")
    print(f"  - Bed Occupancy Stress:            {cr.bed_stress_score:.3f}")
    print(f"  - Staffing Shortage Deficit:       {cr.staffing_deficit_score:.3f}")
    print("Recommended Interventions:")
    for rec in cr.recommended_interventions:
        print(f"  -> {rec}")

    print("\n" + "=" * 80)
    print("4. QUANTUM-CLASSICAL HYBRID ALLOCATION BENCHMARK (OR-Tools + QUBO)")
    print("=" * 80)
    print(f"Convergence Speedup: +{summary.optimization_benchmark.convergence_speedup_pct:.1f}% faster convergence")
    print(f"Quantum Hardware Ready: {summary.optimization_benchmark.quantum_hardware_ready} (D-Wave Advantage / Google Cirq compatible)")
    print("\nBenchmark Master Table:")
    print(pd.DataFrame(summary.optimization_benchmark.benchmark_table).to_string(index=False))

    print("\n" + "=" * 80)
    print("5. EXPLAINABLE AI (TreeSHAP) & GEMINI NATURAL LANGUAGE NARRATIVE")
    print("=" * 80)
    print(f"Primary Root Cause: {summary.explanation.primary_driver_summary}")
    print("\nEnglish Clinical Briefing:")
    print(f"  \"{summary.narrative.get('english_narrative', '')}\"")
    print("\nHindi (Devanagari) Community Briefing:")
    print(f"  \"{summary.narrative.get('hindi_narrative', '')}\"")

    print("\n" + "=" * 80)
    print(f"[SUCCESS] End-to-End Pipeline Completed in {summary.total_pipeline_latency_ms:.2f} ms")
    print("=" * 80)

if __name__ == "__main__":
    main()
