-- Transport SaaS - Test Data Seed
-- Run this AFTER schema.sql and create_test_users.sql in Supabase SQL Editor
-- Version: 1.1
--
-- IMPORTANT: Run scripts in this order:
-- 1. schema.sql (creates tables)
-- 2. create_test_users.sql (creates users and company)
-- 3. seed.sql (this file - populates test data)

-- ============================================================
-- REFERENCE UUIDs (defined in create_test_users.sql)
-- ============================================================
-- Company:  11111111-1111-1111-1111-111111111111
-- Admin:    aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Manager:  bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Operator: cccccccc-cccc-cccc-cccc-cccccccccccc
-- Viewer:   dddddddd-dddd-dddd-dddd-dddddddddddd

-- ============================================================
-- TEST TRUCKS
-- ============================================================
INSERT INTO truck_heads (id, company_id, registration_number, brand, model, year, euro_standard, current_km, status, gps_provider)
VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'B-123-TRA', 'Volvo', 'FH 500', 2021, 'Euro 6', 245000, 'activ', 'wialon'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'B-456-TRB', 'Mercedes', 'Actros 1845', 2020, 'Euro 6', 312000, 'activ', 'wialon'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'B-789-TRC', 'MAN', 'TGX 18.500', 2022, 'Euro 6', 156000, 'activ', 'arobs'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', 'B-012-TRD', 'Scania', 'R 450', 2019, 'Euro 6', 421000, 'service', 'wialon'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111', 'B-345-TRE', 'DAF', 'XF 480', 2023, 'Euro 6', 45000, 'activ', 'volvo');

-- ============================================================
-- TEST TRAILERS
-- ============================================================
INSERT INTO trailers (id, company_id, registration_number, type, brand, year, capacity_tons, volume_m3, status)
VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'B-123-REM', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'B-456-REM', 'prelata', 'Schmitz', 2021, 24.0, 90, 'activ'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'B-789-REM', 'frigorific', 'Krone', 2022, 22.0, 85, 'activ'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'B-012-REM', 'prelata', 'Wielton', 2019, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111111', 'B-345-REM', 'cisterna', 'Magyar', 2021, 30.0, NULL, 'activ');

-- ============================================================
-- TEST DRIVERS
-- ============================================================
INSERT INTO drivers (id, company_id, first_name, last_name, cnp, phone, email, license_number, license_categories, license_expiry, medical_expiry, hire_date, salary_base, diurna_rate, status)
VALUES
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'Ion', 'Popescu', '1850315123456', '+40722100001', 'ion.popescu@demo.ro', 'B123456', ARRAY['C', 'CE'], '2026-03-15', '2025-06-20', '2020-01-15', 4500.00, 65.00, 'activ'),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'Gheorghe', 'Ionescu', '1880720234567', '+40722100002', 'gheorghe.ionescu@demo.ro', 'B234567', ARRAY['C', 'CE'], '2025-07-20', '2025-03-15', '2019-06-01', 4800.00, 70.00, 'activ'),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'Vasile', 'Dumitrescu', '1900105345678', '+40722100003', 'vasile.dumitrescu@demo.ro', 'B345678', ARRAY['C', 'CE'], '2027-01-05', '2025-12-10', '2021-03-20', 4200.00, 60.00, 'activ'),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 'Andrei', 'Stanescu', '1920815456789', '+40722100004', 'andrei.stanescu@demo.ro', 'B456789', ARRAY['C', 'CE'], '2025-08-15', '2025-02-28', '2022-09-10', 4000.00, 55.00, 'activ'),
  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', 'Mihai', 'Georgescu', '1870420567890', '+40722100005', 'mihai.georgescu@demo.ro', 'B567890', ARRAY['C', 'CE'], '2026-04-20', '2025-09-05', '2018-11-25', 5000.00, 75.00, 'concediu');

