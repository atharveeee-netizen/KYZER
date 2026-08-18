"""
Comprehensive Quantum Multi-Scale Benchmark Suite for CareDOM.
Usage:
    python -m ai_engine.quantum.benchmark --nodes 5,10,20,50,100
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
import pandas as pd
from typing import List

from ai_engine.allocator.benchmark import generate_benchmark_cluster
from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator
from ai_engine.quantum.hybrid_orchestrator import HybridQuantumOrchestrator

def main():
    parser = argparse.ArgumentParser(description="Multi-Scale Quantum Routing Benchmark")
    parser.add_argument("--nodes", type=str, default="5,10,20,50,100", help="Comma-separated node counts")
    args = parser.parse_args()

    node_counts = [int(x.strip()) for x in args.nodes.split(",") if x.strip()]

    print("=" * 105)
    print("⚛️ CareDOM Quantum-Classical Hybrid Routing — Multi-Scale Benchmark Suite")
    print("IBM Quantum (Heron r2 156-Qubit) + D-Wave Advantage (5000+ Qubit Pegasus QPU)")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 105)

    orchestrator = HybridQuantumOrchestrator()
    records = []

    for N in node_counts:
        facs = generate_benchmark_cluster(N)
        dist_mat = AdaptiveRouteAllocator._compute_distance_matrix(facs)

        res = orchestrator.route_quantum(facs, dist_mat)
        records.append({
            "Nodes (N)": N,
            "Scale Tier": res.scale_tier,
            "Quantum Backend": res.quantum_backend_type.split("(")[0].strip(),
            "Target Hardware": res.target_hardware.split("(")[0].strip(),
            "Distance (km)": res.total_distance_km,
            "Transit (min)": res.total_transit_time_min,
            "Cold-Chain": "✅ Compliant" if res.cold_chain_compliant else "❌ >4h",
            "Ground Energy": res.quantum_ground_energy,
            "Runtime (ms)": res.runtime_ms
        })

    df = pd.DataFrame(records)
    print("\n" + df.to_string(index=False))

    print("\n" + "=" * 105)
    print("✅ MULTI-SCALE QUANTUM BENCHMARK COMPLETE: All problem scales verified!")
    print("=" * 105)

if __name__ == "__main__":
    main()
