# ⚡ PERSON 2: BACKEND, API GATEWAY & DATABASE ARCHITECTURE
**Role**: Person 2 (Lead Backend & Systems Infrastructure Engineer)  
**Project**: KYZER — Autonomous Healthcare Supply Chain Platform  
**Team**: KYZER | **Hackathon**: Build with AI: Code for Communities 2

---

## 🎯 1. ROLE OVERVIEW & CORE RESPONSIBILITIES
Person 2 owns the **FastAPI REST API, PostgreSQL + PostGIS Database, SSE Real-Time Event Bus, and Cloud Run Deployment** located inside `backend/`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERSON 2 BACKEND ARCHITECTURE                                   │
├────────────────────────┬────────────────────────┬───────────────────────┬───────────────────────┤
│ 🚀 1. FASTAPI CORE     │ 🗄️ 2. POSTGRESQL + GIS │ 🚨 3. REAL-TIME SSE   │ ☁️ 4. DEPLOYMENT      │
├────────────────────────┼────────────────────────┼───────────────────────┼───────────────────────┤
│ • Async Uvicorn Server │ • 18 Seeded BRICS      │ • EventSource Stream  │ • Single Bundled      │
│ • Singleton KYZER-     Facilities (10 IND)    │   (/api/v1/alerts/    │   Container Docker    │
│   Engine Pre-Warmup    │ • PostGIS Spatial      │    stream)            │ • Cloud Run Auto-Scale│
│ • Pydantic v2 Schemas  │   Distance Queries     │ • Webhook Emitters    │   (--min-instances 1) │
│ • Auto OpenAPI /docs   │ • FEFO Expiry Queue    │ • Real-time P0 Audio  │ • Cloud SQL Postgres  │
│ • CORS Whitelist       │   Mutation Rules       │   Payload Delivery    │   Connection Pool     │
└────────────────────────┴────────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 🔌 2. API ENDPOINTS SPECIFICATION (`backend/app/main.py`)

| Method | Route | Request Body | Response Payload | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | — | `{"status": "ONLINE", "quantum_ready": true}` | Container health probe & cold-start check. |
| `GET` | `/api/v1/facilities` | `?country=IND` | `{"count": 10, "facilities": [...]}` | Fetches 9 Pune clinics + depot with GPS coordinates, stock, beds, and staff. |
| `POST` | `/api/v1/routing/plan` | `{ "target_medicine": "MED-PCM-500", "deficit_units": 500 }` | `{"total_distance_km": 159.15, "ordered_facilities": [...], "google_maps_url": "..."}` | Solves autonomous 9-clinic route via OR-Tools / Quantum QAOA and emits GPS navigation links. |
| `POST` | `/api/v1/ai/run` | `{ "facility_id": "PHC-PUN-001", "item_code": "MED-PCM-500" }` | `{"demand_forecast": {...}, "compound_risk": {...}, "quantum_routing": {...}}` | Unified inference run across all 4 AI engine stages. |
| `GET` | `/api/v1/forecast/{id}` | `?item_code=MED-PCM-500` | `{"wape": "17.48%", "daily_forecast": [...]}` | 7-day LightGBM Tweedie quantile predictions. |
| `POST` | `/api/v1/ocr/upload` | `multipart/form-data (file: image.jpg)` | `{"extraction": { "medicines": [...], "beds": {...}, "staff": {...} }}` | Runs OpenCV Hough deskew + Gemini Vision on paper register photo. |
| `GET` | `/api/v1/alerts/stream` | — | `text/event-stream (SSE)` | Continuous real-time stream of emergency $P_0$ stockout alerts. |

---

## 🗄️ 3. DATABASE SCHEMA & FEFO REALLOCATION RULES
- **Facilities Table**: `facility_id (PK), name, country_code, geom (Geometry Point), gen_beds, icu_beds, docs, nurses`.
- **Inventory Batches Table**: `batch_id (PK), facility_id (FK), item_code, batch_number, quantity, expiry_date`.
- **FEFO Allocation Query**:
  ```sql
  SELECT * FROM inventory_batches
  WHERE facility_id = :donor_id AND item_code = :item_code AND quantity > 0
  ORDER BY expiry_date ASC
  FOR UPDATE;
  ```
- **Authoritative Rule**: Backend SQL executes the actual transactional stock decrement/increment; AI `fefo_rules.py` handles route planning.
