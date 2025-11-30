-- Migration: Currency Conversion Enhancement
-- Description: Add fields for proper currency handling and BNR exchange rate support
-- Date: 2025-11-27

-- ============================================================
-- ADD ORIGINAL CURRENCY FIELDS
-- ============================================================

-- Original currency from the file (can be EUR, RON, etc.)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3) DEFAULT 'EUR';

-- Exchange rate used for conversion (1 if already in EUR)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 6) DEFAULT 1;

-- Date of the exchange rate (BNR rate date)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS exchange_rate_date VARCHAR(20);

-- Country code (ISO 2-letter)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- ============================================================
-- ADD EUR CONVERTED VALUES
-- ============================================================

-- Net purchase value converted to EUR
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS net_purchase_value_eur DECIMAL(12, 2);

-- Gross value (Brutto)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS gross_value DECIMAL(12, 2);

-- Gross value converted to EUR
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS gross_value_eur DECIMAL(12, 2);

-- Payment value converted to EUR
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS payment_value_eur DECIMAL(12, 2);

-- VAT amount in original currency
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount_original DECIMAL(12, 2);

-- Country's standard VAT rate (for reference)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_country_rate DECIMAL(5, 2);

-- ============================================================
-- UPDATE EXISTING DATA
-- ============================================================

-- For existing records where original_currency is not set, assume it matches payment_currency
UPDATE dkv_transactions
SET original_currency = COALESCE(payment_currency, 'EUR')
WHERE original_currency IS NULL OR original_currency = 'EUR';

-- Set EUR values to match original values for records that are already in EUR
UPDATE dkv_transactions
SET
  net_purchase_value_eur = net_purchase_value,
  payment_value_eur = payment_value,
  exchange_rate = 1
WHERE (original_currency = 'EUR' OR original_currency IS NULL)
  AND net_purchase_value_eur IS NULL;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN dkv_transactions.original_currency IS 'Original currency from the source file (EUR, RON, etc.)';
COMMENT ON COLUMN dkv_transactions.exchange_rate IS 'BNR exchange rate used for conversion to EUR';
COMMENT ON COLUMN dkv_transactions.exchange_rate_date IS 'Date of the BNR exchange rate used';
COMMENT ON COLUMN dkv_transactions.country_code IS 'ISO 2-letter country code';
COMMENT ON COLUMN dkv_transactions.net_purchase_value_eur IS 'Net purchase value converted to EUR';
COMMENT ON COLUMN dkv_transactions.gross_value IS 'Gross value (Brutto) in original currency';
COMMENT ON COLUMN dkv_transactions.gross_value_eur IS 'Gross value converted to EUR';
COMMENT ON COLUMN dkv_transactions.payment_value_eur IS 'Payment value converted to EUR (use for totals)';
COMMENT ON COLUMN dkv_transactions.vat_amount_original IS 'VAT amount in original currency';
COMMENT ON COLUMN dkv_transactions.vat_country_rate IS 'Standard VAT rate for the country (percentage)';
