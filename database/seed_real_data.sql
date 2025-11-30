-- Transport SaaS - REAL DATA SEED for TRANSFABI LOG SRL
-- Run this AFTER schema.sql and create_test_users.sql in Supabase SQL Editor
-- Version: 2.0 - Real Company Data
--
-- COMPANIE: TRANSFABI LOG SRL
-- ADRESA: TARGU MURES, LIBERTATII
-- TEL: 0742011625

-- ============================================================
-- UPDATE COMPANY WITH REAL DATA
-- ============================================================
UPDATE companies
SET
  name = 'TRANSFABI LOG SRL',
  cui = 'RO12345678',  -- Trebuie completat cu CUI real
  address = 'Str. Libertatii',
  city = 'Targu Mures',
  county = 'Mures',
  phone = '+40742011625',
  email = 'contact@transfabilog.ro'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- CLEAR OLD TEST DATA
-- ============================================================
-- IMPORTANT: Delete in correct order due to foreign key constraints
-- transactions references trips, so delete transactions first
DELETE FROM trip_expenses;
DELETE FROM transactions;  -- Must be before trips (has trip_id FK)
DELETE FROM documents;
DELETE FROM trips;         -- Now safe to delete
DELETE FROM drivers;
DELETE FROM trailers;
DELETE FROM truck_heads;

-- ============================================================
-- REAL TRUCKS (CAPURI DE TRACTOR) - 19 total
-- ============================================================
INSERT INTO truck_heads (id, company_id, registration_number, brand, model, year, euro_standard, current_km, status, gps_provider)
VALUES
  -- B 16 TFL - Nicusan Valeriu
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'B 16 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 350000, 'activ', 'wialon'),
  -- B 46 TFL - Szasz Csaba
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'B 46 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 320000, 'activ', 'wialon'),
  -- MS 10 TFL - Moldovan Petru
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'MS 10 TFL', 'Volvo', 'FH', 2019, 'Euro 6', 380000, 'activ', 'wialon'),
  -- MS 20 TFL - Timar Zsolt
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', 'MS 20 TFL', 'Volvo', 'FH', 2019, 'Euro 6', 410000, 'activ', 'wialon'),
  -- MS 22 TFL - Stavila Sorin
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111', 'MS 22 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 290000, 'activ', 'wialon'),
  -- MS 25 TFL - Cordos Marian
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111111', 'MS 25 TFL', 'Volvo', 'FH', 2021, 'Euro 6', 250000, 'activ', 'wialon'),
  -- MS 26 TFL - Kiss Istvan
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111111', 'MS 26 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 310000, 'activ', 'wialon'),
  -- MS 28 TFL - Chilut Sorin
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111111', 'MS 28 TFL', 'DAF', 'XF', 2019, 'Euro 6', 420000, 'activ', 'wialon'),
  -- MS 35 TFL - Kardos Cristin
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111111', 'MS 35 TFL', 'Volvo', 'FH', 2021, 'Euro 6', 230000, 'activ', 'wialon'),
  -- MS 40 TFL - Macarie Daniel
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111111', 'MS 40 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 340000, 'activ', 'wialon'),
  -- MS 45 TFL - Mathe Sandor Levente
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111111', 'MS 45 TFL', 'Volvo', 'FH', 2021, 'Euro 6', 220000, 'activ', 'wialon'),
  -- MS 50 TFL - Bondor Ioan
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111111', 'MS 50 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 360000, 'activ', 'wialon'),
  -- MS 55 TFL - Teban Horea
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111111', 'MS 55 TFL', 'Volvo', 'FH', 2022, 'Euro 6', 180000, 'activ', 'wialon'),
  -- MS 70 TFL - Ursan Andrei
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111111', 'MS 70 TFL', 'Volvo', 'FH', 2021, 'Euro 6', 270000, 'activ', 'wialon'),
  -- MS 73 TFL - Portik Szilard
  ('22222222-2222-2222-2222-222222222215', '11111111-1111-1111-1111-111111111111', 'MS 73 TFL', 'DAF', 'XF', 2020, 'Euro 6', 330000, 'activ', 'wialon'),
  -- MS 85 TFL - Negru Sergiu
  ('22222222-2222-2222-2222-222222222216', '11111111-1111-1111-1111-111111111111', 'MS 85 TFL', 'Volvo', 'FH', 2019, 'Euro 6', 450000, 'activ', 'wialon'),
  -- MS 90 TFL - Czitrom Istvan
  ('22222222-2222-2222-2222-222222222217', '11111111-1111-1111-1111-111111111111', 'MS 90 TFL', 'Volvo', 'FH', 2020, 'Euro 6', 300000, 'activ', 'wialon'),
  -- MS 95 TFL - Moldovan Paul
  ('22222222-2222-2222-2222-222222222218', '11111111-1111-1111-1111-111111111111', 'MS 95 TFL', 'Volvo', 'FH', 2021, 'Euro 6', 240000, 'activ', 'wialon'),
  -- MS 18 DBG - Mihalachi Mugurel
  ('22222222-2222-2222-2222-222222222219', '11111111-1111-1111-1111-111111111111', 'MS 18 DBG', 'Volvo', 'FH', 2020, 'Euro 6', 280000, 'activ', 'wialon');

