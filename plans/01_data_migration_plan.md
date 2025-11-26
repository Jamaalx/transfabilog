# Transport SaaS - Plan de Migrare Date
## Migrarea Datelor Istorice (01.01.2025 - 01.11.2025)

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft
**Responsabil:** TBD

---

## CUPRINS

1. [Obiective](#1-obiective)
2. [Surse de Date](#2-surse-de-date)
3. [Template-uri Import](#3-template-uri-import)
4. [Proces de Migrare](#4-proces-de-migrare)
5. [Validare și Verificare](#5-validare-și-verificare)
6. [Rollback Strategy](#6-rollback-strategy)
7. [Timeline](#7-timeline)

---

## 1. OBIECTIVE

### 1.1 Scopul Migrării
- Transferul complet al datelor operaționale din sistemele existente (Excel, documente scanate)
- Perioada acoperită: **01.01.2025 - 01.11.2025** (11 luni)
- Zero pierderi de date critice
- Integritate referențială păstrată

### 1.2 Success Criteria
| Criteriu | Target | Măsurare |
|----------|--------|----------|
| Date importate corect | 100% | Checksum + manual sampling |
| Discrepanțe financiare | < 1% | Reconciliere cu totals existente |
| Documente asociate | 100% | Toate documentele linkate la entități |
| Timp total migrare | < 5 zile | Calendar |

---

## 2. SURSE DE DATE

### 2.1 Inventar Surse Existente

| Sursă | Format | Volum Estimat | Prioritate | Responsabil |
|-------|--------|---------------|------------|-------------|
| Liste vehicule | Excel (.xlsx) | ~50 rânduri | HIGH | TBD |
| Liste șoferi | Excel (.xlsx) | ~30 rânduri | HIGH | TBD |
| Registru curse | Excel (.xlsx) | ~2000 rânduri | HIGH | TBD |
| Documente RCA/CASCO/ITP | PDF/JPG | ~200 fișiere | MEDIUM | TBD |
| Facturi SmartBill | API | ~500 facturi | HIGH | Auto-sync |
| Tranzacții combustibil | Excel/CSV | ~5000 rânduri | HIGH | TBD |
| State plată | Excel/PDF | ~30 fișiere | MEDIUM | TBD |
| Date GPS istorice | API/CSV | ~100,000 puncte | LOW | TBD |

### 2.2 Mapping Surse → Tabele

```
SURSE EXISTENTE              TABELE NOI
─────────────────            ──────────────
Liste vehicule          →    truck_heads, trailers
Liste șoferi            →    drivers
Registru curse          →    trips, trip_stops
Documente              →    documents, storage
Facturi SmartBill      →    invoices
Tranzacții combustibil →    transactions
State plată            →    transactions (salary type)
Date GPS               →    gps_data, gps_daily_summary
```

---

## 3. TEMPLATE-URI IMPORT

### 3.1 Template Vehicule (trucks_import.xlsx)

```
Coloană              | Tip       | Obligatoriu | Exemplu            | Validare
---------------------|-----------|-------------|--------------------|-----------
registration_number  | text      | DA          | B-123-ABC          | Regex: ^[A-Z]{1,2}-\d{2,3}-[A-Z]{3}$
vin                  | text      | NU          | WVWZZZ3CZWE123456  | 17 caractere
brand                | text      | NU          | Volvo              | -
model                | text      | NU          | FH16               | -
year                 | number    | NU          | 2020               | 1990-2025
euro_standard        | text      | NU          | Euro 6             | Euro 3-6
purchase_date        | date      | NU          | 2020-03-15         | Format ISO
purchase_price       | number    | NU          | 125000.00          | > 0
current_km           | number    | NU          | 450000             | > 0
status               | text      | NU          | activ              | activ/inactiv/service
gps_provider         | text      | NU          | wialon             | wialon/arobs/volvo/ecomotive
gps_device_id        | text      | NU          | 12345              | -
```

### 3.2 Template Șoferi (drivers_import.xlsx)

```
Coloană              | Tip       | Obligatoriu | Exemplu            | Validare
---------------------|-----------|-------------|--------------------|-----------
first_name           | text      | DA          | Ion                | Min 2 chars
last_name            | text      | DA          | Popescu            | Min 2 chars
cnp                  | text      | NU          | 1850315123456      | 13 cifre, validare CNP
phone                | text      | NU          | 0721123456         | Format RO
email                | text      | NU          | ion@email.com      | Format email
address              | text      | NU          | Str. Exemplu 10    | -
hire_date            | date      | NU          | 2020-01-15         | Format ISO
base_salary          | number    | NU          | 5000.00            | > 0
has_adr              | boolean   | NU          | true               | true/false
adr_expiry_date      | date      | NU          | 2026-03-15         | Format ISO
license_categories   | text      | NU          | C, CE              | -
license_expiry_date  | date      | NU          | 2030-05-20         | Format ISO
```

### 3.3 Template Curse (trips_import.xlsx)

```
Coloană              | Tip       | Obligatoriu | Exemplu            | Validare
---------------------|-----------|-------------|--------------------|-----------
settlement_number    | text      | NU          | D-2025-001         | Nr. decont
truck_registration   | text      | DA          | B-123-ABC          | Match cu trucks
driver_name          | text      | DA          | Ion Popescu        | Match cu drivers
trailer_registration | text      | NU          | B-456-DEF          | Match cu trailers
departure_date       | datetime  | DA          | 2025-01-15 08:00   | Format ISO
return_date          | datetime  | NU          | 2025-01-20 18:00   | Format ISO
from_location        | text      | NU          | București          | -
to_location          | text      | NU          | Berlin             | -
total_km             | number    | NU          | 2500               | > 0
loaded_km            | number    | NU          | 2200               | <= total_km
empty_km             | number    | NU          | 300                | <= total_km
days_romania         | number    | NU          | 1                  | >= 0
days_abroad          | number    | NU          | 4                  | >= 0
revenue_amount       | number    | NU          | 2500.00            | > 0
revenue_currency     | text      | NU          | EUR                | EUR/RON/USD
diurna_total         | number    | NU          | 435.00             | >= 0
notes                | text      | NU          | Marfă ADR          | -
```

### 3.4 Template Tranzacții (transactions_import.xlsx)

```
Coloană              | Tip       | Obligatoriu | Exemplu            | Validare
---------------------|-----------|-------------|--------------------|-----------
transaction_date     | date      | DA          | 2025-01-15         | Format ISO
type                 | text      | DA          | combustibil        | Enum values
truck_registration   | text      | NU          | B-123-ABC          | Match cu trucks
driver_name          | text      | NU          | Ion Popescu        | Match cu drivers
amount               | number    | DA          | 500.00             | != 0
currency             | text      | NU          | EUR                | EUR/RON
fuel_liters          | number    | NU          | 200.5              | > 0 (doar pt combustibil)
fuel_station         | text      | NU          | Shell Berlin       | -
fuel_country         | text      | NU          | Germania           | -
source               | text      | NU          | DKV                | DKV/Eurowag/Manual
description          | text      | NU          | Alimentare autostradă | -
```

---

## 4. PROCES DE MIGRARE

### 4.1 Faze de Migrare

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCES DE MIGRARE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FAZA 1: PREGĂTIRE (2 zile)                                    │
│  ├── Colectare toate fișierele Excel                           │
│  ├── Scanare documente lipsă                                   │
│  ├── Completare date lipsă                                     │
│  └── Validare formate                                          │
│                                                                 │
│  FAZA 2: CURĂȚARE (1 zi)                                       │
│  ├── Standardizare formate date                                │
│  ├── Eliminare duplicate                                        │
│  ├── Corecție erori evidente                                   │
│  └── Generare raport discrepanțe                               │
│                                                                 │
│  FAZA 3: IMPORT (1 zi)                                         │
│  ├── Import în ordine: Companies → Trucks → Trailers           │
│  ├── → Drivers → Trips → Transactions                          │
│  ├── Upload documente                                          │
│  └── Link documente la entități                                │
│                                                                 │
│  FAZA 4: VALIDARE (1 zi)                                       │
│  ├── Verificare integritate referențială                       │
│  ├── Reconciliere totals                                       │
│  ├── Sampling manual (5%)                                      │
│  └── Sign-off final                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Ordinea de Import

**IMPORTANT**: Ordinea este critică pentru integritate referențială!

```
1. companies         (fără dependențe)
2. truck_heads       (→ companies)
3. trailers          (→ companies)
4. drivers           (→ companies)
5. fuel_card_mappings (→ truck_heads, drivers)
6. trips             (→ truck_heads, trailers, drivers)
7. trip_stops        (→ trips)
8. documents         (→ truck_heads, trailers, drivers)
9. transactions      (→ truck_heads, trailers, drivers, trips)
10. invoices         (→ trips)
```

### 4.3 Script de Import (Node.js)

```javascript
// scripts/migrate.js
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateData() {
  const companyId = 'your-company-uuid';

  console.log('🚀 Starting migration...');

  // 1. Import Trucks
  console.log('📦 Importing trucks...');
  const trucks = await importTrucks('./data/trucks_import.xlsx', companyId);
  console.log(`   ✅ Imported ${trucks.length} trucks`);

  // 2. Import Trailers
  console.log('📦 Importing trailers...');
  const trailers = await importTrailers('./data/trailers_import.xlsx', companyId);
  console.log(`   ✅ Imported ${trailers.length} trailers`);

  // 3. Import Drivers
  console.log('👤 Importing drivers...');
  const drivers = await importDrivers('./data/drivers_import.xlsx', companyId);
  console.log(`   ✅ Imported ${drivers.length} drivers`);

  // 4. Import Trips
  console.log('🚛 Importing trips...');
  const trips = await importTrips('./data/trips_import.xlsx', companyId, {
    trucks, trailers, drivers
  });
  console.log(`   ✅ Imported ${trips.length} trips`);

  // 5. Import Transactions
  console.log('💰 Importing transactions...');
  const transactions = await importTransactions('./data/transactions_import.xlsx', companyId, {
    trucks, drivers, trips
  });
  console.log(`   ✅ Imported ${transactions.length} transactions`);

  console.log('✅ Migration complete!');
}

async function importTrucks(filePath, companyId) {
  const workbook = xlsx.readFile(filePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  const results = [];
  for (const row of data) {
    const truck = {
      company_id: companyId,
      registration_number: row.registration_number.trim().toUpperCase(),
      vin: row.vin || null,
      brand: row.brand || null,
      model: row.model || null,
      year: parseInt(row.year) || null,
      euro_standard: row.euro_standard || null,
      purchase_date: row.purchase_date || null,
      purchase_price: parseFloat(row.purchase_price) || null,
      current_km: parseInt(row.current_km) || 0,
      status: row.status || 'activ',
      gps_provider: row.gps_provider || null,
      gps_device_id: row.gps_device_id || null
    };

    const { data, error } = await supabase
      .from('truck_heads')
      .upsert(truck, { onConflict: 'registration_number' })
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Error importing ${row.registration_number}:`, error.message);
    } else {
      results.push(data);
    }
  }

  return results;
}

// Similar functions for other entities...
```

---

## 5. VALIDARE ȘI VERIFICARE

### 5.1 Checklist Pre-Import

```
□ Toate fișierele Excel sunt în format corect
□ Nu există celule goale în coloanele obligatorii
□ Numerele de înmatriculare sunt unice și valide
□ CNP-urile șoferilor sunt valide (unde există)
□ Datele sunt în format ISO (YYYY-MM-DD)
□ Sumele sunt în format numeric (fără caractere)
□ Backup-ul sistemului vechi este făcut
```

### 5.2 Verificări Post-Import

| Verificare | Query SQL | Expected |
|------------|-----------|----------|
| Count trucks | `SELECT COUNT(*) FROM truck_heads` | = rânduri Excel |
| Count drivers | `SELECT COUNT(*) FROM drivers` | = rânduri Excel |
| Count trips | `SELECT COUNT(*) FROM trips` | = rânduri Excel |
| Sum revenues | `SELECT SUM(revenue_amount_ron) FROM trips` | ≈ total Excel |
| Sum transactions | `SELECT SUM(amount_ron) FROM transactions` | ≈ total Excel |
| Orphan trips | `SELECT * FROM trips WHERE truck_head_id IS NULL` | 0 rows |
| Orphan transactions | `SELECT * FROM transactions WHERE entity_id IS NULL AND is_matched = false` | Minimal |

### 5.3 Raport de Reconciliere

```sql
-- Generare raport reconciliere
SELECT
  'Trucks' as entity,
  (SELECT COUNT(*) FROM truck_heads) as db_count,
  50 as excel_count, -- înlocuiește cu valoarea reală
  (SELECT COUNT(*) FROM truck_heads) - 50 as difference
UNION ALL
SELECT
  'Drivers',
  (SELECT COUNT(*) FROM drivers),
  30,
  (SELECT COUNT(*) FROM drivers) - 30
UNION ALL
SELECT
  'Trips',
  (SELECT COUNT(*) FROM trips),
  2000,
  (SELECT COUNT(*) FROM trips) - 2000
UNION ALL
SELECT
  'Transactions',
  (SELECT COUNT(*) FROM transactions),
  5000,
  (SELECT COUNT(*) FROM transactions) - 5000;
```

---

## 6. ROLLBACK STRATEGY

### 6.1 Backup Pre-Migrare

```bash
# Backup complet înainte de migrare
pg_dump -h db.supabase.co -U postgres -d postgres \
  --clean --if-exists \
  -f backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 6.2 Procedură Rollback

```
SCENARII ROLLBACK:
─────────────────────────────────────────────────────────────
1. Erori minore (< 5% date afectate)
   → Fix manual, nu rollback complet

2. Erori moderate (5-20% date afectate)
   → Truncate tabelele afectate
   → Re-import doar datele corecte

3. Erori majore (> 20% date afectate)
   → Rollback complet din backup
   → Investigare cauză
   → Re-planificare migrare
─────────────────────────────────────────────────────────────
```

### 6.3 Script Rollback

```sql
-- ATENȚIE: Execută doar în caz de eșec major!
-- Ordinea inversă a importului

BEGIN;

-- 1. Șterge transactions
DELETE FROM transactions WHERE company_id = 'your-company-uuid';

-- 2. Șterge invoices
DELETE FROM invoices WHERE company_id = 'your-company-uuid';

-- 3. Șterge trip_stops
DELETE FROM trip_stops WHERE trip_id IN (
  SELECT id FROM trips WHERE company_id = 'your-company-uuid'
);

-- 4. Șterge trips
DELETE FROM trips WHERE company_id = 'your-company-uuid';

-- 5. Șterge documents
DELETE FROM documents WHERE company_id = 'your-company-uuid';

-- 6. Șterge drivers
DELETE FROM drivers WHERE company_id = 'your-company-uuid';

-- 7. Șterge trailers
DELETE FROM trailers WHERE company_id = 'your-company-uuid';

-- 8. Șterge trucks
DELETE FROM truck_heads WHERE company_id = 'your-company-uuid';

COMMIT;
```

---

## 7. TIMELINE

### 7.1 Calendar Migrare

```
┌──────────────────────────────────────────────────────────────┐
│                     TIMELINE MIGRARE                         │
├──────────┬───────────────────────────────────────────────────┤
│ Ziua 1   │ Colectare date, verificare completitudine         │
│ Ziua 2   │ Curățare date, standardizare formate              │
│ Ziua 3   │ Import Master Data (trucks, trailers, drivers)    │
│ Ziua 4   │ Import Operational Data (trips, transactions)     │
│ Ziua 5   │ Validare, reconciliere, sign-off                  │
└──────────┴───────────────────────────────────────────────────┘
```

### 7.2 Responsabilități

| Rol | Responsabilități |
|-----|------------------|
| Project Manager | Coordonare, timeline, escalări |
| Data Owner | Furnizare date, validare completitudine |
| Developer | Scripturi import, debugging |
| QA | Verificare date, rapoarte reconciliere |
| Business User | Sampling, sign-off final |

---

## ANEXE

### A. Checklist Final

```
PRE-MIGRARE:
□ Toate fișierele colectate și validate
□ Backup sistem vechi făcut
□ Scripturi de import testate pe date sample
□ Rollback plan documentat
□ Toți stakeholders informați

MIGRARE:
□ Import executat în ordinea corectă
□ Logs verificate pentru erori
□ Documente uploadate și linkate

POST-MIGRARE:
□ Reconciliere completă executată
□ Discrepanțe investigate și rezolvate
□ Sampling manual făcut (min 5%)
□ Sign-off de la Business Owner
□ Documentație actualizată
```

### B. Contact Escalare

| Problemă | Contact | Timp Răspuns |
|----------|---------|--------------|
| Erori import | Developer Lead | 1 oră |
| Date lipsă | Data Owner | 2 ore |
| Decizie rollback | Project Manager | 30 min |
| Go/No-Go | Business Owner | 1 oră |
