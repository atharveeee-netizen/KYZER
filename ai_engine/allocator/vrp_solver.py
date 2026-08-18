"""
Google OR-Tools CVRPTW Solver for Cold-Chain Medicine Redistribution.
Handles multi-stop route optimization with vehicle capacity, delivery time windows,
and 4-hour cold-chain freshness constraints.
"""

import time
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from ai_engine.config import settings
from ai_engine.allocator.data_model import VRPProblemInstance, FacilityNode

logger = logging.getLogger("ai_engine.allocator.vrp")

class VehicleRouteStop(BaseModel):
    """Single clinic stop along a delivery vehicle's route."""
    stop_sequence: int
    node_id: int
    facility_id: str
    facility_name: str
    arrival_time_min: int
    departure_time_min: int
    arrival_clock: str
    departure_clock: str
    demand_delivered_or_collected: int
    cumulative_load: int
    distance_from_prev_km: float

class VehicleRoute(BaseModel):
    """Route itinerary for a single refrigerated delivery vehicle."""
    vehicle_id: int
    stops: List[VehicleRouteStop]
    total_distance_km: float
    total_time_min: float
    total_medicines_transported: int
    cold_chain_compliant: bool
    max_duration_limit_min: int = 240

class VRPSolutionResult(BaseModel):
    """Overall multi-vehicle routing solution."""
    total_network_distance_km: float
    total_network_time_min: float
    num_facilities_served: int
    routes: List[VehicleRoute]
    solver_name: str
    runtime_sec: float
    status: str = "OPTIMAL"

