-- ============================================================
-- FIX RLS POLICIES - Migration 002
-- ============================================================
-- Problem: Original get_user_company_id() only checks user_profiles,
-- but if a user doesn't have a profile yet, it returns NULL and
-- blocks ALL access.
--
-- Solution: Check both user_profiles AND auth.users.raw_user_meta_data
-- ============================================================

-- Drop old helper function
DROP FUNCTION IF EXISTS get_user_company_id();

-- ============================================================
-- NEW HELPER FUNCTION - More robust company_id lookup
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- First, try to get company_id from user_profiles
  SELECT company_id INTO v_company_id
  FROM user_profiles
  WHERE id = auth.uid();

  -- If found, return it
  IF v_company_id IS NOT NULL THEN
    RETURN v_company_id;
  END IF;

  -- If not in user_profiles, try auth.users raw_user_meta_data
  SELECT (raw_user_meta_data->>'company_id')::UUID INTO v_company_id
  FROM auth.users
  WHERE id = auth.uid();

  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- GRANT EXECUTE on function to authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION get_user_company_id() TO authenticated;

-- ============================================================
-- DROP ALL EXISTING POLICIES (to recreate them properly)
-- ============================================================

-- Companies
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;

-- User profiles
DROP POLICY IF EXISTS "Users can view profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Truck heads
DROP POLICY IF EXISTS "Users can view trucks in their company" ON truck_heads;
DROP POLICY IF EXISTS "Users can insert trucks in their company" ON truck_heads;
DROP POLICY IF EXISTS "Users can update trucks in their company" ON truck_heads;
DROP POLICY IF EXISTS "Users can delete trucks in their company" ON truck_heads;

-- Trailers
DROP POLICY IF EXISTS "Users can view trailers in their company" ON trailers;
DROP POLICY IF EXISTS "Users can insert trailers in their company" ON trailers;
DROP POLICY IF EXISTS "Users can update trailers in their company" ON trailers;
DROP POLICY IF EXISTS "Users can delete trailers in their company" ON trailers;

-- Drivers
DROP POLICY IF EXISTS "Users can view drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can insert drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can update drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can delete drivers in their company" ON drivers;

-- Trips
DROP POLICY IF EXISTS "Users can view trips in their company" ON trips;
DROP POLICY IF EXISTS "Users can insert trips in their company" ON trips;
DROP POLICY IF EXISTS "Users can update trips in their company" ON trips;
DROP POLICY IF EXISTS "Users can delete trips in their company" ON trips;

-- Trip stops
DROP POLICY IF EXISTS "Users can manage trip stops" ON trip_stops;

-- Trip expenses
DROP POLICY IF EXISTS "Users can manage trip expenses" ON trip_expenses;

-- Documents
DROP POLICY IF EXISTS "Users can view documents in their company" ON documents;
DROP POLICY IF EXISTS "Users can insert documents in their company" ON documents;
DROP POLICY IF EXISTS "Users can update documents in their company" ON documents;
DROP POLICY IF EXISTS "Users can delete documents in their company" ON documents;

-- Transactions
DROP POLICY IF EXISTS "Users can view transactions in their company" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions in their company" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions in their company" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their company" ON transactions;

-- ============================================================
-- COMPANIES POLICIES
-- ============================================================
CREATE POLICY "companies_select"
  ON companies FOR SELECT
  TO authenticated
  USING (id = get_user_company_id());

CREATE POLICY "companies_update"
  ON companies FOR UPDATE
  TO authenticated
  USING (id = get_user_company_id())
  WITH CHECK (id = get_user_company_id());

-- ============================================================
-- USER PROFILES POLICIES
-- ============================================================
-- CRITICAL: Allow users to INSERT their own profile (for first login)
CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can view profiles in their company
CREATE POLICY "user_profiles_select"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id = get_user_company_id()
    OR id = auth.uid()  -- Can always see own profile
  );

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- TRUCK HEADS POLICIES
-- ============================================================
CREATE POLICY "truck_heads_select"
  ON truck_heads FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "truck_heads_insert"
  ON truck_heads FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "truck_heads_update"
  ON truck_heads FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "truck_heads_delete"
  ON truck_heads FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRAILERS POLICIES
-- ============================================================
CREATE POLICY "trailers_select"
  ON trailers FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "trailers_insert"
  ON trailers FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "trailers_update"
  ON trailers FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "trailers_delete"
  ON trailers FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- DRIVERS POLICIES
-- ============================================================
CREATE POLICY "drivers_select"
  ON drivers FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "drivers_insert"
  ON drivers FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "drivers_update"
  ON drivers FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "drivers_delete"
  ON drivers FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIPS POLICIES
