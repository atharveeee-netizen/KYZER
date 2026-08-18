"""
Database Initialization & Seed Loader for CareDOM PostgreSQL + PostGIS.
Automatically creates tables, spatial indices, and seeds the 18 BRICS clinics.
"""

import os
import json
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("backend.db.init")

# DDL Schema Definition with PostGIS Extension
SCHEMA_SQL = """
-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Health Facilities Registry Table
CREATE TABLE IF NOT EXISTS facilities (
    facility_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    district VARCHAR(100) NOT NULL,
    facility_type VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    total_beds INT DEFAULT 20,
    occupied_beds INT DEFAULT 0,
    icu_beds_total INT DEFAULT 2,
    icu_beds_occupied INT DEFAULT 0,
    doctors_present INT DEFAULT 2,
    nurses_present INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index on Facility Coordinates
CREATE INDEX IF NOT EXISTS idx_facilities_geom ON facilities USING GIST (geom);

-- 3. FEFO Pharmaceutical Inventory Batches Table
CREATE TABLE IF NOT EXISTS inventory_batches (
    batch_id SERIAL PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(facility_id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Fast FEFO Queries (First-Expiry-First-Out)
CREATE INDEX IF NOT EXISTS idx_inventory_fefo ON inventory_batches (facility_id, item_code, expiry_date ASC);

-- 4. Autonomous Redistribution Route Logs Table
CREATE TABLE IF NOT EXISTS route_dispatches (
    dispatch_id SERIAL PRIMARY KEY,
    donor_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    recipient_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    item_code VARCHAR(50) NOT NULL,
    units_transferred INT NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    transit_time_min DOUBLE PRECISION NOT NULL,
    cold_chain_passed BOOLEAN DEFAULT TRUE,
    google_maps_url TEXT,
    status VARCHAR(50) DEFAULT 'DISPATCHED',
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
"""

def seed_facilities_from_json(seed_json_path: str) -> List[Dict[str, Any]]:
    """Loads 18 seeded BRICS facilities."""
    if not os.path.exists(seed_json_path):
        logger.warning(f"Seed file not found at {seed_json_path}")
        return []
    with open(seed_json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def run_db_migration():
    """Executes schema DDL and seeds database if empty."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.info("DATABASE_URL not configured. Running in standalone SQLite/in-memory mode.")
        return

    logger.info("Connecting to PostgreSQL to run migrations...")
    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Execute DDL
        cur.execute(SCHEMA_SQL)
        conn.commit()
        logger.info("PostgreSQL schema and PostGIS tables initialized successfully.")

        # Seed data
        seed_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ai_engine/data/brics_facilities_seed.json"))
        facilities = seed_facilities_from_json(seed_path)
        
        for fac in facilities:
            cur.execute("""
                INSERT INTO facilities (
                    facility_id, name, country_code, district, facility_type, 
                    latitude, longitude, geom, total_beds, occupied_beds, 
                    icu_beds_total, icu_beds_occupied, doctors_present, nurses_present
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), 
                    %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (facility_id) DO NOTHING;
            """, (
                fac["facility_id"], fac["name"], fac.get("country_code", "IND"), "Pune",
                "DISTRICT_HOSPITAL" if fac.get("is_dh") else "PRIMARY_HEALTH_CENTRE",
                fac["lat"], fac["lng"], fac["lng"], fac["lat"],
                fac.get("gen_beds", 24), int(fac.get("gen_beds", 24) * 0.75),
                fac.get("icu_beds", 2), int(fac.get("icu_beds", 2) * 0.5),
                fac.get("docs", 2), fac.get("nurses", 5)
            ))
        
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Successfully seeded {len(facilities)} health facilities into PostGIS.")
    except Exception as e:
        logger.error(f"Failed to run database migration: {e}", exc_info=True)

if __name__ == "__main__":
    run_db_migration()
