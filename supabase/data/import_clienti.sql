-- =====================================================
-- IMPORT CLIENTI - 476 clienti
-- =====================================================

DO $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT company_id INTO v_company_id FROM user_profiles LIMIT 1;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AAA SPEDITION SRL', 'activ', 'client', 'RO21201350', 'J23/526/2007', 'Str. Calugareni, Nr. 31, Ap. Cam. 3', 'Ghermanesti', 'Ilfov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ABC SPECIAL&HEAVY TRANSPORT SRL', 'activ', 'client', '46720620', 'J26/1598/2022', 'Str. Independentei, Bl. 1, Sc. C, Ap. 4, C.P. 545200', 'Ludus', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ABC SPECIAL TRANSPORT  EOOD', 'activ', 'client', 'BG206672266', 'ul. RAYKO DASKALOV 68,OFFICE 8', '4000 PLOVDIV', 'Bulgaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ABC SYSTEM Sp.zoo.', 'activ', 'client', 'PL5542999801', 'ul.Bydgoska  13 lok.3', '85-790 Bydgoszcz', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'A & B Senatore Logistics GmbH', 'activ', 'client', 'DE266924239', 'Bartachstrasse 9', '90455 Nurnberg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ABS LOGISTICS', 'activ', 'client', 'NL004621149B34', 'Manitobadreef 5', '3565 CH Utrecht', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ABX SOLUTION WOJCIECH TRELA SPOLKA  KOMANDYTOWA', 'activ', 'client', 'PL8883161532', 'ul.Torunska 30', 'PL87-800 Wloclawek', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ADIANA COM SRL', 'activ', 'client', 'RO16536618', 'J26/1039/2004', 'Mun. Targu Mures, Str. Dezrobirii, Nr.40', 'Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone)
    VALUES (v_company_id, 'ADNITY LOGISTIC SRL', 'activ', 'client', 'RO45715757', 'J26/310/2022', 'Mun. Targu Mures, Str. Dezrobirii, Nr.40', 'Tirgu Mures', 'Mures', 'Romania', '0757363256')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGRICOLA BTC S.R.L.', 'activ', 'client', 'RO43309582', 'J16/2048/2020', 'Sat Poiana Mare Com. Poiana Mare, Str. Morii Marincu, Nr.37', 'Poiana Mare', 'Dolj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'AGRI HOLISTIC Heinrich Brokering', 'activ', 'client', 'DE323253094', 'NEUSTRASSE 9', '46348 RAESFELD', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGRO BADEN BANAT S.R.L.', 'activ', 'client', 'RO12623495', 'J35/37/2000', 'Zona Steaua-Bujorilor, Bl.34, Sc.E, Et.4, Ap.14', 'Timisoara', 'Timis', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGROFERM SRL', 'activ', 'client', 'RO13620039', 'J2000000610328', 'Jud. Sibiu, Sat Brateiu Com. Brateiu, Brateiu, Nr.12, C.P. 557055', 'Brateiu Com. Brateiu', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGRO MODEL SRL', 'activ', 'client', 'RO26183793', 'J35/2130/2009', 'Sat Sacalaz Com. Sacalaz,  , Nr.492/a', 'Sacalaz', 'Timis', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGRO POIANA S.R.L.', 'activ', 'client', 'RO18260038', 'J34/3/2006', 'Sat Poiana Com. Ciuperceni', 'Poaiana', 'Teleorman', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGROPREST SRL', 'activ', 'client', 'RO15482269', 'J26/603/2003', 'Sat Dumbravioara Com. Ernei, Dumbravioara, Nr.177', 'DUMBRAVIOARA', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AGROSIM S.R.L.', 'activ', 'client', 'RO18494080', 'J26/430/2006', 'Bld. 1 Decembrie 1918, Nr.194, Ap.8', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AIRO LINK EXPRESS S.R.L.', 'activ', 'client', 'RO42885919', 'J2020001007321', 'Str. Teliuc, Nr.4', 'Sibiu', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'A.Kothmaier Transport-Gesellschaft m.b.H', 'activ', 'client', 'ATU24607502', 'Walter Simmer Strasse 7', 'A - 5310 MONDSEE', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Aktien-Gesellschaft der Dillinger Huttenwerke', 'activ', 'client', 'DE811120702', 'Werkstrasse 1-66763  Postfach 1580', '66748 DILLINGEN/Saar', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AKTUS IMPEX SRL', 'activ', 'client', 'RO14948990', 'J12/2030/2002', 'Str. Nasaud, Nr.10, Ap.38', 'Cluj-Napoca', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Aleksander Rybka Transport i Spedycja "OL-TRANS "', 'activ', 'client', 'DE815552076', 'Strasse der Technik 8a', '39291Mockern OT Lubars', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone, contact_person)
    VALUES (v_company_id, 'ALE TEO EXPEDITII SRL', 'activ', 'client', 'RO32610996', 'J26/1282/2013', 'Sat.VOINICENI,Nr. 137 Com. CEUASU DE CAMPIE', '547148 VOINICENI', 'Mures', 'Romania', '0740262329', 'ALEXANDRU TOGAN')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, country, contact_person)
    VALUES (v_company_id, 'ALE  TEO GMBH', 'activ', 'client', 'DE305560445', '151/121/51718', 'EICHENDORFSTRASSE 289278-NERSINGEN', 'NERSINGEN', 'Germania', 'MIHAITA BUCHMULLER')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ALETEO TRANS S.R.L.', 'activ', 'client', 'RO18676634', 'J2006000810269', 'Sat Saulia Com. Saulia, Nr.481', 'Saulia', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Alfamobil TRANS s.r.o.', 'activ', 'client', 'CZ07217544', 'Postovska 455/8', '60200 BRNO', 'Cehia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ALMECAR IMPEX S.R.L.', 'activ', 'client', 'RO1218560', 'J26/755/1992', 'Str. Cimpului, Nr.31', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Alu Team Fahrzeugtechnik  Wolfhagen Gmbh', 'activ', 'client', 'DE812044116', 'Hans-Bockler-Str.4', '34466 WOLFHAGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Andrea Herkenhoff Transportunternehmen', 'activ', 'client', 'DE240148097', 'Estrichkies 0-8 Weisser Stein 2', 'D-49451 Holdorf', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ANIA SPEDITION S.R.L.', 'activ', 'client', 'RO30215214', 'J2012001358129', 'Str. 1 Decembrie 1918, Nr.38, Ap.3', 'Campia Turzii', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ARAMIREL TRANS S.R.L.', 'activ', 'client', 'RO45237326', 'J14/433/2021', 'Str. Dozsa Gyorgy, Nr.21a, Bl.1, Sc.B, Et.1, Ap.3', 'Sfantu Gheorghe', 'Covasna', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ASSTRA FORWARDING AG', 'activ', 'client', 'CHE115.138.470', 'SEESTRASSE 467', '8038 ZURICH', 'Elvetia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'Atlantis Sp. z o.o.', 'activ', 'client', 'PL6080103744', 'Ledochowskiego 34', 'Ostrow Wielkopolski', '63-400', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AULEX COM SRL', 'activ', 'client', 'RO17575445', 'J15/541/2005', 'Str. Victoriei, Nr.38', 'Moreni', 'Dambovita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AUTODOMUS SA', 'activ', 'client', 'RO6564939', 'J26/1318/1994', 'Str. Iernuteni, Nr. 159/a, C.P. 4225', 'Reghin', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'AUTOLAK DISTRIBUTION SRL', 'activ', 'client', 'RO36479134', 'J067282016', 'Sat Livezile Com. Livezile, Str. Intre Cruci, Nr.423', 'Livezile', 'Bistrita-Nasaud', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'AUTO UNGAR GmbH & Co.KG', 'activ', 'client', 'DE250825365', 'In der Lach 68', '90530  WENDELSTEIN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Avanti Logistk und  Transport GmbH', 'activ', 'client', 'DE137528054', 'Carl Zeiss Str.2', '63755 ALZENAU', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'AVTOSPED INTERNATIONALE SPEDITIONS GMBH', 'activ', 'client', 'DE812311371', 'STEINDAMM 23 DE 28719 BREMEN', 'BREMEN', 'Germania', '004942164391-70')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BAESTSEN INTERNATIONAAL TRANSPORT B.V.', 'activ', 'client', 'NL007052431B01', 'LOCHT 100', '5504 RP VELDHOVEN', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BALKOUDIS TRANSPORT IKE', 'activ', 'client', 'EL802235357', 'FYLAKIO ORESTIADAS', 'FYLAKIO ORESTIADAS', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Baltic transline , UAB', 'activ', 'client', 'LT355849917', 'R.Kalantos g .49,', 'LT-52303 Kaunas', 'Lituania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BARBERA IMPORT SRL', 'activ', 'client', 'RO27409350', 'J33/570/2010', 'Str. I. G. Sbiera, Nr.14', 'Suceava', 'Suceava', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BAS WORLD B.V.', 'activ', 'client', 'NL806859945B02', 'MAC. ARTHURWEG 00002 5466AP VEGHEL', 'VEGHEL', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BATIR IT SRL', 'activ', 'client', 'IT04251690246', 'Via A. Meucci 85,IT 36067 Arcugnano(VI)', 'IT36067 ARCUGNANO (VI)', 'Italia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Baumann GmbH', 'activ', 'client', 'DE167175859', 'Postfach 1125', '74723 Walldurn', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BEBE TRANS INTERNATIONAL S.R.L.', 'activ', 'client', 'RO23074139', 'J03/79/2008', 'Str. Gheorghe Doja, Nr.83', 'Pitesti', 'Arges', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BENUTI COMPANY SRL', 'activ', 'client', 'RO25656087', 'J26/576/2009', 'Str. Prof. Dr. Simion C. Mandrescu, Nr.1', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Bernd Wiedemeyer GmbH Spedition,Spezial-und Schwertransporte', 'activ', 'client', 'DE126876861', 'Postfach 44', '58286 Wetter', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BIERINGS SPECIAAL TRANSPORT', 'activ', 'client', 'NL822103916B01', 'Den Engelsman 2-f', '6026 RB Maarheeze', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BIOAGRAR SRL', 'activ', 'client', 'RO21449160', 'J32/559/2007', 'Sat Brateiu Com. Brateiu, Str. Brateiului, Nr.12', 'Brateiu', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BISPEL SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL1132939594', 'ul. Mickiewicza36A', '01-616 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BKL UTILAJE CONSTRUCTII 2020 S.R.L.', 'activ', 'client', 'RO43045570', 'J26/1159/2020', 'Str. Transilvania, Nr.15, Ap.10', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BLOEDORN Container GmbH', 'activ', 'client', 'DE812125586', 'Giselherstr.1', '44319 Dortmund', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BMR PROFESSIONAL MANAGEMENT SRL', 'activ', 'client', 'RO30787372', 'J40/11850/2012', 'Bld. Chisinau, Nr.18, Bl.M8, Sc.2, Et.5, Ap.194', 'Sector 2', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BOHNET GmbH', 'activ', 'client', 'DE144901542', 'Erolzheimer Str. 1', '88457 Kirchdorf', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BOLK TRANSPORT BV', 'activ', 'client', 'NL007874601B01', 'PLESMANWEG 3 PO BOX 385', '7602 PD ALMELO', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BOLK TRANSPORT  GMBH', 'activ', 'client', 'ATU69472518', 'WARTENBURGER STRASSE  1b Top 15', '4840 VOCKLABRUCK', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone, contact_person)
    VALUES (v_company_id, 'BOLK TRANSPORT SRL', 'activ', 'client', 'RO25103940', 'J2015001921128', 'Sat Luna De Sus Com. Floresti, Luna De Sus, Nr.Fn, Bl.Corp Cladire C1, Sc.Dn1, Et.Km 490+13,cod postal 407280', 'Luna De Sus', 'Cluj', 'Romania', '+40371300151', 'FLORIN  NECIU')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BOSS   MACHINERY', 'activ', 'client', 'NL850673264B01', 'EINDHOVENSEBAAN 5', '5505 JA VELDHOVEN', 'OLANDA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BOYS ZONE SRL', 'activ', 'client', 'RO29184742', 'J26/994/2011', 'Str. Ramurele, Nr.5, Ap.2', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'B.P. TRANSPORTS SP.Z O.O.', 'activ', 'client', 'PL7122361122', 'UL.SOWINSKIEGO 35,20-613', '20-613 LUBLIN', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BRAANKER TRANSPORT B.V.', 'activ', 'client', 'NL.8059.16.374.B01', 'Postbus 11', '2950 AA ALBLASSERDAM', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BRANDL TRANSPORT -LOGISTIK GmbH', 'activ', 'client', 'ATU50570403', 'Kehrgasse 71', 'A-8793 Trofaiach', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Braunig Schwerlast GmbH & Co.KG', 'activ', 'client', 'DE275235159', 'Richartzstrasse 2', '30519 Hannover', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BREAK BULK SERVICES SRL', 'activ', 'client', 'RO10223816', 'J13/804/1998', 'Str. A. S. Puskin, Nr.19a, Corp C1, Et.1', 'Constanta', 'Constanta', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'BS RECYCLING SRL', 'activ', 'client', 'RO27965631', 'J12/146/2011', 'Bld. Muncii, Nr.16, Et.1, Ap.4', 'Cluj-Napoca', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'BURLOTTI SPEDIZIONI S.P.A,', 'activ', 'client', '00365920206', 'VIA ARIA LIBERA 86', '25047 DARFO', 'Italia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Cargomind ( Austria) Gmbh', 'activ', 'client', 'ATU61877008', 'FREUDENAUER HAFENSTRASSE 20 1020 WIEN  AUSTRIA', 'WIEN', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'CARGO ORGANISATIONS SERVICES', 'activ', 'client', 'FR13344801212', '22 Rue du Chemin de Fer', '02100 NEUVILLE SAINT AMAND', 'FRANTA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone, contact_person)
    VALUES (v_company_id, 'CARGOROM SPECIAL PROJECT SRL', 'activ', 'client', 'RO30955832', 'J40/14013/2012', 'BUCURESTI,SECTORUL 2,STR.VASELOR,NR. 34,COD POSTAL 021254', 'BUCURESTI', 'Bucuresti', 'Romania', '0733375317', 'MIHAI ESANU')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'CARGOWAYS LOGISTICS & TRANSPORT LTD', 'activ', 'client', 'GB241851026', 'SUDTIROLER PLATZ 12', 'KUFSTEIN', 'Marea Britanie')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CARPATICA LOGISTIC SRL', 'activ', 'client', 'RO29428359', 'J32/1151/2011', 'Str. Nicolaus Olahus,Nr.5', 'SIBIU', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CARTRANS SPEDITION S.R.L.', 'activ', 'client', 'RO12118655', 'J29/116/2018', 'Str. Marasesti, Nr.309, Biroul E1-03, Cod Postal 100238', 'Ploiesti', 'Prahova', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'C & D LOGISTIK TECHNOLOGIES SRL', 'activ', 'client', 'RO28050114', 'J35/332/2011', 'Str. Aristide Demetriade, Nr.13, Spatiul 2, Camera 40, Sc.B, Et.3, Ap.2', 'Timisoara', 'Timis', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CECA PARTNER LOGISTIC SRL', 'activ', 'client', 'RO32511976', 'J40/14537/2013', 'Sos. Garii Catelu, Nr.174, Cladirea C21, Biroul Nr. 1, Et.1', 'Sector 3', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'CENTRUL DE CULTURA, ARTA SI AGREMENT TARGU MURES', 'activ', 'client', 'RO47398396', 'Str. Avram Iancu, Nr.2', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CERGHIZAN D DUMITRU PERSOANA FIZICA AUTORIZATA', 'activ', 'client', 'RO26905577', 'F26/629/2010', 'Jud. Mures, Sat Draculea Bandului Com. Band, Nr.59, C.P. 547066', 'Draculea Bandului Com. Band', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'Cerghizan Gabriel Ioan', 'activ', 'client', '-', 'str.Prieteniei 11/11', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'CHS CONTAINER HANDEL GMBH', 'activ', 'client', 'DE320530138', 'TILLMANNSTRASSE 19', '28239 BREMEN', 'Germania', '004942164396609')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CLDE MIS TRANS SRL', 'activ', 'client', 'RO30779043', 'J2012001654162', 'Aleea 1 Castanilor, Nr.2, Bl.105b, Sc.1, Ap.2', 'Craiova', 'Dolj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Colle Vermietung und Verkauf GmbH', 'activ', 'client', 'DE297245637', 'Anton-Laumen-Str.62', '52525 Waldfeucht', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'CORMANA BV', 'activ', 'client', 'NL820630147B02', 'Rijksweg 85', '9422CG SMILDE', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CORMANA MACHINERY S.R.L.', 'activ', 'client', 'RO45402857', 'J08/3670/2021', 'Sos. Combinatului, Nr.2, Birou 5', '505200 Fagaras', 'Brasov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'COSMINA SI OVIDIU S.R.L.', 'activ', 'client', 'RO27770532', 'J26/804/2010', 'Sat Voiniceni Com. Ceuasu De Campie, Nr.1, C1', 'Voiniceni', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'COTE INVEST SRL', 'activ', 'client', 'RO40384865', 'J31/42/2019', 'B-dul Mihai Viteazu, Nr. 129, Camera 111, C.P. 450126', 'Zalau', 'Salaj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'CRACIUN IONUT', 'activ', 'client', '1850730060069', 'str.PRINCIPALA,nr244', 'BISTRITA', 'Bistrita-Nasaud', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CRAM NIVACIANA SRL', 'activ', 'client', 'RO14514923', 'J15/118/2002', 'Str. Aviator Negel, Nr.7', 'Targoviste', 'Dambovita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone, contact_person)
    VALUES (v_company_id, 'CRISTALIN S.R.L.', 'activ', 'client', 'RO6510300', 'J02/1603/1994', 'Str. Bela Bartok, Nr.10, Bl.Corp B, Ap.4', '310028 Arad', 'Arad', 'Romania', '0722402190', 'CIOBANU VOIREL')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CROSSOVER EBY SRL', 'activ', 'client', 'RO31363537', 'J24/249/2013', 'Sat Viseu De Jos Com. Viseu De Jos, Viseu De Jos, Nr.1332', 'Viseu De Jos', 'Maramures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'CS Conti-Service Internationale Spedition GmbH', 'activ', 'client', 'DE118700634', 'Bei den Muhren 91', 'D-20457 Hamburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'CTE TRAILERS SRL', 'activ', 'client', 'RO14269085', 'J23/1326/2008', 'SOS.BUCURESTI,NR.57', 'comuna CIOROGARLA', 'jud.ILFOV', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DACHSER SE', 'activ', 'client', 'DE815512007', 'Logistikzentrum Regensburg Dachserplatz 1', '93098 Mintraching', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DACODA SRL', 'activ', 'client', 'RO4989577', 'J1993026443409', 'Str Vespasian, Nr.41a, Et.1', 'Sector 1', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DACOROM INTERNATIONAL SRL', 'activ', 'client', 'RO3717566', 'J1993000937083', 'Str. Octavian Goga, Nr.19, Bl.204, Sc.A, Ap.12', '500137 Brasov', 'Brasov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DAKO DISTRIBUTION SRL', 'activ', 'client', 'RO13881476', 'J2001001125130', 'Str. Ostrov, Nr.3, Lot 2. Bl.Locuinte C2. Mansarda, Ap.12', 'Constanta', 'Constanta', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DALCO  e.U.', 'activ', 'client', 'ATU74613279', 'BAHNHOFSTRASSE 40', '4802 EBENSEE', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DANACHER Baumaschinen GmbH', 'activ', 'client', 'DE323135523', 'Roemerstrasse 4-6', '78183 Huefingen-Behla', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DAS d.o.o.', 'activ', 'client', 'HR05109091010', 'HR,10310 Ivanic-Grand', '10310 Ivanic- Grand', 'Croatia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DEAC PREST SRL', 'activ', 'client', 'RO24075558', 'J26/1126/2008', 'Cal. Sighisoarei, Nr.43/a', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'De Lange Speciaal Transport BV', 'activ', 'client', 'NL807878728B03', 'Rudolf A.Jasstraat 5', '3316 BR Dordrecht', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DELTA LOGISTIC KORLATOLT FELELOSSEGU TARSASAG', 'activ', 'client', 'HU22748898', 'Vasarhelyi Pal Utca 17', '2330 Dunaharaszti', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DEMMAR GmbH', 'activ', 'client', 'DE281131255', 'Bahnerberg 4', '85283  Wolnzach', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DESTINE BROKER DE ASIGURARE-REASIGURARE SRL', 'activ', 'client', 'RO21678074', 'J29/1143/2007', 'Str. Torcatori, Nr.4, Et.1, Ap.2', 'Ploiesti', 'Prahova', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Destiny Spedition s.r.o.', 'activ', 'client', 'SK2121192623', 'MASARYKOVA 1957/49', '07101 MICHALOVCE', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DG Spedition GmbH', 'activ', 'client', 'DE331493884', 'Am Schafgraben 16', '63654 Budingen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'D.Heinrichs Logistic GmbH', 'activ', 'client', 'DE812377107', 'Amerikaring 40', '27568 Bremerhaven', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DIANA TRUCK & TRAVEL SRL', 'activ', 'client', 'RO28226734', 'J26/320/2011', 'Mun. Targu Mures, Str. Hunedoara, Nr.27, Ap.8', 'Tirgu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Dimitriadis Kataskevastiki O.E. Dimitriadis Konstantinos', 'activ', 'client', 'EL802302061', 'Elia Evrou 68007', 'Elia Evrou 68007', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DIOPREST SRL', 'activ', 'client', 'RO18466985', 'J26/373/2006', 'Sat Saschiz Com. Saschiz, Nr.146', 'Saschiz', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DIPLO  LOGISTICS s.r.o.', 'activ', 'client', 'CZ10719474', 'Sidliste 9. kvetna 292', '28506 SAZAVA', 'Cehia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DISCORDIA S.R.L.', 'activ', 'client', 'RO23178229', 'J12/373/2008', 'Aleea Slanic, Nr.1, Ap.11', '4003940 Cluj-Napoca', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DK Transporte e.K.', 'activ', 'client', 'DE224931161', 'Am Steinacher Kreuz 20', '90427 Nurnberg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DOMINIC LOGISTIC LINE SRL', 'activ', 'client', 'RO36460654', 'J02/1068/2016', 'Cal. 6 Vanatori, Nr.25-29, Bl.V-4, Sc.B, Ap.9', 'Arad', 'Arad', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DOPRAVIA s.r.o.', 'activ', 'client', 'SK2023352892', 'DEMANOVSKA DOLINA 364', '031 01 DEMANOVSKA DOLINA', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DRAGOSIM COM SRL', 'activ', 'client', 'RO5959264', 'J10/1413/1994', 'Str. Primaverii, Nr.5', 'Buzau', 'Buzau', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DSV ROAD S.R.L.', 'activ', 'client', 'RO46318372', 'J40/11529/2022', 'B-Dul Timisoara, Nr.4a, Afi Park 4&5, Camera 1, Et.6', 'Sector 6', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DSV SLOVAKIA s.r.o.', 'activ', 'client', 'SK2020272892', 'DIALNICNA 6', 'SK 90301 SENEC', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'DT Logistic CZ s.r.o.', 'activ', 'client', 'CZ26823985', 'Mala Strana 194 194', '74283 Zbyslavice', 'Cehia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'DUMI & MEA TRANS SRL', 'activ', 'client', 'RO33327301', 'J26/600/2014', 'Sat Zau De Campie Com. Zau De Campie, Str. Amorului, Nr.12, Ap.4', 'Zau De Campie', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone)
    VALUES (v_company_id, 'DVI PRODUCTION S.R.L.', 'activ', 'client', 'RO36569865', 'J15/997/2016', 'Sat I. L. Caragiale Com. I. L. Caragiale,  , Dn 72, In Incinta Parcului Industrial Mija, Pavilion C 35, Camera 3 Jud Dambovita', 'I. L. Caragiale', 'Dambovita', 'Romania', '0745571882')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EARTHMOVING F GROUP', 'activ', 'client', 'EL802359460', 'KATASKEYASTIKI O.E. FILIATES THESPROTIAS', '46100 DOY HGOYMENITSAS', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EAST CARGOLOG S.R.L.', 'activ', 'client', 'RO38601610', 'J12/6770/2017', 'Str. Arany Janos, Nr.13, Ap.6', 'Cluj-Napoca', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EASTSHIP PROJECTS & LOGISTICS  SRL', 'activ', 'client', 'RO34264597', 'J13/504/2015', 'Str. Stefan Cel Mare, Nr.2, Et.2', 'Constanta', 'Constanta', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EDES LOGISTK GMBH', 'activ', 'client', 'ATU74750968', 'Munchner str.44', 'AT-6330 Kufstein', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Edgar Rothermel Internationale Spedition GmbH', 'activ', 'client', 'DE811278105', 'Industriestrasse 2', '76684 Ostringen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'E-FARM GmbH', 'activ', 'client', 'DE328328957', 'Kleine Reichenstr. 1', '20457 Hamburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EGGER Gesellschaft m.b.H', 'activ', 'client', 'ATU27095201', 'Tragosser Strasse 51', 'A-8600  Bruck an der Mur', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EGtrans Spedition & Logistik GmbH', 'activ', 'client', 'DE811995502', 'Gewerbeparkstrasse 19', '51580 Reichshof-Wehnrath', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, contact_person)
    VALUES (v_company_id, 'EJS SP . Z O .O.', 'activ', 'client', 'PL8522657720', 'MARCINA KASPRZAKA 2/5', '71-074 SZCZECIN,PL', 'Polonia', '0048690428437', 'JAKUB BOGACZ')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'E.Knieper Transporte  GmbH', 'activ', 'client', 'DE811313982', 'Postfach 1307', '26331  ZETEL', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ELIS AGREGATE SRL', 'activ', 'client', 'RO15727075', 'J01/763/2003', 'Loc. Petresti Mun. Sebes, Str. Zorilor, Nr.1', 'Petresti', 'Alba', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ELIS PAVAJE S.R.L.', 'activ', 'client', 'RO1771593', 'J01/948/1991', 'Loc. Petresti Mun. Sebes, Str. Zorilor, Nr.1', 'Petresti', 'Alba', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Eljo  Exalto  Transport  B.V.', 'activ', 'client', 'NL808572222B01', 'Langekamp 6', '5306  Brakel', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ELNA TRADING SRL', 'activ', 'client', 'RO9976187', 'J1997009328406', 'B-Dul Aviatorilor, Nr.7, Ap.1', 'Sector 1', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EMAG EXPED SRL', 'activ', 'client', 'RO33388333', 'J22/1128/2014', 'Aleea Sucidava, Nr.7, Bl.261, Sc.A, Et.4, Ap.14', 'Iasi', 'Iasi', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ENESA SOLAR TEHNOLOGY SRL', 'activ', 'client', 'RO37664121', 'J26/946/2017', 'Sat Bardesti Com. Santana De Mures, Bardesti, Nr.44', 'Bardesti', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Engel-Krane,Ernst Engel  OHG', 'activ', 'client', 'DE259850403', 'Ulmenweg 12', '39288  Burg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EP-TRANS Internationale Speditions GmbH', 'activ', 'client', 'DE812838008', 'Benzstrasse 2', '74076 Heilbronn', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'Erb-Transporte GmbH', 'activ', 'client', 'DE274675735', 'Planckstrasse 9', '71665 Vaihingen/Enz', 'GERMANIA', '07042-81890')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ERNST UDO MULLER INTERNATIONALE SPEDITION GmbH', 'activ', 'client', 'DE811221858', 'Runtestr.10', '59457 WERL', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ETL European Transport & Logistics GmbH', 'activ', 'client', 'DE262321463', 'Otto-Lilienthal-Strasse 2', '56479 Liebenscheid', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EUROBIS SRL', 'activ', 'client', 'RO28498100', 'J32/495/2011', 'Str. Livezii, Nr.1e', '555300 Cisnadie', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EURO CARGOO PLUS S.R.L.', 'activ', 'client', 'RO41947509', 'J20/1725/2019', 'Str. Bucegi, Nr.4, Bl.K2, Sc.A, Et.2, Ap.28', '331109 Hunedoara', 'Hunedoara', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EURODOS - PLUS , s.r.o', 'activ', 'client', 'SK2022447724', 'Kruzlov 13', '08604 KRUZLOV', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EUROPA ROAD KFT', 'activ', 'client', 'HU13493246', 'TOCOSKERT TER 8.', '4031 DEBRECEN', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EUROPASPED LOGISTICS SRL', 'activ', 'client', 'RO36778152', 'J22/2496/2016', 'Sat Tomesti Com. Tomesti, Str. Lalelei, Nr.7, Camera 1, Bl.15, Sc.B, Et.4, Ap.17', 'Tomesti', 'Iasi', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EUROPA SPEED LTD', 'activ', 'client', 'BG201573617', '1 HAN KUBRAT SQ, 2 nd floor,office 1', 'RUSE', 'Bulgaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EUROSKY SRL', 'activ', 'client', 'RO14953198', 'J26/857/2002', 'Str. Decebal, Nr.2, Ap.11', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EUROTOP TRANS SRL', 'activ', 'client', 'RO27855345', 'J04/1024/2010', 'Cal. Brasovului, Nr.270', 'Onesti', 'Bacau', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'EWALS GROUPAGE B.V.', 'activ', 'client', 'NL001564195B01', 'Ariensstraat 61-63,5931 HM, Tegelen', '5931 HM Telegen', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EXCAVISION S.R.L.', 'activ', 'client', 'RO50572971', 'J2024023726002', 'Sat Ganesti Com. Ganesti, Str. Principala, Nr.526, Birou 1', 'Ganesti', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EXON SRL', 'activ', 'client', 'RO8862664', 'J1996000486018', 'Str. Poet Andrei Muresanu, Nr.82', 'Ocna Mures', 'Alba', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'Expert-Log R24 e.U.', 'activ', 'client', 'ATU81050425', 'Lesingerweg 10', '8642 St. Lorenzen im Murztal', '-', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'EXTALMIN  DIGGING S.R.L.', 'activ', 'client', 'RO39795891', 'J26/1284/2018', 'Bld. Unirii, Bl.8, Sc.2, Ap.18', 'Reghin', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FAB d.o.o. Gracanica', 'activ', 'client', '209256470005', 'Kakmuski put b.b.-Donja Lohinja', '75320 Gracanica', 'Bosnia si Hertegovina')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Fahrlogistik Wachter GmbH', 'activ', 'client', 'DE814976542', 'Augustinusstrasse 9b', '50226 Frechen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FashionZone GbR', 'activ', 'client', 'DE257964505', 'Gewerbepark Am Grundel 21', '09423 Gelenau', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FEHRENKOTTER TRANSPORT & LOGISTIK GmbH', 'activ', 'client', 'DE126733482', 'HEINRICH-BUSSING-Str.6', '49549 LADBERGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FEIT INTERNATIONALE TRANSPORTE', 'activ', 'client', 'DE219752588', 'Franz-Lehner-Strasse 3', 'UnterschleiBheim', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'FEKETE ANDRAS INTREPRINDERE INDIVIDUALA', 'activ', 'client', 'RO40643226', 'F26/141/2019', 'Jud. Mures, Sat Band Com. Band, Str. Primaverii, Nr.21a, C.P. 547065', 'Band Com. Band', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone, contact_person)
    VALUES (v_company_id, 'FELBERMAYR ROMANIA SRL', 'activ', 'client', 'RO18265450', 'J23/1866/2010', 'Sat Dragomiresti-Deal Com. Dragomiresti-Vale, Str. Gabriela, Nr.13', 'Dragomiresti-Deal', 'Ilfov', 'Romania', '0726122193', 'TUDOSE MARIUS')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FELDMANN SPEDITION GmbH', 'activ', 'client', 'DE126943736', 'Nikolaus-OTTo-Str.4', 'D-33335 Gutersloh', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FERCAM AUSTRIA GmbH', 'activ', 'client', 'ATU64059119', 'Moeslbichl 78', '6250 KUNDL', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FERCAM SPA', 'activ', 'client', '00098090210', 'VIA MARIE Curie,2', '39100 BOLZANO', 'ITALIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'FERMA 12 S.R.L.', 'activ', 'client', 'RO14552889', 'J26/255/2002', 'Sat Ideciu De Jos Com. Ideciu De Jos, Nr.Fn', 'Ideciu De Jos', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Ferro-Sped 2000 Kft.', 'activ', 'client', 'HU11889087', 'Szent Janos  ut 1', 'H-2371 Dabas', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FETEC environment GmbH', 'activ', 'client', 'DE293848656', 'Hellerstrasse 23', '01445 Radebeul', 'GERMANIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Flexi Transport s.r.o', 'activ', 'client', 'SK2122339032', 'Fabryho842/9', '04022 Kosice', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FLUCKINGER TRANSPORT GmbH', 'activ', 'client', 'ATU70099537', 'Johannnesfeldstrasse 15', '6111 Volders', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'FM COMPANY TRANS SRL', 'activ', 'client', 'RO22454857', 'J26/1685/2007', 'Sat Raciu Com. Raciu, Str. Vasile Contiu,nr 101', 'Riciu', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FME Frachtmanagement Europa GmbH', 'activ', 'client', 'DE272669000', 'Niederlassung Thuringen Thoreyer Strasse 3', '99334 Amt Wachsenburg OT Thorey', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FO-TRANSPORT PROJECT INT.AG', 'activ', 'client', 'CHE-114.608.740', 'STAATSSTRASSE , NR. 50', 'CH-9472 GRABS', 'Elvetia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FOX FORWARDING NICOLAS OSWALD', 'activ', 'client', 'LU34399409', '24 Op Zaemer', 'LU-L-4959 KAERJENG', 'LUXEMBURG')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Franz Dillage Transporte', 'activ', 'client', 'DE203195375', 'Inh. Georg Dillage Landwehr 63', '46325 BORKEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'FRATII HEIKENS SRL', 'activ', 'client', 'RO23956681', 'J32/605/2016', 'Com. Brateiu, Brateiu, Nr.12', 'Brateiu', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FREIGHT TAXI d.o.o.', 'activ', 'client', 'HR19949989924', 'Koprivnicka ulica 9', 'HR 42000 Varazdin', 'Croatia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FREJA Transport &Logistics A/S', 'activ', 'client', 'DK15027800', 'LITAUEN ALLE 6', 'DK-2630 TAASTRUP', 'Danemarca')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FREY SPEDITIONS-GmbH', 'activ', 'client', 'DE143872920', 'Deutsche Strasse 28', 'd-67059 Ludwigshafen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Friedrich Jerich Transport GmbH Nfg & Co  KG', 'activ', 'client', 'ATU47404508', 'pirching 90', '8200 Hofstatten an der  Raab', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, email, contact_person)
    VALUES (v_company_id, 'FRIEDRICHSOHN INTERNATIONALE SPEDITION GMBH', 'activ', 'client', 'DE144892547', 'FABRIKSTRASSE 1 88444 UMMENDORF', 'UMMENDORF', 'Germania', 'gerhard.hanschek@fried-sped.de', 'GERHARD HANSCHEK')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FRIEDRICH STEINLE KRAFTVERKEHR GmbH', 'activ', 'client', 'DE169227013', 'WAIHENGEYER 3', '89415LAUINGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Friedrich-Transport GmbH', 'activ', 'client', 'DE144425001', 'Daimlerstrasse 6', '72213 Altensteig', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'FRIESLANDCAMPINA ROMANIA S.A.', 'activ', 'client', 'RO6632642', 'J40/15564/2019', 'Str. Barbu Vacarescu, Nr.301-311, Et.10', 'Sector 2', '020276 Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FS Spedition A/S', 'activ', 'client', 'DK31164249', 'Uldum Hedevej 8', 'DK-7171 Uldum', 'Danemarca')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FULMENN UAB', 'activ', 'client', 'LT100005824110', 'Dariaus ir Gireno 42A', 'LT02189 Vilnius', 'Lituania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'FV & Spedition Grundinger', 'activ', 'client', 'DE152980387', 'Mooswiese 1', '94034 Passau', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'GAMAR CONSTRUCT SRL', 'activ', 'client', 'RO19201382', 'J33/1413/2006', 'Sat Scheia Com. Scheia, Str. Humorului, Nr.105', 'Scheia', 'Suceava', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Geerlings Spedition + Logistik GmbH', 'activ', 'client', 'DE368949883', 'Natt 4a', '41334 Nettetal', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Gertzen Projektlogistik GmbH', 'activ', 'client', 'DE299062397', 'LUTTINGER Str.27', '46509 XANTEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Gewerblicher Guterkraftverkehr  Dieter Schumacher GbR', 'activ', 'client', 'DE298210056', 'Am Handelspark 12', 'D-18184 Broderstorf-Neuendorf', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'GINA TRANSPORT LTD', 'activ', 'client', 'GR800764063', '270 ,PATRON KLAOUS MPEGOULAKI PATRON', 'T.K.26500  PATRA', 'Grecia', '00302610644327')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'GO INTERNATIONAL', 'activ', 'client', 'DE197128907', 'HEINRICH-LUBKE,STR.8', 'D-81737 MUNCHEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'GOSPODARIA TARANEASCA(DE FERMIER) LEPORDA VALERII MIHAIL', 'activ', 'client', '29442326', 'BRICENI,TABANI', 'TABANI', 'EDINET', 'Republica Moldova')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'G-plant spol.sr.o', 'activ', 'client', 'SK2020304759', 'Floglova 5', '81105 Bratislava', 'SLOVACIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Grall IS Bau und Landmaschinen', 'activ', 'client', 'DE815830337', 'Inh.Michaela Grall Str. Im Sontchen 27', 'DE -57078 SIEGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Grosse Scheffels GmbH', 'activ', 'client', 'DE363627237', 'Stahlstr. 3', '51645 Gummersbach', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'GRUBER  Logistics Gmbh', 'activ', 'client', 'DE251273055', 'MARBURGERSTRASSE 390', '57223 KREUZTAL', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'GRUBER  LOGISTICS  SP .Z.O.O.', 'activ', 'client', 'PL7010935919', 'UL.CHORZOWSKA 152', '40-101 KATOWICE', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'GRUBER Logistics s.r.o.', 'activ', 'client', 'CZ63674947', 'MRAZIRNY 70,', '25087 MOCHOV', 'CEHIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'GUSTAV ZIEGLER GMBH', 'activ', 'client', 'DE812286820', 'SCHUTZENHAUSWEG 5', 'D-88525 DURMENTINGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'HADARIG VIOREL PERSOANA FIZICA AUTORIZATA', 'activ', 'client', '34109585', 'ICLANDU MARE,NR.108,sat. ICLANDU MARE,com ICLANZEL', '547348 ICLANZEL', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HAGMI LOGISTICS SRL', 'activ', 'client', 'RO29203780', 'J23/2659/2011', 'Sat Dobroesti Com. Dobroesti, Drm. Dobroesti Fundeni, Nr.24, Camera 1, Et.P', 'Dobroesti', 'Ilfov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'HARTMANN ACTIVE LOGISTIK GmbH & Co.KG', 'activ', 'client', 'DE815911514', 'Halbersdter Str. 77', '33106  Paderborn', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HARTMANN PRODCOM S.R.L.', 'activ', 'client', 'RO7452437', 'J26/342/1995', 'Str. Gheorghe Doja, Nr.231-C14', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HEAVY CARGO SRL', 'activ', 'client', 'RO36644630', 'J33/1309/2016', 'Str. Calea Bucovinei, Nr.37 A, Sc.B, Et.3, Ap.33', 'Radauti', 'Suceava', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Heemsbergen Logistics B.V.', 'activ', 'client', 'NL865150436B01', 'Linatebaan 69A', '3045 Rotterdam', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Helmut Fieber Spedition Spezialtransporte GmbH', 'activ', 'client', 'DE127484279', 'Hunnenstr.34', '86343 Konigsbrunn', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'HGS-Sonderfahrten GmbH & Co.KG', 'activ', 'client', 'DE320195497', 'Industriestrasse 13', '91626 Schopfloch', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'HINTERLAND SAS', 'activ', 'client', 'FR03408369221', '11 RUE DU LION D''OR', '35120 CHERRUEIX', 'Franta')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'HIPTOM-ESTATE Zrt.', 'activ', 'client', 'HU26260864', 'Petofi Sandor UTCA 48.', '2724  Ujlengyel', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'HIT TRANSPORT MIEDZYNARODOWY,SPEDYCJA I LOGISTYKA SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', '9231689207', 'ul.Dworcowa 27,64-200 Wolsztyn', '64-200  WOLSZTYN', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HOLLEMAN SPECIAL TRANSPORT & PROJECT CARGO SRL', 'activ', 'client', 'RO22941739', 'J2007023700409', 'Str. Codrii Neamtului, Nr.5-7, Cladirea B, Et.6, Ap.59', 'Sector 3', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Huffermann Krandienst GmbH', 'activ', 'client', 'DE258441641', 'Ahlhorner Strasse 89', '27793 Wildeshausen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HULEA N.  IOAN OVIDIU INTREPRINDERE FAMILIALA', 'activ', 'client', 'RO39723496', 'F01/925/2018', 'Sat Henig Com. Berghin,  , Nr.237', 'Henig', 'Alba', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'HUT RODICA INTREPRINDERE INDIVIDUALA', 'activ', 'client', 'RO45342070', 'F02/1186/2021', 'Str. Alexandru Ioan Cuza, Nr.6a', 'Ineu', 'Arad', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'IJMOND TRANSPORT  FORWARDING B.V.', 'activ', 'client', 'NL003096075B01', '30 1948 PV BEVERWIJK', '30 1948  PV BEVERWIJK', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ILISEB TCMAT SRL', 'activ', 'client', 'RO41278730', 'J27/788/2019', 'Str. Inginer Serafim Lungu, Bl.A10, Sc.A, Et.2, Ap.9', 'Targu Neamt', 'Neamt', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'INDUSTRIAS  LACASTA S.A.', 'activ', 'client', 'A22008254', 'CALLE GIBRALTAR N  38', '22006 HUESCA', 'Spania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'INTERLOGIS POLAND SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL9512364106', 'ul.  Wiertnicza 34', 'PL02-952 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Internationale  Spedition Thomas Pfeiffer', 'activ', 'client', 'DE169708198', 'Buchel 10', 'D-42855 Remscheid', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'INTERNATIONAL LINES TRANSPORT SRL', 'activ', 'client', 'RO18285946', 'J32/35/2006', 'Str. Mitropoliei, Nr.16, Ap.8', 'Sibiu', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'INTER TRANS LOGISTICS S.R.L.', 'activ', 'client', 'RO13973960', 'J2001005927404', 'Str. Capt. Mircea Vasilescu, Nr.26', 'Sector 4', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'IONUT & MONICA SPEDITION SRL', 'activ', 'client', 'RO49312137', 'J26/1911/2023', 'Sat Nazna Com. Sancraiu De Mures, Str. Pasunii, Nr.17', 'Nazna', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ISENTALER TRANSPORTE GMBH', 'activ', 'client', 'DE212304104', 'Am Industriepark 29', '84453 Muhldorf', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ISTY&LEVY SRL', 'activ', 'client', 'RO24178103', 'J26/1277/2008', 'Sat Band Com. Band, Str. Targu Muresului, Nr.36', 'Band', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Jansen Transport Drempt B.V.', 'activ', 'client', 'NL-862481259B01', 'H.Remmelinkweg 15a', 'NL 6996 DH Drempt', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'J.Brouwer  & Zn.  B.V.', 'activ', 'client', 'NL807409364B01', '3430 BA Nieuwegein Postbus 1049 Nijverheidsweg 1', '3430 BA Nieuwegein', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'JKG TRANSPORT -SPEDITION SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL5542988743', 'ul.Janowo 2A', '86-070 Dabrowa Chelminka', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'JN MACHINES BV', 'activ', 'client', 'NL859213912B01', 'Putstraat 9', '5091TH Oost West Middelbeers', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'JOBSTL EAST GmbH', 'activ', 'client', 'DE305439367', 'Zeppelinstr.2', '82178 Puchheim', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'JUNKOSPED SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL1132939565', 'ul. Mickiewicza 36 A', '01-616 Warszawa', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KALTRUCKS   FRANCE  SAS', 'activ', 'client', 'FR93803023548', '788,CHEMIN RODAT CARONNES', '83670 TAVERNES', 'FRANTA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KASPEDA SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL1132939536', 'ul. Tucholska 43 01-618 Warszawa', '01-618 Warszawa', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KAYAK SP .Z O.O.', 'activ', 'client', 'PL6222785080', 'Ledochowskiego 34', '63-400 Ostrow Wielkopolski', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Keimelmayr Speditions-und Transport GmbH', 'activ', 'client', 'ATU65715345', 'Schirmerstrasse 5', '4060 LEONDING', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KFZ-Speditionsbetrieb  Christian Kimpel  und Karsten Mothes GbR', 'activ', 'client', 'DE349484157', 'Rudersdorfer Strasse 24', '57234 Wilnsdorf', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KGV Speditionsgesellschaft mbH Kraftwagen-Guter-Verkehre', 'activ', 'client', 'DE120000388', 'Vinkrather Str.46-47929 Grefrath', '47929 Grefrath', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'K. -H. MEYER-KOLDINGEN GmbH & Co.KG', 'activ', 'client', 'DE198722289', 'Ludwig-Erhard-Str.7-13', 'D-30982  Pattensen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KIABA - Spedition & Transporte s.r.o.', 'activ', 'client', 'SK2120618709', 'Zabokreky nad Nitrou 188/7', '95852 Zabokreky nad Nitrou', 'SLOVACIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KIESEL used GmbH', 'activ', 'client', 'DE202275217', 'BAINDTER Str.21', '88255 BAIENFURT', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KLAUS RUNDT GMBH', 'activ', 'client', '114954687', 'MOORWEG 12', '21261 Welle OT Kampen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Kliwaro sp . z o.o.', 'activ', 'client', 'PL1132939571', 'ul.Bohomolca 21', '01-613 Warszawa', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Kollmannsberger KG Transport & Logistik', 'activ', 'client', 'DE813186808', 'Dieselstr. 6 ( Interpark)', '85098 Großmehring', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Konrad Sturm GmbH', 'activ', 'client', 'DE157884873', 'Ruhrstr.64', '41469 Neuss', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Konstantinos Zotor Crushers and Screens', 'activ', 'client', 'EL042879630', 'Kampani, Kilkis, Greece', 'Kilkis', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KONZEPT-GROUP SARL', 'activ', 'client', 'LU26634456', '30,RUE EDMOND REUTER 5326 CONTERN LUXEMBURG', 'CONTERN', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KOTRANS Logistics GmbH & Co. KG', 'activ', 'client', 'DE144529654', 'Im Kobler 3', 'D-75438 KNITTLINGEN-FREUDENSTEIN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Kraft Global Logistics Sp. z o.o.', 'activ', 'client', 'PL64443560853', 'Ostrogorska 9', '41-200 Sosnowiec', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KRELL LOGISTIK GMBH', 'activ', 'client', 'DE251814815', 'SALIERSTRASSE 48', '70736 FELBACH', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KRS Logistics SPRL', 'activ', 'client', 'BE0432308412', 'Grand Route 44', 'B-4367 CRISNEE', 'Belgia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KRUK TRANSPORT  SP. ZO.O.', 'activ', 'client', 'PL6211843106', 'ul.Kobylinska', '63-760 Zduny', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'KSS GmbH', 'activ', 'client', 'DE299007575', 'Frankfurter  Str.8-Geb.56-23554 Lubeck', '23554 Lubeck', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'LACZKO TEAM KFT', 'activ', 'client', 'HU12233850', 'Szentmartonkatai ut, 69', 'Tapiosag', 'Ungaria', '+36307436721')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LA  Logistik Inhaber Tarik  Mustic', 'activ', 'client', 'DE354521920', 'Agathagasse 6', '45894 Gelsenkirchen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Lampe Spezialtransporte GmbH @ Co.KG', 'activ', 'client', 'DE265799187', 'Boschstrasse 4', 'D-49456 Bakum', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LANDI SP . O.O.', 'activ', 'client', 'PL7010600366', 'UL.NOWOGRODZKA 50/54/515', '00-695 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Laszlo  Pekarik Internationale Transporte Kft', 'activ', 'client', 'HU24720506', 'Jokai utca 42.', '5600 Bekescsaba', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LAVOIR LOGISTICS', 'activ', 'client', 'NL865726012B01', 'Simon Stevinstraat 3', 'NL-3284 WC ZUID-BEIJERLAND', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LINKTIS SP. Z O. O.', 'activ', 'client', 'PL9512373803', 'CZERNIAKOWSKA 87A', '00-718 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LION  Projects GmbH', 'activ', 'client', 'DE306682160', 'Holunderweg 1', '03149 Forst(Lausitz)', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LOGATECH d.o.o.', 'activ', 'client', '84380454723', 'JALSOVEC 9/c', 'STRIGOVA', 'CROATIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'LOGITRANS SRL', 'activ', 'client', 'RO19502075', 'J27/1450/2006', 'Sat Dumbrava Rosie Com. Dumbrava Rosie, Str. Plantelor, Nr.6a', 'Dumbrava Rosie', 'Neamt', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LORANG S.A.', 'activ', 'client', 'LU13068937', '9 PORT DE MERTERT', '6688 MERTERT', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'LoTuS Solution GmbH', 'activ', 'client', 'DE332430104', 'Hinterer Ring 3', 'D 08233 Treuen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, email)
    VALUES (v_company_id, 'LS LESZEK STUDNICKI', 'activ', 'client', 'PL8861504769', 'CHOPINA3/4 PL58-330', 'ZEDLINA ZDROJ', 'Polonia', 'ls.invoice3@gmail.com')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Lubbers Benelux BV', 'activ', 'client', 'NL803976380B01', 'Klaverakker 1', '7761RA  SCHOONEBEEK', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'LUCAS STEEL CONF S.R.L.', 'activ', 'client', 'RO42462196', 'J08/724/2020', 'Sat Harman Com. Harman, Str. Avram Iancu, Nr.31e', 'Harman', 'Brasov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Ludwig Haberle Logistik GmbH', 'activ', 'client', 'DE146752694', 'Guglingstrasse 85', 'DE73529 Schwabisch Gmund', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'LUGASI TRANS SRL', 'activ', 'client', 'RO22198260', 'J05/1966/2007', 'Str. Constantin Brancoveanu, Nr.49', 'Oradea', 'Bihor', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'LUIE TOTAL S.R.L.', 'activ', 'client', 'RO31404033', 'J2013000199155', 'Sat Picior De Munte Com. Dragodana, -, Nr.106', 'Picior De Munte', 'Dambovita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MAIRON GALATI SA', 'activ', 'client', 'RO6581999', 'J17/3127/1994', 'Str. Drumul De Centura, Nr.59', 'Galati', 'Galati', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Mammoet Road Cargo B.V.', 'activ', 'client', 'NL809828625B01', 'P.O BOX 140 4730 AC OUDENBOSCH', '4730 OUDENBOSCH', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MAMUT LOGISTICS S.L', 'activ', 'client', 'ESB10746329', 'Calle Maldonado,4-BJ', '03181 Torrevieja', 'Spania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MANFRED SCHREFLER GmbH', 'activ', 'client', 'ATU67729425', 'AT,4523 NEUZEUG', 'NEUZEUG', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MAREX TRANS SRL', 'activ', 'client', 'RO23131587', 'J26/135/2008', 'Sat Ceuasu De Campie Com. Ceuasu De Campie, Ceuasu De Cimpie, Nr.240/a', 'Ceuasu De Cimpie', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MARINHO STEEL SA', 'activ', 'client', 'LU25123577', 'RUE PIERRE GANSEN  DIFFERDANGE', '4570 NIEDERKORN', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MARIUSTRANS SRL', 'activ', 'client', 'RO16668481', 'J14/302/2004', 'Sat Sita Buzaului Com. Sita Buzaului, Com. Sita Buzaului, Nr.415', 'Sita Buzaului', 'Covasna', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MARKEMI TRUCKSPED HOLDING S.R.L.', 'activ', 'client', 'RO42478672', 'J17/465/2020', 'Sat Liesti Com. Liesti, Str. Mircea Eliade, Nr.29', 'Liesti', 'Galati', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Marlo  Expeditie BV', 'activ', 'client', 'NL808362501B01', 'Dorpsstraat 202', '2761 AJ Zevenhuizen', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MARSIM TRANSPORT LOGISTIC S.R.L.', 'activ', 'client', 'RO27553126', 'J40/9950/2010', 'Str. Muntele Mare, Nr.47a', 'Sector 4', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MATE CONSTRUCT SRL', 'activ', 'client', 'RO16606403', 'J26/1184/2004', 'Sat Ganesti Com. Ganesti, Str. Principala, Nr.526', 'Ganesti', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MATTIA WINKLER S.p.A.', 'activ', 'client', '00313990319', 'Via Terza Armata 187', '34170  GORIZIA', 'Italia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MAUFFREY LUXEMBOURG', 'activ', 'client', 'LU18696767', 'Z.A.C. HANEBOESCH   II  EMPYREUM', '4563 DIFFERDANGE', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Max Bogl Transport  & Gerate GmbH &  Co.KG', 'activ', 'client', 'DE178069458', 'Postfach 11 20', '92301 Neumarkt i.d. OPf.', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MAXX Transport GmbH', 'activ', 'client', 'DE353801239', 'Schafecke 1', 'Dettelbach', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, contact_person)
    VALUES (v_company_id, 'MBM LOGISTICS KFT', 'activ', 'client', 'HU24340386', 'HU-2360 GYAL,KOLOSVARI utca 26', 'GYAL', 'Ungaria', '+36706205232', 'ILLES ARPAD')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MECON S.A', 'activ', 'client', 'GR999865419', 'Chalkis 10', '65404 KAVALA', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MEGA Transport B.V.', 'activ', 'client', 'NL858681821B01', 'Kon. Wilhelminahaven ZZ 21B', '3134KG VLAARDINGEN', 'OLANDA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MERLIMI SPOLKA  Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL1132939298', 'ul. Bohomolca 21', '01-613 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Michael Joa  Verwertungs GmbH & Co.KG', 'activ', 'client', 'DE293789170', 'Zum Bilsknop 2', '66780 Rehlingen-Siersburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MICKAL, s. r. o.', 'activ', 'client', 'CZ25357166', 'U BECVY 1745', '756 54 ZUBRI', 'Cehia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Mission Transport and Logistics Kft', 'activ', 'client', '13200918-2-08', 'Petofi Sandor utca 19', '9171 Gyorujfalu', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MITLIV PH CONSTRUCT S.R.L.', 'activ', 'client', 'RO26670063', 'J16/346/2010', 'Cal. Severinului, Nr.48', 'Craiova', 'Dolj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MK LANDMASCHINEN VERTRIEB', 'activ', 'client', 'DE303460546', 'HOHE MORGEN 7', '72525 MUNSINGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MK TRANS LOGISTICS GMBH', 'activ', 'client', 'DE326057698', 'WANHEIMERSTR 270-276', '47055  DUISBURG', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'M&M LOGISTIK Sp z o.o. Sp.K', 'activ', 'client', 'PL6182133068', '63-460 Nowe Skalmierzyce ul. Gloski 14A', 'Nowe Skalmierzyce', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'M.O. Baumaschinen & Nutzfahrzeuge GmbH & Co.KG', 'activ', 'client', 'DE814986322', 'Fasanenallee 14', '66740 Saarlouis', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MODERNE BAUSYSTEME S.R.L.', 'activ', 'client', 'RO15870953', 'J26/1439/2003', 'Str. Rozmarinului, Nr.56, Ap.15', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MOHLMANN  & TESCHNER LOGISTIK GMBH', 'activ', 'client', 'DE271208842', 'Dr.- Gildemeister-Strasse 18', 'D-23684 Scharbeutz', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MOLDIS CAR SRL', 'activ', 'client', 'RO27730210', 'J12/1972/2010', 'Sat Valcele Com. Feleacu, Nr.117a', '407274 VALCELE', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MOLDIS SPEDITION SRL', 'activ', 'client', 'RO48406640', 'J12/2789/2023', 'B-dul Muncii, Nr. 18b, C.P. 400641', 'Cluj-napoca', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, bank_account)
    VALUES (v_company_id, 'MONTROSE LTD', 'activ', 'client', 'BG203030359', '1 HAN KUBRAT SQ RKS BUILDING 2ND FLOOR,OFFICE 1', '7000 RUSE', 'Bulgaria', 'BG10IORT73791032816700')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MP Maschinen Park GmbH', 'activ', 'client', 'DE330094052', 'Raiffeisenstr.12', 'D 61169 Friedberg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MTL  EXPEDITIE BV', 'activ', 'client', 'NL809007824B01', 'GRUTTOSTRAAT 61', '7471 ER GOOR', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'MURI&SEBI AUTOTRANSPORT S.R.L.', 'activ', 'client', 'RO40560210', 'J2019000374268', 'Mun. Targu Mures, Str. Cernei, Nr.18', 'Tirgu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'MW   Transport  Mateusz Wiedemann', 'activ', 'client', 'PL8421749165', 'ul. Chelmzynska 198A/28', '04-464 WARSZAWA PL', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'M.ZIETZSCHMANN  GmbH & Co. KG', 'activ', 'client', 'DE119247452', 'Dusseldorfer Str.31', '41460 Neuss', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'NAIBIS VIA TRANS SRL', 'activ', 'client', 'RO37266940', 'J26/449/2017', 'Sat Suseni Com. Suseni, Suseni, Nr.428', 'Suseni', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'NELDAN TRANS SRL', 'activ', 'client', 'RO18977475', 'J26/1375/2006', 'Str. Liviu Rebreanu, Nr.39b, Ap.7', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'NEW WAVE INTERNATIONAL CARGO SP . Z O.O. SP .K.', 'activ', 'client', 'PL5213669600', 'NIEPODLEGLOSCI 18', '02-653 WARSZAWA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'NINACOR SRL', 'activ', 'client', 'RO23029995', 'J04/47/2008', 'Str. Siretului, Nr.11bis', 'Bacau', 'Bacau', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'No Limits Trans GmbH', 'activ', 'client', 'DE265670459', 'Philipp-Reis Strasse 2', '669793 SAARWELLINGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'OCTAV TRANSPORT LOGISTIC SRL', 'activ', 'client', 'RO30245835', 'J2012000421107', 'Bld. Unirii, Bl.138, Ap.2', 'Buzau', 'Buzau', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'OLCAB TELECOM SRL', 'activ', 'client', 'RO15291340', 'J33/215/2003', 'Sat Ipotesti Com. Ipotesti, Str. Bisericii, Nr.605 C, Camera 1', 'Ipotesti', 'Suceava', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'O.L.T. SPEDITION GmbH', 'activ', 'client', 'DE262019345', 'Kronwinkler Str.31', 'D-81245 Munchen-Aubing', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ORANIEN BV', 'activ', 'client', 'NL8143.15.057.B01', 'DIAMANTWEG 10', '5527 LC HAPERT', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ORBIT STREEM S.R.L.', 'activ', 'client', 'RO16291216', 'J23/1783/2005', 'Sat Olteni Com. Clinceni, Sos. De Centura, Nr.4, Et.1', 'Olteni', 'Ilfov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ORIENT SRL', 'activ', 'client', 'RO739128', 'J33/338/1991', 'Str. Fabricilor, Nr.7', 'Radauti', 'Suceava', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'OSTERMAYR STEYR GMBH', 'activ', 'client', 'DE128707421', 'GOTTFRIED-GRUBER STRASSE 2', '93352 ROHR', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'OTN Europe B.V.', 'activ', 'client', 'NL819339052B01', 'Brieltjenspolder 28', 'NL 4921PJ MADE', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Otto Haalboom Internationale Spedition e.k.', 'activ', 'client', 'DE118873545', 'Sascha Kuzmierz', 'DE 21035 Hamburg-Allermohe', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'OXIVIA LOGISTICS SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSSCIA', 'activ', 'client', 'PL9581712326', 'Arendta Dickmana 63', '81-109 GDYNIA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'PAKAR PRIJEVOZ d.o.o.', 'activ', 'client', 'HR23597322788', 'VELIKA VES 61 A', '49000 KRAPINA', 'Croatia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'PANGEA Logistik gMBh', 'activ', 'client', 'DE815817305', 'Schuirweg 85', '45133 ESSEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Papp & Co. GmbH', 'activ', 'client', 'DE142215314', 'Konigsberger strasse 13 D-77694', 'Kehl/Rhein', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Parker Logistics sp z o.o.', 'activ', 'client', 'PL7822807991', 'Heroldow 6/9', 'Warszawa', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'PASCU DAN', 'activ', 'client', '1710601261493', 'str. PRINCIPALA,nr. 437,sat DEDRAD,com BATOS', 'DEDRAD', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country, phone)
    VALUES (v_company_id, 'PDA ERSTE LOGISTICS S.R.L.', 'activ', 'client', 'RO31546925', 'J23/1260/2013', 'SPLAIUL UNIRII NR.313, CAMERA 14.6, COD POSTAL 030138', 'Pantelimon', 'Ilfov', 'Romania', '0314383043')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Peter Adolf Molde Internationale Transperte, Inhaber Marcel Molde e.K.', 'activ', 'client', 'DE358280185', 'Zum Hohen Berg 8', '34434 Borgentreich', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'PETSCHL-TRANSPORTE OSTERREICH GESELLSCHAFT mbH & Co KG INTERNATIONALE TRANSPORTE', 'activ', 'client', 'ATU23544608', 'JOSEF-PETSCHL-STRASSE 1', 'A-4320 PERG OBEROSTERREICH', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'PILOT SERVICE  HOLLAND - PERMITS & PILOTS B.V.', 'activ', 'client', 'NL862636978B01', 'ZUIDERLOSWAL 21', '1216 CJ HILVERSUM', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'Pinciu Ioan', 'activ', 'client', '-', 'Mosna 294', 'Medias', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Platzer Spedition und Transportgesellschaft m.b.H', 'activ', 'client', 'ATU15393401', 'Dr.Scheiber Strasse30-32', 'A-4870 Vocklamarkt', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'POL TRANSPORT BV', 'activ', 'client', 'NL822674014B01', 'ALTEVEER 98', '7907 GA HOOGEVEEN', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'POPUTOAIA GHEORGHITA INTREPRINDERE INDIVIDUALA', 'activ', 'client', 'RO12769661', 'F22/1103/2005', 'Sat Miroslovesti Com. Miroslovesti, Nr.-', 'Miroslovesti', 'Iasi', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'POSTA LOGISTICS SL', 'activ', 'client', 'B66972266', 'CALLE JAUME I,10,Local 6', '08206 SABADELL', 'Spania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'PRELCHIM SRL', 'activ', 'client', 'RO7059714', 'J38/99/1995', 'Str. Stolniceni, Nr.219', 'Ramnicu Valcea', 'Valcea', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, email, contact_person)
    VALUES (v_company_id, 'PRO LOGISTICS & SERVICES LTD', 'activ', 'client', 'BG202999299', '6 RADI   IVANOV str.,', '7000  RUSE', 'Bulgaria', '+359879344899', 'office@prologistic.eu', 'PETAR RAEV')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'PSA BDP INTERNATIONAL ROMANIA S.R.L.', 'activ', 'client', 'RO48377561', 'J40/11607/2023', 'Str. Nicolae G. Caramfil, Nr.71-73, Et.4', 'Sector 1', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'P  . Schwandner  Logistik + Transport GmbH', 'activ', 'client', 'DE813112243', 'Am Kalvarienberg 17', 'D-92536 PFREIMD', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'PSC RAMS IMPEX SRL', 'activ', 'client', 'RO6831840', 'J08/687/2016', 'Sat Harman Com. Harman, Str. Avram Iancu, Nr.31-E', 'Harman', 'Brasov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Pultrum Rijssen B.V.', 'activ', 'client', 'NL817988804B01', 'Noordermorssingel 22', '7461 JN Rijssen', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'P.VAN EGDOM-MARIEN &Co n.v.', 'activ', 'client', 'BE0425.653.519', 'SCHOORSTRAAT 40', 'B-2220 HEIST-OP-DEN-BERG', 'Belgia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'QUATTRO INTERSPED SRL', 'activ', 'client', 'RO25781993', 'J2009000832031', 'Str. Dobrogea nr.12, etaj 1', '500204 Brasov', 'Brasov', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Rainer Breddermann Int.Sped.GmbH', 'activ', 'client', 'DE814193949', 'Neuestr.28 d', '58135 Hagen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'RAPID TRANSPORT EXPRESS SRL', 'activ', 'client', 'RO37039921', 'J40/1537/2017', 'Str. Popa Petre, Nr.5, Corp A, Biroul Nr. 511, Et.5', 'Sector 2', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Rechezite SRL Progrup -IMPEX', 'activ', 'client', '1008604000940', 'r. Briceni', 'PERERITA', 'Republica Moldova')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'RECYCLING PROD SRL', 'activ', 'client', 'RO21274190', 'J26/432/2007', 'Str. Principala, Nr. 7', 'Bardesti', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'RED FAST LOGISTICS SRL', 'activ', 'client', 'RO33789785', 'J03/1456/2014', 'Bld. Republicii,, Bl.212, Sc.C, Et.3, Ap.14', 'Pitesti', 'Arges', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'RENAROM TRANS SRL', 'activ', 'client', 'RO8721126', 'J24/626/1996', 'Str. Dura, Nr.6', 'Baia Mare', 'Maramures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Rheinkraft International GmbH', 'activ', 'client', 'DE811155045', 'Beecker Str. 11', '47166 Duisburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROBERT SERV SRL', 'activ', 'client', 'RO16059080', 'J26/62/2004', 'Sat Campenita Com. Ceuasu De Campie, Campenita, Nr.157/a', 'Campenita', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROBERT SI MIREL TRANS SRL', 'activ', 'client', 'RO24807530', 'J15/1539/2008', 'Salcioara', 'Salcioara', 'Dambovita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROMEX SRL', 'activ', 'client', 'RO1196453', 'J1992000684261', 'Str. Negoiului, Nr.1', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROMPAULUS WOOD S.R.L.', 'activ', 'client', 'RO45825610', 'J26/441/2022', 'Sat Bistra Muresului Com. Deda, Bistra Muresului, Nr.54', 'Muresului', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROMSPED CARGO S.R.L.', 'activ', 'client', 'RO19616169', 'J03/2184/2006', 'Bld. Nicolae Balcescu, Nr.48, Et.1', 'Pitesti', 'Arges', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ROZOTI PRODCOM S.R.L.', 'activ', 'client', 'RO4348076', 'J05/2578/1993', 'Str. Petre P .Carp Nr.7 410603', 'Oradea', 'Bihor', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Rubicon Trade , s.r.o.', 'activ', 'client', 'SK2021917447', 'Mierove nam.2.', 'SK-924 01 Galanta', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'RUUD BORST TRANSPORT B.V.', 'activ', 'client', 'NL8545.06.172.B01', 'Lopikerweg Oost 17a', '3411 JA Lopik', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Ryano Logistics B.V.', 'activ', 'client', 'NL814459419B01', 'Expeditiestraat 14', '4283  JG GIESSEN', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SABCOM SERV S.R.L.', 'activ', 'client', 'RO43460452', 'J26/1602/2020', 'Mun. Targu Mures, Str. Moldovei, Nr.20, Ap.4', 'Tirgu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Salzgitter EuroLogistik GmbH', 'activ', 'client', 'DE813699604', 'Sudetenstrasse 22', '38239  SALZGITTER', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SAVU LIVIU', 'activ', 'client', '1750806054672', 'str. CORNELIU COPOSU nr.3', 'ORADEA', 'Bihor', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SC AGROVISOARA SRL', 'activ', 'client', 'RO30029866', '557055 BRATEIU', 'BRATEIU', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SC BAR-AT SYSTEM SRL', 'activ', 'client', 'RO17634282', 'Str. Bogos, nr. 826', 'Joseni', 'Harghita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SC FRIESLANDCAMPINA ROMANIA SA CLUJ NAPOCA - PUNCT DE LUCRU TG MURES', 'activ', 'client', 'RO23782747', 'Str. Bega, Nr.1', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SCHENKER LOGISTICS ROMANIA S.A.', 'activ', 'client', 'RO5905159', 'J1994009578400', 'Calea Rahovei, Nr.196c', 'BUCURESTI ,050908,Sector 5', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Schiller Trans', 'activ', 'client', 'DE131242267', 'Kapellenweg 3', 'D-94536 Eppenschlag', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SCHNELL HEAVY LOGISTICS SRL', 'activ', 'client', 'RO32137406', 'J12/2592/2013', 'Sat Luna De Sus Com. Floresti, Luna De Sus, Dn1, Km 489, Cf 73625', 'Luna De Sus', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Schulte-Lindhorst GmbH & Co.', 'activ', 'client', 'DE126782497', 'Hauplstrasse 102', 'D 33397 Rietberg Varensell', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SCHWERLAST- SPEDITION HAMBURG GMBH', 'activ', 'client', 'DE118614335', 'NEUHOFERDAMM 112', '21107 HAMBURG', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SCHWERTRANSPORT MAX KFT', 'activ', 'client', 'HU25888704-2-09', 'VAS GEREBEN ut.4', '4110 BIHARKERSZTES', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SC RAUL AGROCOM SRL', 'activ', 'client', 'RO18301057', 'Str.Principala 105', 'VOINICENI', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'SC SERMON LKV SRL', 'activ', 'client', 'RO31078557', 'Cutezantei 43/ap.5', 'TARGU MURES', 'MURES', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SC SERVSILV TRANS SRL', 'activ', 'client', 'RO5283960', 'J26.121.1994', 'STR.  SALISTE NR.4 , JUD MURES', 'TARGU MURES', 'MURES', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SCS LOGISTICS BV', 'activ', 'client', 'NL8131.87.588B01', 'Postbus 118', '7630 AC Ootmarsum', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Seecontainers Sp. z o.o.', 'activ', 'client', 'PL9581726423', 'STANISŁAWA FILIPKOWSKIEGO 18 /25', '81-578 GDYNIA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Serrahn Spedition + Logistk GmbH', 'activ', 'client', 'DE812639055', 'Hakenbusch 3', 'D 49078 Osnabruck', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SIS LOGISTIK GmbH', 'activ', 'client', 'DE813243562', 'Vahrenwalderstr. 265 A', '30179 HANNOVER', 'GERMANIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SMITMA BV', 'activ', 'client', 'NL008298373B01', 'Columbusweg 13', '5928 LA Venlo', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Spedition Bender GmbH', 'activ', 'client', 'DE814304852', 'Leupoldstrasse 2', 'DE-04347 LEIPZIG', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SPEDITION FRIEDA FISCHER e.K.', 'activ', 'client', 'DE205062594', 'Au am Aign 5a', '85084 REICHERTSHOFEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Spedition Gideon Kiefer', 'activ', 'client', 'DE186090140', 'Hansestrasse 32', 'D-46325 Borken', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SPEDITION KLEIN GMBH', 'activ', 'client', 'DE158605965', 'SIEGENER STR. 22', 'DE- 51545 WALDBROL', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Spedition Kurt Wagner GmbH + Co KG', 'activ', 'client', 'DE143765605', 'Max-Born-Strasse 3', '68169 Mannheim', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SPILLER GLOBAL LOGISTICS SRL', 'activ', 'client', 'RO24171822', 'J2008012022405', 'Str. Dorneasca, Nr.16, Bl.P58, Sc.1, Et.8, Ap.26', 'Sector 5', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SPL Rhein-Main GbR', 'activ', 'client', 'DE281449244', 'Hinter dem Turm 3', '55286 Worrstadt', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SRT Saar-Rhein-Transportgesellschaft mit beschrankter Haftung', 'activ', 'client', 'DE121320645', 'Dammstrasse1', '47119 Duisburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'SSV77 TRANS SRL', 'activ', 'client', 'RO32337900', 'J26/1038/2013', 'Sat Voiniceni Com. Ceuasu De Campie, Voiniceni, Nr.269', 'Voiniceni', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'STAVRAKIDIS   STAVROS', 'activ', 'client', 'EL142461436', '68007 ELIA-ORESTIADOS EVROS,GRECIA', '68007 ELIA-ORESTIADOS EVROS', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, email, contact_person)
    VALUES (v_company_id, 'STB-LOGISTICS', 'activ', 'client', 'NL003148530B10', 'DILLEVELD 27', '5467 KK VEGHEL', 'Olanda', '0031614472122', 'info@stb-logistics.com', 'STEFAN BAIJENS')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'STEELCORP DISTRIBUTION SRL', 'activ', 'client', 'RO11528193', 'J24/91/1999', 'Str. Oituz, Nr.6b, Ap.47', 'Baia Mare', 'Maramures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'STEEL TRANS Logistic GmbH Spedition und Transport', 'activ', 'client', 'DE814295360', 'Aldekerker Landstr.61a', 'D-47647 Kerken -Aldekerk', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Ste Transport B.V.', 'activ', 'client', 'NL853943680B01', 'De Grift 39 7711 EP Nieuwleusen', 'Nieuwleusen', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'STM  GROUP Ltd', 'activ', 'client', 'BG201915070', '27,Nedelcho Bonchev,str.fl.3', '1528 SOFIA', 'Bulgaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Stohr Logistik GmbH', 'activ', 'client', 'DE144890607', 'Grundlerstrasse 15', '89616 Rottenacker', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'STS TRANSPORT GMBH', 'activ', 'client', 'ATU57523059', 'GEWERBEPARK 1', 'AT-6300 WORGL', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'S.T.T.L.', 'activ', 'client', '-', 'RUE DE GUAL  156', 'CONAKRY 26547', 'Guineea-Bissau')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SUNBELT RENTALS GmbH', 'activ', 'client', 'DE272283937', 'Brucklesackerstrasse 14', '74248 Ellhofen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'SYKORA PROJECTE s.r.o.', 'activ', 'client', 'SK2121379315', 'Tomcianska cesta 41', '036 01 Martin', 'Slovacia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TACCHINO LOGISTICS SRL', 'activ', 'client', 'RO36506158', 'J40/11865/2016', 'Str. Drumul Gura  Calitei, Nr.4-32, Camera 1, Bl.2, Sc.A, Et.5, Ap.78', 'Sector 3', 'Bucuresti', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, email)
    VALUES (v_company_id, 'TAS Logistik GmbH&Co.', 'activ', 'client', 'DE174113824', 'Kliekener Bahnhofstrasse 10 06869 Coswig ( Anhalt)', 'COSWIG', 'Germania', '034903 / 4997 – 0', 'info@tas-logistik.de')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TdB Bevrachtingen B.V.', 'activ', 'client', 'NL810754034B01', 'De Woerd 1', '4021 CL MAURIK', 'OLANDA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TEAM FREIGHT A/S', 'activ', 'client', 'DK25080742', 'Sp.Mollevej 100', 'DK-6705 Esbjerg', 'Danemarca')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'THITA MACHINERY L.P. FREIGHT FORWARDING SERVICES', 'activ', 'client', 'GR802426912', '9th klm  KARDITSA-ATHENS', '43100 KARDITSA', 'Grecia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Thorsten Kalb TK AGRASERVICES', 'activ', 'client', 'DE294334577', 'Str. Rinnrain 8,', '36088 Hunfeld', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'THRAKS P.C IKE LANDSCAPE SERVICES', 'activ', 'client', 'EL802830804', '68007 DIKAIA EVROS', '68007 DIKAIA', 'EVROS', 'GRECIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'THREE PHARM SRL', 'activ', 'client', 'RO26361386', 'J2009001085267', 'Str. Evreilor Martiri, Nr.4 , C 17 Etaj', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TIRLOG TRANSPORT GMBH', 'activ', 'client', 'ATU63509689', 'PERLMOOSERSTRASSE 17', '6322 KIRCHBICHI', 'AUSTRIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TIR SUN TRANS S.R.L.', 'activ', 'client', 'RO29115904', 'J2011000950260', 'Sat Voiniceni Com. Ceuasu De Campie, Nr.137', 'Voiniceni', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TLC VENLO B.V.', 'activ', 'client', 'NL853658158B01', 'Kruisstraat 4', '5991 EM Baarlo', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TLN EXPOTRANS S.R.L.', 'activ', 'client', 'RO38955978', 'J26/319/2018', 'Sat Sangeorgiu De Mures Com. Sangeorgiu De Mures, Str. Unirii, Nr.864 A, Ap.2', 'Sangeorgiu De Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TODEA ROMEXPRES S.R.L.', 'activ', 'client', 'RO44228184', 'J26/778/2021', 'Sat Nazna Com. Sancraiu De Mures, Str. Mioritei, Nr.14', 'Nazna', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TON AMI PROD SRL', 'activ', 'client', 'RO9101475', 'J1997000013217', 'Str. Gheorghe Lazar, Nr.3, Et.1, Ap.3', 'Slobozia', 'Ialomita', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TOPMAR NEW CARGO SRL', 'activ', 'client', 'RO31119584', 'J03/76/2013', 'str.  FRATII GOLESTI,nr. 19 B ,et. 2,birou 3', 'Pitesti', 'Arges', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TOSALCO SRL', 'activ', 'client', 'RO20923280', 'J35/2971/2008', 'Sat Sacalaz Com. Sacalaz,  , Nr.492/a', 'Sacalaz', 'Timis', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TOTAL N S A SRL', 'activ', 'client', 'RO9315010', 'J32/162/1997', 'Sat Saliste Str. Andrei Saguna, Nr.61', 'Saliste', 'Sibiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRANSALLIANZ INTERNATIONALE SPEDITION GmbH', 'activ', 'client', 'DE812347827', 'MAYBACHSTR. 4', 'D-89233 NEU-ULM', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRANSALL  Internationale SpeditionGmH', 'activ', 'client', 'DE114221739', 'Carl-Benz-Strasse 39-41', '60386 Frankfurt am Main', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRANSALPINA Deutschland GmbH', 'activ', 'client', 'DE813932599', 'WILHELM-MEVIS-PLATZ 5', 'D-50259 PULHEIM', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRANSA SA', 'activ', 'client', 'LU19688921', '41 route du Vin', '5440 Remerschen', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TRANSBENTIA LOGISTIC S.R.L.', 'activ', 'client', 'RO41928000', 'J2019002117265', 'Mun. Targu Mures, Str. Libertatii, Nr.109, Sc.A, Ap.21', 'Tirgu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TRANS COM HE S.R.L.', 'activ', 'client', 'RO1281290', 'J26/295/1992', 'Sat Nazna Com. Sancraiu De Mures, Str. Vadului, Nr.18', 'Nazna', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, country)
    VALUES (v_company_id, 'TransHead Daniel Fijavz  Transport & Logistik GmbH', 'activ', 'client', 'DE331385628', 'HRB 257454', 'OTTOBRUNNER Str. 6', '81737 MUNCHEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Transporte Ralf Bendel', 'activ', 'client', 'DE187989557', 'HAUGENKAMP 3', '48167 MUNSTER', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Transport,Handel & Service Inhaber Alexander Jurges', 'activ', 'client', 'DE261143554', 'Gewerbestrasse 16', '17179 Gnoien', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRANSPORT -LOGISTICA ALPIMAR GmbH', 'activ', 'client', 'DE813090906', 'Kufsteinstrasse 40', 'D-83088 Kiefersfeld', 'GERMANIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Transportowo-Uslugowa TRANSYM  Sylwester Strojec Garnek', 'activ', 'client', 'PL9490636648', 'ul.Poludniowa 22', '42-270 Klomnice', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TRANS VARGA SRL', 'activ', 'client', 'RO15191758', 'J2003000127267', 'Sat Nazna Com. Sancraiu De Mures, Str. Principala, Nr.335', 'Nazna', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TRANS VLAD S.R.L.', 'activ', 'client', 'RO18903478', 'J26/1228/2006', 'Sat Nazna Com. Sancraiu De Mures, Str. Principala, Nr.120', 'Nazna', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'TRAPP INTERNATIONALE SPEDITION  GmbH', 'activ', 'client', 'ATU35108806', 'Schwoll Strasse 3', 'A-5211 Lengau', 'AUSTRIA')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, country)
    VALUES (v_company_id, 'T S C Transport-Service & Logistik GmbH & Co.KG', 'activ', 'client', 'DE812603492', '102/5778/0560', 'Weihersfeld 27a', '41379 BRUGGEN', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'TUDOREANCA S.R.L.', 'activ', 'client', 'RO14122571', 'J2001000561267', 'Str. Rozmarinului, Nr.52, Ap.9', 'Targu Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Tuytel-machinery B.V.', 'activ', 'client', 'NL860840153B01', 'Huizersdijk 20', '4761 PV  Zevenbergen', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'UAB TOMEGRIS', 'activ', 'client', 'LT359815314', 'Tikslo g. 10,Kumpiu k.,', 'LT-54311 Kauno r', 'Lituania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, contact_person)
    VALUES (v_company_id, 'UAB  "UNIKORT"', 'activ', 'client', 'LT242948113', 'P . Luksio g. 32,', '08222 Vilnius', 'Lituania', '+37052741551', 'Aleksandras Ivanovas')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Unitainer Trading GmbH', 'activ', 'client', 'DE118539509', 'Schluisgrove 1', '21107 Hamburg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'UNIVERSAL SPEDITION SRL', 'activ', 'client', 'RO29255614', 'J35/2328/2011', 'Str. Ion Ionescu De La Brad, Nr.29', 'Timisoara', 'Timis', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Universal Transport  Speziallogistik GmbH', 'activ', 'client', 'DE260477892', 'Muhlfeld 27', '96114 Hirschaid', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'UTIL SERV TRUST SRL', 'activ', 'client', 'RO37322170', 'J2017000395203', 'AI.Viitorului,bl.O4', '330141 Deva', 'Hunedoara', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'UTM Universal Transport GmbH', 'activ', 'client', 'DE210700225', 'Borchener Str. 334', '33106 Paderborn', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'VALDEN GROUP INTERNATIONAL SRL', 'activ', 'client', 'RO38290297', 'J03/2384/2017', 'Str. Depozitelor, Nr.3, Bl.Arcadia, Et.8, Ap.57', 'Pitesti', 'Arges', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'VAN DER VLIST LOGISTICS B.V.', 'activ', 'client', 'NL009429487B01', 'WILGENWEG 2,NL-2964', 'AM GROOT AMMERS', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'VAN DER VLIST PROJECTEN B.V.', 'activ', 'client', 'NL008345314B01', 'Wilgenweg 2', '2964 AM GROOT AMMERS', 'Olanda', '0031184606600')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Van der Vlist Speciaal- en Zwaartransport B.V.', 'activ', 'client', 'NL009433685B01', 'Postbus 46', '2964 ZG Groot-Ammers', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Van der Wal  B.V.', 'activ', 'client', 'NL815206379B01', 'Nijverheidsweg 33', '3534 AM Utrecht', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Van Loon XL BV', 'activ', 'client', 'NL856207998B01', 'Hulselsedijk 11A', 'NL-5541 RP Reusel', 'Olanda')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone)
    VALUES (v_company_id, 'VAN WIEREN SPECIAL BV', 'activ', 'client', 'NL809829757B01', 'POSTBUS 1057 8300 BB EMMELOORD', 'BB EMMELOORD', 'Olanda', '+31(0)527634333')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'VASMIR TRANS SRL', 'activ', 'client', 'RO19207300', 'J12/3875/2006', 'Jud. Cluj, Mun. Turda, Str. Avram Iancu, Nr.40, C.P. 401163', 'Turda', 'Cluj', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'VE-Log GmbH', 'activ', 'client', 'DE234415775', 'Sperberweg 13-15', '91056 Erlangen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'VERDINVEST SRL', 'activ', 'client', 'RO12808477', 'J26/163/2000', 'Mun. Targu Mures, Str. Somnului, Nr.11', 'Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'VEROCARGO SP . Z O.O.', 'activ', 'client', 'PL6312642473', '44-100 GLIWICE ul.KAZIMIERZA WIELKIEGO 4', '44-100 GLIWICE POLSKA', 'Polonia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Vexo Spedition GmbH', 'activ', 'client', 'ATU68155809', 'Humerstraße 41', '4063 Hörsching,', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, county, country)
    VALUES (v_company_id, 'Vicvit-Nord SRL', 'activ', 'client', '1017604005710', 'sat. Corjeuti', 'Corjeuti', 'Briceni', 'Republica Moldova')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country, phone, email, contact_person)
    VALUES (v_company_id, 'VINCENTLOGISTICS', 'activ', 'client', 'LU12670962', 'HASSELT,6', '9944 BEILER', 'Luxemburg', '+3242569932', 'account.lu@vincentlogistics.com', 'Pichot Philippe')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'VINGA FARMLAND SRL', 'activ', 'client', 'RO28528112', 'J02/191/2013', 'Sat Vinga Com. Vinga, Vinga, Str.Manasturului Nr.24', 'Vinga', 'Arad', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'V-M Technik Ktt.', 'activ', 'client', 'HU23496415', '8445 Varoslod', '8445 Varoslod', 'Ungaria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'VOLVO ROMANIA SRL', 'activ', 'client', 'RO14545865', 'J52/77/2016', 'Sat Bolintin-Deal Com. Bolintin-Deal, Str. Ithaca, Nr.520', 'Bolintin-Deal', 'Giurgiu', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Vossmann Logistik GmbH', 'activ', 'client', 'DE227597604', 'Am Gewerbering 1', 'D-27243 Prinzhofte', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WAGNER OPTIMIERT', 'activ', 'client', 'ATU74130601', 'WAGNER EUGEN,WIENER STRASSE 114', '2483 EBREICHSDORF', 'Austria')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WALLENBORN TRANSPORT S.A.', 'activ', 'client', 'LU30825649', 'LUX   22, rue GABRIEL LIPPMANN  PARC d''activite SYRDALL 3', 'LU 5365 MUNSBACH', 'Luxemburg')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WALTER F. W. DREWS FUHRGESCHAFT GMBH', 'activ', 'client', 'DE208888596', 'Buchholzstrasse 59', '49377 VECHTA', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Wasse GmbH Spezial- und Schwertransporte', 'activ', 'client', 'DE119956274', 'Gruissem 14', '41516 Grevenbroich', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WAYS Logistics A/S', 'activ', 'client', '40490191', 'Godthabsvej 19', '8660 SKANDERBORG', 'Danemarca')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WEBER Logistics e .Kfm.', 'activ', 'client', 'DE813235013', 'Weixerau Saiblingstr.14', 'Weixerau', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Welex Logistik GmbH', 'activ', 'client', 'DE304591133', 'Wierlauker Weg 39', '59494 Soest-Deiringsen', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WELPA TRANS N.V.', 'activ', 'client', 'BE0425331736', 'Rollebeekstraat 24', '2160  Wommelgem', 'Belgia')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WITSPED Logistik GmbH', 'activ', 'client', 'DE271484501', 'HRB 5718 MARBURG', 'HRB 5718 MARBURG', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'WM  Spedition & Logistik GmbH', 'activ', 'client', 'DE360802698', 'Zeppelinstrasse 4', 'D-72355 Schomberg', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Wormann-Team Ruckbau & Recycling GmbH', 'activ', 'client', 'DE254487868', 'Falkenstrasse 91-97', '33758 Schloss Holte-Stukenbrock', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'XTREME AQUA JET S.R.L.', 'activ', 'client', 'RO43425960', 'J26/1570/2020', 'Sat Sangeorgiu De Mures Com. Sangeorgiu De Mures, Str. Cimpului, Nr.20', 'Sangeorgiu De Mures', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'Yusen Logistics (France) SAS', 'activ', 'client', 'FR89432599785', '69 Route  de Thionville', '57 280 Maizieres-Les-Metz', 'Franta')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ZIEGLER HOLZINDUSTRIE GmbH & Co.KG', 'activ', 'client', 'DE3814945501', 'Zur Betzenmuhle 1', 'D-95703  PLOSSBERG', 'Germania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, registration_number, address, city, county, country)
    VALUES (v_company_id, 'ZOO PROD ANIMAL LIFE SRL', 'activ', 'client', 'RO15607850', 'J26/914/2003', 'Str. Campului, Nr. 89, C.P. 4225', 'Reghin', 'Mures', 'Romania')
    ON CONFLICT DO NOTHING;

    INSERT INTO clients (company_id, company_name, status, client_type, cui, address, city, country)
    VALUES (v_company_id, 'ZTE KATOWICE SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA', 'activ', 'client', 'PL6430010949', 'ul. Bytomska 39 41-103 Siemianowice Slaskie', 'Siemianowice Slaskie', 'Polonia')
    ON CONFLICT DO NOTHING;

END $$;

-- Verificare
SELECT COUNT(*) as total_clienti FROM clients;
