-- =====================================================
-- Migration: Add employee_type, VIN fields, and update trailers
-- Date: 2024-12-02
-- Description:
--   1. Add employee_type to drivers table
--   2. Ensure VIN field exists on truck_heads
--   3. Add brand/model fields to trailers table
-- =====================================================

-- =====================================================
-- 1. DRIVERS TABLE - Add employee_type field
-- =====================================================

-- Add employee_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drivers' AND column_name = 'employee_type'
    ) THEN
        ALTER TABLE drivers
        ADD COLUMN employee_type TEXT DEFAULT 'sofer';
    END IF;
END $$;

-- Add check constraint for valid employee types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE constraint_name = 'drivers_employee_type_check'
    ) THEN
        ALTER TABLE drivers
        ADD CONSTRAINT drivers_employee_type_check
        CHECK (employee_type IN ('sofer', 'mecanic', 'portar', 'femeie_serviciu', 'asistent_manager', 'coordonator_transport', 'altele'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN drivers.employee_type IS 'Type of employee: sofer, mecanic, portar, femeie_serviciu, asistent_manager, coordonator_transport, altele';

-- =====================================================
-- 2. TRUCK_HEADS TABLE - Ensure VIN field exists
-- =====================================================

-- Add VIN column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'truck_heads' AND column_name = 'vin'
    ) THEN
        ALTER TABLE truck_heads
        ADD COLUMN vin TEXT;
    END IF;
END $$;

-- Add unique constraint on VIN (optional - VINs should be unique)
-- Uncomment if you want to enforce unique VINs
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM pg_indexes WHERE indexname = 'truck_heads_vin_unique'
--     ) THEN
--         CREATE UNIQUE INDEX truck_heads_vin_unique ON truck_heads(vin) WHERE vin IS NOT NULL;
--     END IF;
-- END $$;

COMMENT ON COLUMN truck_heads.vin IS 'Vehicle Identification Number (Serie Sasiu)';

-- =====================================================
-- 3. TRAILERS TABLE - Add brand, model fields if missing
-- =====================================================

-- Add brand column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trailers' AND column_name = 'brand'
    ) THEN
        ALTER TABLE trailers
        ADD COLUMN brand TEXT;
    END IF;
END $$;

-- Add model column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trailers' AND column_name = 'model'
    ) THEN
        ALTER TABLE trailers
        ADD COLUMN model TEXT;
    END IF;
END $$;

-- Ensure VIN exists on trailers too
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trailers' AND column_name = 'vin'
    ) THEN
        ALTER TABLE trailers
        ADD COLUMN vin TEXT;
    END IF;
END $$;

-- Ensure updated_at column exists on trailers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trailers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE trailers
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

COMMENT ON COLUMN trailers.brand IS 'Trailer brand/manufacturer (Marca)';
COMMENT ON COLUMN trailers.model IS 'Trailer model';
COMMENT ON COLUMN trailers.vin IS 'Vehicle Identification Number (Serie Sasiu)';

-- =====================================================
-- 4. CREATE TRAILERS TABLE (if it doesn't exist at all)
-- =====================================================

CREATE TABLE IF NOT EXISTS trailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL,
    vin TEXT,
    brand TEXT,
    model TEXT,
    type TEXT DEFAULT 'prelata' CHECK (type IN ('prelata', 'frigorific', 'cisterna', 'altele')),
    capacity_tons DECIMAL(10,2),
    volume_m3 DECIMAL(10,2),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    status TEXT DEFAULT 'activ' CHECK (status IN ('activ', 'inactiv')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, registration_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trailers_company_id ON trailers(company_id);
CREATE INDEX IF NOT EXISTS idx_trailers_status ON trailers(status);
CREATE INDEX IF NOT EXISTS idx_trailers_registration ON trailers(registration_number);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) for trailers
-- =====================================================

-- Enable RLS on trailers table
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see trailers from their company
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'trailers_company_isolation' AND tablename = 'trailers'
    ) THEN
        CREATE POLICY trailers_company_isolation ON trailers
            FOR ALL
            USING (company_id IN (
                SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            ));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 6. TRIGGERS for updated_at
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger on trailers table
DROP TRIGGER IF EXISTS update_trailers_updated_at ON trailers;
CREATE TRIGGER update_trailers_updated_at
    BEFORE UPDATE ON trailers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE!
-- Run this migration in your Supabase SQL Editor
-- =====================================================
