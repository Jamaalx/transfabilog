-- ============================================================
-- QUICK FIX: Update get_user_company_id() function only
-- ============================================================
-- Run this if you already have RLS policies set up and just need
-- to fix the function to check auth.users metadata as fallback.
-- ============================================================

-- Update the function (CREATE OR REPLACE doesn't break existing policies)
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_company_id() TO authenticated;

-- Add INSERT policy for user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON user_profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Debug function to check your company setup
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
-- DONE! Now test with: SELECT * FROM debug_user_company_info();
-- ============================================================
