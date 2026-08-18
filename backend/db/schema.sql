-- CareDOM Backend — Core Schema (Person 2)
-- No ORM/Alembic in this project: this file is the single source of truth for
-- the schema. Apply it by hand against a fresh database, e.g.:
--   psql "$DATABASE_URL" -f backend/db/schema.sql
-- Statements are written to be safely re-runnable against a DB that already
-- has some or all of this schema (IF NOT EXISTS / DO blocks), since there is
-- no migration tracking table to say what has already been applied.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Multi-Country Facility Hierarchy
DO $$ BEGIN
    CREATE TYPE facility_type_enum AS ENUM (
        'NATIONAL_DEPOT', 'REGIONAL_WAREHOUSE', 'DISTRICT_HOSPITAL',
        'COMMUNITY_HEALTH_CENTRE', 'PRIMARY_HEALTH_CENTRE'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS facilities (
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
CREATE INDEX IF NOT EXISTS idx_facilities_country ON facilities(country_code);
CREATE INDEX IF NOT EXISTS idx_facilities_geom ON facilities USING GIST(location_geom);

-- 2. Medicine Catalog & Batches (FEFO Core)
CREATE TABLE IF NOT EXISTS item_masters (
    item_code VARCHAR(50) PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,        -- 'Antibiotic', 'Vaccine', 'Essential'
    unit VARCHAR(20) NOT NULL              -- 'Vial', 'Strip', 'Sachet'
);

CREATE TABLE IF NOT EXISTS inventory_batches (
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
CREATE INDEX IF NOT EXISTS idx_batches_fefo ON inventory_batches(facility_id, item_code, expiry_date ASC);

-- 3. Bed Availability Pillar
CREATE TABLE IF NOT EXISTS facility_beds (
    bed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) UNIQUE REFERENCES facilities(facility_id),
    general_total INT NOT NULL DEFAULT 20,
    general_occupied INT NOT NULL DEFAULT 0,
    icu_total INT NOT NULL DEFAULT 4,
    icu_occupied INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medical Personnel Attendance Pillar
CREATE TABLE IF NOT EXISTS staff_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    doctors_present INT NOT NULL DEFAULT 0,
    doctors_expected INT NOT NULL DEFAULT 0,
    nurses_present INT NOT NULL DEFAULT 0,
    nurses_expected INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_facility_date UNIQUE (facility_id, record_date)
);

-- 5. Immutable Inventory Ledger (append-only audit trail)
CREATE TABLE IF NOT EXISTS inventory_ledger (
    ledger_id BIGSERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL, -- 'DISPATCH', 'TRANSFER', 'CONSUMPTION'
    from_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    to_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    item_code VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
