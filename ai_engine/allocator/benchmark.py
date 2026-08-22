"""
CLI Benchmark Suite for Adaptive Multi-Scale Routing Engine (N=1 to 100+).
Usage:
    python -m ai_engine.allocator.benchmark --num-nodes 5
    python -m ai_engine.allocator.benchmark --num-nodes 30
    python -m ai_engine.allocator.benchmark --num-nodes 100
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import time
import argparse
import random
import numpy as np
from typing import List, Dict, Any

from ai_engine.allocator.adaptive_allocator import AdaptiveRouteAllocator

def generate_benchmark_cluster(num_nodes: int, seed: int = 42) -> List[Dict[str, Any]]:
    """Generates geographically clustered facilities around Pune/BRICS coordinates."""
    random.seed(seed)
    np.random.seed(seed)
    
    base_lat, base_lon = 18.5204, 73.8567
    facilities = [{
        "facility_id": "DH-DEPOT-001",
        "name": "District Central Medical Depot",
        "latitude": base_lat,
        "longitude": base_lon,
        "is_dh": True,
        "medicine_surplus_deficit": 5000
    }]

    for idx in range(1, num_nodes):
        # Scatter within ~45km radius
        d_lat = np.random.normal(0, 0.18)
        d_lon = np.random.normal(0, 0.22)
        deficit = random.choice([-250, -150, -100, -50, 0, 100])
        facilities.append({
            "facility_id": f"PHC-PUN-{idx:03d}",
            "name": f"Primary Health Centre #{idx}",
            "latitude": round(base_lat + d_lat, 4),
            "longitude": round(base_lon + d_lon, 4),
            "is_dh": False,
            "medicine_surplus_deficit": deficit
        })

    return facilities

def main():
    parser = argparse.ArgumentParser(description="KYZER Multi-Scale Adaptive Routing Benchmark")
    parser.add_argument("--num-nodes", type=int, default=20, help="Number of health facilities to route (e.g. 5, 20, 50, 100)")
    parser.add_argument("--expected-time-ms", type=int, default=5000, help="Maximum expected time budget in milliseconds")
    parser.add_argument("--quantum", action="store_true", help="Engage Quantum Hardware / Simulator Orchestrator")
    args = parser.parse_args()

    N = args.num_nodes
    print("=" * 85)
    print(f"🚀 KYZER Adaptive Multi-Scale Routing Engine — Benchmark Suite (N = {N})")
    print(f"Mode: {'⚛️ QUANTUM-POWERED (IBM QAOA / D-Wave)' if args.quantum else '⚙️ CLASSICAL-ADAPTIVE'}")
    print("Team KYZER | Build with AI: Code for Communities 2")
    print("=" * 85)

    facs = generate_benchmark_cluster(N)
    allocator = AdaptiveRouteAllocator()

    t0 = time.perf_counter()
    result = allocator.optimize_routes(facilities=facs, use_quantum=args.quantum)
    total_time_ms = (time.perf_counter() - t0) * 1000

    print("\n--- EXECUTION TELEMETRY & DECISION MATRIX ---")
    print(f"  • Scale Tier:                  [{result.scale_tier}]")
    print(f"  • Algorithm Dispatched:        {result.algorithm_executed}")
    print(f"  • Facilities Routed:           {result.total_nodes} nodes")
    print(f"  • Total Network Mileage:       {result.total_distance_km:.2f} km")
    print(f"  • Estimated Transit Time:      {result.total_transit_time_min:.1f} minutes")
    print(f"  • WHO Cold-Chain Compliant:    {'✅ YES (<= 240 min)' if result.cold_chain_compliant else '❌ EXCEEDS 4h'}")
    print(f"  • Solver Compute Latency:      {result.runtime_ms:.2f} ms (Budget: {args.expected_time_ms} ms)")
    print(f"  • Number of Vehicle Routes:    {len(result.routes)} trucks")
    print(f"  • Quantum QPU Ready:           {result.quantum_hardware_ready}")
    print(f"  • Failover Engaged:            {result.failover_engaged}")

    print("\n--- SAMPLE VEHICLE ROUTE STOPS ---")
    for r_idx, r in enumerate(result.routes[:3]):
        stops_str = " -> ".join([s.facility_id if hasattr(s, 'facility_id') else str(s.get('facility_id', 'NODE')) for s in r.stops[:6]])
        if len(r.stops) > 6:
            stops_str += f" -> ... ({len(r.stops)} stops total)"
        print(f"  🚛 Vehicle {r.vehicle_id}: {stops_str} | Dist: {r.total_distance_km:.1f}km | Time: {r.total_time_min:.1f}min")

    print("\n" + "=" * 85)
    if result.runtime_ms <= args.expected_time_ms:
        print(f"✅ BENCHMARK PASSED: Solved N={N} within {result.runtime_ms:.2f}ms budget!")
    else:
        print(f"⚠️ BENCHMARK WARNING: Compute time ({result.runtime_ms:.2f}ms) exceeded target {args.expected_time_ms}ms")
    print("=" * 85)

if __name__ == "__main__":
    main()
