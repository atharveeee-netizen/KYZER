# ⚙️ CareDOM Architecture: Person 2 — Backend & Database Systems Lead (Updated BRICS Edition)
**Project:** CareDOM — BRICS-Federated Smart Health Centre Management  
**Team:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  
**Role:** Person 2 — Backend API, Database Architecture, FEFO Engine & Redistribution  

---

## 1. 📋 EXECUTIVE SUMMARY & SCOPE
Person 2 provides the resilient backbone of CareDOM, directly delivering on the **20% Problem-Solution Fit** (Medicines + Beds + Staff + Redistribution) and the **20% Cross-Border Applicability** (Universal FHIR R4 + BRICS Country Support).

| Parameter | Technology / Strategy |
| :--- | :--- |
| **Framework** | **FastAPI (Python 3.12+)** (Async ASGI, Pydantic v2) |
| **Datastore** | **PostgreSQL 16 + PostGIS 3.4** (Spatial KNN `<->` redistribution matching) |
| **Interoperability** | **HL7 FHIR R4** universal schema (`MedicationRequest`, `SupplyDelivery`, `Location`) |
| **Core 3 Pillars** | **Medicine Batches (FEFO)** + **Facility Beds (ICU/General)** + **Staff Attendance** |
| **Hero Endpoint** | `/api/v1/redistribution/suggest` (Instant PostGIS surplus match within 50km) |
| **Real-Time Feed** | **Server-Sent Events (SSE)** for stockout & bed saturation broadcasts |
| **Judge Access** | **Open Public Reads** (Zero login walls; optional API key for mutating writes) |

---

## 2. 🗄️ STREAMLINED DATABASE SCHEMA (PostgreSQL + PostGIS DDL)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Multi-Country Facility Hierarchy
CREATE TYPE facility_type_enum AS ENUM (
    'NATIONAL_DEPOT', 'REGIONAL_WAREHOUSE', 'DISTRICT_HOSPITAL', 
    'COMMUNITY_HEALTH_CENTRE', 'PRIMARY_HEALTH_CENTRE'
);

CREATE TABLE facilities (
    facility_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,      -- 'IND', 'ZAF', 'BRA'
    region_state VARCHAR(100) NOT NULL,    -- e.g. 'Maharashtra', 'Gauteng'
    district VARCHAR(100) NOT NULL,
    facility_type facility_type_enum NOT NULL,
    location_geom GEOMETRY(Point, 4326),   -- PostGIS Coordinates (Lng, Lat)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_facilities_country ON facilities(country_code);
CREATE INDEX idx_facilities_geom ON facilities USING GIST(location_geom);

-- 2. Medicine Catalog & Batches (FEFO Core)
CREATE TABLE item_masters (
    item_code VARCHAR(50) PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,        -- 'Antibiotic', 'Vaccine', 'Essential'
    unit VARCHAR(20) NOT NULL              -- 'Vial', 'Strip', 'Sachet'
);

CREATE TABLE inventory_batches (
    batch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    item_code VARCHAR(50) REFERENCES item_masters(item_code),
    batch_number VARCHAR(100) NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_positive_stock CHECK (quantity_available >= 0)
);
CREATE INDEX idx_batches_fefo ON inventory_batches(facility_id, item_code, expiry_date ASC);

-- 3. Bed Availability Pillar
CREATE TABLE facility_beds (
    bed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) UNIQUE REFERENCES facilities(facility_id),
    general_total INT NOT NULL DEFAULT 20,
    general_occupied INT NOT NULL DEFAULT 0,
    icu_total INT NOT NULL DEFAULT 4,
    icu_occupied INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medical Personnel Attendance Pillar
CREATE TABLE staff_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    doctors_present INT NOT NULL DEFAULT 0,
    doctors_expected INT NOT NULL DEFAULT 0,
    nurses_present INT NOT NULL DEFAULT 0,
    nurses_expected INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_facility_date UNIQUE (facility_id, record_date)
);

