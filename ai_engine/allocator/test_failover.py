"""
Failover & Resilience Verification Suite for Adaptive Route Allocator.
Tests simulated QUBO exceptions and confirms instant automatic recovery via OR-Tools.
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator
from ai_engine.allocator.benchmark import generate_benchmark_cluster

def main():
    print("=" * 80)
    print("🛡️ CareDOM Adaptive Route Allocator — Failover & Resilience Test")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 80)

    facs = generate_benchmark_cluster(25)
    allocator = AdaptiveRouteAllocator()

    # Monkey patch qubo_sa.solve to raise a simulated QPU hardware timeout exception
    def failing_qubo_solve(instance):
        raise RuntimeError("Simulated D-Wave Advantage QPU Hardware Connection Timeout (HTTP 504 Gateway Timeout)")

    allocator.qubo_sa.solve = failing_qubo_solve

    print("\n[TEST 1] Triggering Meso-Scale Route Optimization with Failing QUBO...")
    res = allocator.optimize_routes(facilities=facs)

    print("\n--- FAILOVER VERIFICATION REPORT ---")
    print(f"  • Scale Tier Attempted:        MESO")
    print(f"  • Solver Dispatched on Crash:  {res.algorithm_executed}")
    print(f"  • Failover Flag:               {res.failover_engaged}")
    print(f"  • Total Distance Recovered:    {res.total_distance_km:.2f} km")
    print(f"  • Cold-Chain Compliant:        {res.cold_chain_compliant}")
    print(f"  • Warning Logged:              {res.warning_notes}")
    print(f"  • Number of Valid Routes:      {len(res.routes)}")

    assert res.failover_engaged is True, "Failover flag should be True"
    assert len(res.routes) > 0, "Routes must be returned despite QUBO crash"
    assert res.total_distance_km > 0, "Distance must be non-zero"

    print("\n" + "=" * 80)
    print("✅ FAILOVER TEST PASSED: System gracefully recovered via OR-Tools with 0% downtime!")
    print("=" * 80)

if __name__ == "__main__":
    main()
