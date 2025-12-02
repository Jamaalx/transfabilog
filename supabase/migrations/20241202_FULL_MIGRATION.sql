-- =====================================================
-- FULL MIGRATION - Run this single file
-- Includes: RLS fixes, Clients, Trip Stops
-- =====================================================

-- =====================================================
-- PART 1: Fix RLS for trailers
-- =====================================================

ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trailers_company_isolation ON trailers;

CREATE POLICY trailers_company_isolation ON trailers
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

-- =====================================================
-- PART 2: Create update_updated_at_column function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- PART 3: CLIENTS table
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Company data
    company_name VARCHAR NOT NULL,
    cui VARCHAR,
    registration_number VARCHAR,

    -- Address
    address TEXT,
    city VARCHAR,
    county VARCHAR,
    country VARCHAR DEFAULT 'Romania',
    postal_code VARCHAR,

    -- Contact
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    contact_person VARCHAR,
    contact_phone VARCHAR,

    -- Commercial details
    client_type VARCHAR DEFAULT 'client',
    payment_terms INTEGER DEFAULT 30,
    credit_limit NUMERIC,
    currency VARCHAR DEFAULT 'EUR',

    -- Bank
    bank_name VARCHAR,
    bank_account VARCHAR,

    -- Status
    status VARCHAR DEFAULT 'activ',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique per company
    UNIQUE(company_id, cui)
);

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_cui ON clients(cui);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_company_isolation ON clients;
CREATE POLICY clients_company_isolation ON clients
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 4: Add client_id to trips table
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE trips ADD COLUMN client_id UUID REFERENCES clients(id);
        CREATE INDEX idx_trips_client_id ON trips(client_id);
    END IF;
END $$;

-- =====================================================
-- PART 5: Add trailer_id to trips if not exists
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'trailer_id'
    ) THEN
        ALTER TABLE trips ADD COLUMN trailer_id UUID REFERENCES trailers(id);
        CREATE INDEX idx_trips_trailer_id ON trips(trailer_id);
    END IF;
END $$;

-- =====================================================
-- PART 6: Add expense fields to trips if not exists
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'diurna'
    ) THEN
        ALTER TABLE trips ADD COLUMN diurna NUMERIC;
        ALTER TABLE trips ADD COLUMN diurna_currency VARCHAR DEFAULT 'EUR';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'cash_expenses'
    ) THEN
        ALTER TABLE trips ADD COLUMN cash_expenses NUMERIC;
        ALTER TABLE trips ADD COLUMN cash_expenses_currency VARCHAR DEFAULT 'EUR';
        ALTER TABLE trips ADD COLUMN expense_report_number VARCHAR;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'km_start'
    ) THEN
        ALTER TABLE trips ADD COLUMN km_start INTEGER;
        ALTER TABLE trips ADD COLUMN km_end INTEGER;
        ALTER TABLE trips ADD COLUMN total_km INTEGER;
    END IF;
END $$;

-- =====================================================
-- PART 7: TRIP_STOPS table for multi-stop support
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

    -- Location
    country VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    address TEXT,
    postal_code VARCHAR,

    -- Stop type and sequence
    type VARCHAR NOT NULL DEFAULT 'tranzit',
    sequence INTEGER NOT NULL DEFAULT 1,

    -- Timing
    planned_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,

    -- Client/Operator for this stop
    client_id UUID REFERENCES clients(id),
    operator_name VARCHAR,

    -- Cargo details
    cargo_type VARCHAR,
    cargo_weight NUMERIC,
    cargo_description TEXT,

    -- Documentation
    cmr_number VARCHAR,
    reference_number VARCHAR,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_sequence ON trip_stops(trip_id, sequence);
CREATE INDEX IF NOT EXISTS idx_trip_stops_client_id ON trip_stops(client_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_type ON trip_stops(type);

ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trip_stops_company_isolation ON trip_stops;
CREATE POLICY trip_stops_company_isolation ON trip_stops
    FOR ALL
    USING (trip_id IN (
        SELECT t.id FROM trips t
        WHERE t.company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    ));

DROP TRIGGER IF EXISTS update_trip_stops_updated_at ON trip_stops;
CREATE TRIGGER update_trip_stops_updated_at
    BEFORE UPDATE ON trip_stops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! All migrations applied successfully
-- =====================================================