-- ============================================================
-- TEST TRIPS
-- ============================================================
INSERT INTO trips (id, company_id, driver_id, truck_id, trailer_id, origin_country, origin_city, destination_country, destination_city, departure_date, estimated_arrival, cargo_type, cargo_weight, client_name, price, currency, status, created_by)
VALUES
  -- Active trip (created by operator)
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'Romania', 'Bucuresti', 'Germania', 'Stuttgart', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 'General', 18.5, 'Auto Parts GmbH', 2800.00, 'EUR', 'in_progress', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

  -- Active trip (created by manager)
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'Romania', 'Timisoara', 'Franta', 'Lyon', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'Textile', 12.0, 'Fashion Express SA', 3200.00, 'EUR', 'in_progress', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

  -- Planned trip (created by admin)
  ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333303', 'Romania', 'Cluj-Napoca', 'Italia', 'Milano', NOW() + INTERVAL '2 days', NOW() + INTERVAL '4 days', 'Frigorifc', 20.0, 'Fresh Food Italia', 2500.00, 'EUR', 'planificat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- Completed trips
  ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'Romania', 'Constanta', 'Olanda', 'Rotterdam', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days', 'General', 22.0, 'Dutch Logistics BV', 3100.00, 'EUR', 'finalizat', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

  ('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'Romania', 'Bucuresti', 'Spania', 'Barcelona', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', 'Mobila', 16.5, 'Furniture Spain SL', 3500.00, 'EUR', 'finalizat', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

  ('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333304', 'Romania', 'Brasov', 'Austria', 'Viena', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'Electronice', 8.0, 'Tech Austria AG', 1800.00, 'EUR', 'finalizat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- TEST TRIP EXPENSES
-- ============================================================
INSERT INTO trip_expenses (trip_id, category, amount, currency, description, date)
VALUES
  ('55555555-5555-5555-5555-555555555504', 'combustibil', 450.00, 'EUR', 'Alimentare Petrom', NOW() - INTERVAL '10 days'),
  ('55555555-5555-5555-5555-555555555504', 'combustibil', 380.00, 'EUR', 'Alimentare Shell Germania', NOW() - INTERVAL '8 days'),
  ('55555555-5555-5555-5555-555555555504', 'taxa_drum', 120.00, 'EUR', 'Taxa autostrada Germania', NOW() - INTERVAL '9 days'),
  ('55555555-5555-5555-5555-555555555504', 'parcare', 25.00, 'EUR', 'Parcare sigura Germania', NOW() - INTERVAL '8 days'),
  ('55555555-5555-5555-5555-555555555505', 'combustibil', 520.00, 'EUR', 'Alimentare traseu RO-ES', NOW() - INTERVAL '14 days'),
  ('55555555-5555-5555-5555-555555555505', 'combustibil', 480.00, 'EUR', 'Alimentare Spania', NOW() - INTERVAL '13 days'),
  ('55555555-5555-5555-5555-555555555505', 'taxa_drum', 85.00, 'EUR', 'Taxa autostrada Franta', NOW() - INTERVAL '14 days'),
  ('55555555-5555-5555-5555-555555555505', 'taxa_drum', 45.00, 'EUR', 'Taxa autostrada Spania', NOW() - INTERVAL '13 days');

-- ============================================================
-- TEST TRANSACTIONS (FINANCIAL)
-- ============================================================
INSERT INTO transactions (company_id, type, category, amount, currency, date, description, trip_id)
VALUES
  -- Income from completed trips
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 3100.00, 'EUR', NOW() - INTERVAL '6 days', 'Plata cursa Rotterdam', '55555555-5555-5555-5555-555555555504'),
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 3500.00, 'EUR', NOW() - INTERVAL '10 days', 'Plata cursa Barcelona', '55555555-5555-5555-5555-555555555505'),
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 1800.00, 'EUR', NOW() - INTERVAL '3 days', 'Plata cursa Viena', '55555555-5555-5555-5555-555555555506'),

  -- Regular expenses
  ('11111111-1111-1111-1111-111111111111', 'expense', 'salarii', 22500.00, 'RON', NOW() - INTERVAL '5 days', 'Salarii soferi noiembrie', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'asigurari', 1200.00, 'EUR', NOW() - INTERVAL '20 days', 'Asigurare flota Q4', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'mentenanta', 850.00, 'EUR', NOW() - INTERVAL '8 days', 'Service camion B-012-TRD', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'combustibil', 2500.00, 'EUR', NOW() - INTERVAL '2 days', 'Card DKV noiembrie', NULL);

-- ============================================================
-- TEST DOCUMENTS WITH EXPIRY ALERTS
-- ============================================================
INSERT INTO documents (company_id, entity_type, entity_id, doc_type, doc_number, issue_date, expiry_date)
VALUES
  -- Truck documents (some expiring soon)
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222201', 'ITP', 'ITP-2024-001', '2024-01-15', '2025-01-15'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222201', 'RCA', 'RCA-2024-001', '2024-06-01', '2025-06-01'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222202', 'ITP', 'ITP-2024-002', '2024-03-20', '2025-03-20'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222203', 'ITP', 'ITP-2024-003', '2024-11-10', NOW() + INTERVAL '15 days'), -- Expiring soon!
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222204', 'RCA', 'RCA-2024-004', '2024-08-01', NOW() + INTERVAL '25 days'), -- Expiring soon!

  -- Driver documents
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444401', 'Atestat', 'AT-2023-001', '2023-05-10', '2028-05-10'),
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444402', 'Atestat', 'AT-2022-002', '2022-09-15', '2027-09-15'),
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444403', 'Card Tahograf', 'CT-2024-003', '2024-02-01', NOW() + INTERVAL '20 days'); -- Expiring soon!

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify data was inserted:

-- SELECT COUNT(*) as trucks FROM truck_heads;
-- SELECT COUNT(*) as trailers FROM trailers;
-- SELECT COUNT(*) as drivers FROM drivers;
-- SELECT COUNT(*) as trips FROM trips;
-- SELECT COUNT(*) as transactions FROM transactions;
-- SELECT COUNT(*) as documents FROM documents;

-- Check expiring documents:
-- SELECT doc_type, entity_type, expiry_date
-- FROM documents
-- WHERE expiry_date <= NOW() + INTERVAL '30 days'
-- ORDER BY expiry_date;
