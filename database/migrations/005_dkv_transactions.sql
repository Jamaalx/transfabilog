-- Migration: DKV Fuel Transactions System
-- Description: Add support for DKV fuel card transaction imports from Excel reports
-- Date: 2025-11-27

-- ============================================================
-- DKV TRANSACTIONS TABLE
-- Stores individual fuel transactions from DKV card reports
-- ============================================================
CREATE TABLE dkv_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_time TIMESTAMPTZ NOT NULL,
  transaction_number VARCHAR(100),

  -- Station information
  station_name VARCHAR(255),
  station_city VARCHAR(255),
  station_number VARCHAR(50),
  country VARCHAR(10), -- Country code (PL, DE, CZ, etc.)

  -- Product information
  cost_group VARCHAR(100), -- Grupă cost (e.g., "Carburant diesel")
  product_group VARCHAR(100), -- Grupă produs
  goods_type VARCHAR(100), -- Tip mărfuri (Diesel, AdBlue, etc.)
  goods_code VARCHAR(50), -- Cod mărfuri

  -- Quantity and pricing
  unit VARCHAR(20), -- L (liters), etc.
  quantity DECIMAL(10, 3), -- Quantity in units (e.g., liters)
  price_per_unit DECIMAL(10, 4), -- Price per unit
  currency VARCHAR(3) DEFAULT 'EUR', -- Base currency

  -- Values
  net_base_value DECIMAL(12, 2), -- Valoare de bază Netă
  net_service_fee DECIMAL(12, 2) DEFAULT 0, -- Taxă de serviciu netă
  net_purchase_value DECIMAL(12, 2), -- Valoarea netă a achiziției
  payment_currency VARCHAR(3), -- Moneda de plată
  payment_value DECIMAL(12, 2), -- Valoarea în moneda de plată

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50), -- Raw registration from DKV
  card_number VARCHAR(100), -- Nr. card/cutie

  -- Entity linking (resolved after import)
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Processing status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched', 'created_expense', 'ignored')),

  -- If expense was created from this transaction
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,

  -- Metadata
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DKV IMPORT BATCHES TABLE
-- Track import sessions for grouping and reconciliation
-- ============================================================
CREATE TABLE dkv_import_batches (
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
  total_amount DECIMAL(14, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',

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

-- Add batch reference to transactions
ALTER TABLE dkv_transactions ADD COLUMN batch_id UUID REFERENCES dkv_import_batches(id) ON DELETE CASCADE;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_dkv_transactions_company ON dkv_transactions(company_id);
CREATE INDEX idx_dkv_transactions_batch ON dkv_transactions(batch_id);
CREATE INDEX idx_dkv_transactions_status ON dkv_transactions(status);
CREATE INDEX idx_dkv_transactions_truck ON dkv_transactions(truck_id);
CREATE INDEX idx_dkv_transactions_time ON dkv_transactions(transaction_time);
CREATE INDEX idx_dkv_transactions_vehicle_reg ON dkv_transactions(vehicle_registration);
CREATE INDEX idx_dkv_transactions_card ON dkv_transactions(card_number);
CREATE INDEX idx_dkv_transactions_document ON dkv_transactions(uploaded_document_id);

CREATE INDEX idx_dkv_batches_company ON dkv_import_batches(company_id);
CREATE INDEX idx_dkv_batches_status ON dkv_import_batches(status);
CREATE INDEX idx_dkv_batches_document ON dkv_import_batches(uploaded_document_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE dkv_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dkv_import_batches ENABLE ROW LEVEL SECURITY;

-- DKV transactions policies
CREATE POLICY "Users can view DKV transactions in their company"
  ON dkv_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert DKV transactions in their company"
  ON dkv_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update DKV transactions in their company"
  ON dkv_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete DKV transactions in their company"
  ON dkv_transactions FOR DELETE
  USING (company_id = get_user_company_id());

-- DKV import batches policies
CREATE POLICY "Users can view DKV import batches in their company"
  ON dkv_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert DKV import batches in their company"
  ON dkv_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update DKV import batches in their company"
  ON dkv_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete DKV import batches in their company"
  ON dkv_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_dkv_transactions_updated_at BEFORE UPDATE ON dkv_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dkv_import_batches_updated_at BEFORE UPDATE ON dkv_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE dkv_transactions IS 'Individual fuel transactions from DKV card reports';
COMMENT ON TABLE dkv_import_batches IS 'Import sessions for DKV transaction batches';

COMMENT ON COLUMN dkv_transactions.vehicle_registration IS 'Raw vehicle registration from DKV report (may need normalization for matching)';
COMMENT ON COLUMN dkv_transactions.truck_id IS 'Resolved truck reference after matching vehicle_registration';
COMMENT ON COLUMN dkv_transactions.transaction_id IS 'Reference to created expense transaction in transactions table';
COMMENT ON COLUMN dkv_transactions.status IS 'pending=not processed, matched=truck found, unmatched=truck not found, created_expense=expense created, ignored=skipped';
