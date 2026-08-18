"""
Allocator and optimization module for CareDOM.
"""

from ai_engine.allocator.fefo_rules import (
    MedicineBatch,
    FEFODispatchPlan,
    FEFOInventoryManager,
)
from ai_engine.allocator.data_model import (
    FacilityNode,
    VRPProblemInstance,
    NetworkMatrixGenerator,
)
from ai_engine.allocator.qubo_allocator import (
    QUBOInstance,
    QUBOFormulator,
)
from ai_engine.allocator.qubo_sa import (
    QuantumHardwareEmbeddingReport,
    QUBOSolutionResult,
    QUBOSimulatedAnnealer,
)
from ai_engine.allocator.vrp_solver import (
    VehicleRouteStop,
    VehicleRoute,
    VRPSolutionResult,
    ORToolsVRPSolver,
)
from ai_engine.allocator.hybrid_quantum import (
    HybridOptimizationBenchmark,
    HybridQuantumAllocator,
)

__all__ = [
    "MedicineBatch",
    "FEFODispatchPlan",
    "FEFOInventoryManager",
    "FacilityNode",
    "VRPProblemInstance",
    "NetworkMatrixGenerator",
    "QUBOInstance",
    "QUBOFormulator",
    "QuantumHardwareEmbeddingReport",
    "QUBOSolutionResult",
    "QUBOSimulatedAnnealer",
    "VehicleRouteStop",
    "VehicleRoute",
    "VRPSolutionResult",
    "ORToolsVRPSolver",
    "HybridOptimizationBenchmark",
    "HybridQuantumAllocator",
]
