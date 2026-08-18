"""
Compound Systemic Risk & Cross-District Cascade Failure Detector.
Unifies all 3 Health Pillars:
1. Medicine Stockout Velocity (Days of Inventory Remaining)
2. Bed Occupancy Stress (General & ICU % Occupied)
3. Staff Shortage (Doctors & Nurses Present vs Expected)
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field

class CompoundFacilityRiskScore(BaseModel):
    """Holistic health centre operational risk assessment."""
    facility_id: str
    country_code: str
    medicine_risk_score: float = Field(..., ge=0.0, le=1.0, description="0=Safe, 1=Empty")
    bed_stress_score: float = Field(..., ge=0.0, le=1.0, description="0=Empty, 1=Over capacity")
    staffing_deficit_score: float = Field(..., ge=0.0, le=1.0, description="0=Full staff, 1=No doctor")
    composite_cascade_risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_tier: str = Field(..., description="'P0_CRITICAL', 'P1_HIGH', 'P2_MEDIUM', 'P3_NORMAL'")
    recommended_interventions: List[str]

class SystemicCascadeAnalyzer:
    """Calculates multi-dimensional risk scores and ranks facilities requiring lateral aid."""

    @classmethod
    def evaluate_facility(
        cls,
        facility_id: str,
        country_code: str,
        stock_days_left: float,
        general_occupied: int,
        general_total: int,
        icu_occupied: int,
        icu_total: int,
        doctors_present: int,
        doctors_expected: int,
        nurses_present: int,
        nurses_expected: int
    ) -> CompoundFacilityRiskScore:
        """Computes weighted multi-pillar systemic vulnerability score."""
        
        # 1. Medicine Risk (Weight 40%)
        # <=1 day = 1.0, 3 days = 0.6, >=7 days = 0.0
        if stock_days_left <= 1.0:
            med_score = 1.0
        elif stock_days_left <= 3.0:
            med_score = 0.75
        elif stock_days_left <= 7.0:
            med_score = 0.35
        else:
            med_score = 0.05

        # 2. Bed Stress (Weight 35%)
        gen_ratio = general_occupied / max(1, general_total)
        icu_ratio = icu_occupied / max(1, icu_total)
        bed_score = min(1.0, 0.6 * icu_ratio + 0.4 * gen_ratio)

        # 3. Staffing Deficit (Weight 25%)
        doc_deficit = max(0, doctors_expected - doctors_present) / max(1, doctors_expected)
        nurse_deficit = max(0, nurses_expected - nurses_present) / max(1, nurses_expected)
        staff_score = min(1.0, 0.7 * doc_deficit + 0.3 * nurse_deficit)

        # Non-linear Multiplicative Compounding Collapse Model
        # Risk = 1 - (1 - med)^alpha * (1 - bed)^beta * (1 - staff)^gamma
        alpha, beta, gamma = 1.6, 1.4, 1.2
        surv_med = max(0.0, 1.0 - med_score) ** alpha
        surv_bed = max(0.0, 1.0 - bed_score) ** beta
        surv_staff = max(0.0, 1.0 - staff_score) ** gamma
        
        non_linear_composite = 1.0 - (surv_med * surv_bed * surv_staff)
        composite = round(min(1.0, max(0.0, non_linear_composite)), 3)

        interventions = []
        if med_score >= 0.7:
            interventions.append("Trigger automated PostGIS lateral medicine transfer from surplus donor PHC.")
        if bed_score >= 0.85:
            interventions.append("Divert incoming emergency ambulance cases to neighboring secondary hospital.")
        if staff_score >= 0.5:
            interventions.append("Deploy mobile medical team / locum doctor from District Headquarters.")

        if composite >= 0.70 or med_score >= 0.90 or (bed_score >= 0.85 and staff_score >= 0.50):
            tier = "P0_CRITICAL"
        elif composite >= 0.45 or med_score >= 0.60 or bed_score >= 0.70:
            tier = "P1_HIGH"
        elif composite >= 0.25:
            tier = "P2_MEDIUM"
        else:
            tier = "P3_NORMAL"

        return CompoundFacilityRiskScore(
            facility_id=facility_id,
            country_code=country_code,
            medicine_risk_score=round(med_score, 3),
            bed_stress_score=round(bed_score, 3),
            staffing_deficit_score=round(staff_score, 3),
            composite_cascade_risk_score=composite,
            risk_tier=tier,
            recommended_interventions=interventions
        )
