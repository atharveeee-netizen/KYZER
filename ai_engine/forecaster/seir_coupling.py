"""
SEIR Epidemic - Inventory Closed-Loop Dynamical Coupling Model.
Solves the coupled ODE system where medicine availability directly dictates patient recovery rate gamma(M_t).
"""

import numpy as np
from scipy.integrate import odeint
from typing import Dict, Any, Tuple, List
from pydantic import BaseModel, Field

class SEIRSimulationParameters(BaseModel):
    """Parameters for the SEIR-Inventory coupled simulation."""
    population: int = Field(default=50000, description="Total catchment population")
    init_exposed: int = Field(default=15, description="Initial exposed cases")
    init_infected: int = Field(default=5, description="Initial infected cases")
    init_recovered: int = Field(default=0, description="Initial recovered individuals")
    
    transmission_rate_beta: float = Field(default=0.35, description="Disease transmission rate (beta)")
    incubation_rate_sigma: float = Field(default=0.20, description="Incubation rate (1/incubation period)")
    
    recovery_treated_gamma1: float = Field(default=0.25, description="Recovery rate with full medicine access (4 days)")
    recovery_untreated_gamma0: float = Field(default=0.10, description="Recovery rate without medicine (10 days)")
    
    daily_dosage_per_infected: float = Field(default=3.0, description="Medicine units consumed per active patient day")
    initial_inventory: float = Field(default=400.0, description="Starting inventory in units at clinic")
    resupply_lead_time_days: int = Field(default=4, description="Days to receive resupply")

class SEIRCouplingModel:
    """Coupled SEIR Epidemic & Pharmaceutical Inventory Dynamic Engine."""
    
    def __init__(self, params: SEIRSimulationParameters):
        self.params = params

    def simulate(self, days: int = 30) -> Dict[str, Any]:
        """
        Simulates the daily trajectory of S, E, I, R and inventory stockout cascades.
        """
        N = self.params.population
        S = N - self.params.init_exposed - self.params.init_infected - self.params.init_recovered
        E = self.params.init_exposed
        I = self.params.init_infected
        R = self.params.init_recovered
        inv = self.params.initial_inventory
        
        trajectory_S = [S]
        trajectory_E = [E]
        trajectory_I = [I]
        trajectory_R = [R]
        trajectory_inv = [inv]
        trajectory_demand = [I * self.params.daily_dosage_per_infected]
        trajectory_fill_rate = [1.0]
        stockout_days = []
        
        for t in range(1, days):
            # Calculate daily medicine demand
            daily_demand = I * self.params.daily_dosage_per_infected
            
            # Inventory fill rate: min(Demand, Inventory) / Demand
            if daily_demand > 0:
                fill_rate = min(daily_demand, inv) / daily_demand
            else:
                fill_rate = 1.0
                
            inv = max(0.0, inv - daily_demand)
            if inv <= 0.0:
                stockout_days.append(t)
            
            # Dynamic recovery rate based on inventory availability
            gamma = self.params.recovery_untreated_gamma0 + (
                self.params.recovery_treated_gamma1 - self.params.recovery_untreated_gamma0
            ) * fill_rate
            
            # Discrete SEIR transitions
            new_exposed = (self.params.transmission_rate_beta * S * I) / N
            new_infected = self.params.incubation_rate_sigma * E
            new_recovered = gamma * I
            
            S = max(0.0, S - new_exposed)
            E = max(0.0, E + new_exposed - new_infected)
            I = max(0.0, I + new_infected - new_recovered)
            R = max(0.0, R + new_recovered)
            
            trajectory_S.append(round(S, 2))
            trajectory_E.append(round(E, 2))
            trajectory_I.append(round(I, 2))
            trajectory_R.append(round(R, 2))
            trajectory_inv.append(round(inv, 2))
            trajectory_demand.append(round(daily_demand, 2))
            trajectory_fill_rate.append(round(fill_rate, 4))
            
        peak_infected = max(trajectory_I)
        peak_day = trajectory_I.index(peak_infected)
        
        return {
            "days": list(range(days)),
            "susceptible": trajectory_S,
            "exposed": trajectory_E,
            "infected": trajectory_I,
            "recovered": trajectory_R,
            "inventory_trajectory": trajectory_inv,
            "projected_demand": trajectory_demand,
            "fill_rate_history": trajectory_fill_rate,
            "stockout_days_count": len(stockout_days),
            "first_stockout_day": stockout_days[0] if stockout_days else None,
            "peak_infection_day": peak_day,
            "peak_infected_count": round(peak_infected, 1),
            "cascade_risk_score": round(min(1.0, len(stockout_days) / (days * 0.5)), 3)
        }