-- ============================================================
-- REAL TRAILERS (REMORCI) - 19 total
-- VIN-uri reale din documentatie
-- ============================================================
INSERT INTO trailers (id, company_id, registration_number, vin, type, brand, year, capacity_tons, volume_m3, status)
VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'MS 16 TFL', 'W09PG300980M49052', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'MS 51 TFL', 'WG0STZV2470028718', 'prelata', 'Schmitz', 2020, 24.0, 90, 'activ'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'MS 11 TFL', 'YAMT13XX8P0108313', 'prelata', 'Krone', 2019, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'MS 09 TFL', 'VAVSAP3386H236020', 'prelata', 'Krone', 2019, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111111', 'MS 23 TFL', 'YE13B0070AA417749', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111111', 'MS 29 TFL', 'YAMT14XX3J0103100', 'prelata', 'Krone', 2021, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111111', 'MS 27 TFL', 'YAMT13XX1N0107453', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111111', 'MS 74 TFL', 'WKVDAF00300100724', 'prelata', 'DAF', 2019, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111111', 'MS 36 TFL', 'YAFTL2002K0022965', 'prelata', 'Krone', 2021, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111111', 'MS 41 TFL', 'YAFTL4005G0018525', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111111', 'MS 46 TFL', 'YAFTL307000006570', 'prelata', 'Krone', 2021, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111111', 'MS 52 TFL', 'YAFTL2000R0034865', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333313', '11111111-1111-1111-1111-111111111111', 'MS 56 TFL', 'YAMT23XX1J0102633', 'prelata', 'Krone', 2022, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333314', '11111111-1111-1111-1111-111111111111', 'MS 71 TFL', 'YAFSR313000014627', 'prelata', 'Krone', 2021, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333315', '11111111-1111-1111-1111-111111111111', 'MS 75 TFL', 'WKVDAF00300100725', 'prelata', 'DAF', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333316', '11111111-1111-1111-1111-111111111111', 'MS 12 TFL', 'VK1ST39PJPE600409', 'prelata', 'Krone', 2019, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333317', '11111111-1111-1111-1111-111111111111', 'MS 14 TFL', 'WK0SNC02420707113', 'prelata', 'Krone', 2020, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333318', '11111111-1111-1111-1111-111111111111', 'MS 96 TFL', 'W09S36238PGR27634', 'prelata', 'Schmitz', 2021, 24.0, 92, 'activ'),
  ('33333333-3333-3333-3333-333333333319', '11111111-1111-1111-1111-111111111111', 'MS 21 TFL', 'YE1A3C002AA420754', 'prelata', 'Krone', 2020, 24.0, 92, 'activ');

