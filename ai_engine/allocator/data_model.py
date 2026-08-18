"""
Data models and network matrix generator for logistics and VRP solvers.
"""

import math
import numpy as np
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel, Field

class FacilityNode(BaseModel):
    """Health centre node on geographic graph."""
    node_id: int
    facility_id: str
    name: str
    latitude: float
    longitude: float
    country_code: str = "IND"
    is_district_hospital: bool = False
    medicine_surplus_deficit: int = Field(
        default=0, 
        description="Positive = surplus donor, Negative = deficit receiver, 0 = balanced"
    )
    time_window_start_min: int = Field(default=480, description="08:00 AM in minutes from midnight")
    time_window_end_min: int = Field(default=1020, description="05:00 PM in minutes from midnight")
    service_time_min: int = Field(default=15, description="Unloading/handover time in minutes")

class VRPProblemInstance(BaseModel):
    """Full instance payload for OR-Tools & QUBO logistics solvers."""
    nodes: List[FacilityNode]
    distance_matrix_km: List[List[float]]
    time_matrix_min: List[List[float]]
    vehicle_capacities: List[int]
    num_vehicles: int
    depot_index: int = 0
    max_driving_time_min: int = 240  # 4 hours cold-chain max limit

class NetworkMatrixGenerator:
    """Computes Haversine distance and travel time matrices."""

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates great-circle distance between two GPS coordinates."""
        R = 6371.0  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @classmethod
    def build_problem_instance(
        cls,
        nodes: List[FacilityNode],
        vehicle_capacity: int = 1500,
        num_vehicles: int = 2,
        avg_speed_kmh: float = 40.0
    ) -> VRPProblemInstance:
        """Builds distance and time matrices from facility nodes."""
        n = len(nodes)
        dist_matrix = [[0.0] * n for _ in range(n)]
        time_matrix = [[0.0] * n for _ in range(n)]

        for i in range(n):
            for j in range(n):
                if i != j:
                    d_km = cls.haversine_distance_km(
                        nodes[i].latitude, nodes[i].longitude,
                        nodes[j].latitude, nodes[j].longitude
                    )
                    # Winding rural road factor (1.3x Euclidean/Haversine)
                    d_road_km = d_km * 1.3
                    t_min = (d_road_km / avg_speed_kmh) * 60.0
                    
                    dist_matrix[i][j] = round(d_road_km, 2)
                    time_matrix[i][j] = round(t_min, 1)

        return VRPProblemInstance(
            nodes=nodes,
            distance_matrix_km=dist_matrix,
            time_matrix_min=time_matrix,
            vehicle_capacities=[vehicle_capacity] * num_vehicles,
            num_vehicles=num_vehicles,
            depot_index=0
        )
