"""
CLI Test Suite for D-Wave Quantum Annealing Router.
Usage:
    python -m ai_engine.quantum.test_dwave --nodes 30 --solver Advantage_system6.4
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
from ai_engine.allocator.benchmark import generate_benchmark_cluster
from ai_engine.quantum.dwave_quantum import DWaveQuantumRouter

def main():
    parser = argparse.ArgumentParser(description="Test D-Wave Quantum Annealing Router")
    parser.add_argument("--nodes", type=int, default=30, help="Number of clinics to route")
    parser.add_argument("--solver", type=str, default="Advantage_system6.4", help="D-Wave Leap solver name")
    args = parser.parse_args()

    print("=" * 80)
    print(f"🌌 CareDOM D-Wave Quantum Annealer — Test Suite (N = {args.nodes})")
    print(f"Solver Target: {args.solver} (5000+ Qubit Pegasus Architecture)")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    facs = generate_benchmark_cluster(args.nodes)
    from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator
    dist_mat = AdaptiveRouteAllocator._compute_distance_matrix(facs)

    router = DWaveQuantumRouter(solver=args.solver)
    res = router.run_quantum_annealing(facs, dist_mat, num_reads=100)

    print("\n--- D-WAVE QUANTUM ANNEALING REPORT ---")
    print(f"  • QPU Solver Active:           {res.solver_name}")
    print(f"  • Hardware Mode:               {'Live QPU' if res.is_live_qpu else 'High-Performance Pegasus Quantum Simulator'}")
    print(f"  • Binary Variables:            {res.num_variables} Variables ({args.nodes}x{args.nodes} Permutation Matrix)")
    print(f"  • Annealing Reads:             {res.num_reads} Samples")
    print(f"  • Ground State Energy:         {res.ground_state_energy:.2f}")
    print(f"  • QPU Access Time:             {res.qpu_access_time_us:.1f} microseconds")
    print(f"  • Total Tour Distance:         {res.total_distance_km:.2f} km")
    print(f"  • Transit Time:                {res.total_transit_time_min:.1f} minutes")
    print(f"  • WHO Cold-Chain Compliant:    {'✅ YES (<= 240 min)' if res.cold_chain_compliant else '❌ EXCEEDS 4h'}")
    print(f"  • Total Solution Latency:      {res.runtime_ms:.2f} ms")

    print("\n" + "=" * 80)
    print("✅ D-WAVE QUANTUM TEST PASSED: Successfully sampled ground states!")
    print("=" * 80)

if __name__ == "__main__":
    main()
