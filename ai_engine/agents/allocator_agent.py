"""
Autonomous Logistics & Quantum Allocator Agent.
Formulates the QUBO Hamiltonian for multi-facility resource balancing,
executes the Quantum-Classical Hybrid Solver (QUBO-SA + OR-Tools CVRPTW),
and applies FEFO batch priority rules.
"""

import json
from pathlib import Path
from typing import Dict, Any, List

from ai_engine.config import DATA_DIR
from ai_engine.agents.base import BaseKYZERAgent
from ai_engine.agents.state import MultiAgentBlackboardState, AgentLifecycleState
from ai_engine.allocator.hybrid_quantum import HybridQuantumAllocator
from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator

class AllocatorAgent(BaseKYZERAgent):
    """Specialized Agent responsible for cold-chain routing & adaptive quantum resource allocation."""

    def __init__(self):
        super().__init__(
            agent_name="AllocatorAgent",
            role_description="Multi-Scale Adaptive Routing (OR-Tools, QUBO-SA, K-Medoids Hybrid)"
        )
        self.quantum_allocator = HybridQuantumAllocator(qubo_steps=800, routing_time_limit=3)
        self.adaptive_allocator = AdaptiveRouteAllocator()

    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Executes adaptive multi-scale allocation and generates vehicle dispatch plans.
        """
        state.transition_to(AgentLifecycleState.ALLOCATING, self.agent_name, "Executing Adaptive Multi-Scale Route Optimization")
        self.logger.info("Solving multi-facility lateral redistribution via Adaptive Route Allocator...")
        
        # Load multi-country facilities
        json_path = DATA_DIR / "brics_facilities_seed.json"
        if json_path.exists():
            with open(json_path, "r", encoding="utf-8") as f:
                all_facs = json.load(f)
            country_facs = [fac for fac in all_facs if fac.get("country_code", "IND") == state.country_code]
        else:
            country_facs = [
                {"facility_id": "PHC-PUN-001", "name": "Shirur Hospital Depot", "latitude": 18.8285, "longitude": 74.3755, "is_dh": True, "medicine_surplus_deficit": 1200},
                {"facility_id": state.target_facility_id, "name": "Target Deficit PHC", "latitude": 18.6534, "longitude": 74.0624, "is_dh": False, "medicine_surplus_deficit": -300},
                {"facility_id": "PHC-PUN-003", "name": "Shikrapur Health Centre", "latitude": 18.7368, "longitude": 74.1567, "is_dh": False, "medicine_surplus_deficit": 400},
            ]

        # Execute hybrid optimization benchmark
        benchmark = self.quantum_allocator.optimize_redistribution(country_facs, unit_batch_size=100)
        state.allocation_benchmark = benchmark

        # Execute adaptive multi-scale routing
        adaptive_res = self.adaptive_allocator.optimize_routes(
            facilities=country_facs,
            priority_facility_ids=[state.target_facility_id]
        )

        # Record route details
        routes_summary = [
            {
                "solver": row.get("Method", ""),
                "distance_km": row.get("Total Distance (km)", 0.0),
                "transit_min": row.get("Total Transit (min)", 0.0),
                "cold_chain_compliant": row.get("Cold-Chain Compliant", True),
                "runtime_ms": row.get("Runtime (ms)", 0.0)
            } for row in benchmark.benchmark_table
        ]
        state.confirmed_dispatch_routes = routes_summary

        # Emit confirmation to Explainer Agent
        self.emit_message(
            state=state,
            recipient="ExplainerAgent",
            message_type="DISPATCH_PLAN_CONFIRMED",
            payload={
                "total_distance_km": adaptive_res.total_distance_km,
                "scale_tier": adaptive_res.scale_tier,
                "algorithm_executed": adaptive_res.algorithm_executed,
                "convergence_speedup_pct": benchmark.convergence_speedup_pct,
                "quantum_hardware_ready": adaptive_res.quantum_hardware_ready,
                "routes_generated": len(adaptive_res.routes)
            },
            priority="HIGH"
        )

        return state
