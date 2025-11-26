-- Transport SaaS - Create Test Users
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Version: 1.0
--
-- This script creates test users with pre-defined UUIDs so all seed data
-- references work correctly.

-- ============================================================
-- CREATE TEST COMPANY
-- ============================================================
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

-- ============================================================
-- CREATE TEST USERS IN AUTH.USERS
-- ============================================================
-- Note: This uses Supabase's internal auth functions
-- Password for all users: Demo123!

-- Admin User
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
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'admin@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "admin"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Demo123!', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Admin Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "admin"}';

-- Manager User
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
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'manager@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Manager Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "manager"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Demo123!', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Manager Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "manager"}';

-- Operator User
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
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '00000000-0000-0000-0000-000000000000',
  'operator@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Operator Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "operator"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Demo123!', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Operator Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "operator"}';

-- Viewer User
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
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '00000000-0000-0000-0000-000000000000',
  'viewer@demo.ro',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Viewer Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "viewer"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Demo123!', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Viewer Demo", "company_id": "11111111-1111-1111-1111-111111111111", "role": "viewer"}';

-- ============================================================
-- CREATE USER IDENTITIES (required for Supabase Auth)
-- ============================================================
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@demo.ro', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "email": "admin@demo.ro"}', 'email', NOW(), NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manager@demo.ro', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "email": "manager@demo.ro"}', 'email', NOW(), NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'operator@demo.ro', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc", "email": "operator@demo.ro"}', 'email', NOW(), NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'viewer@demo.ro', '{"sub": "dddddddd-dddd-dddd-dddd-dddddddddddd", "email": "viewer@demo.ro"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CREATE USER PROFILES (links auth users to company)
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
-- VERIFICATION
-- ============================================================
-- Check users were created:
SELECT
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'company_id' as company_id,
  p.full_name
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
WHERE u.email LIKE '%@demo.ro'
ORDER BY u.email;
