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
-- Natural key for the seeder's ON CONFLICT DO NOTHING: lets reseeding stay
-- additive (safe to rerun once real OCR ingest is writing rows) instead of
-- requiring a destructive TRUNCATE before every seed run.
CREATE UNIQUE INDEX IF NOT EXISTS uq_batches_natural_key
    ON inventory_batches (facility_id, item_code, batch_number);

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
    transaction_type VARCHAR(50) NOT NULL, -- 'RESERVE', 'DISPATCH', 'TRANSFER', 'CONSUMPTION'
    from_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    to_facility_id VARCHAR(50) REFERENCES facilities(facility_id),
    item_code VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    batch_id UUID REFERENCES inventory_batches(batch_id), -- batch_number alone can't be resolved without also carrying facility+item
    quantity INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Idempotent for installs where inventory_ledger already existed before
-- batch_id was added (CREATE TABLE IF NOT EXISTS above is a no-op there).
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES inventory_batches(batch_id);

-- 6. FEFO Allocation (Reservation)
-- Reserves stock for (facility_id, item_code) earliest-expiry-first by
-- walking inventory_batches with a plain FOR UPDATE (NOT SKIP LOCKED): if a
-- concurrent allocation already holds the lock on the earliest-expiring
-- batch, this call BLOCKS and waits for it rather than skipping ahead to a
-- later-expiring batch. Skipping is exactly the failure FEFO exists to
-- prevent, so throughput is deliberately traded for strict expiry ordering.
--
-- Moves stock from quantity_available into quantity_reserved (it does not
-- delete/consume it) and writes one inventory_ledger row per batch touched,
-- all inside the same statement. If total available stock can't cover the
-- request, RAISE EXCEPTION aborts the whole call: Postgres rolls back every
-- UPDATE/INSERT this function has made so far, and — because a plpgsql
-- table function only flushes its queued RETURN NEXT rows if the function
-- returns normally — the caller gets either the complete allocation or
-- nothing at all, never a partial one.
--
-- NOTE: this only reserves stock. Nothing yet converts a RESERVE into a
-- DISPATCH (final consumption) or releases a reservation back to
-- quantity_available if it's abandoned — reserved stock has no lifecycle
-- beyond this call. That's a deliberate scope cut, not an oversight: build
-- it when a dispatch/cancel flow is actually needed.
CREATE OR REPLACE FUNCTION allocate_fefo_stock(
    p_facility_id VARCHAR(50),
    p_item_code VARCHAR(50),
    p_quantity INT
)
RETURNS TABLE (batch_id UUID, batch_number VARCHAR(100), allocated_qty INT, expiry_date DATE) AS $$
DECLARE
    v_remaining INT := p_quantity;
    v_batch RECORD;
    v_alloc INT;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Requested quantity must be positive (got %)', p_quantity;
    END IF;

    FOR v_batch IN
        SELECT ib.batch_id AS b_id, ib.batch_number AS b_number,
               ib.quantity_available AS b_qty, ib.expiry_date AS b_expiry
        FROM inventory_batches ib
        WHERE ib.facility_id = p_facility_id
          AND ib.item_code = p_item_code
          AND ib.quantity_available > 0
          AND ib.expiry_date > CURRENT_DATE
        ORDER BY ib.expiry_date ASC
        FOR UPDATE
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_alloc := LEAST(v_batch.b_qty, v_remaining);

        UPDATE inventory_batches
        SET quantity_available = quantity_available - v_alloc,
            quantity_reserved = quantity_reserved + v_alloc
        WHERE inventory_batches.batch_id = v_batch.b_id;

        INSERT INTO inventory_ledger
            (transaction_type, from_facility_id, to_facility_id, item_code, batch_number, batch_id, quantity)
        VALUES
            ('RESERVE', p_facility_id, NULL, p_item_code, v_batch.b_number, v_batch.b_id, v_alloc);

        batch_id := v_batch.b_id;
        batch_number := v_batch.b_number;
        allocated_qty := v_alloc;
        expiry_date := v_batch.b_expiry;
        RETURN NEXT;

        v_remaining := v_remaining - v_alloc;
    END LOOP;

    IF v_remaining > 0 THEN
        RAISE EXCEPTION 'Insufficient FEFO stock for % at %: short by % units', p_item_code, p_facility_id, v_remaining;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;
