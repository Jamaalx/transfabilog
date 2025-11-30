-- Migration: Complete DKV Schema Alignment
-- Description: Add ALL missing columns from dkv_temp_transactions to dkv_transactions final table
-- Date: 2025-11-29
-- Issue: When approving DKV transactions, the copy from temp to final fails because final table
--        is missing many columns that exist in temp table

-- ============================================================
-- DKV TRANSACTIONS - Add all missing columns from temp table
-- ============================================================

-- Country code (2-letter ISO code)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- EUR converted values
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS net_purchase_value_eur DECIMAL(12, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS payment_value_eur DECIMAL(12, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS gross_value DECIMAL(12, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS gross_value_eur DECIMAL(12, 2);

-- Currency conversion info
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 6) DEFAULT 1;

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS exchange_rate_date VARCHAR(20);

-- VAT columns
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12, 2);

-- vat_amount_eur already added in migration 011, but add IF NOT EXISTS for safety
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount_eur DECIMAL(12, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount_original DECIMAL(12, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_country VARCHAR(10);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_country_rate DECIMAL(5, 2);

ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_refundable BOOLEAN DEFAULT FALSE;

-- Provider info
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'dkv';

-- expense_id already added in migration 011, but add IF NOT EXISTS for safety
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN dkv_transactions.country_code IS '2-letter ISO country code';
COMMENT ON COLUMN dkv_transactions.net_purchase_value_eur IS 'Net purchase value converted to EUR';
COMMENT ON COLUMN dkv_transactions.payment_value_eur IS 'Payment value converted to EUR';
COMMENT ON COLUMN dkv_transactions.gross_value IS 'Gross value in original currency';
COMMENT ON COLUMN dkv_transactions.gross_value_eur IS 'Gross value converted to EUR';
COMMENT ON COLUMN dkv_transactions.original_currency IS 'Original currency of transaction (RON, HUF, PLN, etc.)';
COMMENT ON COLUMN dkv_transactions.exchange_rate IS 'Exchange rate used for EUR conversion';
COMMENT ON COLUMN dkv_transactions.exchange_rate_date IS 'Date of exchange rate used';
COMMENT ON COLUMN dkv_transactions.vat_amount IS 'VAT amount in original currency';
COMMENT ON COLUMN dkv_transactions.vat_amount_eur IS 'VAT amount converted to EUR';
COMMENT ON COLUMN dkv_transactions.vat_amount_original IS 'Original VAT amount from file';
COMMENT ON COLUMN dkv_transactions.vat_rate IS 'Calculated VAT rate percentage';
COMMENT ON COLUMN dkv_transactions.vat_country IS 'Country code for VAT purposes';
COMMENT ON COLUMN dkv_transactions.vat_country_rate IS 'Standard VAT rate for the country';
COMMENT ON COLUMN dkv_transactions.vat_refundable IS 'Whether VAT is refundable for this transaction';
COMMENT ON COLUMN dkv_transactions.provider IS 'Provider (dkv, eurowag, verag)';
