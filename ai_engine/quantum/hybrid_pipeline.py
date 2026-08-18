"""
CLI Runner for End-to-End Quantum Hybrid Routing Pipeline (N=100).
Usage:
    python -m ai_engine.quantum.hybrid_pipeline --nodes 100
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
from ai_engine.allocator.benchmark import generate_benchmark_cluster
from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator
from ai_engine.quantum.hybrid_orchestrator import HybridQuantumOrchestrator

def main():
    parser = argparse.ArgumentParser(description="Run Full Quantum Hybrid Pipeline")
    parser.add_argument("--nodes", type=int, default=100, help="Number of clinics to route")
    args = parser.parse_args()

    print("=" * 90)
    print(f"🌌 CareDOM Full Quantum Hybrid Pipeline (N = {args.nodes} Facilities)")
    print("Graph Coarsening + Regional Quantum Optimization + Feasibility Repair")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 90)

    facs = generate_benchmark_cluster(args.nodes)
    dist_mat = AdaptiveRouteAllocator._compute_distance_matrix(facs)

    orchestrator = HybridQuantumOrchestrator()
    res = orchestrator.route_quantum(facs, dist_mat)

    print("\n--- QUANTUM HYBRID PIPELINE TELEMETRY ---")
    print(f"  • Strategy:                    {res.quantum_backend_type}")
    print(f"  • Target QPU:                  {res.target_hardware}")
    print(f"  • Regional Sub-Clusters:       {res.cluster_count} Clusters")
    print(f"  • Total Network Mileage:       {res.total_distance_km:.2f} km")
    print(f"  • Total Transit Time:          {res.total_transit_time_min:.1f} minutes")
    print(f"  • Cold-Chain Feasible:         {'✅ YES' if res.cold_chain_compliant else '❌ Active cooling required'}")
    print(f"  • Quantum Ground State Energy: {res.quantum_ground_energy:.2f}")
    print(f"  • Pipeline Latency:            {res.runtime_ms:.2f} ms")

    print(f"\nSample Route Sequence: {' -> '.join(res.ordered_facility_sequence[:8])} -> ... ({len(res.ordered_facility_sequence)} stops total)")

    print("\n" + "=" * 90)
    print("✅ FULL QUANTUM PIPELINE COMPLETED: Ready for live demonstration!")
    print("=" * 90)

if __name__ == "__main__":
    main()
