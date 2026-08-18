"""
BRICS Multi-Region Synthetic & Calibrated Seed Data Generator.
Generates realistic multi-facility health telemetry for India (IND), South Africa (ZAF), and Brazil (BRA).
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ai_engine.config import DATA_DIR

def generate_brics_seed_datasets(output_dir: Path = DATA_DIR) -> Dict[str, str]:
    """Generates multi-country CSV and JSON seed records."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # -------------------------------------------------------------
    # 1. INDIA 🇮🇳 (Maharashtra - Pune/Satara District)
    # -------------------------------------------------------------
    india_facilities = [
        {"facility_id": "PHC-PUN-001", "name": "Shirur Sub-District Hospital", "lat": 18.8285, "lng": 74.3755, "is_dh": True, "gen_beds": 100, "icu_beds": 12, "docs": 8, "nurses": 24, "surplus": 1200},
        {"facility_id": "PHC-PUN-002", "name": "Koregaon Bhima PHC", "lat": 18.6534, "lng": 74.0624, "is_dh": False, "gen_beds": 20, "icu_beds": 2, "docs": 2, "nurses": 6, "surplus": -250},
        {"facility_id": "PHC-PUN-003", "name": "Shikrapur Health Centre", "lat": 18.7368, "lng": 74.1567, "is_dh": False, "gen_beds": 24, "icu_beds": 4, "docs": 2, "nurses": 5, "surplus": 400},
        {"facility_id": "PHC-PUN-004", "name": "Talegaon Dhamdhere PHC", "lat": 18.6789, "lng": 74.1512, "is_dh": False, "gen_beds": 16, "icu_beds": 0, "docs": 1, "nurses": 4, "surplus": -180},
        {"facility_id": "PHC-PUN-005", "name": "Wagholi Community Health Centre", "lat": 18.5793, "lng": 73.9814, "is_dh": False, "gen_beds": 30, "icu_beds": 4, "docs": 3, "nurses": 8, "surplus": 600},
        {"facility_id": "PHC-PUN-006", "name": "Chakan Primary Health Centre", "lat": 18.7612, "lng": 73.8596, "is_dh": False, "gen_beds": 25, "icu_beds": 2, "docs": 2, "nurses": 6, "surplus": -450},
        {"facility_id": "PHC-PUN-007", "name": "Alandi Devachi Health Post", "lat": 18.6775, "lng": 73.8974, "is_dh": False, "gen_beds": 18, "icu_beds": 2, "docs": 2, "nurses": 5, "surplus": 150},
        {"facility_id": "PHC-PUN-008", "name": "Khed Rural Hospital", "lat": 18.8471, "lng": 73.9015, "is_dh": False, "gen_beds": 50, "icu_beds": 6, "docs": 4, "nurses": 12, "surplus": 800},
        {"facility_id": "PHC-PUN-009", "name": "Manchar Primary Health Centre", "lat": 19.0068, "lng": 73.9452, "is_dh": False, "gen_beds": 22, "icu_beds": 2, "docs": 2, "nurses": 5, "surplus": -300},
        {"facility_id": "PHC-PUN-010", "name": "Ghodegaon Tribal Health Post", "lat": 19.0345, "lng": 73.8211, "is_dh": False, "gen_beds": 15, "icu_beds": 0, "docs": 1, "nurses": 3, "surplus": -500},
    ]

    # -------------------------------------------------------------
    # 2. SOUTH AFRICA 🇿🇦 (Gauteng - Tshwane/Pretoria District)
    # -------------------------------------------------------------
    sa_facilities = [
        {"facility_id": "CHC-TSH-001", "name": "Pretoria West Hospital Depot", "lat": -25.7511, "lng": 28.1467, "is_dh": True, "gen_beds": 120, "icu_beds": 16, "docs": 10, "nurses": 30, "surplus": 1500},
        {"facility_id": "CHC-TSH-002", "name": "Atteridgeville Community Health Centre", "lat": -25.7725, "lng": 28.0722, "is_dh": False, "gen_beds": 35, "icu_beds": 4, "docs": 3, "nurses": 10, "surplus": -350},
        {"facility_id": "CHC-TSH-003", "name": "Laudium Community Health Clinic", "lat": -25.8056, "lng": 28.1189, "is_dh": False, "gen_beds": 25, "icu_beds": 2, "docs": 2, "nurses": 8, "surplus": 250},
        {"facility_id": "CHC-TSH-004", "name": "Mamelodi West Community Clinic", "lat": -25.7144, "lng": 28.3278, "is_dh": False, "gen_beds": 40, "icu_beds": 4, "docs": 4, "nurses": 12, "surplus": -600},
        {"facility_id": "CHC-TSH-005", "name": "Eersterust Primary Health Clinic", "lat": -25.7189, "lng": 28.3075, "is_dh": False, "gen_beds": 20, "icu_beds": 2, "docs": 2, "nurses": 6, "surplus": 300},
    ]

    # -------------------------------------------------------------
    # 3. BRAZIL 🇧🇷 (Amazonas - Manaus Riverine Region)
    # -------------------------------------------------------------
    brazil_facilities = [
        {"facility_id": "UBS-AMZ-001", "name": "Hospital Flutuante Walter Bártolo", "lat": -3.1190, "lng": -60.0217, "is_dh": True, "gen_beds": 80, "icu_beds": 8, "docs": 6, "nurses": 18, "surplus": 900},
        {"facility_id": "UBS-AMZ-002", "name": "UBS Fluvial Ribeirinha Tarumã", "lat": -2.9812, "lng": -60.1254, "is_dh": False, "gen_beds": 12, "icu_beds": 0, "docs": 1, "nurses": 3, "surplus": -200},
        {"facility_id": "UBS-AMZ-003", "name": "UBS Cacau Pirêra", "lat": -3.1567, "lng": -60.0890, "is_dh": False, "gen_beds": 15, "icu_beds": 1, "docs": 2, "nurses": 4, "surplus": 180},
    ]

    all_facs = []
    for f in india_facilities:
        f["country_code"] = "IND"
        all_facs.append(f)
    for f in sa_facilities:
        f["country_code"] = "ZAF"
        all_facs.append(f)
    for f in brazil_facilities:
        f["country_code"] = "BRA"
        all_facs.append(f)

    # Export Facilities JSON
    fac_json_path = output_dir / "brics_facilities_seed.json"
    with open(fac_json_path, "w", encoding="utf-8") as f:
        json.dump(all_facs, f, indent=2)

    # Generate 60-day historical time-series for forecasting
    dates = [datetime.now() - timedelta(days=i) for i in range(60, 0, -1)]
    records = []
    
    meds = ["MED-PCM-500", "MED-AMX-250", "MED-ORS-PKG", "MED-ART-60", "MED-INS-REG"]
    
    for fac in all_facs:
        for med in meds:
            base_cons = 35.0 if "PCM" in med else (15.0 if "AMX" in med else (50.0 if "ORS" in med else 8.0))
            for dt in dates:
                noise = np.random.normal(0, base_cons * 0.2)
                rain = 45.0 if dt.month in [6, 7, 8] and np.random.rand() > 0.6 else np.random.exponential(5.0)
                dengue = int(np.random.poisson(8 if rain > 25.0 else 2))
                
                # Demand spike during rain for ORS and Paracetamol
                rain_boost = (rain / 20.0) * 8.0 if "ORS" in med or "PCM" in med else 0.0
                cons = max(1.0, round(base_cons + noise + rain_boost, 1))
                
                records.append({
                    "date": dt.strftime("%Y-%m-%d"),
                    "facility_id": fac["facility_id"],
                    "country_code": fac["country_code"],
                    "item_code": med,
                    "consumption": cons,
                    "stock_remaining": max(0, int(cons * np.random.uniform(1.5, 12.0))),
                    "rainfall_mm": round(rain, 1),
                    "active_epidemic_cases": dengue,
                    "is_holiday": 1 if dt.weekday() == 6 else 0
                })

    df_history = pd.DataFrame(records)
    csv_path = output_dir / "brics_consumption_history_seed.csv"
    df_history.to_csv(csv_path, index=False)

    return {
        "facilities_json": str(fac_json_path),
        "history_csv": str(csv_path),
        "facility_count": len(all_facs),
        "history_rows": len(df_history)
    }

if __name__ == "__main__":
    res = generate_brics_seed_datasets()
    print("Generated BRICS Seed Datasets:", res)
