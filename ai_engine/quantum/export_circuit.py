"""
IBM Quantum Circuit Synthesizer & QPU Measurement Visualizer.
Generates:
1. OpenQASM 3.0 / Qiskit Circuit Diagram (ASCII representation of Hadamard, RZZ Ising couplers, and RX mixers)
2. Energy State Probability Distribution (Top computational basis states)
3. Hardware QPU Deployment Report for IBM Heron r2 (156 Qubits)
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import time
import numpy as np
from ai_engine.quantum.ibm_quantum import IBMQuantumRouter

def synthesize_and_visualize_quantum_circuit(nodes_count: int = 3):
    print("=" * 80)
    print(f"⚛️ CAREDOM IBM QUANTUM QAOA CIRCUIT SYNTHESIZER (N = {nodes_count} Nodes)")
    print("Target Architecture: IBM Heron r2 Processor (156 Physical Qubits)")
    print("=" * 80)

    router = IBMQuantumRouter(backend_name="ibm_fez", p_layers=2)
    
    # 3-Node Pune District Health Subgraph
    facilities = ["DH-DEPOT-001", "PHC-PUN-001", "PHC-PUN-002"][:nodes_count]
    dist_matrix = [
        [0.0, 18.5, 24.2],
        [18.5, 0.0, 12.1],
        [24.2, 12.1, 0.0]
    ]

    qubo_dict = router.formulate_qubo_dict(dist_matrix, facilities)
    num_qubits = len(facilities) ** 2
    
    print(f"\n[1] Synthesizing Parameterized QAOA Ansatz Circuit...")
    print(f"    • Logical Qubits: {num_qubits} Qubits ({nodes_count}x{nodes_count} Permutation Matrix)")
    print(f"    • Variational Layers: p = 2 (4 Parameterized Rotation Angles: γ1, γ2, β1, β2)")
    print(f"    • Coupling Ising Hamiltonian: {len(qubo_dict)} Quadratic Couplers (RZZ Gates)")

    qc, gammas, betas = router.build_qaoa_circuit(num_qubits=num_qubits, qubo_dict=qubo_dict, p=2)
    print(f"    • Total Circuit Operations: {len(qc.data)} Quantum Gates")
    print(f"    • Circuit Depth: {qc.depth()}")

    print("\n[2] Quantum Circuit Diagram (Qiskit ASCII Representation):")
    try:
        print(qc.draw(output="text", fold=100))
    except Exception:
        print("    (Text drawing rendered directly on Qiskit terminal)")

    print("\n[3] Executing Variational Optimization & Boltzmann Ground State Sampling...")
    fac_dicts = [{"facility_id": f, "name": f} for f in facilities]
    res = router.solve_qaoa_route(facilities=fac_dicts, distance_matrix=dist_matrix)

    print("\n[4] IBM Quantum Execution Telemetry:")
    print(f"    • Backend Name:              {res.backend_name}")
    print(f"    • Hardware Active:            {'Real QPU Cloud' if not res.is_simulator else 'Qiskit Aer QPU Simulator'}")
    print(f"    • Ground State Expectation:   {res.quantum_expectation_energy:.4f}")
    print(f"    • Optimal QAOA Gammas (γ):    {[round(g, 3) for g in res.optimal_gamma]}")
    print(f"    • Optimal QAOA Betas (β):     {[round(b, 3) for b in res.optimal_beta]}")
    print(f"    • Quantum Optimal Tour:       {' -> '.join(res.ordered_facility_sequence)}")
    print(f"    • Total Road Distance:        {res.total_distance_km:.2f} km")
    print(f"    • WHO Cold-Chain Compliance:  {'✅ VALID (< 240 min)' if res.cold_chain_compliant else '❌ EXCEEDS'}")
    print(f"    • Quantum Latency:            {res.runtime_ms:.2f} ms")
    print("=" * 80)

if __name__ == "__main__":
    synthesize_and_visualize_quantum_circuit(nodes_count=3)
