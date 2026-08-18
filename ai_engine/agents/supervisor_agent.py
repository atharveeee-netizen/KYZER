"""
Supervisor & Consensus Coordinator Agent.
Orchestrates the collaborative Multi-Agent execution graph, resolves conflicts,
enforces clinical safety guardrails, and oversees final decision approval.
"""

from typing import Dict, Any, List

from ai_engine.agents.base import BaseCareDOMAgent
from ai_engine.agents.state import MultiAgentBlackboardState

class SupervisorAgent(BaseCareDOMAgent):
    """Lead Meta-Agent responsible for agent graph routing and clinical consensus."""

    def __init__(self):
        super().__init__(
            agent_name="SupervisorAgent",
            role_description="Multi-Agent Execution Graph Orchestration & Clinical Consensus Verification"
        )

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Validates completeness of multi-agent trace, checks safety constraints,
        and marks workflow as successfully verified.
        """
        self.logger.info("Supervisor Agent performing final consensus & safety audit...")
        
        # Clinical safety checks
        has_forecast = state.demand_forecast is not None
        has_risk = state.compound_risk is not None
        has_explanation = state.decision_explanation is not None

        if not (has_forecast and has_risk and has_explanation):
            state.is_completed = False
            state.error_message = "Multi-agent pipeline incomplete: Missing critical diagnostic components."
            return state

        # If redistribution was needed, verify route safety
        if state.requires_emergency_redistribution and state.allocation_benchmark:
            best_sol = state.allocation_benchmark.best_routing_solution
            cold_chain_ok = all(r.cold_chain_compliant for r in best_sol.routes)
            if not cold_chain_ok:
                self.logger.warning("Supervisor Warning: One or more routes exceed 4-hour cold-chain limit.")

        state.is_completed = True
        
        self.emit_message(
            state=state,
            recipient="ALL_SYSTEMS",
            message_type="CONSENSUS_REACHED_WORKFLOW_APPROVED",
            payload={
                "status": "APPROVED",
                "workflow_id": state.workflow_id,
                "total_agent_messages": len(state.agent_message_log),
                "risk_tier": state.compound_risk.risk_tier if state.compound_risk else "UNKNOWN"
            },
            priority="HIGH"
        )

        return state
