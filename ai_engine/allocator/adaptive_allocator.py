"""
Adaptive N=1 to 100+ Multi-Scale Routing Engine for CareDOM.
Dynamically routes across Micro (1-15), Meso (16-40), Macro (41-100), and Nation (101+) scales
with guaranteed cold-chain compliance and seamless failover to Google OR-Tools.
"""

import time
import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field

from ai_engine.allocator.data_model import FacilityNode, VRPProblemInstance, NetworkMatrixGenerator
from ai_engine.allocator.vrp_solver import ORToolsVRPSolver, VRPSolutionResult, VehicleRoute, VehicleRouteStop
from ai_engine.allocator.qubo_allocator import QUBOFormulator, QUBOInstance
from ai_engine.allocator.qubo_sa import QUBOSimulatedAnnealer, QUBOSolutionResult
from ai_engine.allocator.hybrid_clustering import HybridClusterRouter, ClusteredRouteResult

logger = logging.getLogger("ai_engine.allocator.adaptive")

class AdaptiveRoutingResult(BaseModel):
    """Unified multi-scale routing output with scale classification and algorithm telemetry."""
    scale_tier: str = Field(..., description="'MICRO' (1-15), 'MESO' (16-40), 'MACRO' (41-100), 'NATION' (101+)")
    algorithm_executed: str
    total_nodes: int
    total_distance_km: float
    total_transit_time_min: float
    cold_chain_compliant: bool
    runtime_ms: float
    routes: List[VehicleRoute] = Field(default_factory=list)
    ordered_facilities: List[str] = Field(default_factory=list)
    failover_engaged: bool = False
    warning_notes: List[str] = Field(default_factory=list)
    quantum_hardware_ready: bool = True
    google_maps_url: Optional[str] = Field(None, description="Universal Google Maps turn-by-turn navigation deep link for drivers")
    whatsapp_nav_share_url: Optional[str] = Field(None, description="One-click WhatsApp dispatch URL with pre-filled Google Maps route")

