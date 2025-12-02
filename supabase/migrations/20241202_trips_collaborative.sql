-- =====================================================
-- TRIPS COLLABORATIVE EDITING - Draft & Tracking
-- Run in Supabase SQL Editor
-- =====================================================

-- Add tracking columns to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_trips_last_modified_at ON trips(last_modified_at);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- Update status check to include 'draft'
-- The status column should allow: draft, planificat, in_progress, finalizat, anulat

-- Create trip_history table for audit trail
CREATE TABLE IF NOT EXISTS trip_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR,
    action VARCHAR NOT NULL, -- created, updated, status_changed, stop_added, etc.
    field_changed VARCHAR,
    old_value TEXT,
    new_value TEXT,
    changes JSONB, -- For bulk changes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_history_trip_id ON trip_history(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_history_created_at ON trip_history(created_at);

-- RLS for trip_history
ALTER TABLE trip_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trip_history_company_isolation ON trip_history;
CREATE POLICY trip_history_company_isolation ON trip_history
    FOR ALL
    USING (trip_id IN (
        SELECT t.id FROM trips t
        WHERE t.company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    ));

-- Function to automatically update last_modified fields
CREATE OR REPLACE FUNCTION update_trip_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = NOW();
    NEW.last_modified_by = auth.uid();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_trip_modified ON trips;
CREATE TRIGGER trigger_trip_modified
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_modified();

-- DONE!
SELECT 'Trip collaborative editing migration completed!' as status;
