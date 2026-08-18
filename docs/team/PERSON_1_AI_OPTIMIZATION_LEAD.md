# 🧠 CareDOM Architecture: Person 1 — AI & Optimization Lead (Updated BRICS Edition)
**Project:** CareDOM — BRICS-Federated Smart Health Centre Management  
**Team:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  
**Role:** Person 1 — AI Models, Google Gemini OCR, Demand Forecasting & Vehicle Routing  

---

## 1. 📋 EXECUTIVE SUMMARY & SCOPE
Person 1 is responsible for the intelligence core of CareDOM, directly satisfying the **mandatory Google AI integration gate** and the **25% AI/Technical Execution** rubric score.

| Component | Technology | Role & Target |
| :--- | :--- | :--- |
| **Document Vision OCR (P0)** | **Google Gemini 1.5 Flash Vision** | Zero-shot extraction of handwritten clinic registers (Medicines, Bed Counts, Staff Attendance) to structured JSON with 95%+ accuracy. |
| **Demand Forecaster** | **LightGBM Quantile Regressor + TFT** | 7-day multi-horizon medicine demand prediction (P10, P50, P90) with SEIR epidemic feedback coupling. |
| **Logistics Optimizer** | **Google OR-Tools CVRPTW** | Cold-chain vehicle routing across 100+ rural clinics in <8 seconds with time-window constraints. |
| **Explainable AI (XAI)** | **TreeSHAP** | Feature importance waterfalls explaining shortage drivers (rainfall, disease spike, lead time). |
| **Cross-Border Data** | **BRICS Multi-Region Dataset** | Synthetic & real-calibrated health data for India 🇮🇳 (Maharashtra) and South Africa 🇿🇦 (Gauteng). |

---

## 2. 📷 P0 GOOGLE AI INTEGRATION: GEMINI 1.5 FLASH VISION OCR

The primary hackathon gate requires active Google AI. Person 1 implements the end-to-end OCR pipeline that turns a mobile photo of a physical paper health register into structured database entries.

### Python Implementation (`ai_engine/ocr/gemini_extractor.py`)
```python
import os
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Optional

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class ExtractedMedicine(BaseModel):
    item_code: str
    generic_name: str
    batch_number: str
    expiry_date: str
    quantity: int
    confidence_score: float

class ExtractedBeds(BaseModel):
    general_total: int
    general_occupied: int
    icu_total: int
    icu_occupied: int

class ExtractedStaff(BaseModel):
    doctors_present: int
    doctors_expected: int
    nurses_present: int
    nurses_expected: int

class ClinicRegisterData(BaseModel):
    facility_id: str
    country_code: str
    extracted_records: List[ExtractedMedicine]
    extracted_beds: ExtractedBeds
    extracted_staff: ExtractedStaff

def extract_clinic_register(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = """
    You are an expert medical records digitization assistant for rural health centres in BRICS nations (India, South Africa, Brazil).
    Analyze this photo of a handwritten daily hospital register.
    Extract the following strictly formatted JSON:
    1. 'facility_id': Inferred or default clinic ID
    2. 'country_code': 'IND', 'ZAF', or 'BRA'
    3. 'extracted_records': List of medicines with item_code, generic_name, batch_number, expiry_date (YYYY-MM-DD), quantity (integer), and confidence_score (0.0 to 1.0)
    4. 'extracted_beds': general_total, general_occupied, icu_total, icu_occupied
    5. 'extracted_staff': doctors_present, doctors_expected, nurses_present, nurses_expected

    Return ONLY valid JSON matching this schema with no markdown formatting around it.
    """
    
    response = model.generate_content([
        {"mime_type": mime_type, "data": image_bytes},
        prompt
    ])
    
    clean_text = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(clean_text)
```

---

## 3. 📈 DEMAND FORECASTING (LightGBM + SEIR Epidemic Coupling)

```
[Historical Medicine Consumption] ──┐
[Rainfall & Weather Anomalies]    ──┼──► [LightGBM Quantile Regressor] ──► P10 / P50 / P90 Forecast
[SEIR Disease Incidence Rates]    ──┘
```

- **Objective:** Predict daily consumption for the next 7 days per facility.
- **Formulation:** Quantile Loss $\mathcal{L}_q(y, \hat{y}) = \max(q(y - \hat{y}), (1-q)(\hat{y} - y))$ for $q \in \{0.1, 0.5, 0.9\}$.
- **Output:** Flag stockout risk if $\text{Current Stock} < \text{P90 Forecast} \times \text{Lead Time}$.

---

## 4. 🚚 LOGISTICS OPTIMIZATION (Google OR-Tools CVRPTW)

When cross-district replenishment is approved, Person 1's OR-Tools module generates optimal dispatch routes:
- **Constraints:** Vehicle refrigerated capacity, max driving time (4 hours for cold chain), delivery time windows.
- **Objective:** Minimize total transit distance while prioritizing clinics with <24 hours buffer stock.

---

## 5. 📁 FOLDER STRUCTURE (`ai_engine/`)

```text
ai_engine/
├── ocr/
│   ├── gemini_extractor.py         # Google Gemini 1.5 Flash Vision pipeline
│   └── test_ocr.py                 # Unit tests with mock register photos
├── forecaster/
│   ├── lightgbm_model.py           # Multi-horizon quantile demand model
│   └── seir_coupling.py            # Epidemic incidence feature generator
├── allocator/
│   └── vrp_solver.py               # Google OR-Tools CVRPTW delivery router
├── explainer/
│   └── shap_explainer.py           # TreeSHAP feature importance generator
├── data/
│   ├── seed_india_phc.csv          # Maharashtra district health records
│   └── seed_south_africa_clinic.csv# Gauteng province health records
└── requirements.txt
```

---

## 6. ⏱️ PRIORITY TASK ORDER

| Priority | Task | Est. Hours | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | Gemini 1.5 Flash Vision OCR script (`gemini_extractor.py`) | 2.5 hrs | **Mandatory Google AI Gate** |
| **P0** | Multi-country seed data generation (India + South Africa) | 1.5 hrs | **20% Cross-Border Rubric** |
| **P1** | LightGBM 7-day Demand Forecaster with P10/P50/P90 output | 2.5 hrs | Core AI Capability |
| **P1** | Google OR-Tools CVRPTW Route Optimizer | 2.5 hrs | Logistics Capability |
| **P2** | TreeSHAP feature importance explanation generator | 1.5 hrs | Explainability Polish |