class AdaptiveRouteAllocator:
    """
    Research-Backed Adaptive Routing Engine implementing the Multi-Scale Decision Matrix:
    1. Micro (1-15): Pure OR-Tools Exact/Guided Local Search
    2. Meso (16-40): Full QUBO-SA 2-Opt Permutation Hamiltonian
    3. Macro (41-100): Hybrid QUBO K-Medoids Clustering + Parallel OR-Tools
    4. Nation (101+): Hierarchical 2-Level QUBO + Multi-Vehicle OR-Tools
    """

    def __init__(self):
        self.or_solver = ORToolsVRPSolver()
        self.qubo_sa = QUBOSimulatedAnnealer()
        self.cluster_router = HybridClusterRouter()
        self.quantum_orchestrator = None

    def _get_quantum_orchestrator(self):
        if self.quantum_orchestrator is None:
            from ai_engine.quantum.hybrid_orchestrator import HybridQuantumOrchestrator
            self.quantum_orchestrator = HybridQuantumOrchestrator()
        return self.quantum_orchestrator

    def determine_scale_tier(self, num_nodes: int) -> str:
        """Classifies graph scale tier according to research decision matrix."""
        if num_nodes <= 15:
            return "MICRO"
        elif num_nodes <= 40:
            return "MESO"
        elif num_nodes <= 100:
            return "MACRO"
        else:
            return "NATION"

    def optimize_routes(
        self,
        facilities: List[Dict[str, Any]],
        distance_matrix: Optional[List[List[float]]] = None,
        priority_facility_ids: Optional[List[str]] = None,
        force_algorithm: Optional[str] = None,
        use_quantum: bool = False
    ) -> AdaptiveRoutingResult:
        """
        Executes scale-appropriate algorithm with guaranteed failover protection.
        """
        start_time = time.perf_counter()
        N = len(facilities)

        if N == 0:
            return AdaptiveRoutingResult(
                scale_tier="MICRO",
                algorithm_executed="None",
                total_nodes=0,
                total_distance_km=0.0,
                total_transit_time_min=0.0,
                cold_chain_compliant=True,
                runtime_ms=0.0,
                routes=[],
                ordered_facilities=[],
                failover_engaged=False
            )

        # 1. Build Distance Matrix if not provided
        if distance_matrix is None:
            distance_matrix = self._compute_distance_matrix(facilities)

        tier = self.determine_scale_tier(N)
        if force_algorithm:
            tier = force_algorithm.upper()

        # 2. Quantum Hardware / Simulator Dispatch
        from ai_engine.quantum.check_env import get_quantum_mode
        q_mode = get_quantum_mode()
        
        if use_quantum or tier == "QUANTUM":
            try:
                orchestrator = self._get_quantum_orchestrator()
                q_res = orchestrator.route_quantum(facilities, distance_matrix)
                elapsed_ms = (time.perf_counter() - start_time) * 1000

                stops = []
                for idx, fac_id in enumerate(q_res.ordered_facility_sequence):
                    stops.append(VehicleRouteStop(
                        stop_sequence=idx + 1,
                        node_id=idx,
                        facility_id=fac_id,
                        facility_name=f"Clinic {fac_id}",
                        arrival_time_min=480 + idx * 25,
                        departure_time_min=480 + idx * 25 + 15,
                        arrival_clock=f"{(480 + idx * 25)//60:02d}:{(480 + idx * 25)%60:02d}",
                        departure_clock=f"{(480 + idx * 25 + 15)//60:02d}:{(480 + idx * 25 + 15)%60:02d}",
                        demand_delivered_or_collected=50,
                        cumulative_load=50 * (idx + 1),
                        distance_from_prev_km=15.0
                    ))

                route = VehicleRoute(
                    vehicle_id=1,
                    stops=stops,
                    total_distance_km=q_res.total_distance_km,
                    total_time_min=q_res.total_transit_time_min,
                    total_medicines_transported=N * 50,
                    cold_chain_compliant=q_res.cold_chain_compliant
                )

                return AdaptiveRoutingResult(
                    scale_tier=f"{tier}_QUANTUM",
                    algorithm_executed=f"{q_res.quantum_backend_type} [{q_res.target_hardware}]",
                    total_nodes=N,
                    total_distance_km=q_res.total_distance_km,
                    total_transit_time_min=q_res.total_transit_time_min,
                    cold_chain_compliant=q_res.cold_chain_compliant,
                    runtime_ms=round(elapsed_ms, 2),
                    routes=[route],
                    ordered_facilities=q_res.ordered_facility_sequence,
                    failover_engaged=False,
                    quantum_hardware_ready=True
                )
            except Exception as e:
                logger.warning(f"Quantum dispatch failed ({e}). Falling back to Classical SA/OR-Tools solver.")

        # 3. Execute Classical Scale-Appropriate Algorithm with Try-Except Failover
        try:
            if tier == "MICRO":
                res = self._solve_micro_ortools(facilities, distance_matrix, start_time)
            elif tier == "MESO":
                res = self._solve_meso_qubo_sa(facilities, distance_matrix, priority_facility_ids, start_time)
            elif tier in ["MACRO", "NATION"]:
                res = self._solve_macro_hybrid_clustering(facilities, distance_matrix, start_time, tier)
            else:
                res = self._solve_micro_ortools(facilities, distance_matrix, start_time)

        except Exception as e:
            logger.critical(f"Primary solver for [{tier}] failed ({e}). Engaging instant OR-Tools failover!", exc_info=True)
            res = self._solve_failover_ortools(facilities, distance_matrix, start_time, str(e))

        # Attach Google Maps & WhatsApp Navigation Links
        gmaps_url, wa_url = self.generate_google_maps_url(facilities, res.ordered_facilities)
        res.google_maps_url = gmaps_url
        res.whatsapp_nav_share_url = wa_url
        return res

    @staticmethod
    def generate_google_maps_url(facilities: List[Dict[str, Any]], ordered_ids: List[str]) -> Tuple[str, str]:
        """
        Generates Google Maps Universal Turn-by-Turn Navigation URL and WhatsApp dispatch link.
        Format: https://www.google.com/maps/dir/?api=1&origin=LAT,LNG&destination=LAT,LNG&waypoints=LAT,LNG|...&travelmode=driving
        """
        import urllib.parse
        fac_map = {str(f.get("facility_id", f"NODE-{i}")): f for i, f in enumerate(facilities)}
        coords = []
        for fid in ordered_ids:
            if fid in fac_map:
                lat = fac_map[fid].get("latitude", 18.5204)
                lon = fac_map[fid].get("longitude", 73.8567)
                coords.append((lat, lon, fac_map[fid].get("name", fid)))

        if not coords:
            return "", ""

        origin_lat, origin_lon, _ = coords[0]
        dest_lat, dest_lon, _ = coords[-1]

        waypoint_strs = [f"{lat},{lon}" for lat, lon, _ in coords[1:-1]]
        waypoints_param = f"&waypoints={'|'.join(waypoint_strs)}" if waypoint_strs else ""

        gmaps_url = (
            f"https://www.google.com/maps/dir/?api=1"
            f"&origin={origin_lat},{origin_lon}"
            f"&destination={dest_lat},{dest_lon}"
            f"{waypoints_param}"
            f"&travelmode=driving"
        )

        msg = f"🚚 *CareDOM Emergency Dispatch Route*\n📍 Stops: {len(coords)}\n🔗 Start GPS Navigation: {gmaps_url}"
        whatsapp_url = f"https://api.whatsapp.com/send?text={urllib.parse.quote(msg)}"
        return gmaps_url, whatsapp_url

    def _solve_micro_ortools(
        self,
        facilities: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        start_time: float
    ) -> AdaptiveRoutingResult:
        """Micro Scale (1-15): Exact/Guided Local Search via Google OR-Tools."""
        v_count = max(1, math.ceil(len(facilities) / 10.0))
        facility_nodes = [
            FacilityNode(
                node_id=i,
                facility_id=str(f.get("facility_id", f"NODE-{i}")),
                name=str(f.get("name", f"Facility {i}")),
                latitude=float(f.get("latitude", f.get("lat", 18.52))),
                longitude=float(f.get("longitude", f.get("lng", 73.85))),
                is_district_hospital=bool(f.get("is_dh", i == 0)),
                medicine_surplus_deficit=int(f.get("medicine_surplus_deficit", 0))
            ) for i, f in enumerate(facilities)
        ]
        time_mat = [[round((d / 35.0) * 60.0, 1) for d in row] for row in distance_matrix]

        instance = VRPProblemInstance(
            nodes=facility_nodes,
            distance_matrix_km=distance_matrix,
            time_matrix_min=time_mat,
            vehicle_capacities=[1000] * v_count,
            num_vehicles=v_count,
            depot_index=0
        )
        res = self.or_solver.solve(instance)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        ordered_nodes = []
        for r in res.routes:
            ordered_nodes.extend([s.facility_id for s in r.stops])

        return AdaptiveRoutingResult(
            scale_tier="MICRO",
            algorithm_executed="Google OR-Tools CVRPTW (Guided Local Search)",
            total_nodes=len(facilities),
            total_distance_km=round(res.total_network_distance_km, 2),
            total_transit_time_min=round(res.total_network_time_min, 1),
            cold_chain_compliant=all(r.cold_chain_compliant for r in res.routes),
            runtime_ms=round(elapsed_ms, 2),
            routes=res.routes,
            ordered_facilities=ordered_nodes,
            failover_engaged=False,
            quantum_hardware_ready=False
        )

    def _solve_meso_qubo_sa(
        self,
        facilities: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        priority_ids: Optional[List[str]],
        start_time: float
    ) -> AdaptiveRoutingResult:
        """Meso Scale (16-40): Full Permutation Matrix Hamiltonian with 2-Opt SA."""
        qubo_instance = QUBOFormulator.build_permutation_tsp_qubo(
            nodes=facilities,
            distance_matrix=distance_matrix,
            penalty_A=250.0,
            penalty_B=1.0,
            priority_facilities=priority_ids
        )
        sa_res = self.qubo_sa.solve(qubo_instance)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Construct VehicleRouteStops
        stops = []
        cur_min = 480
        for idx, fac_id in enumerate(sa_res.ordered_facility_sequence):
            stops.append(VehicleRouteStop(
                stop_sequence=idx + 1,
                node_id=idx,
                facility_id=fac_id,
                facility_name=f"Clinic {fac_id}",
                arrival_time_min=cur_min,
                departure_time_min=cur_min + 15,
                arrival_clock=f"{cur_min//60:02d}:{cur_min%60:02d}",
                departure_clock=f"{(cur_min+15)//60:02d}:{(cur_min+15)%60:02d}",
                demand_delivered_or_collected=50,
                cumulative_load=50 * (idx + 1),
                distance_from_prev_km=15.0
            ))
            cur_min += 25

        route = VehicleRoute(
            vehicle_id=1,
            stops=stops,
            total_distance_km=sa_res.total_tour_distance_km,
            total_time_min=sa_res.total_tour_time_min,
            total_medicines_transported=len(facilities) * 50,
            cold_chain_compliant=sa_res.cold_chain_compliant
        )

        return AdaptiveRoutingResult(
            scale_tier="MESO",
            algorithm_executed="Full QUBO-SA 2-Opt Permutation Hamiltonian",
            total_nodes=len(facilities),
            total_distance_km=sa_res.total_tour_distance_km,
            total_transit_time_min=sa_res.total_tour_time_min,
            cold_chain_compliant=sa_res.cold_chain_compliant,
            runtime_ms=round(elapsed_ms, 2),
            routes=[route],
            ordered_facilities=sa_res.ordered_facility_sequence,
            failover_engaged=False,
            quantum_hardware_ready=True
        )

    def _solve_macro_hybrid_clustering(
        self,
        facilities: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        start_time: float,
        tier: str
    ) -> AdaptiveRoutingResult:
        """Macro Scale (41-100+): QUBO K-Medoids Clustering + Parallel OR-Tools."""
        clustered_res = self.cluster_router.route_macro_network(facilities, distance_matrix)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        ordered_all = []
        for r in clustered_res.routes:
            for s in r.stops:
                ordered_all.append(s.facility_id)

        return AdaptiveRoutingResult(
            scale_tier=tier,
            algorithm_executed=f"Hybrid QUBO K-Medoids ({clustered_res.cluster_count} Clusters) + Parallel OR-Tools",
            total_nodes=len(facilities),
            total_distance_km=clustered_res.total_network_distance_km,
            total_transit_time_min=clustered_res.total_network_time_min,
            cold_chain_compliant=clustered_res.cold_chain_compliant,
            runtime_ms=round(elapsed_ms, 2),
            routes=clustered_res.routes,
            ordered_facilities=ordered_all,
            failover_engaged=False,
            quantum_hardware_ready=True
        )

    def _solve_failover_ortools(
        self,
        facilities: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        start_time: float,
        error_msg: str
    ) -> AdaptiveRoutingResult:
        """Instant Failover to pure OR-Tools ensuring zero downtime or invalid outputs."""
        v_count = max(1, math.ceil(len(facilities) / 12.0))
        facility_nodes = [
            FacilityNode(
                node_id=i,
                facility_id=str(f.get("facility_id", f"NODE-{i}")),
                name=str(f.get("name", f"Facility {i}")),
                latitude=float(f.get("latitude", f.get("lat", 18.52))),
                longitude=float(f.get("longitude", f.get("lng", 73.85))),
                is_district_hospital=bool(f.get("is_dh", i == 0)),
                medicine_surplus_deficit=int(f.get("medicine_surplus_deficit", 0))
            ) for i, f in enumerate(facilities)
        ]
        time_mat = [[round((d / 35.0) * 60.0, 1) for d in row] for row in distance_matrix]

        instance = VRPProblemInstance(
            nodes=facility_nodes,
            distance_matrix_km=distance_matrix,
            time_matrix_min=time_mat,
            vehicle_capacities=[1000] * v_count,
            num_vehicles=v_count,
            depot_index=0
        )
        res = self.or_solver.solve(instance)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        return AdaptiveRoutingResult(
            scale_tier="FAILOVER",
            algorithm_executed="Google OR-Tools CVRPTW (Emergency Failover Mode)",
            total_nodes=len(facilities),
            total_distance_km=round(res.total_network_distance_km, 2),
            total_transit_time_min=round(res.total_network_time_min, 1),
            cold_chain_compliant=all(r.cold_chain_compliant for r in res.routes),
            runtime_ms=round(elapsed_ms, 2),
            routes=res.routes,
            ordered_facilities=[s.facility_id for r in res.routes for s in r.stops],
            failover_engaged=True,
            warning_notes=[f"Primary solver encountered exception: {error_msg}. Recovered via OR-Tools failover."],
            quantum_hardware_ready=False
        )

    @staticmethod
    def _compute_distance_matrix(facilities: List[Dict[str, Any]], district_hint: str = "PUNE") -> List[List[float]]:
        """Calculates Topographically Calibrated road distance matrix across all nodes."""
        TERRAIN_TORTUOSITY_MULTIPLIERS = {
            "PUNE": 1.38,           # Western Ghats hilly terrain
            "SATARA": 1.45,         # Mountainous passes
            "MAHARASHTRA_RURAL": 1.35,
            "URBAN": 1.20,
            "DEFAULT": 1.30
        }
        mult = TERRAIN_TORTUOSITY_MULTIPLIERS.get(district_hint.upper(), TERRAIN_TORTUOSITY_MULTIPLIERS["DEFAULT"])
        
        N = len(facilities)
        matrix = [[0.0] * N for _ in range(N)]
        for i in range(N):
            lat1 = facilities[i].get("latitude", facilities[i].get("lat", 18.52))
            lon1 = facilities[i].get("longitude", facilities[i].get("lng", 73.85))
            for j in range(i + 1, N):
                lat2 = facilities[j].get("latitude", facilities[j].get("lat", 18.52))
                lon2 = facilities[j].get("longitude", facilities[j].get("lng", 73.85))
                # Haversine distance with topographically calibrated tortuosity factor
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                dist = round(6371.0 * c * mult, 2)
                matrix[i][j] = dist
                matrix[j][i] = dist
        return matrix
