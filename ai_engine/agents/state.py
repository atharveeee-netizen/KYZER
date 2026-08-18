"""
Shared State Schema for the CareDOM Autonomous Multi-Agent System.
Implements the shared blackboard pattern allowing agents to collaborate, pass state,
and record an auditable clinical trace.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ai_engine.ocr.schema import ClinicRegisterExtractionResult
from ai_engine.forecaster.lightgbm_model import QuantileForecastResult
from ai_engine.detector.isolation_forest import AnomalyDetectionResult
from ai_engine.detector.cascade_detector import CompoundFacilityRiskScore
from ai_engine.allocator.hybrid_quantum import HybridOptimizationBenchmark
from ai_engine.explainer.shap_explainer import DecisionExplanationReport

class AgentMessage(BaseModel):
    """Inter-agent communication message."""
    sender_agent: str
    recipient_agent: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    message_type: str = Field(..., description="'TELEMETRY_UPDATE', 'STOCKOUT_ALERT', 'ALLOCATION_PROPOSAL', 'EXPLANATION_READY'")
    payload: Dict[str, Any]
    priority: str = Field(default="NORMAL", description="'NORMAL', 'HIGH', 'CRITICAL_P0'")

class MultiAgentBlackboardState(BaseModel):
    """Global state shared across all collaborative health supply chain agents."""
    workflow_id: str
    country_code: str = "IND"
    target_facility_id: str
    target_item_code: str
    
    # 1. Perception Layer (OCR / Sensor Ingestion)
    raw_register_extracted: Optional[ClinicRegisterExtractionResult] = None
    
    # 2. Predictive Layer (Forecaster Agent)
    demand_forecast: Optional[QuantileForecastResult] = None
    
    # 3. Diagnostic Layer (Detector Agent)
    anomaly_report: Optional[AnomalyDetectionResult] = None
    compound_risk: Optional[CompoundFacilityRiskScore] = None
    requires_emergency_redistribution: bool = False
    
    # 4. Action Layer (Allocator Agent)
    allocation_benchmark: Optional[HybridOptimizationBenchmark] = None
    confirmed_dispatch_routes: List[Dict[str, Any]] = Field(default_factory=list)
    
    # 5. Explanatory Layer (Explainer Agent)
    decision_explanation: Optional[DecisionExplanationReport] = None
    multilingual_narratives: Dict[str, str] = Field(default_factory=dict)
    
    # Audit trail & Agent conversation log
    agent_message_log: List[AgentMessage] = Field(default_factory=list)
    execution_steps: List[str] = Field(default_factory=list)
    is_completed: bool = False
    error_message: Optional[str] = None
