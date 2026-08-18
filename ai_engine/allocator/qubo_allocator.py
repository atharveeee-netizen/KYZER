"""
QUBO Formulation for Lateral Health Resource & Medicine Redistribution.
Formulates multi-facility inventory rebalancing as a Quadratic Unconstrained Binary Optimization (QUBO) problem:
H = H_transport + lambda_1 * H_demand_deficit + lambda_2 * H_surplus_capacity
"""

import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel, Field

class QUBOVariableMeta(BaseModel):
    """Metadata mapping for a single binary variable x_{i,t} (facility i at step t)."""
    index: int
    label: str
    facility_node_id: int
    facility_id: str
    facility_name: str
    time_step: int
    urgency_weight: float = 1.0

class QUBOInstance(BaseModel):
    """Quadratic Unconstrained Binary Optimization mathematical structure."""
    num_variables: int
    num_nodes: int
    Q_matrix: List[List[float]]
    variable_labels: List[str]
    variable_details: List[QUBOVariableMeta] = Field(default_factory=list)
    facility_ids: List[str]
    distance_matrix: List[List[float]]
    penalties: Dict[str, float]

class QUBOFormulator:
    """
    Constructs the standard Permutation Matrix Hamiltonian for Vehicle Routing / TSP:
    H = A * sum_t (1 - sum_i x_{i,t})^2 + A * sum_i (1 - sum_t x_{i,t})^2 + B * sum_{i,j,t} d_{ij} x_{i,t} x_{j,t+1}
    """

    @classmethod
    def build_permutation_tsp_qubo(
        cls,
        nodes: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        penalty_A: float = 200.0,
        penalty_B: float = 1.0,
        priority_facilities: Optional[List[str]] = None
    ) -> QUBOInstance:
        """
        Creates an N^2 QUBO upper-triangular matrix for permutation routing.
        Variable index k = i * N + t, where x_{i,t} = 1 if facility i is visited at step t.
        """
        N = len(nodes)
        total_vars = N * N
        var_labels = []
        var_details = []

        priorities = set(priority_facilities or [])

        # Build variable index mappings
        for i in range(N):
            fac = nodes[i]
            fac_id = str(fac.get("facility_id", f"NODE-{i}"))
            fac_name = str(fac.get("name", fac_id))
            urgency = 2.5 if fac_id in priorities or fac.get("medicine_surplus_deficit", 0) < 0 else 1.0

            for t in range(N):
                k = i * N + t
                lbl = f"x_{fac_id}_t{t}"
                var_labels.append(lbl)
                var_details.append(QUBOVariableMeta(
                    index=k,
                    label=lbl,
                    facility_node_id=i,
                    facility_id=fac_id,
                    facility_name=fac_name,
                    time_step=t,
                    urgency_weight=urgency
                ))

        Q = np.zeros((total_vars, total_vars), dtype=float)

        # 1. Constraint 1: Exactly one facility visited at each time step t
        # A * sum_t (1 - sum_i x_{i,t})^2 -> -A * sum_{i} x_{i,t} + 2A * sum_{i1 < i2} x_{i1,t} x_{i2,t}
        for t in range(N):
            for i in range(N):
                k = i * N + t
                Q[k, k] -= penalty_A  # Diagonal linear term
            for i1 in range(N):
                for i2 in range(i1 + 1, N):
                    k1 = i1 * N + t
                    k2 = i2 * N + t
                    Q[k1, k2] += 2.0 * penalty_A  # Quadratic collision penalty

        # 2. Constraint 2: Each facility visited at exactly one time step t
        # A * sum_i (1 - sum_t x_{i,t})^2 -> -A * sum_{t} x_{i,t} + 2A * sum_{t1 < t2} x_{i,t1} x_{i,t2}
        for i in range(N):
            for t in range(N):
                k = i * N + t
                Q[k, k] -= penalty_A  # Diagonal linear term
            for t1 in range(N):
                for t2 in range(t1 + 1, N):
                    k1 = i * N + t1
                    k2 = i * N + t2
                    Q[k1, k2] += 2.0 * penalty_A  # Quadratic collision penalty

        # 3. Objective Term: Minimize total edge distances along sequence
        # B * sum_{t=0}^{N-2} sum_{i,j} d_{ij} * x_{i,t} * x_{j,t+1} + round-trip return to depot
        for t in range(N):
            next_t = (t + 1) % N
            for i in range(N):
                for j in range(N):
                    if i == j:
                        continue
                    dist = float(distance_matrix[i][j])
                    k1 = i * N + t
                    k2 = j * N + next_t
                    if k1 < k2:
                        Q[k1, k2] += penalty_B * dist
                    else:
                        Q[k2, k1] += penalty_B * dist

        facility_ids = [str(node.get("facility_id", f"NODE-{idx}")) for idx, node in enumerate(nodes)]

        return QUBOInstance(
            num_variables=total_vars,
            num_nodes=N,
            Q_matrix=Q.tolist(),
            variable_labels=var_labels,
            variable_details=var_details,
            facility_ids=facility_ids,
            distance_matrix=distance_matrix,
            penalties={"penalty_A": penalty_A, "penalty_B": penalty_B}
        )

    @classmethod
    def build_redistribution_qubo(
        cls,
        donor_nodes: List[Dict[str, Any]],
        receiver_nodes: List[Dict[str, Any]],
        distance_matrix: List[List[float]],
        unit_transfer_batch_size: int = 100,
        **kwargs
    ) -> QUBOInstance:
        """Compatibility builder for multi-facility lateral redistribution."""
        combined_nodes = list(donor_nodes) + list(receiver_nodes)
        # Deduplicate by facility_id
        seen = set()
        unique_nodes = []
        for n in combined_nodes:
            fid = n.get("facility_id", "")
            if fid not in seen:
                seen.add(fid)
                unique_nodes.append(n)

        # Slice distance matrix to matching nodes
        sub_dists = [[distance_matrix[u.get("node_id", 0)][v.get("node_id", 0)] for v in unique_nodes] for u in unique_nodes] if distance_matrix else [[0.0]]
        return cls.build_permutation_tsp_qubo(
            nodes=unique_nodes,
            distance_matrix=sub_dists,
            penalty_A=200.0,
            penalty_B=1.0
        )
