-- Migration: Enhance Fuel Providers
-- Description: Add provider tracking, VAT fields, and rename tables for multi-provider support
-- Date: 2025-11-27

-- ============================================================
-- ADD PROVIDER FIELD TO TRANSACTIONS
-- ============================================================
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'dkv'
CHECK (provider IN ('dkv', 'eurowag', 'verag', 'shell', 'omv', 'other'));

-- ============================================================
-- ADD VAT TRACKING FIELDS
-- ============================================================
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_country VARCHAR(10); -- Country where VAT was paid

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_refundable BOOLEAN DEFAULT FALSE; -- Is VAT refundable

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_refund_status VARCHAR(20) DEFAULT 'not_applicable'
CHECK (vat_refund_status IN ('not_applicable', 'pending', 'submitted', 'refunded', 'rejected'));

-- ============================================================
-- ADD PROVIDER TO BATCHES
-- ============================================================
ALTER TABLE dkv_import_batches
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'dkv'
CHECK (provider IN ('dkv', 'eurowag', 'verag', 'shell', 'omv', 'other'));

ALTER TABLE dkv_import_batches
ADD COLUMN IF NOT EXISTS total_vat DECIMAL(14, 2) DEFAULT 0;

-- ============================================================
-- ADD INDEXES FOR PROVIDER
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dkv_transactions_provider ON dkv_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_dkv_transactions_vat_country ON dkv_transactions(vat_country);
CREATE INDEX IF NOT EXISTS idx_dkv_batches_provider ON dkv_import_batches(provider);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN dkv_transactions.provider IS 'Fuel card provider: dkv, eurowag, verag, shell, omv';
COMMENT ON COLUMN dkv_transactions.vat_amount IS 'VAT amount in EUR';
COMMENT ON COLUMN dkv_transactions.vat_country IS 'Country where VAT was charged';
COMMENT ON COLUMN dkv_transactions.vat_refundable IS 'Whether VAT can be claimed back';
COMMENT ON COLUMN dkv_transactions.vat_refund_status IS 'Status of VAT refund claim';
