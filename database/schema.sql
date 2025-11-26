-- Transport SaaS Database Schema
-- Supabase PostgreSQL
-- Version: 1.0
-- Date: 2025-11-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- COMPANIES TABLE
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cui VARCHAR(20) UNIQUE,
  j_number VARCHAR(30),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Romania',
  phone VARCHAR(50),
  email VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  phone VARCHAR(50),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRUCK HEADS TABLE
-- ============================================================
CREATE TABLE truck_heads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number VARCHAR(20) NOT NULL,
  vin VARCHAR(50),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER CHECK (year >= 1990 AND year <= 2100),
  euro_standard VARCHAR(20),
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  current_km INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'activ' CHECK (status IN ('activ', 'inactiv', 'service', 'avariat')),
  gps_provider VARCHAR(50),
  gps_device_id VARCHAR(100),
  fuel_tank_capacity INTEGER,
  avg_consumption DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, registration_number)
);

-- ============================================================
-- TRAILERS TABLE
-- ============================================================
CREATE TABLE trailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number VARCHAR(20) NOT NULL,
  vin VARCHAR(50),
  type VARCHAR(50) CHECK (type IN ('prelata', 'frigorific', 'cisterna', 'altele')),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  capacity_tons DECIMAL(6, 2),
  volume_m3 DECIMAL(6, 2),
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'activ' CHECK (status IN ('activ', 'inactiv')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, registration_number)
);

-- ============================================================
-- DRIVERS TABLE
-- ============================================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  cnp VARCHAR(13) UNIQUE,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  license_number VARCHAR(50),
  license_categories TEXT[],
  license_expiry DATE,
  medical_expiry DATE,
  card_tahograf_number VARCHAR(50),
  card_tahograf_expiry DATE,
  hire_date DATE,
  termination_date DATE,
  salary_base DECIMAL(10, 2),
  diurna_rate DECIMAL(8, 2),
  status VARCHAR(20) DEFAULT 'activ' CHECK (status IN ('activ', 'inactiv', 'concediu')),
  position VARCHAR(100),  -- Job position: CONDUCATOR AUTO, DIRECTOR, AGENT DE, etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIPS TABLE
-- ============================================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  truck_id UUID REFERENCES truck_heads(id),
  trailer_id UUID REFERENCES trailers(id),
  origin_country VARCHAR(100) NOT NULL,
  origin_city VARCHAR(255) NOT NULL,
  origin_address TEXT,
  destination_country VARCHAR(100) NOT NULL,
  destination_city VARCHAR(255) NOT NULL,
  destination_address TEXT,
  departure_date TIMESTAMPTZ NOT NULL,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  km_start INTEGER,
  km_end INTEGER,
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(8, 2),
  cargo_description TEXT,
  client_name VARCHAR(255),
  client_contact VARCHAR(255),
  price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'invoiced', 'paid')),
  status VARCHAR(20) DEFAULT 'planificat' CHECK (status IN ('planificat', 'in_progress', 'finalizat', 'anulat')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIP STOPS TABLE
-- ============================================================
CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address TEXT,
  type VARCHAR(20) CHECK (type IN ('incarcare', 'descarcare', 'tranzit', 'pauza')),
  planned_date TIMESTAMPTZ,
  actual_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIP EXPENSES TABLE
-- ============================================================
CREATE TABLE trip_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('combustibil', 'taxa_drum', 'parcare', 'mancare', 'reparatii', 'altele')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  description TEXT,
  receipt_number VARCHAR(100),
  date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('truck', 'trailer', 'driver', 'trip', 'company')),
  entity_id UUID NOT NULL,
  doc_type VARCHAR(100) NOT NULL,
  doc_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS TABLE (Financial)
-- ============================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  date DATE NOT NULL,
  description TEXT,
  trip_id UUID REFERENCES trips(id),
  driver_id UUID REFERENCES drivers(id),
  truck_id UUID REFERENCES truck_heads(id),
  invoice_number VARCHAR(100),
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'transfer', 'dkv', 'eurowag')),
  external_ref VARCHAR(100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_truck_heads_company ON truck_heads(company_id);
CREATE INDEX idx_truck_heads_status ON truck_heads(status);
CREATE INDEX idx_truck_heads_registration ON truck_heads(registration_number);

CREATE INDEX idx_trailers_company ON trailers(company_id);
CREATE INDEX idx_trailers_status ON trailers(status);

CREATE INDEX idx_drivers_company ON drivers(company_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_name ON drivers(last_name, first_name);

CREATE INDEX idx_trips_company ON trips(company_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_departure ON trips(departure_date);

CREATE INDEX idx_trip_expenses_trip ON trip_expenses(trip_id);
CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);

CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id())
  WITH CHECK (id = get_user_company_id());

-- User profiles policies
CREATE POLICY "Users can view profiles in their company"
  ON user_profiles FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Truck heads policies
CREATE POLICY "Users can view trucks in their company"
  ON truck_heads FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert trucks in their company"
  ON truck_heads FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update trucks in their company"
  ON truck_heads FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete trucks in their company"
  ON truck_heads FOR DELETE
  USING (company_id = get_user_company_id());

-- Trailers policies
CREATE POLICY "Users can view trailers in their company"
  ON trailers FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert trailers in their company"
  ON trailers FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update trailers in their company"
  ON trailers FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete trailers in their company"
  ON trailers FOR DELETE
  USING (company_id = get_user_company_id());

-- Drivers policies
CREATE POLICY "Users can view drivers in their company"
  ON drivers FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert drivers in their company"
  ON drivers FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update drivers in their company"
  ON drivers FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete drivers in their company"
  ON drivers FOR DELETE
  USING (company_id = get_user_company_id());

-- Trips policies
CREATE POLICY "Users can view trips in their company"
  ON trips FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert trips in their company"
  ON trips FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update trips in their company"
  ON trips FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete trips in their company"
  ON trips FOR DELETE
  USING (company_id = get_user_company_id());

-- Trip stops policies
CREATE POLICY "Users can manage trip stops"
  ON trip_stops FOR ALL
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

-- Trip expenses policies
CREATE POLICY "Users can manage trip expenses"
  ON trip_expenses FOR ALL
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

-- Documents policies
CREATE POLICY "Users can view documents in their company"
  ON documents FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert documents in their company"
  ON documents FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update documents in their company"
  ON documents FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete documents in their company"
  ON documents FOR DELETE
  USING (company_id = get_user_company_id());

-- Transactions policies
CREATE POLICY "Users can view transactions in their company"
  ON transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert transactions in their company"
  ON transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update transactions in their company"
  ON transactions FOR UPDATE
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete transactions in their company"
  ON transactions FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_truck_heads_updated_at BEFORE UPDATE ON truck_heads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trailers_updated_at BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_stops_updated_at BEFORE UPDATE ON trip_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKET FOR DOCUMENTS
-- ============================================================
-- Run this in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