-- ============================================================
CREATE POLICY "trips_select"
  ON trips FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "trips_insert"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "trips_update"
  ON trips FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "trips_delete"
  ON trips FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRIP STOPS POLICIES
-- ============================================================
CREATE POLICY "trip_stops_select"
  ON trip_stops FOR SELECT
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_stops_insert"
  ON trip_stops FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_stops_update"
  ON trip_stops FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  )
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_stops_delete"
  ON trip_stops FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

-- ============================================================
-- TRIP EXPENSES POLICIES
-- ============================================================
CREATE POLICY "trip_expenses_select"
  ON trip_expenses FOR SELECT
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_expenses_insert"
  ON trip_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_expenses_update"
  ON trip_expenses FOR UPDATE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  )
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

CREATE POLICY "trip_expenses_delete"
  ON trip_expenses FOR DELETE
  TO authenticated
  USING (
    trip_id IN (SELECT id FROM trips WHERE company_id = get_user_company_id())
  );

-- ============================================================
-- DOCUMENTS POLICIES
-- ============================================================
CREATE POLICY "documents_select"
  ON documents FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "documents_insert"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "documents_update"
  ON documents FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "documents_delete"
  ON documents FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- TRANSACTIONS POLICIES
-- ============================================================
CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "transactions_insert"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "transactions_update"
  ON transactions FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "transactions_delete"
  ON transactions FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- ============================================================
-- UPLOADED DOCUMENTS POLICIES (if table exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'uploaded_documents') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view uploaded documents in their company" ON uploaded_documents;
    DROP POLICY IF EXISTS "Users can insert uploaded documents in their company" ON uploaded_documents;
    DROP POLICY IF EXISTS "Users can update uploaded documents in their company" ON uploaded_documents;
    DROP POLICY IF EXISTS "Users can delete uploaded documents in their company" ON uploaded_documents;

    -- Create new policies
    EXECUTE 'CREATE POLICY "uploaded_documents_select" ON uploaded_documents FOR SELECT TO authenticated USING (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "uploaded_documents_insert" ON uploaded_documents FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "uploaded_documents_update" ON uploaded_documents FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "uploaded_documents_delete" ON uploaded_documents FOR DELETE TO authenticated USING (company_id = get_user_company_id())';
  END IF;
END $$;

-- ============================================================
-- DOCUMENT PROCESSING QUEUE POLICIES (if table exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_processing_queue') THEN
    DROP POLICY IF EXISTS "Users can view processing queue for their documents" ON document_processing_queue;

    EXECUTE 'CREATE POLICY "document_processing_queue_select" ON document_processing_queue FOR SELECT TO authenticated USING (uploaded_document_id IN (SELECT id FROM uploaded_documents WHERE company_id = get_user_company_id()))';
  END IF;
END $$;

-- ============================================================
-- DOCUMENT TYPE MAPPINGS POLICIES (if table exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_type_mappings') THEN
    DROP POLICY IF EXISTS "Users can view document type mappings in their company" ON document_type_mappings;
    DROP POLICY IF EXISTS "Users can manage document type mappings in their company" ON document_type_mappings;

    EXECUTE 'CREATE POLICY "document_type_mappings_select" ON document_type_mappings FOR SELECT TO authenticated USING (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "document_type_mappings_insert" ON document_type_mappings FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "document_type_mappings_update" ON document_type_mappings FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id())';
    EXECUTE 'CREATE POLICY "document_type_mappings_delete" ON document_type_mappings FOR DELETE TO authenticated USING (company_id = get_user_company_id())';
  END IF;
END $$;

-- ============================================================
-- HELPER: Debug function to check user's company (for troubleshooting)
-- ============================================================
CREATE OR REPLACE FUNCTION debug_user_company_info()
RETURNS TABLE (
  user_id UUID,
  profile_company_id UUID,
  metadata_company_id UUID,
  resolved_company_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth.uid() as user_id,
    (SELECT up.company_id FROM user_profiles up WHERE up.id = auth.uid()) as profile_company_id,
    (SELECT (au.raw_user_meta_data->>'company_id')::UUID FROM auth.users au WHERE au.id = auth.uid()) as metadata_company_id,
    get_user_company_id() as resolved_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION debug_user_company_info() TO authenticated;

-- ============================================================
-- DONE
-- ============================================================
COMMENT ON FUNCTION get_user_company_id() IS
'Returns the company_id for the current user.
Checks user_profiles first, then falls back to auth.users metadata.
This ensures RLS works even before user_profiles is created.';
