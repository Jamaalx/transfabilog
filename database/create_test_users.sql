-- Transport SaaS - Create Test Users with Company Link
-- Run this in Supabase SQL Editor AFTER schema.sql and seed.sql
-- This creates auth users and links them to the test company

-- ============================================================
-- CREATE TEST USERS (using Supabase auth.users)
-- ============================================================

-- First, ensure the test company exists
INSERT INTO companies (id, name, cui, j_number, address, city, county, phone, email, subscription_plan, subscription_status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Transport Demo SRL',
  'RO12345678',
  'J40/1234/2020',
  'Strada Exemplu nr. 123',
  'Bucuresti',
  'Bucuresti',
  '+40721234567',
  'contact@transport-demo.ro',
  'premium',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Create Admin User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'admin@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object(
    'full_name', 'Admin Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'admin'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Admin Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'admin'
  );

-- Create Manager User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'manager@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object(
    'full_name', 'Manager Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'manager'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Manager Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'manager'
  );

-- Create Operator User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '00000000-0000-0000-0000-000000000000',
  'operator@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object(
    'full_name', 'Operator Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'operator'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Operator Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'operator'
  );

-- Create Viewer User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '00000000-0000-0000-0000-000000000000',
  'viewer@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object(
    'full_name', 'Viewer Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'viewer'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Viewer Demo',
    'company_id', '11111111-1111-1111-1111-111111111111',
    'role', 'viewer'
  );

-- ============================================================
-- CREATE USER IDENTITIES (required for Supabase Auth)
-- ============================================================

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    jsonb_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'email', 'admin@demo.ro'),
    'email',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    jsonb_build_object('sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'email', 'manager@demo.ro'),
    'email',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    jsonb_build_object('sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'email', 'operator@demo.ro'),
    'email',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    jsonb_build_object('sub', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'email', 'viewer@demo.ro'),
    'email',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CREATE USER PROFILES (links to company)
-- ============================================================

INSERT INTO user_profiles (id, company_id, full_name, role, phone)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Admin Demo', 'admin', '+40722111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Manager Demo', 'manager', '+40722222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Operator Demo', 'operator', '+40722333333'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Viewer Demo', 'viewer', '+40722444444')
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================================
-- VERIFY SETUP
-- ============================================================
-- SELECT
--   u.email,
--   u.raw_user_meta_data->>'role' as role,
--   u.raw_user_meta_data->>'company_id' as company_id,
--   c.name as company_name
-- FROM auth.users u
-- LEFT JOIN companies c ON c.id = (u.raw_user_meta_data->>'company_id')::uuid
-- WHERE u.email LIKE '%@demo.ro';