-- ============================================================
-- REAL DRIVERS (SOFERI) - Din stat de salarii TRANSFABI LOG
-- Conducatori auto + Personal administrativ
-- ============================================================
INSERT INTO drivers (id, company_id, first_name, last_name, phone, email, license_categories, hire_date, salary_base, diurna_rate, status, position)
VALUES
  -- CONDUCATORI AUTO (19 cu masini atribuite)
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'Coriolan Valeriu', 'Nicusan', '+40700000001', 'nicusan.valeriu@transfabilog.ro', ARRAY['C', 'CE'], '2020-01-15', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'Csaba Szabolcs', 'Szasz', '+40700000002', 'szasz.csaba@transfabilog.ro', ARRAY['C', 'CE'], '2020-02-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'Petru', 'Moldovan', '+40700000003', 'moldovan.petru@transfabilog.ro', ARRAY['C', 'CE'], '2019-06-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 'Zsolt', 'Timar', '+40700000004', 'timar.zsolt@transfabilog.ro', ARRAY['C', 'CE'], '2019-08-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', 'Sorin Dumitru', 'Stavila', '+40700000005', 'stavila.sorin@transfabilog.ro', ARRAY['C', 'CE'], '2020-03-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', 'Marian', 'Cordos', '+40700000006', 'cordos.marian@transfabilog.ro', ARRAY['C', 'CE'], '2020-04-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444407', '11111111-1111-1111-1111-111111111111', 'Istvan', 'Kiss', '+40700000007', 'kiss.istvan@transfabilog.ro', ARRAY['C', 'CE'], '2020-01-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444408', '11111111-1111-1111-1111-111111111111', 'Dan Sorin', 'Chilut', '+40700000008', 'chilut.sorin@transfabilog.ro', ARRAY['C', 'CE'], '2019-05-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444409', '11111111-1111-1111-1111-111111111111', 'Cristin', 'Kardos', '+40700000009', 'kardos.cristin@transfabilog.ro', ARRAY['C', 'CE'], '2020-06-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444410', '11111111-1111-1111-1111-111111111111', 'Daniel', 'Macarie', '+40700000010', 'macarie.daniel@transfabilog.ro', ARRAY['C', 'CE'], '2020-02-15', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444411', '11111111-1111-1111-1111-111111111111', 'Sandor Levente', 'Mathe', '+40700000011', 'mathe.levente@transfabilog.ro', ARRAY['C', 'CE'], '2021-01-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444412', '11111111-1111-1111-1111-111111111111', 'Ioan Vasile', 'Bondor', '+40700000012', 'bondor.ioan@transfabilog.ro', ARRAY['C', 'CE'], '2019-09-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444413', '11111111-1111-1111-1111-111111111111', 'Horea Vasile', 'Teban', '+40700000013', 'teban.horea@transfabilog.ro', ARRAY['C', 'CE'], '2020-05-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444414', '11111111-1111-1111-1111-111111111111', 'Gheorghe Andrei', 'Ursan', '+40700000014', 'ursan.andrei@transfabilog.ro', ARRAY['C', 'CE'], '2020-07-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444415', '11111111-1111-1111-1111-111111111111', 'Szilard', 'Portik', '+40700000015', 'portik.szilard@transfabilog.ro', ARRAY['C', 'CE'], '2020-08-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444416', '11111111-1111-1111-1111-111111111111', 'Sergiu Augustin', 'Negru', '+40700000016', 'negru.sergiu@transfabilog.ro', ARRAY['C', 'CE'], '2019-04-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444417', '11111111-1111-1111-1111-111111111111', 'Istvan Arpad', 'Czitrom', '+40700000017', 'czitrom.istvan@transfabilog.ro', ARRAY['C', 'CE'], '2020-01-15', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444418', '11111111-1111-1111-1111-111111111111', 'Paul Grigore', 'Moldovan', '+40700000018', 'moldovan.paul@transfabilog.ro', ARRAY['C', 'CE'], '2020-09-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444419', '11111111-1111-1111-1111-111111111111', 'Mugurel Gheorghe', 'Mihalachi', '+40700000019', 'mihalachi.mugurel@transfabilog.ro', ARRAY['C', 'CE'], '2020-03-15', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),

  -- CONDUCATORI AUTO REZERVA (fara masina atribuita)
  ('44444444-4444-4444-4444-444444444420', '11111111-1111-1111-1111-111111111111', 'Vasile', 'Farcas', '+40700000020', 'farcas.vasile@transfabilog.ro', ARRAY['C', 'CE'], '2019-11-01', 5000.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444421', '11111111-1111-1111-1111-111111111111', 'Sandor', 'Mathe', '+40700000021', 'mathe.sandor@transfabilog.ro', ARRAY['C', 'CE'], '2020-11-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444422', '11111111-1111-1111-1111-111111111111', 'Ioan Romeo', 'Costinas', '+40700000022', 'costinas.romeo@transfabilog.ro', ARRAY['C', 'CE'], '2020-04-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444423', '11111111-1111-1111-1111-111111111111', 'Codrutu Dumitrache', 'Fabian', '+40700000023', 'fabian.codrutu@transfabilog.ro', ARRAY['C', 'CE'], '2018-01-01', 8500.00, 65.00, 'activ', 'CONDUCATOR AUTO'),

  -- PERSONAL ADMINISTRATIV
  ('44444444-4444-4444-4444-444444444424', '11111111-1111-1111-1111-111111111111', 'Arpad', 'Beno', '+40700000024', 'beno.arpad@transfabilog.ro', NULL, '2020-01-01', 4300.00, 0, 'activ', 'AGENT DE'),
  ('44444444-4444-4444-4444-444444444425', '11111111-1111-1111-1111-111111111111', 'Iuliu', 'Dicu', '+40700000025', 'dicu.iuliu@transfabilog.ro', NULL, '2019-06-01', 4300.00, 0, 'activ', 'AGENT DE'),
  ('44444444-4444-4444-4444-444444444426', '11111111-1111-1111-1111-111111111111', 'Calina Dorina', 'Fabian', '+40742011625', 'fabian.dorina@transfabilog.ro', NULL, '2015-01-01', 6000.00, 0, 'activ', 'DIRECTOR'),
  ('44444444-4444-4444-4444-444444444427', '11111111-1111-1111-1111-111111111111', 'Casandra Veronica', 'Fabian', '+40700000027', 'fabian.casandra@transfabilog.ro', NULL, '2018-01-01', 4300.00, 0, 'activ', 'ASISTENT'),
  ('44444444-4444-4444-4444-444444444428', '11111111-1111-1111-1111-111111111111', 'Rares Andrei', 'Fabian', '+40700000028', 'fabian.rares@transfabilog.ro', NULL, '2020-01-01', 4300.00, 0, 'activ', 'TEHNICIAN'),
  ('44444444-4444-4444-4444-444444444429', '11111111-1111-1111-1111-111111111111', 'Maria Emilia', 'Feier', '+40700000029', 'feier.maria@transfabilog.ro', NULL, '2019-01-01', 4050.00, 0, 'activ', 'FEMEIE DE SERVICIU'),
  ('44444444-4444-4444-4444-444444444430', '11111111-1111-1111-1111-111111111111', 'Bianca Maria', 'Moldovan Bumbac', '+40700000030', 'moldovan.bianca@transfabilog.ro', NULL, '2020-01-01', 5000.00, 0, 'activ', 'SECRETARA'),
  ('44444444-4444-4444-4444-444444444431', '11111111-1111-1111-1111-111111111111', 'Mircea Emil', 'Moldovan', '+40700000031', 'moldovan.mircea@transfabilog.ro', ARRAY['C', 'CE'], '2019-01-01', 4300.00, 65.00, 'activ', 'CONDUCATOR AUTO'),
  ('44444444-4444-4444-4444-444444444432', '11111111-1111-1111-1111-111111111111', 'Iulia Alina', 'Saiu', '+40700000032', 'saiu.iulia@transfabilog.ro', NULL, '2018-01-01', 600.00, 0, 'activ', 'ECONOMIST');

-- ============================================================
-- DEFAULT TRUCK-DRIVER-TRAILER ASSIGNMENTS (Atribuiri standard)
-- Bazat pe tabelul din documentatie
-- ============================================================
-- Acestea sunt atribuirile default, pot fi schimbate la fiecare cursa
-- B 16 TFL -> Nicusan Valeriu -> MS 16 TFL
-- B 46 TFL -> Szasz Csaba -> MS 51 TFL
-- MS 10 TFL -> Moldovan Petru -> MS 11 TFL
-- etc.

-- ============================================================
-- SAMPLE TRIPS (Curse exemple)
-- ============================================================
INSERT INTO trips (id, company_id, driver_id, truck_id, trailer_id, origin_country, origin_city, destination_country, destination_city, departure_date, estimated_arrival, cargo_type, cargo_weight, client_name, price, currency, status, created_by)
VALUES
  -- Cursa activa - Nicusan Valeriu cu B 16 TFL
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'Romania', 'Targu Mures', 'Germania', 'Stuttgart', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 'General', 18.5, 'Auto Parts GmbH', 2800.00, 'EUR', 'in_progress', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- Cursa activa - Szasz Csaba cu B 46 TFL
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'Romania', 'Targu Mures', 'Franta', 'Lyon', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'Textile', 12.0, 'Fashion Express SA', 3200.00, 'EUR', 'in_progress', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- Cursa planificata - Moldovan Petru cu MS 10 TFL
  ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333303', 'Romania', 'Cluj-Napoca', 'Italia', 'Milano', NOW() + INTERVAL '2 days', NOW() + INTERVAL '4 days', 'Piese auto', 20.0, 'Auto Italia SRL', 2500.00, 'EUR', 'planificat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- Curse finalizate
  ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'Romania', 'Constanta', 'Olanda', 'Rotterdam', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days', 'General', 22.0, 'Dutch Logistics BV', 3100.00, 'EUR', 'finalizat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'Romania', 'Bucuresti', 'Spania', 'Barcelona', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', 'Mobila', 16.5, 'Furniture Spain SL', 3500.00, 'EUR', 'finalizat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333304', 'Romania', 'Brasov', 'Austria', 'Viena', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'Electronice', 8.0, 'Tech Austria AG', 1800.00, 'EUR', 'finalizat', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- TRIP EXPENSES (Cheltuieli curse)
-- ============================================================
INSERT INTO trip_expenses (trip_id, category, amount, currency, description, date)
VALUES
  ('55555555-5555-5555-5555-555555555504', 'combustibil', 450.00, 'EUR', 'Alimentare OMV Romania', NOW() - INTERVAL '10 days'),
  ('55555555-5555-5555-5555-555555555504', 'combustibil', 380.00, 'EUR', 'Alimentare Shell Germania', NOW() - INTERVAL '8 days'),
  ('55555555-5555-5555-5555-555555555504', 'taxa_drum', 120.00, 'EUR', 'Taxa autostrada Germania', NOW() - INTERVAL '9 days'),
  ('55555555-5555-5555-5555-555555555504', 'parcare', 25.00, 'EUR', 'Parcare sigura Germania', NOW() - INTERVAL '8 days'),
  ('55555555-5555-5555-5555-555555555505', 'combustibil', 520.00, 'EUR', 'DKV - traseu RO-ES', NOW() - INTERVAL '14 days'),
  ('55555555-5555-5555-5555-555555555505', 'combustibil', 480.00, 'EUR', 'Eurowag Spania', NOW() - INTERVAL '13 days'),
  ('55555555-5555-5555-5555-555555555505', 'taxa_drum', 85.00, 'EUR', 'Taxa autostrada Franta', NOW() - INTERVAL '14 days'),
  ('55555555-5555-5555-5555-555555555505', 'taxa_drum', 45.00, 'EUR', 'Taxa autostrada Spania', NOW() - INTERVAL '13 days');

-- ============================================================
-- TRANSACTIONS (Tranzactii financiare)
-- ============================================================
INSERT INTO transactions (company_id, type, category, amount, currency, date, description, trip_id)
VALUES
  -- Incasari din curse finalizate
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 3100.00, 'EUR', NOW() - INTERVAL '6 days', 'Plata cursa Rotterdam - Dutch Logistics', '55555555-5555-5555-5555-555555555504'),
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 3500.00, 'EUR', NOW() - INTERVAL '10 days', 'Plata cursa Barcelona - Furniture Spain', '55555555-5555-5555-5555-555555555505'),
  ('11111111-1111-1111-1111-111111111111', 'income', 'transport', 1800.00, 'EUR', NOW() - INTERVAL '3 days', 'Plata cursa Viena - Tech Austria', '55555555-5555-5555-5555-555555555506'),

  -- Cheltuieli regulate
  ('11111111-1111-1111-1111-111111111111', 'expense', 'salarii', 140950.00, 'RON', NOW() - INTERVAL '5 days', 'Salarii angajati noiembrie 2025', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'asigurari', 2500.00, 'EUR', NOW() - INTERVAL '20 days', 'Asigurare flota Q4', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'mentenanta', 850.00, 'EUR', NOW() - INTERVAL '8 days', 'Service MS 20 TFL', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'combustibil', 15000.00, 'EUR', NOW() - INTERVAL '2 days', 'Card DKV noiembrie', NULL),
  ('11111111-1111-1111-1111-111111111111', 'expense', 'combustibil', 8500.00, 'EUR', NOW() - INTERVAL '2 days', 'Card Eurowag noiembrie', NULL);

