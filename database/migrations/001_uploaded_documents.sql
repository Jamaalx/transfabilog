-- Migration: Uploaded Documents System
-- Description: Add support for bulk document uploads with AI processing
-- Date: 2025-11-26

-- ============================================================
-- UPLOADED DOCUMENTS TABLE (for bulk uploads with AI processing)
-- ============================================================
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- File information
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  file_extension VARCHAR(20),

  -- Document classification (AI extracted or manual)
  document_type VARCHAR(100), -- 'factura_intrare', 'factura_iesire', 'extras_bancar', 'raport_dkv', 'raport_eurowag', 'raport_verag', 'cmr', 'altele'
  document_category VARCHAR(50), -- 'financial', 'fuel', 'transport', 'hr', 'other'

  -- AI extracted data
  extracted_data JSONB DEFAULT '{}',
  ai_confidence DECIMAL(5, 2), -- 0-100 confidence score
  ai_processed_at TIMESTAMPTZ,
  ai_error TEXT,

  -- Manual/AI extracted fields
  document_date DATE,
  document_number VARCHAR(100),
  amount DECIMAL(12, 2),
  currency VARCHAR(3),
  supplier_name VARCHAR(255),
  supplier_cui VARCHAR(20),

  -- Entity associations (can be multiple via junction table or direct)
  truck_id UUID REFERENCES truck_heads(id) ON DELETE SET NULL,
  trailer_id UUID REFERENCES trailers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,

  -- Processing status
  status VARCHAR(30) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed', 'needs_review', 'archived')),

  -- User actions
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT PROCESSING QUEUE
-- ============================================================
CREATE TABLE document_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES uploaded_documents(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT TYPE MAPPINGS (for AI training/reference)
-- ============================================================
CREATE TABLE document_type_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  keywords TEXT[], -- Keywords that help identify this document type
  patterns JSONB, -- Regex patterns for identification
  extraction_rules JSONB, -- Rules for extracting data from this type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_uploaded_docs_company ON uploaded_documents(company_id);
CREATE INDEX idx_uploaded_docs_status ON uploaded_documents(status);
CREATE INDEX idx_uploaded_docs_type ON uploaded_documents(document_type);
CREATE INDEX idx_uploaded_docs_category ON uploaded_documents(document_category);
CREATE INDEX idx_uploaded_docs_date ON uploaded_documents(document_date);
CREATE INDEX idx_uploaded_docs_truck ON uploaded_documents(truck_id);
CREATE INDEX idx_uploaded_docs_driver ON uploaded_documents(driver_id);
CREATE INDEX idx_uploaded_docs_trip ON uploaded_documents(trip_id);
CREATE INDEX idx_uploaded_docs_created ON uploaded_documents(created_at);

CREATE INDEX idx_doc_queue_status ON document_processing_queue(status);
CREATE INDEX idx_doc_queue_priority ON document_processing_queue(priority, scheduled_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_type_mappings ENABLE ROW LEVEL SECURITY;

-- Uploaded documents policies
CREATE POLICY "Users can view uploaded documents in their company"
  ON uploaded_documents FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert uploaded documents in their company"
  ON uploaded_documents FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update uploaded documents in their company"
  ON uploaded_documents FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete uploaded documents in their company"
  ON uploaded_documents FOR DELETE
  USING (company_id = get_user_company_id());

-- Processing queue policies
CREATE POLICY "Users can view processing queue for their documents"
  ON document_processing_queue FOR SELECT
  USING (
    document_id IN (SELECT id FROM uploaded_documents WHERE company_id = get_user_company_id())
  );

-- Document type mappings policies
CREATE POLICY "Users can manage document type mappings in their company"
  ON document_type_mappings FOR ALL
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGER FOR updated_at
-- ============================================================
CREATE TRIGGER update_uploaded_documents_updated_at BEFORE UPDATE ON uploaded_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_type_mappings_updated_at BEFORE UPDATE ON document_type_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKET FOR UPLOADED DOCUMENTS
-- ============================================================
-- Run this in Supabase Dashboard > Storage:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'uploaded-documents',
--   'uploaded-documents',
--   false,
--   52428800, -- 50MB limit
--   ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
-- );

-- Storage policies (run in Supabase Dashboard):
-- CREATE POLICY "Users can upload documents to their company folder"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'uploaded-documents' AND
--   (storage.foldername(name))[1] = (SELECT company_id::text FROM user_profiles WHERE id = auth.uid())
-- );

-- CREATE POLICY "Users can view documents in their company folder"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'uploaded-documents' AND
--   (storage.foldername(name))[1] = (SELECT company_id::text FROM user_profiles WHERE id = auth.uid())
-- );

-- CREATE POLICY "Users can delete documents in their company folder"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'uploaded-documents' AND
--   (storage.foldername(name))[1] = (SELECT company_id::text FROM user_profiles WHERE id = auth.uid())
-- );
