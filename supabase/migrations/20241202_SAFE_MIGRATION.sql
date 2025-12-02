-- =====================================================
-- SAFE MIGRATION - No foreign key issues
-- Copy-paste this entire script into Supabase SQL Editor
-- =====================================================

-- STEP 1: Create function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 2: Fix trailers RLS
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trailers_company_isolation ON trailers;
CREATE POLICY trailers_company_isolation ON trailers
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

-- STEP 3: Create CLIENTS table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_name VARCHAR NOT NULL,
    cui VARCHAR,
    registration_number VARCHAR,
    address TEXT,
    city VARCHAR,
    county VARCHAR,
    country VARCHAR DEFAULT 'Romania',
    postal_code VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    contact_person VARCHAR,
    contact_phone VARCHAR,
    client_type VARCHAR DEFAULT 'client',
    payment_terms INTEGER DEFAULT 30,
    credit_limit NUMERIC,
    currency VARCHAR DEFAULT 'EUR',
    bank_name VARCHAR,
    bank_account VARCHAR,
    status VARCHAR DEFAULT 'activ',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, cui)
);

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clients_company_isolation ON clients;
CREATE POLICY clients_company_isolation ON clients
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

-- STEP 4: Add columns to trips (no FK for now)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS trailer_id UUID;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS diurna NUMERIC;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS diurna_currency VARCHAR DEFAULT 'EUR';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cash_expenses NUMERIC;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cash_expenses_currency VARCHAR DEFAULT 'EUR';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS expense_report_number VARCHAR;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS km_start INTEGER;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS km_end INTEGER;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS total_km INTEGER;

-- STEP 5: Create TRIP_STOPS table (no FK to clients)
CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    country VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    address TEXT,
    postal_code VARCHAR,
    type VARCHAR NOT NULL DEFAULT 'tranzit',
    sequence INTEGER NOT NULL DEFAULT 1,
    planned_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,
    client_id UUID,
    operator_name VARCHAR,
    cargo_type VARCHAR,
    cargo_weight NUMERIC,
    cargo_description TEXT,
    cmr_number VARCHAR,
    reference_number VARCHAR,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_sequence ON trip_stops(trip_id, sequence);
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

-- DONE!
SELECT 'Migration completed successfully!' as status;
