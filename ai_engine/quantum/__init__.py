"""
Quantum Computing module for CareDOM.
Supports IBM Quantum (QAOA) and D-Wave (Quantum Annealing).
"""

from ai_engine.quantum.ibm_quantum import IBMQuantumRouter, IBMQuantumRouteResult
from ai_engine.quantum.dwave_quantum import DWaveQuantumRouter, DWaveRouteResult
from ai_engine.quantum.qaoa_plus import QAOAWithConstraints, QAOAPlusResult
from ai_engine.quantum.hybrid_orchestrator import HybridQuantumOrchestrator, UnifiedQuantumRouteResult

__all__ = [
    "IBMQuantumRouter",
    "IBMQuantumRouteResult",
    "DWaveQuantumRouter",
    "DWaveRouteResult",
    "QAOAWithConstraints",
    "QAOAPlusResult",
    "HybridQuantumOrchestrator",
    "UnifiedQuantumRouteResult",
]
