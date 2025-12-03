-- =====================================================
-- Migration: Driver Documents Tracking System
-- Version: 003
-- Description: Adds columns for driver document tracking
--              with conditional requirements and AI extraction
-- =====================================================

-- =====================================================
-- 1. ADD COLUMNS TO DOCUMENTS TABLE
-- =====================================================

-- Add extracted_data JSONB column for AI-extracted data
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS extracted_data JSONB DEFAULT '{}'::jsonb;

-- Add alert_sent flag to track if expiry notification was sent
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT false;

-- Add alert_sent_at timestamp
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS alert_sent_at TIMESTAMP WITH TIME ZONE;

-- Add source to track where document came from (upload, ai_processed, manual)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'manual';

-- Add uploaded_document_id to link with uploaded_documents table if imported from there
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS uploaded_document_id UUID REFERENCES uploaded_documents(id);

-- =====================================================
-- 2. ADD COLUMNS TO DRIVERS TABLE FOR CONDITIONAL REQUIREMENTS
-- =====================================================

-- Flag for international transport (requires passport)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS has_international_routes BOOLEAN DEFAULT true;

-- Flag for ADR transport (requires ADR certificate)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS has_adr BOOLEAN DEFAULT false;

-- Flag for refrigerated transport (requires FRIGO/ATP certificate)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS has_frigo BOOLEAN DEFAULT false;

-- Add photo_url for driver profile picture
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for finding documents by entity
CREATE INDEX IF NOT EXISTS idx_documents_entity
ON documents(entity_type, entity_id);

-- Index for finding expiring documents
CREATE INDEX IF NOT EXISTS idx_documents_expiry
ON documents(expiry_date)
WHERE expiry_date IS NOT NULL;

-- Index for finding documents by type
CREATE INDEX IF NOT EXISTS idx_documents_doc_type
ON documents(doc_type);

-- Index for company documents
CREATE INDEX IF NOT EXISTS idx_documents_company
ON documents(company_id);

-- Composite index for driver document lookups
CREATE INDEX IF NOT EXISTS idx_documents_driver_lookup
ON documents(company_id, entity_type, entity_id)
WHERE entity_type = 'driver';

-- =====================================================
-- 4. CREATE VIEW FOR EXPIRING DOCUMENTS
-- =====================================================

CREATE OR REPLACE VIEW expiring_driver_documents AS
SELECT
    d.id as document_id,
    d.company_id,
    d.entity_id as driver_id,
    d.doc_type,
    d.doc_number,
    d.expiry_date,
    d.alert_sent,
    d.file_url,
    dr.first_name,
    dr.last_name,
    dr.phone,
    dr.email,
    (d.expiry_date - CURRENT_DATE) as days_until_expiry,
    CASE
        WHEN d.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN (d.expiry_date - CURRENT_DATE) <= 7 THEN 'critical'
        WHEN (d.expiry_date - CURRENT_DATE) <= 30 THEN 'urgent'
        WHEN (d.expiry_date - CURRENT_DATE) <= 90 THEN 'warning'
        ELSE 'ok'
    END as alert_status
FROM documents d
JOIN drivers dr ON d.entity_id = dr.id
WHERE d.entity_type = 'driver'
  AND d.expiry_date IS NOT NULL
ORDER BY d.expiry_date ASC;

-- =====================================================
-- 5. CREATE FUNCTION FOR DOCUMENT STATUS SUMMARY
-- =====================================================

CREATE OR REPLACE FUNCTION get_driver_document_summary(p_driver_id UUID)
RETURNS TABLE (
    total_documents INTEGER,
    valid_documents INTEGER,
    expiring_documents INTEGER,
    expired_documents INTEGER,
    missing_required INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_documents,
        COUNT(*) FILTER (
            WHERE expiry_date IS NULL
            OR expiry_date > CURRENT_DATE + INTERVAL '90 days'
        )::INTEGER as valid_documents,
        COUNT(*) FILTER (
            WHERE expiry_date IS NOT NULL
            AND expiry_date > CURRENT_DATE
            AND expiry_date <= CURRENT_DATE + INTERVAL '90 days'
        )::INTEGER as expiring_documents,
        COUNT(*) FILTER (
            WHERE expiry_date IS NOT NULL
            AND expiry_date <= CURRENT_DATE
        )::INTEGER as expired_documents,
        0::INTEGER as missing_required -- Calculated in backend
    FROM documents
    WHERE entity_type = 'driver'
    AND entity_id = p_driver_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ADD RLS POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS on documents table if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see documents from their company
DROP POLICY IF EXISTS documents_company_isolation ON documents;
CREATE POLICY documents_company_isolation ON documents
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN documents.extracted_data IS 'AI-extracted data from document (JSON)';
COMMENT ON COLUMN documents.alert_sent IS 'Whether expiry alert notification was sent';
COMMENT ON COLUMN documents.source IS 'Document source: manual, upload, ai_processed';
COMMENT ON COLUMN drivers.has_international_routes IS 'Driver does international transport (requires passport)';
COMMENT ON COLUMN drivers.has_adr IS 'Driver transports hazardous materials (requires ADR certificate)';
COMMENT ON COLUMN drivers.has_frigo IS 'Driver uses refrigerated vehicles (requires FRIGO/ATP certificate)';

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
/*
ALTER TABLE documents DROP COLUMN IF EXISTS extracted_data;
ALTER TABLE documents DROP COLUMN IF EXISTS alert_sent;
ALTER TABLE documents DROP COLUMN IF EXISTS alert_sent_at;
ALTER TABLE documents DROP COLUMN IF EXISTS source;
ALTER TABLE documents DROP COLUMN IF EXISTS uploaded_document_id;

ALTER TABLE drivers DROP COLUMN IF EXISTS has_international_routes;
ALTER TABLE drivers DROP COLUMN IF EXISTS has_adr;
ALTER TABLE drivers DROP COLUMN IF EXISTS has_frigo;
ALTER TABLE drivers DROP COLUMN IF EXISTS photo_url;

DROP INDEX IF EXISTS idx_documents_entity;
DROP INDEX IF EXISTS idx_documents_expiry;
DROP INDEX IF EXISTS idx_documents_doc_type;
DROP INDEX IF EXISTS idx_documents_company;
DROP INDEX IF EXISTS idx_documents_driver_lookup;

DROP VIEW IF EXISTS expiring_driver_documents;
DROP FUNCTION IF EXISTS get_driver_document_summary;
*/
