-- Migration: Eurowag Fuel Transactions System
-- Description: Separate tables for Eurowag fuel card transaction imports
-- Date: 2025-11-28

-- ============================================================
-- EUROWAG IMPORT BATCHES TABLE
-- Track import sessions for grouping and reconciliation
-- ============================================================
CREATE TABLE eurowag_import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Batch info
  file_name VARCHAR(500),
  import_date TIMESTAMPTZ DEFAULT NOW(),

  -- Statistics
  total_transactions INTEGER DEFAULT 0,
  matched_transactions INTEGER DEFAULT 0,
  unmatched_transactions INTEGER DEFAULT 0,

  -- Amounts in EUR
  total_net_eur DECIMAL(14, 2) DEFAULT 0,
  total_gross_eur DECIMAL(14, 2) DEFAULT 0,
  total_vat_eur DECIMAL(14, 2) DEFAULT 0,

  -- Date range of transactions in batch
  period_start DATE,
  period_end DATE,

  -- Status
  status VARCHAR(30) DEFAULT 'imported' CHECK (status IN ('imported', 'processing', 'completed', 'partial', 'failed')),

  -- Metadata
  imported_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EUROWAG TRANSACTIONS TABLE
-- Stores individual fuel transactions from Eurowag card reports
-- ============================================================
CREATE TABLE eurowag_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES eurowag_import_batches(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_time TIMESTAMPTZ NOT NULL,
  service_type VARCHAR(50), -- FUEL, TOLL, etc.

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50),
  card_number VARCHAR(100),
  obu_id VARCHAR(100), -- OBU ID for toll

  -- Entity linking (resolved after import)
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Product information
  product_type VARCHAR(100), -- Motorină, AdBlue, etc.
  quantity DECIMAL(10, 3),
  unit VARCHAR(20) DEFAULT 'LTR',

  -- Location
  country VARCHAR(50),
  country_code VARCHAR(2),
  location VARCHAR(255),

  -- Original currency amounts
  original_currency VARCHAR(3) DEFAULT 'EUR',
  net_amount DECIMAL(12, 2), -- Sumă netă in original currency
  gross_amount DECIMAL(12, 2), -- Valoarea brută in original currency
  vat_amount DECIMAL(12, 2), -- VAT in original currency

  -- EUR converted amounts
  exchange_rate DECIMAL(10, 6) DEFAULT 1,
  exchange_rate_date VARCHAR(20),
  net_amount_eur DECIMAL(12, 2),
  gross_amount_eur DECIMAL(12, 2),
  vat_amount_eur DECIMAL(12, 2),

  -- VAT details
  vat_rate DECIMAL(5, 2),
  vat_country VARCHAR(10),
  vat_country_rate DECIMAL(5, 2),
  vat_refundable BOOLEAN DEFAULT FALSE,
  vat_refund_status VARCHAR(20) DEFAULT 'not_applicable'
    CHECK (vat_refund_status IN ('not_applicable', 'pending', 'submitted', 'refunded', 'rejected')),

  -- Processing status
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending', 'matched', 'unmatched', 'created_expense', 'ignored')),

  -- If expense was created from this transaction
  expense_id UUID REFERENCES transactions(id) ON DELETE SET NULL,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_eurowag_transactions_company ON eurowag_transactions(company_id);
CREATE INDEX idx_eurowag_transactions_batch ON eurowag_transactions(batch_id);
CREATE INDEX idx_eurowag_transactions_status ON eurowag_transactions(status);
CREATE INDEX idx_eurowag_transactions_truck ON eurowag_transactions(truck_id);
CREATE INDEX idx_eurowag_transactions_time ON eurowag_transactions(transaction_time);
CREATE INDEX idx_eurowag_transactions_vehicle_reg ON eurowag_transactions(vehicle_registration);
CREATE INDEX idx_eurowag_transactions_card ON eurowag_transactions(card_number);
CREATE INDEX idx_eurowag_transactions_document ON eurowag_transactions(uploaded_document_id);
CREATE INDEX idx_eurowag_transactions_country ON eurowag_transactions(country_code);

CREATE INDEX idx_eurowag_batches_company ON eurowag_import_batches(company_id);
CREATE INDEX idx_eurowag_batches_status ON eurowag_import_batches(status);
CREATE INDEX idx_eurowag_batches_document ON eurowag_import_batches(uploaded_document_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE eurowag_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eurowag_import_batches ENABLE ROW LEVEL SECURITY;

-- Eurowag transactions policies
CREATE POLICY "Users can view Eurowag transactions in their company"
  ON eurowag_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Eurowag transactions in their company"
  ON eurowag_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Eurowag transactions in their company"
  ON eurowag_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Eurowag transactions in their company"
  ON eurowag_transactions FOR DELETE
  USING (company_id = get_user_company_id());

-- Eurowag import batches policies
CREATE POLICY "Users can view Eurowag import batches in their company"
  ON eurowag_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Eurowag import batches in their company"
  ON eurowag_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Eurowag import batches in their company"
  ON eurowag_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Eurowag import batches in their company"
  ON eurowag_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_eurowag_transactions_updated_at
  BEFORE UPDATE ON eurowag_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eurowag_import_batches_updated_at
  BEFORE UPDATE ON eurowag_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE eurowag_transactions IS 'Individual fuel transactions from Eurowag card reports';
COMMENT ON TABLE eurowag_import_batches IS 'Import sessions for Eurowag transaction batches';

COMMENT ON COLUMN eurowag_transactions.service_type IS 'Type of service: FUEL, TOLL, etc.';
COMMENT ON COLUMN eurowag_transactions.vehicle_registration IS 'Vehicle registration from Eurowag report';
COMMENT ON COLUMN eurowag_transactions.truck_id IS 'Resolved truck reference after matching vehicle_registration';
COMMENT ON COLUMN eurowag_transactions.original_currency IS 'Original currency from the file (EUR, RON, HUF, CZK, etc.)';
COMMENT ON COLUMN eurowag_transactions.net_amount_eur IS 'Net amount converted to EUR (use for totals)';
COMMENT ON COLUMN eurowag_transactions.gross_amount_eur IS 'Gross amount (Brutto) converted to EUR';
COMMENT ON COLUMN eurowag_transactions.vat_refundable IS 'Whether VAT can be claimed back';
COMMENT ON COLUMN eurowag_transactions.status IS 'pending=not processed, matched=truck found, unmatched=truck not found, created_expense=expense created, ignored=skipped';
