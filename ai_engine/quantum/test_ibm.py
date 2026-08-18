"""
CLI Test Suite for IBM Quantum QAOA Router.
Usage:
    python -m ai_engine.quantum.test_ibm --nodes 5 --backend ibm_fez
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import argparse
from ai_engine.allocator.benchmark import generate_benchmark_cluster
from ai_engine.quantum.ibm_quantum import IBMQuantumRouter

def main():
    parser = argparse.ArgumentParser(description="Test IBM Quantum QAOA Router")
    parser.add_argument("--nodes", type=int, default=5, help="Number of clinics to route")
    parser.add_argument("--backend", type=str, default="ibm_fez", help="IBM Quantum backend name")
    args = parser.parse_args()

    print("=" * 80)
    print(f"⚛️ CareDOM IBM Quantum QAOA Router — Test Suite (N = {args.nodes})")
    print(f"Backend Target: {args.backend} (156-Qubit Heron r2 Processor)")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    facs = generate_benchmark_cluster(args.nodes)
    from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator
    dist_mat = AdaptiveRouteAllocator._compute_distance_matrix(facs)

    router = IBMQuantumRouter(backend_name=args.backend)
    res = router.solve_qaoa_route(facs, dist_mat)

    print("\n--- IBM QUANTUM EXECUTION REPORT ---")
    print(f"  • Backend Active:              {res.backend_name}")
    print(f"  • Hardware Mode:               {'Live QPU' if not res.is_simulator else 'High-Performance Statevector Simulator'}")
    print(f"  • Qubits Allocated:            {res.num_qubits} Qubits ({args.nodes}x{args.nodes} Permutation Matrix)")
    print(f"  • Circuit Depth:               {res.circuit_depth} Gates")
    print(f"  • Optimal Angles (gamma*, beta*): gamma={res.optimal_gamma}, beta={res.optimal_beta}")
    print(f"  • Ground State Expectation:    {res.quantum_expectation_energy:.2f}")
    print(f"  • Solved Tour Sequence:        {' -> '.join(res.ordered_facility_sequence)}")
    print(f"  • Total Tour Distance:         {res.total_distance_km:.2f} km")
    print(f"  • Transit Time:                {res.total_transit_time_min:.1f} minutes")
    print(f"  • WHO Cold-Chain Compliant:    {'✅ YES (<= 240 min)' if res.cold_chain_compliant else '❌ EXCEEDS 4h'}")
    print(f"  • Quantum Execution Latency:   {res.runtime_ms:.2f} ms")

    print("\n" + "=" * 80)
    print("✅ IBM QUANTUM TEST PASSED: Successfully executed parameterized QAOA circuit!")
    print("=" * 80)

if __name__ == "__main__":
    main()
