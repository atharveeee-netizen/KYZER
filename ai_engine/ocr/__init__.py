"""
OCR module for KYZER.
"""

from ai_engine.ocr.schema import (
    ExtractedMedicine,
    ExtractedBeds,
    ExtractedStaff,
    ClinicRegisterExtractionResult,
)
from ai_engine.ocr.gemini_extractor import GeminiRegisterExtractor

__all__ = [
    "ExtractedMedicine",
    "ExtractedBeds",
    "ExtractedStaff",
    "ClinicRegisterExtractionResult",
    "GeminiRegisterExtractor",
]
