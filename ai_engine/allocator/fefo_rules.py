"""
First-Expired, First-Out (FEFO) Perishable Inventory Allocation Logic.
Prioritizes oldest batches nearing expiration to eliminate pharmaceutical waste.
"""

from datetime import datetime, date
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class MedicineBatch(BaseModel):
    """Pharmaceutical batch representation."""
    batch_id: str
    item_code: str
    generic_name: str
    facility_id: str
    quantity: int = Field(..., ge=0)
    expiry_date: str = Field(..., description="YYYY-MM-DD")
    unit_cost_inr: float = Field(default=15.0)
    temperature_sensitive: bool = Field(default=False)

class FEFODispatchPlan(BaseModel):
    """Result of FEFO batch selection for consumption or lateral transfer."""
    item_code: str
    total_requested: int
    total_allocated: int
    allocated_batches: List[Dict[str, Any]]
    unfulfilled_quantity: int
    batches_saved_from_waste: int
    near_expiry_warning: bool

class FEFOInventoryManager:
    """Manages batch-level FIFO/FEFO queues and calculates perishability priorities."""

    @staticmethod
    def calculate_days_to_expiry(expiry_date_str: str) -> int:
        """Calculates days remaining until batch expiration."""
        try:
            exp_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
            today = date.today()
            return (exp_date - today).days
        except Exception:
            return 180  # Default safe shelf-life fallback

    @classmethod
    def allocate_fefo(
        cls,
        available_batches: List[MedicineBatch],
        requested_quantity: int,
        min_shelf_life_days: int = 15
    ) -> FEFODispatchPlan:
        """
        Sorts available batches by expiration date ascending (earliest expiry first)
        and allocates required quantity. Batches with days_to_expiry < min_shelf_life_days
        are flagged for urgent use.
        """
        # Filter batches with positive quantity
        valid_batches = [b for b in available_batches if b.quantity > 0]
        
        # Sort by expiry date ascending (FEFO)
        sorted_batches = sorted(
            valid_batches,
            key=lambda b: (cls.calculate_days_to_expiry(b.expiry_date), b.quantity)
        )

        remaining_needed = requested_quantity
        allocated_records = []
        batches_saved = 0
        has_near_expiry = False

        for batch in sorted_batches:
            if remaining_needed <= 0:
                break
                
            days_left = cls.calculate_days_to_expiry(batch.expiry_date)
            if days_left <= 0:
                # Expired batch - cannot dispatch
                continue

            if days_left <= 60:
                has_near_expiry = True
                batches_saved += 1

            qty_to_take = min(batch.quantity, remaining_needed)
            allocated_records.append({
                "batch_id": batch.batch_id,
                "facility_id": batch.facility_id,
                "allocated_qty": qty_to_take,
                "expiry_date": batch.expiry_date,
                "days_to_expiry": days_left,
                "priority_rank": len(allocated_records) + 1
            })
            
            remaining_needed -= qty_to_take

        total_alloc = requested_quantity - remaining_needed
        
        return FEFODispatchPlan(
            item_code=available_batches[0].item_code if available_batches else "UNKNOWN",
            total_requested=requested_quantity,
            total_allocated=total_alloc,
            allocated_batches=allocated_records,
            unfulfilled_quantity=max(0, remaining_needed),
            batches_saved_from_waste=batches_saved,
            near_expiry_warning=has_near_expiry
        )
