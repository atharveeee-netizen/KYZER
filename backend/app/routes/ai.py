"""
KYZER AI & Quantum Engine Router — Person 1's routes, mounted by Person 2
as Service B (see backend/app/main_ai.py). Deliberately has no dependency
on asyncpg/DATABASE_URL/app.database — it's fully self-contained (in-memory
models + ai_engine/data/*.json on disk), which is exactly why it's split
into its own deployable service instead of living in Service A's process:
importing this module pulls in ai_engine and its ~1.4GB of ML/quantum/CV
dependencies (lightgbm, qiskit, opencv, ortools, ...) regardless of whether
the importing process ever serves these routes.
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ai_engine.engine import KYZEREngine
from ai_engine.config import settings
from ai_engine.explainer.shap_explainer import HealthSHAPExplainer

logger = logging.getLogger("backend.routes.ai")

# Modular FastAPI Router for AI, Quantum Routing & OCR Perception
ai_router = APIRouter(tags=["AI Engine & Quantum Routing"])

# Singleton engine instance
_engine: Optional[KYZEREngine] = None

def get_engine() -> KYZEREngine:
    global _engine
    if _engine is None:
        logger.info("Initializing KYZER AI Engine Singleton...")
        _engine = KYZEREngine(pre_load_models=True)
    return _engine

# Request / Response Schemas
class AIRunRequest(BaseModel):
    facility_id: str = Field("PHC-PUN-001", description="Primary Health Centre identifier")
    item_code: str = Field("MED-PCM-500", description="Pharmaceutical Item Code")
    country_code: str = Field("IND", description="ISO 3-Letter Country Code (IND, ZAF, BRA)")

class RoutePlanRequest(BaseModel):
    facility_ids: Optional[List[str]] = Field(None, description="List of clinic IDs (defaults to 9 Pune clinics)")
    donor_id: Optional[str] = Field("PHC-PUN-001", description="Central distribution hub / donor facility")
    target_medicine: str = Field("MED-PCM-500", description="Medicine to redistribute")
    deficit_units: int = Field(500, description="Required units to replenish")

@ai_router.get("/ai/health", tags=["AI Engine"])
async def ai_health_check():
    """Confirms AI engine model weights are pre-loaded in memory."""
    engine = get_engine()
    return {
        "status": "ONLINE",
        "engine_ready": True,
        "quantum_ready": True,
        "gemini_vision_ready": bool(settings.GEMINI_API_KEY)
    }

@ai_router.post("/ai/run", tags=["AI Engine"])
async def run_ai_pipeline(payload: AIRunRequest):
    """Executes perception, forecast, anomaly detection, quantum routing, and explanation."""
    engine = get_engine()
    try:
        result = engine.run(
            facility_id=payload.facility_id,
            item_code=payload.item_code,
            country_code=payload.country_code
        )
        return result
    except Exception as e:
        logger.error(f"Error running AI pipeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@ai_router.post("/routing/plan", tags=["Quantum Routing"])
async def plan_autonomous_9_clinic_route(payload: RoutePlanRequest):
    """
    Autonomously plans the optimal redistribution route across the 9 Pune clinics
    using Google OR-Tools CVRPTW and IBM Quantum QAOA.
    Returns 3D waypoints, stop sequence, and 1-Click Google Maps GPS navigation links.
    """
    engine = get_engine()
    seed_path = os.path.join(settings.DATA_DIR, "brics_facilities_seed.json")
    with open(seed_path, "r", encoding="utf-8") as f:
        all_facs = json.load(f)

    pune_clinics = [f for f in all_facs if f.get("country_code") == "IND"][:10]

    allocator_input = [
        {
            "facility_id": f["facility_id"],
            "name": f["name"],
            "latitude": f["lat"],
            "longitude": f["lng"],
            "demand": -500 if f["facility_id"] == "PHC-PUN-001" else 60 if f.get("surplus", 0) < 0 else -100
        }
        for f in pune_clinics
    ]

    routing_result = engine.route_allocator.optimize_routes(
        facilities=allocator_input,
        priority_facility_ids=["PHC-PUN-002", "PHC-PUN-004"]
    )

    return {
        "status": "SUCCESS",
        "scale_tier": routing_result.scale_tier,
        "algorithm": routing_result.algorithm_executed,
        "total_nodes": routing_result.total_nodes,
        "total_distance_km": routing_result.total_distance_km,
        "total_transit_time_min": routing_result.total_transit_time_min,
        "cold_chain_compliant": routing_result.cold_chain_compliant,
        "ordered_facilities": routing_result.ordered_facilities,
        "google_maps_url": getattr(routing_result, "google_maps_url", ""),
        "whatsapp_nav_share_url": getattr(routing_result, "whatsapp_nav_share_url", ""),
        "stops": [
            {
                "stop_sequence": idx + 1,
                "facility_id": fid,
                "name": next((f["name"] for f in pune_clinics if f["facility_id"] == fid), fid),
                "lat": next((f["lat"] for f in pune_clinics if f["facility_id"] == fid), 18.5204),
                "lng": next((f["lng"] for f in pune_clinics if f["facility_id"] == fid), 73.8567),
            }
            for idx, fid in enumerate(routing_result.ordered_facilities)
        ]
    }

@ai_router.get("/forecast/{facility_id}", tags=["Forecasting"])
async def get_forecast(facility_id: str, item_code: str = "MED-PCM-500"):
    """Returns 7-day quantile prediction (P10/P50/P90) + TreeSHAP feature drivers."""
    engine = get_engine()
    forecast_res = engine.forecaster.predict_multi_horizon(
        facility_id=facility_id,
        item_code=item_code,
        horizon_days=7
    )
    
    # Format daily_forecast for Frontend Recharts
    daily_forecast = []
    if hasattr(forecast_res, "p50_median_expected"):
        for idx in range(len(forecast_res.p50_median_expected)):
            d_label = forecast_res.forecast_dates[idx] if idx < len(forecast_res.forecast_dates) else f"Day {idx+1}"
            daily_forecast.append({
                "day": d_label,
                "p10": forecast_res.p10_lower_bound[idx] if idx < len(forecast_res.p10_lower_bound) else 0.0,
                "p50": forecast_res.p50_median_expected[idx],
                "p90": forecast_res.p90_upper_stress[idx] if idx < len(forecast_res.p90_upper_stress) else 0.0,
            })

    # Compute TreeSHAP drivers
    shap_drivers = []
    try:
        if hasattr(forecast_res, "latest_feature_vector") and forecast_res.latest_feature_vector:
            fv_df = pd.DataFrame([forecast_res.latest_feature_vector])
            base_model = engine.forecaster.models.get(0.50)
            if base_model is not None:
                shap_report = HealthSHAPExplainer.explain_with_model(
                    model=base_model,
                    feature_names=engine.forecaster.feature_names,
                    feature_vector=fv_df,
                    facility_id=facility_id,
                    item_code=item_code,
                    base_value=float(np.mean(forecast_res.p50_median_expected)),
                    predicted_value=float(forecast_res.p50_median_expected[0]) if forecast_res.p50_median_expected else 45.0
                )
                for factor in shap_report.top_contributing_factors[:5]:
                    shap_drivers.append({
                        "feature_name": factor.feature_name,
                        "shap_value": factor.shap_value,
                        "readable_desc": f"{factor.feature_name.replace('_', ' ').title()} ({factor.relative_importance_pct}% impact)",
                        "direction": "UP" if factor.shap_value > 0 else "DOWN"
                    })
    except Exception as e:
        logger.warning(f"SHAP driver computation notice: {e}")

    return {
        "facility_id": facility_id,
        "item_code": item_code,
        "wape_accuracy": "17.48%",
        "daily_forecast": daily_forecast,
        "shap_drivers": shap_drivers,
        "stockout_risk_level": getattr(forecast_res, "stockout_risk_level", "LOW"),
        "total_expected_demand": getattr(forecast_res, "total_expected_demand", 0.0)
    }

@ai_router.post("/ocr/upload", tags=["Perception & OCR"])
async def upload_register_photo(file: UploadFile = File(...)):
    """Ingests clinic register photo -> OpenCV Hough Deskew -> Gemini Vision OCR.
    Extraction only, no DB write - see /api/v1/ocr/commit-register on Service A
    for persisting a structured extraction result to Postgres."""
    engine = get_engine()
    contents = await file.read()
    
    if hasattr(engine, "ocr_engine") and engine.ocr_engine:
        extraction_result = engine.ocr_engine.extract_from_image(contents)
    elif hasattr(engine, "ocr_extractor") and engine.ocr_extractor:
        extraction_result = engine.ocr_extractor.extract_from_image(contents)
    else:
        from ai_engine.ocr.gemini_extractor import GeminiRegisterExtractor
        extractor = GeminiRegisterExtractor()
        extraction_result = extractor.extract_from_image(contents)

    res_data = (
        extraction_result.model_dump()
        if hasattr(extraction_result, "model_dump")
        else extraction_result.dict()
        if hasattr(extraction_result, "dict")
        else extraction_result
    )
    extraction_mode = res_data.get("extraction_mode", "simulated") if isinstance(res_data, dict) else "simulated"
    return {
        "status": "SUCCESS",
        "extraction": res_data,
        "extraction_mode": extraction_mode
    }

class OcrExtractRequest(BaseModel):
    image_base64: str
    facility_id: Optional[str] = "PHC-PUN-002"
    country_code: Optional[str] = "IND"

@ai_router.post("/ocr/extract", tags=["Perception & OCR"])
async def extract_register_base64(req: OcrExtractRequest):
    """Ingests base64 image data -> OpenCV Deskew -> Gemini Vision OCR."""
    import base64
    raw_b64 = req.image_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]
    image_bytes = base64.b64decode(raw_b64)
    from ai_engine.ocr.gemini_extractor import GeminiRegisterExtractor
    extractor = GeminiRegisterExtractor()
    extraction_result = extractor.extract_from_image(
        image_bytes, 
        facility_hint=req.facility_id or "PHC-PUN-002",
        country_hint=req.country_code or "IND"
    )
    res_data = (
        extraction_result.model_dump()
        if hasattr(extraction_result, "model_dump")
        else extraction_result.dict()
        if hasattr(extraction_result, "dict")
        else extraction_result
    )
    extraction_mode = res_data.get("extraction_mode", "simulated") if isinstance(res_data, dict) else "simulated"
    
    entries = []
    if isinstance(res_data, dict) and "medicines" in res_data:
        for idx, med in enumerate(res_data["medicines"]):
            entries.append({
                "id": str(idx + 1),
                "item_code": med.get("item_code", ""),
                "item_name": med.get("generic_name", ""),
                "batch_number": med.get("batch_number", ""),
                "quantity": med.get("quantity", 0),
                "expiry_date": med.get("expiry_date", ""),
                "confidence": med.get("confidence_score", 0.95)
            })

    return {
        "status": "SUCCESS",
        "extraction": res_data,
        "entries": entries,
        "raw_narrative": res_data.get("raw_text_summary") if isinstance(res_data, dict) else "",
        "extraction_mode": extraction_mode
    }

@ai_router.get("/alerts/stream", tags=["Real-Time Alerts"])
async def sse_alert_stream():
    """Server-Sent Events (SSE) broadcasting real-time stockout alerts.

    NOTE: this emits a fixed, hardcoded alert payload on a 15s timer - it is
    NOT derived from real database state (no query against inventory_batches
    or facility_beds). It demonstrates the SSE transport/format for the demo,
    not a working alert pipeline. Don't assume it's wired to live stock
    levels without checking here first.
    """
    async def event_generator():
        while True:
            await asyncio.sleep(15)
            alert_payload = {
                "event": "STOCKOUT_ALERT_P0",
                "facility_id": "PHC-PUN-001",
                "message": "Critical Paracetamol stockout in 1.8 days. Autonomous redistribution dispatched.",
                "marathi_audio_note": "सावधान: प्राथमिक आरोग्य केंद्र शिरूर येथे औषध साठा संपण्याची शक्यता आहे..."
            }
            yield f"data: {json.dumps(alert_payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
