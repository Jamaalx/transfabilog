-- Migration: Add notes column to transactions table
-- Description: The approve endpoint for DKV/Eurowag/Verag needs to store import notes
-- Date: 2025-11-29
-- Issue: "Could not find the 'notes' column of 'transactions' in the schema cache"

-- ============================================================
-- ADD NOTES COLUMN TO TRANSACTIONS TABLE
-- ============================================================

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment
COMMENT ON COLUMN transactions.notes IS 'Additional notes for the transaction (e.g., import source, country)';
