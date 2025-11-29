-- Migration: Temporary Expense Tables for Staging
-- Description: Create temporary tables for DKV, Eurowag, and Verag to stage imports before final approval
-- Date: 2025-11-29
--
-- FLOW:
-- 1. Import PDF/Excel -> Save to *_temp_transactions (staging)
-- 2. User reviews and validates data
-- 3. User clicks "Creează Cheltuieli" -> Move from temp to final tables + create expense
-- 4. Delete from temp tables

-- ============================================================
-- DKV TEMP IMPORT BATCHES TABLE
-- ============================================================
CREATE TABLE dkv_temp_import_batches (
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
  total_vat DECIMAL(14, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Date range of transactions in batch
  period_start DATE,
  period_end DATE,

  -- Provider info
  provider VARCHAR(20) DEFAULT 'dkv',

  -- Status
  status VARCHAR(30) DEFAULT 'imported' CHECK (status IN ('imported', 'processing', 'completed', 'partial', 'failed')),

  -- Metadata
  imported_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DKV TEMP TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE dkv_temp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES dkv_temp_import_batches(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_time TIMESTAMPTZ NOT NULL,
  transaction_number VARCHAR(100),

  -- Station information
  station_name VARCHAR(255),
  station_city VARCHAR(255),
  station_number VARCHAR(50),
  country VARCHAR(10),
  country_code VARCHAR(2),

  -- Product information
  cost_group VARCHAR(100),
  product_group VARCHAR(100),
  goods_type VARCHAR(100),
  goods_code VARCHAR(50),

  -- Quantity and pricing
  unit VARCHAR(20),
  quantity DECIMAL(10, 3),
  price_per_unit DECIMAL(10, 4),
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Values
  net_base_value DECIMAL(12, 2),
  net_service_fee DECIMAL(12, 2) DEFAULT 0,
  net_purchase_value DECIMAL(12, 2),
  net_purchase_value_eur DECIMAL(12, 2),
  payment_currency VARCHAR(3),
  payment_value DECIMAL(12, 2),
  payment_value_eur DECIMAL(12, 2),
  gross_value DECIMAL(12, 2),
  gross_value_eur DECIMAL(12, 2),

  -- VAT
  vat_amount DECIMAL(12, 2),
  vat_amount_eur DECIMAL(12, 2),
  vat_rate DECIMAL(5, 2),
  vat_country VARCHAR(10),
  vat_country_rate DECIMAL(5, 2),
  vat_refundable BOOLEAN DEFAULT FALSE,

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50),
  card_number VARCHAR(100),

  -- Entity linking
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Processing status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched', 'created_expense', 'ignored')),

  -- Metadata
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EUROWAG TEMP IMPORT BATCHES TABLE
-- ============================================================
CREATE TABLE eurowag_temp_import_batches (
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

  -- Date range
  period_start DATE,
  period_end DATE,

  -- Provider info
  provider VARCHAR(20) DEFAULT 'eurowag',

  -- Status
  status VARCHAR(30) DEFAULT 'imported' CHECK (status IN ('imported', 'processing', 'completed', 'partial', 'failed')),

  -- Metadata
  imported_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EUROWAG TEMP TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE eurowag_temp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES eurowag_temp_import_batches(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_time TIMESTAMPTZ NOT NULL,
  service_type VARCHAR(50),

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50),
  card_number VARCHAR(100),
  obu_id VARCHAR(100),

  -- Entity linking
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Product information
  product_type VARCHAR(100),
  product_category VARCHAR(50),
  quantity DECIMAL(10, 3),
  unit VARCHAR(20) DEFAULT 'LTR',

  -- Location
  country VARCHAR(50),
  country_code VARCHAR(2),
  location VARCHAR(255),

  -- Original currency amounts
  original_currency VARCHAR(3) DEFAULT 'EUR',
  net_amount DECIMAL(12, 2),
  gross_amount DECIMAL(12, 2),
  vat_amount DECIMAL(12, 2),

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

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VERAG TEMP IMPORT BATCHES TABLE
-- ============================================================
CREATE TABLE verag_temp_import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Batch info
  file_name VARCHAR(500),
  import_date TIMESTAMPTZ DEFAULT NOW(),
  report_date DATE,

  -- Statistics
  total_transactions INTEGER DEFAULT 0,
  matched_transactions INTEGER DEFAULT 0,
  unmatched_transactions INTEGER DEFAULT 0,

  -- Amounts (VERAG is always in EUR)
  total_net_eur DECIMAL(14, 2) DEFAULT 0,
  total_gross_eur DECIMAL(14, 2) DEFAULT 0,
  total_vat_eur DECIMAL(14, 2) DEFAULT 0,

  -- Date range
  period_start DATE,
  period_end DATE,

  -- Provider info
  provider VARCHAR(20) DEFAULT 'verag',

  -- Status
  status VARCHAR(30) DEFAULT 'imported' CHECK (status IN ('imported', 'processing', 'completed', 'partial', 'failed')),

  -- Metadata
  imported_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VERAG TEMP TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE verag_temp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES verag_temp_import_batches(id) ON DELETE CASCADE,

  -- Source document reference
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,

  -- Transaction identification
  transaction_date TIMESTAMPTZ NOT NULL,

  -- Vehicle and card identification
  vehicle_registration VARCHAR(50),
  card_number VARCHAR(100),

  -- Entity linking
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,

  -- Product information
  product_type VARCHAR(100),
  product_category VARCHAR(50),
  route_info VARCHAR(255),

  -- Location
  country VARCHAR(10),
  country_code VARCHAR(2),

  -- Amounts (VERAG is always in EUR)
  currency VARCHAR(3) DEFAULT 'EUR',
  net_amount DECIMAL(12, 2),
  vat_amount DECIMAL(12, 2),
  gross_amount DECIMAL(12, 2),

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

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR TEMP TABLES
-- ============================================================
-- DKV Temp
CREATE INDEX idx_dkv_temp_transactions_company ON dkv_temp_transactions(company_id);
CREATE INDEX idx_dkv_temp_transactions_batch ON dkv_temp_transactions(batch_id);
CREATE INDEX idx_dkv_temp_transactions_status ON dkv_temp_transactions(status);
CREATE INDEX idx_dkv_temp_transactions_truck ON dkv_temp_transactions(truck_id);
CREATE INDEX idx_dkv_temp_transactions_time ON dkv_temp_transactions(transaction_time);
CREATE INDEX idx_dkv_temp_transactions_vehicle_reg ON dkv_temp_transactions(vehicle_registration);
CREATE INDEX idx_dkv_temp_batches_company ON dkv_temp_import_batches(company_id);
CREATE INDEX idx_dkv_temp_batches_status ON dkv_temp_import_batches(status);

-- Eurowag Temp
CREATE INDEX idx_eurowag_temp_transactions_company ON eurowag_temp_transactions(company_id);
CREATE INDEX idx_eurowag_temp_transactions_batch ON eurowag_temp_transactions(batch_id);
CREATE INDEX idx_eurowag_temp_transactions_status ON eurowag_temp_transactions(status);
CREATE INDEX idx_eurowag_temp_transactions_truck ON eurowag_temp_transactions(truck_id);
CREATE INDEX idx_eurowag_temp_transactions_time ON eurowag_temp_transactions(transaction_time);
CREATE INDEX idx_eurowag_temp_transactions_vehicle_reg ON eurowag_temp_transactions(vehicle_registration);
CREATE INDEX idx_eurowag_temp_batches_company ON eurowag_temp_import_batches(company_id);
CREATE INDEX idx_eurowag_temp_batches_status ON eurowag_temp_import_batches(status);

-- Verag Temp
CREATE INDEX idx_verag_temp_transactions_company ON verag_temp_transactions(company_id);
CREATE INDEX idx_verag_temp_transactions_batch ON verag_temp_transactions(batch_id);
CREATE INDEX idx_verag_temp_transactions_status ON verag_temp_transactions(status);
CREATE INDEX idx_verag_temp_transactions_truck ON verag_temp_transactions(truck_id);
CREATE INDEX idx_verag_temp_transactions_date ON verag_temp_transactions(transaction_date);
CREATE INDEX idx_verag_temp_transactions_vehicle_reg ON verag_temp_transactions(vehicle_registration);
CREATE INDEX idx_verag_temp_batches_company ON verag_temp_import_batches(company_id);
CREATE INDEX idx_verag_temp_batches_status ON verag_temp_import_batches(status);

-- ============================================================
-- ROW LEVEL SECURITY FOR TEMP TABLES
-- ============================================================
ALTER TABLE dkv_temp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dkv_temp_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE eurowag_temp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eurowag_temp_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE verag_temp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verag_temp_import_batches ENABLE ROW LEVEL SECURITY;

-- DKV Temp policies
CREATE POLICY "Users can view DKV temp transactions in their company"
  ON dkv_temp_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert DKV temp transactions in their company"
  ON dkv_temp_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update DKV temp transactions in their company"
  ON dkv_temp_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete DKV temp transactions in their company"
  ON dkv_temp_transactions FOR DELETE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can view DKV temp batches in their company"
  ON dkv_temp_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert DKV temp batches in their company"
  ON dkv_temp_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update DKV temp batches in their company"
  ON dkv_temp_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete DKV temp batches in their company"
  ON dkv_temp_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- Eurowag Temp policies
CREATE POLICY "Users can view Eurowag temp transactions in their company"
  ON eurowag_temp_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Eurowag temp transactions in their company"
  ON eurowag_temp_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Eurowag temp transactions in their company"
  ON eurowag_temp_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Eurowag temp transactions in their company"
  ON eurowag_temp_transactions FOR DELETE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can view Eurowag temp batches in their company"
  ON eurowag_temp_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Eurowag temp batches in their company"
  ON eurowag_temp_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Eurowag temp batches in their company"
  ON eurowag_temp_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Eurowag temp batches in their company"
  ON eurowag_temp_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- Verag Temp policies
CREATE POLICY "Users can view Verag temp transactions in their company"
  ON verag_temp_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Verag temp transactions in their company"
  ON verag_temp_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Verag temp transactions in their company"
  ON verag_temp_transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Verag temp transactions in their company"
  ON verag_temp_transactions FOR DELETE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can view Verag temp batches in their company"
  ON verag_temp_import_batches FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert Verag temp batches in their company"
  ON verag_temp_import_batches FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update Verag temp batches in their company"
  ON verag_temp_import_batches FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete Verag temp batches in their company"
  ON verag_temp_import_batches FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGERS FOR TEMP TABLES
-- ============================================================
CREATE TRIGGER update_dkv_temp_transactions_updated_at
  BEFORE UPDATE ON dkv_temp_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dkv_temp_import_batches_updated_at
  BEFORE UPDATE ON dkv_temp_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eurowag_temp_transactions_updated_at
  BEFORE UPDATE ON eurowag_temp_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eurowag_temp_import_batches_updated_at
  BEFORE UPDATE ON eurowag_temp_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verag_temp_transactions_updated_at
  BEFORE UPDATE ON verag_temp_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verag_temp_import_batches_updated_at
  BEFORE UPDATE ON verag_temp_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE dkv_temp_transactions IS 'Temporary staging table for DKV transactions before approval';
COMMENT ON TABLE dkv_temp_import_batches IS 'Temporary staging table for DKV import batches before approval';
COMMENT ON TABLE eurowag_temp_transactions IS 'Temporary staging table for Eurowag transactions before approval';
COMMENT ON TABLE eurowag_temp_import_batches IS 'Temporary staging table for Eurowag import batches before approval';
COMMENT ON TABLE verag_temp_transactions IS 'Temporary staging table for Verag transactions before approval';
COMMENT ON TABLE verag_temp_import_batches IS 'Temporary staging table for Verag import batches before approval';
