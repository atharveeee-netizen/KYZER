"""
Allocator and optimization module for KYZER.
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
from ai_engine.allocator.hybrid_clustering import (
    ClusteredRouteResult,
    HybridClusterRouter,
)
from ai_engine.allocator.adaptive_allocator import (
    AdaptiveRoutingResult,
    AdaptiveRouteAllocator,
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
    "ClusteredRouteResult",
    "HybridClusterRouter",
    "AdaptiveRoutingResult",
    "AdaptiveRouteAllocator",
]
