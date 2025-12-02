-- =====================================================
-- DATA IMPORT V2 - Șoferi, Camioane, Remorci
-- Fără id_card_number (coloană inexistentă)
-- =====================================================

DO $$
DECLARE
    v_company_id UUID;
BEGIN
    -- Obține company_id din primul user
    SELECT company_id INTO v_company_id FROM user_profiles LIMIT 1;

    RAISE NOTICE 'Using company_id: %', v_company_id;

    -- =====================================================
    -- ȘOFERI (25 șoferi)
    -- =====================================================
    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Sorin', 'Stavila', '+40745125616', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Zoltan', 'Csaki', '+40740995253', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Sergiu', 'Negru', '+40755917056', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Bogdan', 'Iancu', '+40746563527', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Marian', 'Cordos', '+40765479015', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Istvan', 'Kiss', '+40757182494', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Sorin', 'Chilut', '+40749792009', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Cristin', 'Kardos', '+40745380705', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Daniel', 'Macarie', '+40740616241', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Levente', 'Mathe Sandor', '+40791201815', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Ioan', 'Bondor', '+40756793101', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Horea', 'Teban', '+40757795284', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Andrei', 'Ursan', '+40756862431', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Szilard', 'Portik', '+40740754302', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Istvan', 'Czitrom', '+40752526768', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Paul', 'Moldovan', '+40740756940', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Mugurel', 'Mihalachi', '+40770837436', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Vasile', 'Farcas', '+40740082244', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Sandor', 'Mathe', '+40745678011', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Codrutu', 'Fabian', '+40742011625', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Csaba', 'Szasz', '+40743959159', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Valeriu', 'Nicusan', '+40731338676', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Petru', 'Moldovan', '+40745617345', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Zsolt', 'Timar', '+40748566714', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO drivers (company_id, first_name, last_name, phone, employee_type, status)
    VALUES (v_company_id, 'Romeo', 'Costinas', '+40755591932', 'sofer', 'activ')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- CAMIOANE (19 camioane Volvo)
    -- =====================================================
    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'B 16 TFL', 'YV2RT40C6GB788173', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'B 46 TFL', 'YV2RT40C1JA831413', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 10 TFL', 'YV2RT40A0RA339465', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 20 TFL', 'YV2RT40A3GB765870', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 22 TFL', 'YV2RT40C4GB771307', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 25 TFL', 'YV2RT40C2JA818069', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 26 TFL', 'YV2RT40C1PA322429', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 28 TFL', 'YV2RT40C8PA321441', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 35 TFL', 'YV2RT40C4KA841435', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 40 TFL', 'YV2RT40C9RA345993', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 45 TFL', 'YV2R0P0D8GB772639', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 50 TFL', 'YV2RT40C9JA818313', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 55 TFL', 'YV2RT40A5RA339543', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 70 TFL', 'YV2RTY0A3HB818950', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 73 TFL', 'YV2RT40A1RA339880', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 85 TFL', 'YV2RT40A3RA339525', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 90 TFL', 'YV2RTY0A1HB809468', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 95 TFL', 'YV2RT40C2RA346001', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO truck_heads (company_id, registration_number, vin, brand, status)
    VALUES (v_company_id, 'MS 18 DBG', 'YV2RT40A5GB767006', 'Volvo', 'activ')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- REMORCI (19 remorci)
    -- =====================================================
    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 16 TFL', 'W09PG300980M49052', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 51 TFL', 'WG0STZV2470028718', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 11 TFL', 'YAMT13XX8P0108313', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 09 TFL', 'VAVSAP3386H236020', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 23 TFL', 'YE13B0070AA417749', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 29 TFL', 'YAMT14XX3J0103100', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 27 TFL', 'YAMT13XX1N0107453', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 74 TFL', 'WKVDAF00300100724', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 36 TFL', 'YAFTL2002K0022965', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 41 TFL', 'YAFTL4005G0018525', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 46 TFL', 'YAFTL307000006570', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 52 TFL', 'YAFTL2000R0034865', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 56 TFL', 'YAMT23XX1J0102633', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 71 TFL', 'YAFSR313000014627', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 75 TFL', 'WKVDAF00300100725', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 12 TFL', 'VK1ST39PJPE600409', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 14 TFL', 'WK0SNC02420707113', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 96 TFL', 'W09S36238PGR27634', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

    INSERT INTO trailers (company_id, registration_number, vin, type, status)
    VALUES (v_company_id, 'MS 21 TFL', 'YE1A3C002AA420754', 'prelata', 'activ')
    ON CONFLICT DO NOTHING;

END $$;

-- Verificare
SELECT 'Soferi:' as tip, COUNT(*) as total FROM drivers
UNION ALL
SELECT 'Camioane:', COUNT(*) FROM truck_heads
UNION ALL
SELECT 'Remorci:', COUNT(*) FROM trailers;
