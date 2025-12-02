-- =====================================================
-- QUICK SETUP - Corrected based on actual schema
-- Run in Supabase SQL Editor
-- =====================================================

-- Toate câmpurile necesare EXISTĂ DEJA în schema ta:
-- ✓ drivers.employee_type (default 'sofer')
-- ✓ truck_heads.vin
-- ✓ trailers.brand, trailers.model, trailers.vin

-- =====================================================
-- DOAR RLS Policy pentru trailers (dacă nu există)
-- =====================================================

-- Enable RLS pe trailers
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;

-- Drop policy dacă există
DROP POLICY IF EXISTS trailers_company_isolation ON trailers;

-- Crează policy corectă (bazată pe user_profiles.id = auth.uid())
CREATE POLICY trailers_company_isolation ON trailers
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

-- =====================================================
-- OPȚIONAL: Verifică că RLS este activ pe celelalte tabele
-- =====================================================

-- Poți rula aceste comenzi să verifici RLS-ul:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- =====================================================
-- Schema pentru CLIENȚI (CLIENTS) - NOU
-- Bazat pe cerințele din document
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Date firmă
    company_name VARCHAR NOT NULL,              -- Numele firmei
    cui VARCHAR,                                -- CUI / Cod TVA
    registration_number VARCHAR,               -- Nr înregistrare (J..)

    -- Adresă
    address TEXT,                              -- Adresa completă
    city VARCHAR,
    county VARCHAR,
    country VARCHAR DEFAULT 'Romania',
    postal_code VARCHAR,

    -- Contact
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    contact_person VARCHAR,                    -- Persoană de contact
    contact_phone VARCHAR,

    -- Detalii comerciale
    client_type VARCHAR DEFAULT 'client',      -- client, furnizor, partener
    payment_terms INTEGER DEFAULT 30,          -- Termen plată (zile)
    credit_limit NUMERIC,                      -- Limită credit
    currency VARCHAR DEFAULT 'EUR',

    -- Bancar
    bank_name VARCHAR,
    bank_account VARCHAR,                      -- IBAN

    -- Status
    status VARCHAR DEFAULT 'activ',            -- activ, inactiv, blocat
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique per company
    UNIQUE(company_id, cui)
);

-- Indexuri pentru căutare rapidă
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_cui ON clients(cui);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy pentru izolare per companie
DROP POLICY IF EXISTS clients_company_isolation ON clients;
CREATE POLICY clients_company_isolation ON clients
    FOR ALL
    USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
    ));

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Adaugă client_id la trips (pentru legătură cu clienți)
-- =====================================================

-- Adaugă coloana client_id dacă nu există
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
-- DONE! Rulează acest script în Supabase SQL Editor
-- =====================================================
