from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ai_engine.ocr.schema import ClinicRegisterExtractionResult
from ai_engine.forecaster.lightgbm_model import QuantileForecastResult
from ai_engine.detector.isolation_forest import AnomalyDetectionResult
from ai_engine.detector.cascade_detector import CompoundFacilityRiskScore
from ai_engine.allocator.hybrid_quantum import HybridOptimizationBenchmark
from ai_engine.explainer.shap_explainer import DecisionExplanationReport

class AgentLifecycleState(str, Enum):
    """Formal lifecycle states for the KYZER multi-agent state machine."""
    INITIALIZED = "INITIALIZED"
    INGESTING = "INGESTING"
    FORECASTING = "FORECASTING"
    DIAGNOSING = "DIAGNOSING"
    ALLOCATING = "ALLOCATING"
    EXPLAINING = "EXPLAINING"
    AUDITING = "AUDITING"
    CONSENSUS_REACHED = "CONSENSUS_REACHED"
    CRITIQUE_REVISE = "CRITIQUE_REVISE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AgentMessage(BaseModel):
    """Inter-agent communication message with pub/sub routing metadata."""
    sender_agent: str
    recipient_agent: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    message_type: str = Field(..., description="'TELEMETRY_UPDATE', 'STOCKOUT_ALERT', 'ALLOCATION_PROPOSAL', 'EXPLANATION_READY'")
    payload: Dict[str, Any]
    priority: str = Field(default="NORMAL", description="'NORMAL', 'HIGH', 'CRITICAL_P0'")

class MultiAgentBlackboardState(BaseModel):
    """Global state shared across all collaborative health supply chain agents with state machine semantics."""
    workflow_id: str
    country_code: str = "IND"
    target_facility_id: str
    target_item_code: str
    lifecycle_state: AgentLifecycleState = AgentLifecycleState.INITIALIZED
    
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
    
    # Audit trail & Agent message bus
    agent_message_log: List[AgentMessage] = Field(default_factory=list)
    execution_steps: List[str] = Field(default_factory=list)
    consensus_confidence_score: float = 1.0
    supervisor_critique_notes: List[str] = Field(default_factory=list)
    is_completed: bool = False
    error_message: Optional[str] = None

    def transition_to(self, next_state: AgentLifecycleState, agent_name: str, rationale: str = "") -> None:
        """Enforces formal state transitions with audit logging."""
        prev = self.lifecycle_state
        self.lifecycle_state = next_state
        entry = f"[State Machine: {agent_name}] Transition {prev.value} -> {next_state.value}"
        if rationale:
            entry += f" | Reason: {rationale}"
        self.execution_steps.append(entry)

    def get_messages_for_agent(self, agent_name: str, message_type: Optional[str] = None) -> List[AgentMessage]:
        """Subscribes and queries messages targeted to a specific agent or broadcast."""
        return [
            m for m in self.agent_message_log
            if (m.recipient_agent in [agent_name, "ALL_SYSTEMS", "*"])
            and (message_type is None or m.message_type == message_type)
        ]

    def get_latest_payload(self, message_type: str) -> Optional[Dict[str, Any]]:
        """Extracts the latest message payload of a given type from the message bus."""
        for msg in reversed(self.agent_message_log):
            if msg.message_type == message_type:
                return msg.payload
        return None