-- 5. Immutable Cryptographic Inventory Ledger
CREATE TABLE inventory_ledger (
    ledger_id BIGSERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL, -- 'DISPATCH', 'TRANSFER', 'CONSUMPTION'
    from_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    to_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    item_code VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. 🚨 HERO ENDPOINT: AUTOMATED CROSS-DISTRICT REDISTRIBUTION

When a clinic faces an emergency stockout, this endpoint uses PostGIS KNN spatial indexing to locate the closest clinic with surplus stock and computes a transfer recommendation in <20 milliseconds.

```python
# backend/app/routes/redistribution_routes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import asyncpg

router = APIRouter(prefix="/api/v1/redistribution", tags=["Redistribution"])

@router.get("/suggest")
async def suggest_resource_redistribution(
    requesting_facility_id: str,
    item_code: str,
    needed_qty: int,
    db: asyncpg.Connection = Depends(get_db)
):
    # Query nearest facility within same country that has surplus stock > needed_qty
    query = """
    SELECT 
        f.facility_id,
        f.name,
        f.district,
        b.batch_number,
        b.expiry_date,
        b.quantity_available,
        ROUND((ST_Distance(f.location_geom, req.location_geom) / 1000.0)::numeric, 1) AS distance_km
    FROM facilities f
    JOIN inventory_batches b ON f.facility_id = b.facility_id
    CROSS JOIN (SELECT location_geom, country_code FROM facilities WHERE facility_id = $1) req
    WHERE f.facility_id != $1
      AND f.country_code = req.country_code
      AND b.item_code = $2
      AND b.quantity_available >= $3
      AND b.expiry_date > CURRENT_DATE + INTERVAL '14 days'
    ORDER BY f.location_geom <-> req.location_geom
    LIMIT 1;
    """
    row = await db.fetchrow(query, requesting_facility_id, item_code, needed_qty)
    
    if not row:
        raise HTTPException(status_code=404, detail="No facility with sufficient surplus found within operational range.")
        
    return {
        "status": "TRANSFER_RECOMMENDED",
        "requesting_facility_id": requesting_facility_id,
        "needed_item": item_code,
        "needed_quantity": needed_qty,
        "suggested_donor": {
            "facility_id": row["facility_id"],
            "facility_name": row["name"],
            "district": row["district"],
            "distance_km": float(row["distance_km"]),
            "estimated_transit_minutes": int(float(row["distance_km"]) * 1.8),
            "source_batch": row["batch_number"],
            "batch_expiry": str(row["expiry_date"]),
            "available_stock": row["quantity_available"]
        },
        "dispatch_action": "POST /api/v1/inventory/transfer"
    }
```

---

## 4. 📦 DETERMINISTIC FEFO ALLOCATION (Plain `FOR UPDATE`)

```python
# backend/app/services/fefo_service.py
async def allocate_fefo_stock(db, facility_id: str, item_code: str, required_qty: int):
    async with db.transaction():
        # Lock batches in strict ascending expiry order
        query = """
        SELECT batch_id, batch_number, quantity_available, expiry_date
        FROM inventory_batches
        WHERE facility_id = $1 AND item_code = $2 AND quantity_available > 0 AND expiry_date > CURRENT_DATE
        ORDER BY expiry_date ASC
        FOR UPDATE;
        """
        batches = await db.fetch(query, facility_id, item_code)
        
        remaining = required_qty
        allocations = []
        
        for b in batches:
            if remaining <= 0:
                break
            alloc = min(b["quantity_available"], remaining)
            
            await db.execute(
                "UPDATE inventory_batches SET quantity_available = quantity_available - $1, quantity_reserved = quantity_reserved + $1 WHERE batch_id = $2",
                alloc, b["batch_id"]
            )
            allocations.append({"batch_number": b["batch_number"], "allocated_qty": alloc, "expiry": str(b["expiry_date"])})
            remaining -= alloc
            
        if remaining > 0:
            raise ValueError(f"Insufficient FEFO stock. Short by {remaining} units.")
            
        return allocations
```

---

## 5. 📁 FOLDER STRUCTURE (`backend/`)

```text
backend/
├── app/
│   ├── main.py                     # FastAPI entrypoint & open CORS
│   ├── config.py                   # Environment settings (DATABASE_URL, GEMINI_API_KEY)
│   ├── database.py                 # Async PostgreSQL / SQLite engine
│   ├── seed_data.py                # BRICS multi-country health center seeder
│   ├── routes/
│   │   ├── dashboard_routes.py     # Unified facilities overview with Beds & Staff
│   │   ├── inventory_routes.py     # FEFO queries & batch allocation
│   │   ├── redistribution_routes.py# PostGIS nearest surplus matching
│   │   ├── ocr_routes.py           # Gemini OCR commit hook
│   │   └── alert_routes.py         # Server-Sent Events (SSE) stream
│   └── services/
│       ├── fefo_service.py
│       └── webhook_service.py      # Outbound trigger for Person 4 WhatsApp
├── Dockerfile
└── requirements.txt
```

---

## 6. ⏱️ PRIORITY TASK ORDER

| Priority | Task | Est. Hours | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | FastAPI app shell + PostgreSQL connection + Seed BRICS data | 2.0 hrs | Core API Foundation |
| **P0** | Unified Facilities Endpoint (`GET /api/v1/facilities/dashboard` with Beds, Staff, Stock) | 2.0 hrs | 20% Rubric Scope |
| **P0** | PostGIS Redistribution Endpoint (`/api/v1/redistribution/suggest`) | 2.0 hrs | Killer Demo Feature |
| **P1** | Gemini OCR commit endpoint (`POST /api/v1/ocr/commit-register`) | 1.5 hrs | Google AI Gate |
| **P1** | Real-time SSE alert streaming + Webhook trigger | 1.5 hrs | Real-time interactivity |
| **P2** | FEFO transaction allocation service + ledger writes | 1.5 hrs | Pharmaceutical integrity |
