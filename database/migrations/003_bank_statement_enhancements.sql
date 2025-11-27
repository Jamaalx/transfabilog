-- Migration: Bank Statement Enhancements
-- Description: Add is_paid field for invoices and payment tracking
-- Date: 2025-11-27

-- ============================================================
-- ADD is_paid FIELD TO UPLOADED DOCUMENTS
-- For tracking payment status of invoices (factura_iesire)
-- ============================================================
ALTER TABLE uploaded_documents
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Add index for quick filtering of paid/unpaid invoices
CREATE INDEX IF NOT EXISTS idx_uploaded_docs_is_paid ON uploaded_documents(is_paid) WHERE document_type = 'factura_iesire';

-- Add payment tracking fields
ALTER TABLE uploaded_documents
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE uploaded_documents
ADD COLUMN IF NOT EXISTS paid_from_document_id UUID REFERENCES uploaded_documents(id);

-- Comment explaining the fields
COMMENT ON COLUMN uploaded_documents.is_paid IS 'Whether this invoice has been paid (relevant for factura_iesire)';
COMMENT ON COLUMN uploaded_documents.paid_at IS 'When the invoice was marked as paid';
COMMENT ON COLUMN uploaded_documents.paid_from_document_id IS 'Reference to the bank statement that confirmed the payment';

-- ============================================================
-- BANK STATEMENT PAYMENTS TABLE
-- Track individual payments from bank statements
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_statement_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Source document (the bank statement)
  bank_statement_id UUID NOT NULL REFERENCES uploaded_documents(id) ON DELETE CASCADE,

  -- Transaction details
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  transaction_date DATE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  description TEXT,
  reference VARCHAR(255),
  counterparty VARCHAR(255),
  counterparty_iban VARCHAR(50),

  -- Associations
  matched_invoice_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL, -- For credit transactions matched to factura_iesire
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL, -- For debit transactions linked to trips
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Expense category for debit transactions
  expense_category VARCHAR(50),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'ignored')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_payments_company ON bank_statement_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_payments_statement ON bank_statement_payments(bank_statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_payments_type ON bank_statement_payments(transaction_type);
CREATE INDEX IF NOT EXISTS idx_bank_payments_invoice ON bank_statement_payments(matched_invoice_id);
CREATE INDEX IF NOT EXISTS idx_bank_payments_trip ON bank_statement_payments(trip_id);

-- RLS
ALTER TABLE bank_statement_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bank payments in their company"
  ON bank_statement_payments FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert bank payments in their company"
  ON bank_statement_payments FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update bank payments in their company"
  ON bank_statement_payments FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete bank payments in their company"
  ON bank_statement_payments FOR DELETE
  USING (company_id = get_user_company_id());

-- Trigger for updated_at
CREATE TRIGGER update_bank_statement_payments_updated_at
  BEFORE UPDATE ON bank_statement_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
