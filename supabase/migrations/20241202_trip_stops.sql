-- =====================================================
-- TRIP STOPS - Multi-stop support for trips
-- Run in Supabase SQL Editor
-- =====================================================

-- Create trip_stops table for multi-stop journeys
CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,

    -- Location
    country VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    address TEXT,
    postal_code VARCHAR,

    -- Stop type and sequence
    type VARCHAR NOT NULL DEFAULT 'tranzit',  -- incarcare, descarcare, tranzit, pauza
    sequence INTEGER NOT NULL DEFAULT 1,       -- Order of stops

    -- Timing
    planned_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,

    -- Client/Operator for this stop (different operator per stop)
    client_id UUID REFERENCES clients(id),
    operator_name VARCHAR,                     -- Alternative: text field for operator

    -- Cargo details for this stop
    cargo_type VARCHAR,
    cargo_weight NUMERIC,
    cargo_description TEXT,

    -- CMR and documentation
    cmr_number VARCHAR,
    reference_number VARCHAR,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_sequence ON trip_stops(trip_id, sequence);
CREATE INDEX IF NOT EXISTS idx_trip_stops_client_id ON trip_stops(client_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_type ON trip_stops(type);

-- Enable RLS
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

-- Policy: users can access trip_stops for trips in their company
DROP POLICY IF EXISTS trip_stops_company_isolation ON trip_stops;
CREATE POLICY trip_stops_company_isolation ON trip_stops
    FOR ALL
    USING (trip_id IN (
        SELECT t.id FROM trips t
        WHERE t.company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_trip_stops_updated_at ON trip_stops;
CREATE TRIGGER update_trip_stops_updated_at
    BEFORE UPDATE ON trip_stops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Update trips table with additional fields if needed
-- =====================================================

-- Add trailer_id if not exists
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

-- Add diurna fields if not exists
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

-- Add cash_expenses fields if not exists
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

-- Add km tracking fields if not exists
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
-- DONE!
-- =====================================================