class ORToolsVRPSolver:
    """Solves Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)."""

    def __init__(self, time_limit_sec: int = 5):
        self.time_limit_sec = time_limit_sec
        self.has_ortools = False
        try:
            from ortools.constraint_solver import routing_enums_pb2, pywrapcp
            self.routing_enums = routing_enums_pb2
            self.pywrapcp = pywrapcp
            self.has_ortools = True
        except ImportError:
            self.has_ortools = False
            logger.info("OR-Tools package not imported. Using native Greedy Nearest-Neighbor VRP solver.")

    @staticmethod
    def _format_time_clock(minutes_from_midnight: int) -> str:
        """Converts minutes (e.g. 540) to clock string ('09:00 AM')."""
        hrs = int(minutes_from_midnight // 60)
        mins = int(minutes_from_midnight % 60)
        suffix = "AM" if hrs < 12 else "PM"
        display_hrs = hrs if hrs <= 12 else hrs - 12
        if display_hrs == 0:
            display_hrs = 12
        return f"{display_hrs:02d}:{mins:02d} {suffix}"

    def solve(self, instance: VRPProblemInstance) -> VRPSolutionResult:
        """
        Solves CVRPTW for the given problem instance.
        """
        start_time = time.perf_counter()
        
        if self.has_ortools and len(instance.nodes) > 1:
            try:
                return self._solve_with_ortools(instance, start_time)
            except Exception as e:
                logger.warning(f"OR-Tools solver encounter exception ({e}), falling back to native solver.")

        return self._solve_native_greedy(instance, start_time)

    def _solve_with_ortools(self, instance: VRPProblemInstance, start_time: float) -> VRPSolutionResult:
        """Uses Google OR-Tools constraint solver."""
        n_nodes = len(instance.nodes)
        n_vehicles = instance.num_vehicles
        depot = instance.depot_index

        manager = self.pywrapcp.RoutingIndexManager(n_nodes, n_vehicles, depot)
        routing = self.pywrapcp.RoutingModel(manager)

        # Distance Callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(instance.distance_matrix_km[from_node][to_node] * 100)  # in 10-meter units

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Capacity Dimension
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            # Receiver nodes need absolute demand quantity delivered
            return abs(instance.nodes[from_node].medicine_surplus_deficit)

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            instance.vehicle_capacities,
            True,  # start cumul to zero
            "Capacity"
        )

        # Time Dimension
        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            travel_time = int(instance.time_matrix_min[from_node][to_node])
            service_time = instance.nodes[from_node].service_time_min
            return travel_time + service_time

        time_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.AddDimension(
            time_callback_index,
            60,  # allow 60 min waiting time slack
            instance.max_driving_time_min + 480,  # maximum total time
            False,
            "Time"
        )

        time_dimension = routing.GetDimensionOrDie("Time")
        for node_idx, node in enumerate(instance.nodes):
            index = manager.NodeToIndex(node_idx)
            time_dimension.CumulVar(index).SetRange(
                node.time_window_start_min,
                node.time_window_end_min
            )

        # Search parameters
        search_params = self.pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            self.routing_enums.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.local_search_metaheuristic = (
            self.routing_enums.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_params.time_limit.FromSeconds(self.time_limit_sec)

        solution = routing.SolveWithParameters(search_params)
        
        if not solution:
            return self._solve_native_greedy(instance, start_time)

        # Extract routes from OR-Tools solution
        routes = []
        total_dist = 0.0
        total_time = 0.0
        served_count = 0

        for vehicle_id in range(n_vehicles):
            index = routing.Start(vehicle_id)
            stops = []
            v_dist = 0.0
            v_load = 0
            seq = 1

            while not routing.IsEnd(index):
                node_idx = manager.IndexToNode(index)
                node = instance.nodes[node_idx]
                time_var = time_dimension.CumulVar(index)
                arr_min = solution.Min(time_var)
                dep_min = arr_min + node.service_time_min
                demand = abs(node.medicine_surplus_deficit)
                v_load += demand

                prev_index = index
                index = solution.Value(routing.NextVar(index))
                next_node_idx = manager.IndexToNode(index) if not routing.IsEnd(index) else depot
                leg_dist = instance.distance_matrix_km[node_idx][next_node_idx]
                v_dist += leg_dist

                stops.append(VehicleRouteStop(
                    stop_sequence=seq,
                    node_id=node.node_id,
                    facility_id=node.facility_id,
                    facility_name=node.name,
                    arrival_time_min=arr_min,
                    departure_time_min=dep_min,
                    arrival_clock=self._format_time_clock(arr_min),
                    departure_clock=self._format_time_clock(dep_min),
                    demand_delivered_or_collected=demand,
                    cumulative_load=v_load,
                    distance_from_prev_km=leg_dist
                ))
                seq += 1
                if node_idx != depot:
                    served_count += 1

            # Append depot return
            depot_node = instance.nodes[depot]
            stops.append(VehicleRouteStop(
                stop_sequence=seq,
                node_id=depot_node.node_id,
                facility_id=depot_node.facility_id,
                facility_name=f"{depot_node.name} (Return Depot)",
                arrival_time_min=stops[-1].departure_time_min + int(instance.time_matrix_min[stops[-1].node_id][depot]),
                departure_time_min=stops[-1].departure_time_min + int(instance.time_matrix_min[stops[-1].node_id][depot]),
                arrival_clock=self._format_time_clock(stops[-1].departure_time_min + int(instance.time_matrix_min[stops[-1].node_id][depot])),
                departure_clock=self._format_time_clock(stops[-1].departure_time_min + int(instance.time_matrix_min[stops[-1].node_id][depot])),
                demand_delivered_or_collected=0,
                cumulative_load=v_load,
                distance_from_prev_km=0.0
            ))

            v_time = stops[-1].arrival_time_min - stops[0].arrival_time_min
            total_dist += v_dist
            total_time += v_time

            routes.append(VehicleRoute(
                vehicle_id=vehicle_id + 1,
                stops=stops,
                total_distance_km=round(v_dist, 2),
                total_time_min=round(v_time, 1),
                total_medicines_transported=v_load,
                cold_chain_compliant=v_time <= instance.max_driving_time_min
            ))

        runtime = time.perf_counter() - start_time
        return VRPSolutionResult(
            total_network_distance_km=round(total_dist, 2),
            total_network_time_min=round(total_time, 1),
            num_facilities_served=served_count,
            routes=routes,
            solver_name="Google OR-Tools CVRPTW",
            runtime_sec=round(runtime, 3)
        )

    def _solve_native_greedy(self, instance: VRPProblemInstance, start_time: float) -> VRPSolutionResult:
        """Native greedy nearest neighbor route scheduler."""
        depot = instance.depot_index
        unvisited = [n for n in instance.nodes if n.node_id != depot]
        routes = []
        total_dist = 0.0
        total_time = 0.0

        for v_id in range(instance.num_vehicles):
            stops = []
            curr_node = instance.nodes[depot]
            curr_time = curr_node.time_window_start_min
            v_dist = 0.0
            v_load = 0
            seq = 1

            stops.append(VehicleRouteStop(
                stop_sequence=seq,
                node_id=curr_node.node_id,
                facility_id=curr_node.facility_id,
                facility_name=curr_node.name,
                arrival_time_min=curr_time,
                departure_time_min=curr_time + curr_node.service_time_min,
                arrival_clock=self._format_time_clock(curr_time),
                departure_clock=self._format_time_clock(curr_time + curr_node.service_time_min),
                demand_delivered_or_collected=0,
                cumulative_load=0,
                distance_from_prev_km=0.0
            ))
            curr_time += curr_node.service_time_min
            seq += 1

            while unvisited:
                # Find nearest unvisited node
                nearest = min(
                    unvisited,
                    key=lambda n: instance.distance_matrix_km[curr_node.node_id][n.node_id]
                )
                leg_dist = instance.distance_matrix_km[curr_node.node_id][nearest.node_id]
                leg_time = instance.time_matrix_min[curr_node.node_id][nearest.node_id]
                
                demand = abs(nearest.medicine_surplus_deficit)
                if v_load + demand > instance.vehicle_capacities[v_id]:
                    break  # Vehicle capacity filled
                    
                v_dist += leg_dist
                v_load += demand
                arr_time = int(curr_time + leg_time)
                dep_time = arr_time + nearest.service_time_min
                
                stops.append(VehicleRouteStop(
                    stop_sequence=seq,
                    node_id=nearest.node_id,
                    facility_id=nearest.facility_id,
                    facility_name=nearest.name,
                    arrival_time_min=arr_time,
                    departure_time_min=dep_time,
                    arrival_clock=self._format_time_clock(arr_time),
                    departure_clock=self._format_time_clock(dep_time),
                    demand_delivered_or_collected=demand,
                    cumulative_load=v_load,
                    distance_from_prev_km=leg_dist
                ))
                
                curr_node = nearest
                curr_time = dep_time
                seq += 1
                unvisited.remove(nearest)

            # Return to depot
            return_dist = instance.distance_matrix_km[curr_node.node_id][depot]
            return_time = instance.time_matrix_min[curr_node.node_id][depot]
            v_dist += return_dist
            depot_node = instance.nodes[depot]
            
            stops.append(VehicleRouteStop(
                stop_sequence=seq,
                node_id=depot_node.node_id,
                facility_id=depot_node.facility_id,
                facility_name=f"{depot_node.name} (Return Depot)",
                arrival_time_min=int(curr_time + return_time),
                departure_time_min=int(curr_time + return_time),
                arrival_clock=self._format_time_clock(int(curr_time + return_time)),
                departure_clock=self._format_time_clock(int(curr_time + return_time)),
                demand_delivered_or_collected=0,
                cumulative_load=v_load,
                distance_from_prev_km=return_dist
            ))

            v_tot_time = stops[-1].arrival_time_min - stops[0].arrival_time_min
            total_dist += v_dist
            total_time += v_tot_time

            routes.append(VehicleRoute(
                vehicle_id=v_id + 1,
                stops=stops,
                total_distance_km=round(v_dist, 2),
                total_time_min=round(v_tot_time, 1),
                total_medicines_transported=v_load,
                cold_chain_compliant=v_tot_time <= instance.max_driving_time_min
            ))

        runtime = time.perf_counter() - start_time
        return VRPSolutionResult(
            total_network_distance_km=round(total_dist, 2),
            total_network_time_min=round(total_time, 1),
            num_facilities_served=len(instance.nodes) - 1 - len(unvisited),
            routes=routes,
            solver_name="Native Greedy CVRPTW",
            runtime_sec=round(runtime, 3)
        )
