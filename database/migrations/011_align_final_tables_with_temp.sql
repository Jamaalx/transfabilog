-- Migration: Align Final Tables with Temp Tables
-- Description: Add missing columns to final tables so temp->final copy works seamlessly
-- Date: 2025-11-29

-- ============================================================
-- DKV TRANSACTIONS - Add missing columns from temp table
-- ============================================================

-- Add vat_amount_eur (exists in temp but not in final)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS vat_amount_eur DECIMAL(12, 2);

-- Add expense_id for consistency with eurowag/verag (alternative to transaction_id)
ALTER TABLE dkv_transactions
ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- Copy existing transaction_id values to expense_id for consistency
UPDATE dkv_transactions
SET expense_id = transaction_id
WHERE transaction_id IS NOT NULL AND expense_id IS NULL;

-- ============================================================
-- EUROWAG TRANSACTIONS - Add missing columns from temp table
-- ============================================================

-- Add product_category (exists in temp but not in final)
ALTER TABLE eurowag_transactions
ADD COLUMN IF NOT EXISTS product_category VARCHAR(50);

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN dkv_transactions.vat_amount_eur IS 'VAT amount converted to EUR';
COMMENT ON COLUMN dkv_transactions.expense_id IS 'Reference to created expense in transactions table (same as transaction_id for backwards compatibility)';
COMMENT ON COLUMN eurowag_transactions.product_category IS 'Product category (toll_hungary, toll_bulgaria, fuel, etc.)';
