"""
Pydantic schemas for structured data extracted from handwritten clinic registers.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedMedicine(BaseModel):
    """Structured record of a single medicine batch from a register."""
    item_code: str = Field(..., description="Standard generic item code (e.g., MED-PCM-500)")
    generic_name: str = Field(..., description="Generic pharmaceutical name (e.g., Paracetamol 500mg)")
    batch_number: str = Field(..., description="Batch identifier (e.g., B240801)")
    expiry_date: str = Field(..., description="Expiry date in YYYY-MM-DD format")
    quantity: int = Field(..., ge=0, description="Available stock count / units dispensed")
    unit: str = Field(default="tablets", description="Unit of measurement (tablets, vials, strips)")
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0, description="OCR extraction confidence")

class ExtractedBeds(BaseModel):
    """Bed capacity and occupancy telemetry."""
    general_total: int = Field(default=20, ge=0, description="Total General ward beds")
    general_occupied: int = Field(default=12, ge=0, description="Currently occupied General beds")
    icu_total: int = Field(default=4, ge=0, description="Total ICU / High-Dependency beds")
    icu_occupied: int = Field(default=2, ge=0, description="Currently occupied ICU beds")

class ExtractedStaff(BaseModel):
    """Medical staff attendance telemetry."""
    doctors_present: int = Field(default=2, ge=0, description="Doctors present today")
    doctors_expected: int = Field(default=2, ge=0, description="Total rostered doctors")
    nurses_present: int = Field(default=5, ge=0, description="Nurses present today")
    nurses_expected: int = Field(default=6, ge=0, description="Total rostered nurses")

class ClinicRegisterExtractionResult(BaseModel):
    """Full extraction payload representing a physical paper register sheet."""
    facility_id: str = Field(..., description="Identifier of the reporting clinic / PHC")
    country_code: str = Field(default="IND", description="BRICS country code (IND, ZAF, BRA)")
    date_of_record: str = Field(..., description="Date of the register sheet (YYYY-MM-DD)")
    medicines: List[ExtractedMedicine] = Field(default_factory=list, description="Extracted medicine line items")
    beds: ExtractedBeds = Field(default_factory=ExtractedBeds, description="Extracted bed telemetry")
    staff: ExtractedStaff = Field(default_factory=ExtractedStaff, description="Extracted staff telemetry")
    raw_text_summary: Optional[str] = Field(default=None, description="Summary notes or illegible remarks")
    processing_time_ms: float = Field(default=0.0, description="End-to-end extraction latency in ms")
    extraction_mode: str = Field(default="simulated", description="'gemini' for live Gemini API or 'simulated' for offline cache")
