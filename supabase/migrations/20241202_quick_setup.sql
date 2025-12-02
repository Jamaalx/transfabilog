-- =====================================================
-- QUICK SETUP - Run in Supabase SQL Editor
-- Pentru adăugare rapidă a câmpurilor noi
-- =====================================================

-- 1. Adaugă employee_type la drivers
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS employee_type TEXT DEFAULT 'sofer';

-- 2. Adaugă VIN la truck_heads (camioane)
ALTER TABLE truck_heads
ADD COLUMN IF NOT EXISTS vin TEXT;

-- 3. Adaugă coloane noi la trailers (remorci)
ALTER TABLE trailers
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS vin TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- Dacă tabela trailers NU există, rulează acest CREATE:
-- =====================================================

/*
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

-- Indexuri
CREATE INDEX idx_trailers_company_id ON trailers(company_id);
CREATE INDEX idx_trailers_status ON trailers(status);

-- Enable RLS
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;

-- Policy pentru company isolation
CREATE POLICY trailers_company_isolation ON trailers
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    ));
*/
