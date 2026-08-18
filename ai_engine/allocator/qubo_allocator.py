"""
QUBO Formulation for Lateral Health Resource & Medicine Redistribution.
Formulates multi-facility inventory rebalancing as a Quadratic Unconstrained Binary Optimization (QUBO) problem:
H = H_transport + lambda_1 * H_demand_deficit + lambda_2 * H_surplus_capacity
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel, Field

class QUBOVariableMeta(BaseModel):
    """Metadata mapping for a single binary transfer variable x_{ij}."""
    index: int
    label: str
    donor_node_id: int
    receiver_node_id: int
    donor_facility_id: str
    receiver_facility_id: str
    donor_name: str
    receiver_name: str
    distance_km: float
    batch_size: int

class QUBOInstance(BaseModel):
    """Quadratic Unconstrained Binary Optimization mathematical structure."""
    num_variables: int
    Q_matrix: List[List[float]]
    variable_labels: List[str]
    variable_details: List[QUBOVariableMeta] = Field(default_factory=list)
    donor_indices: List[int]
    receiver_indices: List[int]
    penalties: Dict[str, float]

class QUBOFormulator:
    """Constructs upper-triangular Q-matrix for cross-district medicine redistribution."""

    @classmethod
    def build_redistribution_qubo(
        cls,
        donor_nodes: List[Dict[str, Any]],
        receiver_nodes: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        unit_transfer_batch_size: int = 100,
        lambda_transport: float = 1.0,
        lambda_deficit_penalty: float = 50.0,
        lambda_surplus_penalty: float = 50.0
    ) -> QUBOInstance:
        """
        Creates QUBO matrix for binary assignment variables x_{ij} in {0, 1}:
        x_{ij} = 1 if donor i transfers batch to receiver j.
        """
        num_donors = len(donor_nodes)
        num_receivers = len(receiver_nodes)
        total_vars = num_donors * num_receivers
        
        # Variable mapping: index k = i * num_receivers + j
        var_labels = []
        var_details = []
        for i in range(num_donors):
            d_node = donor_nodes[i]
            d_idx = d_node["node_id"]
            for j in range(num_receivers):
                r_node = receiver_nodes[j]
                r_idx = r_node["node_id"]
                dist = distance_matrix[d_idx][r_idx]
                k = i * num_receivers + j
                label = f"x_{d_node['facility_id']}->{r_node['facility_id']}"
                var_labels.append(label)
                var_details.append(QUBOVariableMeta(
                    index=k,
                    label=label,
                    donor_node_id=d_idx,
                    receiver_node_id=r_idx,
                    donor_facility_id=d_node["facility_id"],
                    receiver_facility_id=r_node["facility_id"],
                    donor_name=d_node.get("name", d_node["facility_id"]),
                    receiver_name=r_node.get("name", r_node["facility_id"]),
                    distance_km=float(dist),
                    batch_size=unit_transfer_batch_size
                ))

        Q = np.zeros((total_vars, total_vars), dtype=float)

        # 1. Transport Cost Term: sum_{i,j} d_{ij} * x_{ij}
        for i in range(num_donors):
            d_idx = donor_nodes[i]["node_id"]
            for j in range(num_receivers):
                r_idx = receiver_nodes[j]["node_id"]
                dist = distance_matrix[d_idx][r_idx]
                k = i * num_receivers + j
                Q[k, k] += lambda_transport * dist

        # 2. Deficit Satisfaction Penalty: lambda_1 * sum_j (sum_i B * x_{ij} - Deficit_j)^2
        # (sum_i B x_{ij} - D_j)^2 = B^2 sum_i x_i^2 + 2 B^2 sum_{i1 < i2} x_{i1} x_{i2} - 2 B D_j sum_i x_i + D_j^2
        B = float(unit_transfer_batch_size)
        for j in range(num_receivers):
            deficit = float(abs(receiver_nodes[j]["medicine_surplus_deficit"]))
            for i1 in range(num_donors):
                k1 = i1 * num_receivers + j
                # Linear diagonal term: B^2 - 2 * B * Deficit_j
                Q[k1, k1] += lambda_deficit_penalty * (B**2 - 2.0 * B * deficit)
                
                # Quadratic off-diagonal term: 2 * B^2
                for i2 in range(i1 + 1, num_donors):
                    k2 = i2 * num_receivers + j
                    Q[k1, k2] += lambda_deficit_penalty * (2.0 * B**2)

        # 3. Surplus Capacity Limit Penalty: lambda_2 * sum_i (sum_j B * x_{ij} - Surplus_i)^2
        for i in range(num_donors):
            surplus = float(donor_nodes[i]["medicine_surplus_deficit"])
            for j1 in range(num_receivers):
                k1 = i * num_receivers + j1
                # Linear diagonal term
                Q[k1, k1] += lambda_surplus_penalty * (B**2 - 2.0 * B * surplus)
                
                # Quadratic off-diagonal term
                for j2 in range(j1 + 1, num_receivers):
                    k2 = i * num_receivers + j2
                    Q[k1, k2] += lambda_surplus_penalty * (2.0 * B**2)

        return QUBOInstance(
            num_variables=total_vars,
            Q_matrix=Q.tolist(),
            variable_labels=var_labels,
            variable_details=var_details,
            donor_indices=[d["node_id"] for d in donor_nodes],
            receiver_indices=[r["node_id"] for r in receiver_nodes],
            penalties={
                "lambda_transport": lambda_transport,
                "lambda_deficit_penalty": lambda_deficit_penalty,
                "lambda_surplus_penalty": lambda_surplus_penalty
            }
        )