-- ============================================================
-- DOCUMENTS (Documente)
-- ============================================================
INSERT INTO documents (company_id, entity_type, entity_id, doc_type, doc_number, issue_date, expiry_date)
VALUES
  -- Documente camioane
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222201', 'ITP', 'ITP-B16TFL-2024', '2024-03-15', '2025-03-15'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222201', 'RCA', 'RCA-B16TFL-2024', '2024-06-01', '2025-06-01'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222201', 'CASCO', 'CASCO-B16TFL-2024', '2024-06-01', '2025-06-01'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222202', 'ITP', 'ITP-B46TFL-2024', '2024-05-20', '2025-05-20'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222202', 'RCA', 'RCA-B46TFL-2024', '2024-07-01', '2025-07-01'),
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222203', 'ITP', 'ITP-MS10TFL-2024', '2024-11-10', NOW() + INTERVAL '20 days'), -- Expira curand!
  ('11111111-1111-1111-1111-111111111111', 'truck', '22222222-2222-2222-2222-222222222204', 'RCA', 'RCA-MS20TFL-2024', '2024-08-01', NOW() + INTERVAL '30 days'), -- Expira curand!

  -- Documente soferi
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444401', 'Atestat', 'AT-NICUSAN-2023', '2023-05-10', '2028-05-10'),
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444402', 'Atestat', 'AT-SZASZ-2022', '2022-09-15', '2027-09-15'),
  ('11111111-1111-1111-1111-111111111111', 'driver', '44444444-4444-4444-4444-444444444403', 'Card Tahograf', 'CT-MOLDOVAN-2024', '2024-02-01', NOW() + INTERVAL '25 days'); -- Expira curand!

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- SELECT 'trucks' as entity, COUNT(*) as count FROM truck_heads
-- UNION ALL SELECT 'trailers', COUNT(*) FROM trailers
-- UNION ALL SELECT 'drivers', COUNT(*) FROM drivers
-- UNION ALL SELECT 'trips', COUNT(*) FROM trips;

-- Documente care expira in 30 zile:
-- SELECT doc_type, entity_type, expiry_date FROM documents
-- WHERE expiry_date <= NOW() + INTERVAL '30 days' ORDER BY expiry_date;
