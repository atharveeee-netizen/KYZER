# ⚙️ TECHNICAL REQUIREMENTS DOCUMENT (TRD) — BRICS Federated Edition
**Project Name:** CareDOM (BRICS Smart Health Centre Management)  
**Team Name:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  

---

## 1. System Architecture & Tech Stack

```
[Clients]
  ├── React 19 + MapLibre PWA (Person 3)
  └── WhatsApp Voice Bot (Person 4)
         │
         ▼
[API & Core Logic - Person 2]
  └── FastAPI (ASGI) + PostGIS Redistribution Engine
         ├── GET /api/v1/facilities/dashboard
         ├── GET /api/v1/redistribution/suggest
         └── POST /api/v1/ocr/commit-register
         │
         ▼
[Persistence Layer]
  └── PostgreSQL 16 + PostGIS (Spatial KNN) + Server-Sent Events (SSE)
         ▲
         │
[AI & Optimization - Person 1]
  ├── Google Gemini 1.5 Flash Vision OCR (ai_engine/ocr/)
  ├── LightGBM 7-Day Quantile Forecaster (ai_engine/forecaster/)
  └── Google OR-Tools CVRPTW Router (ai_engine/allocator/)
```

---

## 2. Universal Data Schemas & API Contracts

### 2.1 Unified Facilities Endpoint (`GET /api/v1/facilities/dashboard?country_code=IND`)
```json
[
  {
    "facility_id": "fac_ind_01",
    "name": "Dindori Primary Health Centre",
    "country_code": "IND",
    "lat": 20.201,
    "lng": 73.834,
    "inventory": {
      "total_items": 45,
      "stockouts": 2,
      "items": [{ "code": "MED_ORS", "name": "ORS", "qty": 0, "status": "P0_CRITICAL" }]
    },
    "beds": {
      "general_total": 20,
      "general_occupied": 18,
      "icu_total": 4,
      "icu_occupied": 4,
      "status": "SATURATED"
    },
    "staff": {
      "doctors_present": 2,
      "doctors_expected": 3,
      "nurses_present": 5,
      "nurses_expected": 5
    }
  }
]
```

### 2.2 PostGIS Nearest Surplus Redistribution (`GET /api/v1/redistribution/suggest`)
```json
{
  "requesting_facility": "Dindori PHC",
  "needed_item": "MED_ORS",
  "needed_qty": 200,
  "suggested_donor": {
    "facility_id": "fac_ind_09",
    "name": "Nashik Community Health Centre",
    "distance_km": 14.2,
    "surplus_available": 850,
    "batch_number": "ORS2409B"
  }
}
```
