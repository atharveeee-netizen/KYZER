"""
Configuration settings for the CareDOM AI Engine.
Loads environment variables and sets operational defaults.
"""

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Base Directory paths
BASE_DIR = Path(__file__).resolve().parent.parent
AI_ENGINE_DIR = Path(__file__).resolve().parent
DATA_DIR = AI_ENGINE_DIR / "data"

# Automatically parse .env if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k not in os.environ:
                        os.environ[k] = v
    except Exception:
        pass

class Settings(BaseModel):
    """Global configuration settings for AI Engine components."""
    
    # Google AI / Gemini API
    GEMINI_API_KEY: str = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", "")
    )
    GEMINI_MODEL_VISION: str = "gemini-flash-latest"
    GEMINI_MODEL_TEXT: str = "gemini-flash-latest"
    
    # BRICS Settings
    DEFAULT_COUNTRY: str = "IND"
    SUPPORTED_COUNTRIES: List[str] = ["IND", "ZAF", "BRA"]
    
    # Optimization Parameters
    OR_TOOLS_TIME_LIMIT_SEC: int = 5
    QUBO_ANNEAL_STEPS: int = 1000
    QUBO_INITIAL_TEMP: float = 100.0
    QUBO_FINAL_TEMP: float = 0.01
    QUBO_PENALTY_MULTIPLIER: float = 50.0
    
    # Forecast Parameters
    FORECAST_HORIZON_DAYS: int = 7
    QUANTILE_ALPHAS: List[float] = [0.10, 0.50, 0.90]
    MIN_HISTORICAL_DAYS: int = 14
    
    # Cold-chain & Logistics
    MAX_COLD_CHAIN_HOURS: float = 4.0
    MAX_VEHICLE_CAPACITY_UNITS: int = 5000
    SAFETY_STOCK_DAYS: int = 3
    MIN_SHELF_LIFE_DAYS_FOR_TRANSFER: int = 30
    
    # Anomaly Detection
    CONTAMINATION_RATE: float = 0.05
    CRITICAL_STOCKOUT_THRESHOLD_DAYS: int = 3

settings = Settings()
