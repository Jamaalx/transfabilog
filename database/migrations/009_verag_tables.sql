-- Migration: Verag Toll Transactions System
-- Description: Separate tables for VERAG 360 GMBH toll (Maut) report imports
-- Date: 2025-11-28

-- ============================================================
-- VERAG IMPORT BATCHES TABLE
-- Track import sessions for grouping and reconciliation
-- ============================================================
CREATE TABLE verag_import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Batch info
  file_name VARCHAR(500),
  import_date TIMESTAMPTZ DEFAULT NOW(),
  report_date DATE, -- Datum from VERAG report header

  -- Statistics
  total_transactions INTEGER DEFAULT 0,
  matched_transactions INTEGER DEFAULT 0,
  unmatched_transactions INTEGER DEFAULT 0,

  -- Amounts (VERAG is always in EUR)
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
-- VERAG TRANSACTIONS TABLE
-- Stores individual toll transactions from VERAG Maut reports
-- ============================================================
CREATE TABLE verag_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES verag_import_batches(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_date TIMESTAMPTZ NOT NULL,

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50), -- LKW-Kennzeichen
  card_number VARCHAR(100), -- Kartennummer

  -- Entity linking (resolved after import)
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Product information
  product_type VARCHAR(100), -- ÚTDÍJAK, PEDAGGIO BG, Tolls, etc.
  product_category VARCHAR(50), -- toll_hungary, toll_bulgaria, vignette, etc.
  route_info VARCHAR(255), -- Route info like M5U35K618M

  -- Location
  country VARCHAR(10), -- AT, DE, HU, etc.
  country_code VARCHAR(2),

  -- Amounts (VERAG is always in EUR)
  currency VARCHAR(3) DEFAULT 'EUR',
  net_amount DECIMAL(12, 2), -- Netto
  vat_amount DECIMAL(12, 2), -- MWST
  gross_amount DECIMAL(12, 2), -- Brutto

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
CREATE INDEX idx_verag_transactions_company ON verag_transactions(company_id);
CREATE INDEX idx_verag_transactions_batch ON verag_transactions(batch_id);
CREATE INDEX idx_verag_transactions_status ON verag_transactions(status);
CREATE INDEX idx_verag_transactions_truck ON verag_transactions(truck_id);
CREATE INDEX idx_verag_transactions_date ON verag_transactions(transaction_date);
CREATE INDEX idx_verag_transactions_vehicle_reg ON verag_transactions(vehicle_registration);
CREATE INDEX idx_verag_transactions_card ON verag_transactions(card_number);
CREATE INDEX idx_verag_transactions_document ON verag_transactions(uploaded_document_id);
CREATE INDEX idx_verag_transactions_country ON verag_transactions(country);
CREATE INDEX idx_verag_transactions_product_cat ON verag_transactions(product_category);

CREATE INDEX idx_verag_batches_company ON verag_import_batches(company_id);
CREATE INDEX idx_verag_batches_status ON verag_import_batches(status);
CREATE INDEX idx_verag_batches_document ON verag_import_batches(uploaded_document_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE verag_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verag_import_batches ENABLE ROW LEVEL SECURITY;

-- Verag transactions policies
CREATE POLICY "Users can view Verag transactions in their company"
  ON verag_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Verag transactions in their company"
  ON verag_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Verag transactions in their company"
  ON verag_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Verag transactions in their company"
  ON verag_transactions FOR DELETE
  USING (company_id = get_user_company_id());

-- Verag import batches policies
CREATE POLICY "Users can view Verag import batches in their company"
  ON verag_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Verag import batches in their company"
  ON verag_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Verag import batches in their company"
  ON verag_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Verag import batches in their company"
  ON verag_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_verag_transactions_updated_at
  BEFORE UPDATE ON verag_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verag_import_batches_updated_at
  BEFORE UPDATE ON verag_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE verag_transactions IS 'Individual toll transactions from VERAG 360 GMBH Maut reports';
COMMENT ON TABLE verag_import_batches IS 'Import sessions for VERAG transaction batches';

COMMENT ON COLUMN verag_transactions.vehicle_registration IS 'LKW-Kennzeichen from VERAG report';
COMMENT ON COLUMN verag_transactions.truck_id IS 'Resolved truck reference after matching vehicle_registration';
COMMENT ON COLUMN verag_transactions.product_type IS 'Raw product name: ÚTDÍJAK, PEDAGGIO BG, Tolls, etc.';
COMMENT ON COLUMN verag_transactions.product_category IS 'Categorized type: toll_hungary, toll_bulgaria, vignette, etc.';
COMMENT ON COLUMN verag_transactions.route_info IS 'Route/segment info from VERAG report';
COMMENT ON COLUMN verag_transactions.vat_refundable IS 'Whether VAT can be claimed back (most EU countries)';
COMMENT ON COLUMN verag_transactions.status IS 'pending=not processed, matched=truck found, unmatched=truck not found, created_expense=expense created, ignored=skipped';
