# TRANSPORT SaaS - PLAN COMPLET DE IMPLEMENTARE
## Document Tehnic pentru Dezvoltare

---

# 📋 1. DESPRE PROIECT

## 1.1 Descriere
SaaS pentru managementul unei flote de transport. Centralizează datele financiare, operaționale și de cheltuieli din multiple surse externe, oferind rapoarte și analize pe 3 variabile principale: **Cap de Remorcă**, **Șofer**, **Remorcă**.

## 1.2 Surse de Date Externe
| Sursă | Tip | Date |
|-------|-----|------|
| SmartBill | API | Facturi emise/primite |
| Banca Transilvania | API PSD2 | Tranzacții bancare |
| DKV | API | Combustibil |
| Eurowag | API | Combustibil |
| Verag | CSV din Gmail | Combustibil |
| Sprint Diesel | PDF din Gmail | Combustibil |
| Wialon | API | GPS tracking |
| AROBS | API | GPS tracking |
| Volvo | API | GPS tracking |
| Ecomotive | API | GPS tracking |
| Google Drive | API | Documente, state plată |
| Gmail | API | Documente, facturi |

## 1.3 Logica de Business
Sistemul permite combinații flexibile între cele 3 entități principale pentru rapoarte:
- Un șofer poate conduce diferite capuri de remorcă într-o lună
- Un cap de remorcă poate avea diferite remorci atașate
- Fiecare entitate are costuri și documente proprii
- Rapoartele pot fi generate per entitate sau combinații

---

# 🛠️ 2. STACK TEHNOLOGIC

## 2.1 Backend
```
Node.js + Express.js
├── @supabase/supabase-js - Database client
├── cors - CORS middleware
├── dotenv - Environment variables
├── express-rate-limit - Rate limiting
├── multer - File uploads
├── node-cron - Scheduled jobs
├── axios - External API calls
├── pdf-parse - PDF parsing
├── csv-parser - CSV parsing
├── googleapis - Gmail/Drive API
└── nodemon - Development
```

## 2.2 Frontend
```
React 18+ (Vite)
├── react-router-dom v6 - Routing
├── @reduxjs/toolkit - Global state
├── @tanstack/react-query - Server state & cache
├── @supabase/supabase-js - Auth & realtime
├── tailwindcss - Styling
├── shadcn/ui (@radix-ui) - Components
├── react-hook-form - Forms
├── zod - Validation
├── recharts - Charts
├── leaflet + react-leaflet - Maps
├── @tanstack/react-table - Tables
├── date-fns - Date utils
├── react-hot-toast - Notifications
├── lucide-react - Icons
└── axios - API calls
```

## 2.3 Database & Infrastructure
```
Supabase (PostgreSQL)
├── Database hosting
├── Authentication
├── Row Level Security
├── Realtime subscriptions
├── Storage (documents)
└── Edge Functions (optional)
```

---

# 🗄️ 3. SCHEMA BAZEI DE DATE

## 3.1 Tabele Principale (26 total)

### Core Entities
```sql
-- Companies (multi-tenant ready)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cui VARCHAR(20) UNIQUE,
    reg_com VARCHAR(50),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Truck Heads (Capuri de Remorcă)
CREATE TABLE truck_heads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(50),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    euro_standard VARCHAR(10),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    current_km INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'activ', -- activ, inactiv, service, avariat
    gps_provider VARCHAR(50), -- wialon, arobs, volvo, ecomotive
    gps_device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trailers (Remorci)
CREATE TABLE trailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(50),
    type VARCHAR(50), -- prelata, frigorific, cisterna
    capacity_tons DECIMAL(10,2),
    volume_m3 DECIMAL(10,2),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'activ',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Drivers (Șoferi)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cnp VARCHAR(13) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    hire_date DATE,
    termination_date DATE,
    base_salary DECIMAL(10,2),
    has_adr BOOLEAN DEFAULT FALSE,
    adr_expiry_date DATE,
    license_categories VARCHAR(50),
    license_expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trips (Curse)
```sql
-- Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    truck_head_id UUID REFERENCES truck_heads(id),
    trailer_id UUID REFERENCES trailers(id),
    driver_id UUID REFERENCES drivers(id),
    
    -- Trip info
    trip_type VARCHAR(20) NOT NULL, -- simpla, complexa
    settlement_number VARCHAR(50), -- Nr. Decont
    departure_date TIMESTAMP,
    return_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
    
    -- Route info (for simple trips)
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    
    -- Kilometers
    total_km INTEGER,
    loaded_km INTEGER,
    empty_km INTEGER,
    
    -- Days tracking
    days_romania INTEGER DEFAULT 0,
    days_abroad INTEGER DEFAULT 0,
    
    -- Revenue
    revenue_amount DECIMAL(15,2),
    revenue_currency VARCHAR(3) DEFAULT 'EUR',
    exchange_rate DECIMAL(10,4),
    revenue_amount_ron DECIMAL(15,2),
    
    -- Diurna
    diurna_per_day DECIMAL(10,2),
    diurna_currency VARCHAR(3) DEFAULT 'EUR',
    diurna_total DECIMAL(15,2),
    
    -- Profit calculation (auto-computed)
    total_costs DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trip Stops (for complex trips)
CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    stop_type VARCHAR(20), -- pickup, dropoff, rest, customs
    location_name VARCHAR(255),
    location_address TEXT,
    country VARCHAR(100),
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    cargo_description TEXT,
    weight_tons DECIMAL(10,2),
    km_from_previous INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Documents
```sql
-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    -- Polymorphic association
    entity_type VARCHAR(20) NOT NULL, -- truck_head, trailer, driver
    entity_id UUID NOT NULL,
    
    document_type VARCHAR(50) NOT NULL, 
    -- Types: rca, casco, itp, tahograf, licenta_transport, adr, cim, leasing, credit
    
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    amount DECIMAL(15,2), -- Cost (for insurance, leasing)
    currency VARCHAR(3) DEFAULT 'RON',
    payment_frequency VARCHAR(20), -- annual, semi-annual, quarterly, monthly
    
    file_url TEXT,
    file_name VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'valid', -- valid, expiring_soon, expired, pending
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);
```

### Transactions
```sql
-- Transactions (toate tranzacțiile financiare)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    -- Polymorphic link
    entity_type VARCHAR(20), -- truck_head, trailer, driver, trip
    entity_id UUID,
    trip_id UUID REFERENCES trips(id),
    
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    -- Types: combustibil, amenda, taxa_drum, autorizatie, reparatie, 
    --        parcare, spalatorie, salariu, diurna, leasing, asigurare, altele
    
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RON',
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    amount_ron DECIMAL(15,2),
    
    -- Source tracking
    source_system VARCHAR(50), -- DKV, Eurowag, BT, SmartBill, manual
    external_id VARCHAR(100),
    
    -- Fuel specific
    fuel_liters DECIMAL(10,2),
    fuel_price_per_liter DECIMAL(10,4),
    fuel_station VARCHAR(255),
    fuel_country VARCHAR(100),
    
    -- Matching
    is_matched BOOLEAN DEFAULT FALSE,
    matched_by UUID,
    matched_at TIMESTAMP,
    
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_entity ON transactions(entity_type, entity_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_source ON transactions(source_system);
CREATE INDEX idx_transactions_unmatched ON transactions(is_matched) WHERE is_matched = FALSE;
```

### GPS & Sync
```sql
-- GPS Data
CREATE TABLE gps_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_head_id UUID REFERENCES truck_heads(id),
    
    timestamp TIMESTAMP NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    speed INTEGER, -- km/h
    heading INTEGER, -- degrees
    altitude INTEGER, -- meters
    
    engine_on BOOLEAN,
    ignition_on BOOLEAN,
    odometer INTEGER,
    fuel_level DECIMAL(5,2),
    
    source VARCHAR(50), -- wialon, arobs, volvo, ecomotive
    raw_data JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gps_truck_time ON gps_data(truck_head_id, timestamp DESC);

-- GPS Daily Summary
CREATE TABLE gps_daily_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_head_id UUID REFERENCES truck_heads(id),
    date DATE NOT NULL,
    
    total_km INTEGER,
    driving_time_minutes INTEGER,
    idle_time_minutes INTEGER,
    stop_count INTEGER,
    
    avg_speed DECIMAL(5,2),
    max_speed INTEGER,
    fuel_consumed DECIMAL(10,2),
    
    start_location TEXT,
    end_location TEXT,
    countries_visited TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(truck_head_id, date)
);

-- API Configurations
CREATE TABLE api_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    api_name VARCHAR(50) NOT NULL, -- smartbill, bt, dkv, eurowag, wialon, etc
    api_key TEXT,
    api_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    
    config JSONB, -- Additional config (endpoints, client_id, etc)
    
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(20), -- success, failed, in_progress
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync Logs
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    source VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    
    status VARCHAR(20), -- success, failed, partial
    records_processed INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    errors JSONB,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Alerts & Users
```sql
-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    alert_type VARCHAR(50) NOT NULL,
    -- Types: document_expiry, service_due, license_expiry, low_fuel, 
    --        geofence_violation, speeding, unmatched_transaction
    
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    entity_type VARCHAR(20),
    entity_id UUID,
    
    due_date DATE,
    status VARCHAR(20) DEFAULT 'new', -- new, viewed, resolved, dismissed
    
    viewed_at TIMESTAMP,
    viewed_by UUID,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON alerts(status, priority);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id),
    
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    
    role VARCHAR(20) DEFAULT 'operator', -- admin, manager, operator, viewer
    permissions JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fuel Card Mappings
CREATE TABLE fuel_card_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    card_number VARCHAR(50) NOT NULL,
    card_provider VARCHAR(50), -- DKV, Eurowag
    truck_head_id UUID REFERENCES truck_heads(id),
    driver_id UUID REFERENCES drivers(id),
    
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(card_number, card_provider)
);

-- Invoices (from SmartBill)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    
    invoice_type VARCHAR(20), -- emisa, primita
    invoice_number VARCHAR(50),
    invoice_date DATE,
    due_date DATE,
    
    client_name VARCHAR(255),
    client_cui VARCHAR(20),
    
    subtotal DECIMAL(15,2),
    vat_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'RON',
    
    status VARCHAR(20), -- draft, sent, paid, cancelled
    
    smartbill_id VARCHAR(100),
    pdf_url TEXT,
    
    -- Link to trip if applicable
    trip_id UUID REFERENCES trips(id),
    
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Additional Tables
```sql
-- Exchange Rates (for currency conversion)
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL,
    rate_to_ron DECIMAL(10,4) NOT NULL,
    source VARCHAR(50) DEFAULT 'BNR',
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(date, currency)
);

-- Settings
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) UNIQUE,
    
    default_currency VARCHAR(3) DEFAULT 'RON',
    default_diurna_romania DECIMAL(10,2) DEFAULT 57,
    default_diurna_abroad DECIMAL(10,2) DEFAULT 87,
    
    fuel_consumption_target DECIMAL(5,2) DEFAULT 32, -- l/100km
    document_expiry_warning_days INTEGER DEFAULT 30,
    
    sync_schedule JSONB, -- Cron schedules for each source
    notification_settings JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(50) NOT NULL, -- create, update, delete
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 🔌 4. API ENDPOINTS

## 4.1 Structura API

```
/api/v1/
├── /auth                 - Autentificare
├── /companies            - Management companii
├── /vehicles
│   ├── /trucks          - Capuri de remorcă
│   ├── /trailers        - Remorci
│   └── /gps             - Date GPS
├── /drivers             - Șoferi
├── /trips               - Curse
├── /documents           - Documente
├── /transactions        - Tranzacții
├── /invoices            - Facturi
├── /reports             - Rapoarte
├── /sync                - Sincronizare externe
├── /alerts              - Alerte
└── /dashboard           - Date dashboard
```

## 4.2 Auth Endpoints
```javascript
POST   /api/v1/auth/login          // Login cu Supabase
POST   /api/v1/auth/logout         // Logout
POST   /api/v1/auth/refresh        // Refresh token
GET    /api/v1/auth/me             // User curent
```

## 4.3 Vehicles Endpoints
```javascript
// Trucks
GET    /api/v1/vehicles/trucks                    // List cu filtre, pagination
GET    /api/v1/vehicles/trucks/:id                // Detalii + docs + costs
POST   /api/v1/vehicles/trucks                    // Crează truck
PUT    /api/v1/vehicles/trucks/:id                // Update
DELETE /api/v1/vehicles/trucks/:id                // Soft delete

// Trailers
GET    /api/v1/vehicles/trailers                  // List
GET    /api/v1/vehicles/trailers/:id              // Detalii
POST   /api/v1/vehicles/trailers                  // Crează
PUT    /api/v1/vehicles/trailers/:id              // Update

// GPS
GET    /api/v1/vehicles/gps/current               // Poziții curente toate
GET    /api/v1/vehicles/trucks/:id/gps            // Istoric GPS per truck
GET    /api/v1/vehicles/trucks/:id/gps/summary    // Summary zilnic
```

## 4.4 Drivers Endpoints
```javascript
GET    /api/v1/drivers                   // List cu filtre
GET    /api/v1/drivers/:id               // Detalii + stats + docs
POST   /api/v1/drivers                   // Crează
PUT    /api/v1/drivers/:id               // Update
DELETE /api/v1/drivers/:id               // Soft delete (is_active = false)
```

## 4.5 Trips Endpoints
```javascript
GET    /api/v1/trips                     // List cu filtre avansate
GET    /api/v1/trips/:id                 // Detalii complete + stops + costs
POST   /api/v1/trips/simple              // Cursă simplă
POST   /api/v1/trips/complex             // Cursă complexă cu stops
PUT    /api/v1/trips/:id                 // Update
POST   /api/v1/trips/:id/stops           // Adaugă stop
PUT    /api/v1/trips/:id/stops/:stopId   // Update stop
DELETE /api/v1/trips/:id/stops/:stopId   // Șterge stop
GET    /api/v1/trips/:id/profitability   // Calcul profit detaliat
POST   /api/v1/trips/:id/complete        // Marchează completă
```

## 4.6 Documents Endpoints
```javascript
GET    /api/v1/documents                 // List cu filtre
GET    /api/v1/documents/expiring        // Documente care expiră (default 30 zile)
GET    /api/v1/documents/:id             // Detalii document
POST   /api/v1/documents                 // Upload document (FormData)
PUT    /api/v1/documents/:id             // Update metadata
DELETE /api/v1/documents/:id             // Șterge
```

## 4.7 Transactions Endpoints
```javascript
GET    /api/v1/transactions              // List cu filtre
GET    /api/v1/transactions/unmatched    // Tranzacții nepotrivite + sugestii
GET    /api/v1/transactions/:id          // Detalii
POST   /api/v1/transactions              // Crează manual
PUT    /api/v1/transactions/:id          // Update
POST   /api/v1/transactions/:id/match    // Potrivește cu entitate
POST   /api/v1/transactions/import       // Import bulk (CSV/Excel)
```

## 4.8 Reports Endpoints
```javascript
GET    /api/v1/reports/profit/vehicles   // Profit per vehicul
GET    /api/v1/reports/profit/drivers    // Profit per șofer
GET    /api/v1/reports/fuel-consumption  // Consum combustibil
GET    /api/v1/reports/trips/statistics  // Statistici curse
GET    /api/v1/reports/costs/breakdown   // Defalcare costuri
GET    /api/v1/reports/export            // Export Excel/CSV/PDF
```

## 4.9 Sync Endpoints
```javascript
POST   /api/v1/sync/:source              // Sync manual (smartbill, bt, dkv, etc)
GET    /api/v1/sync/status               // Status toate sursele
PUT    /api/v1/sync/:source/config       // Configurare sursă
GET    /api/v1/sync/logs                 // Istoric sync-uri
```

## 4.10 Dashboard Endpoints
```javascript
GET    /api/v1/dashboard                 // Date principale dashboard
GET    /api/v1/dashboard/map             // Date pentru hartă GPS
WS     /api/v1/dashboard/realtime        // WebSocket pentru updates live
```

## 4.11 Alerts Endpoints
```javascript
GET    /api/v1/alerts                    // List alerte active
PATCH  /api/v1/alerts/:id/view           // Marchează văzută
PATCH  /api/v1/alerts/:id/resolve        // Rezolvă
POST   /api/v1/alerts                    // Crează alertă manuală
```

---

# 🎨 5. FRONTEND ARCHITECTURE

## 5.1 Structura Folder
```
/src
├── /api                    # API clients
│   ├── supabaseClient.js
│   ├── apiClient.js        # Axios instance
│   └── endpoints/          # API call functions
├── /components
│   ├── /common             # Button, Card, Modal, Table, etc.
│   ├── /layout             # AppLayout, Sidebar, Header
│   ├── /dashboard
│   ├── /vehicles
│   ├── /drivers
│   ├── /trips
│   ├── /documents
│   ├── /finance
│   └── /reports
├── /features               # Redux slices
│   ├── auth/
│   ├── vehicles/
│   ├── drivers/
│   ├── trips/
│   └── ui/
├── /hooks                  # Custom hooks
│   ├── useAuth.js
│   ├── useVehicles.js
│   └── ...
├── /pages                  # Route pages
├── /utils                  # Helpers
├── /styles                 # Global styles
├── App.jsx
├── main.jsx
└── routes.jsx
```

## 5.2 Routes Structure
```javascript
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginPage, public: true },
  
  { path: '/dashboard', component: DashboardPage },
  
  // Vehicles
  { path: '/vehicles/trucks', component: TruckListPage },
  { path: '/vehicles/trucks/new', component: TruckFormPage },
  { path: '/vehicles/trucks/:id', component: TruckDetailsPage },
  { path: '/vehicles/trailers', component: TrailerListPage },
  { path: '/vehicles/gps-tracking', component: GPSTrackingPage },
  
  // Drivers
  { path: '/drivers', component: DriverListPage },
  { path: '/drivers/new', component: DriverFormPage },
  { path: '/drivers/:id', component: DriverDetailsPage },
  
  // Trips
  { path: '/trips/active', component: ActiveTripsPage },
  { path: '/trips/history', component: TripHistoryPage },
  { path: '/trips/new-simple', component: SimpleTripFormPage },
  { path: '/trips/new-complex', component: ComplexTripFormPage },
  { path: '/trips/:id', component: TripDetailsPage },
  
  // Documents
  { path: '/documents/expiring', component: ExpiringDocsPage },
  { path: '/documents/by-entity', component: DocsByEntityPage },
  { path: '/documents/upload', component: UploadDocPage },
  
  // Finance
  { path: '/finance/transactions', component: TransactionsPage },
  { path: '/finance/unmatched', component: UnmatchedPage },
  { path: '/finance/invoices', component: InvoicesPage },
  { path: '/finance/costs', component: CostsAnalysisPage },
  
  // Reports
  { path: '/reports/profit', component: ProfitReportPage },
  { path: '/reports/fuel', component: FuelReportPage },
  { path: '/reports/trips', component: TripStatsPage },
  { path: '/reports/export', component: ExportPage },
  
  // Settings
  { path: '/settings/company', component: CompanySettingsPage },
  { path: '/settings/integrations', component: IntegrationsPage },
  { path: '/settings/users', component: UsersPage },
  { path: '/settings/alerts', component: AlertSettingsPage },
];
```

## 5.3 Componente Principale

### Dashboard
```
DashboardPage/
├── StatsGrid           - 4 carduri: vehicule, șoferi, curse, km
├── RevenueChart        - Grafic venituri 30 zile (Recharts)
├── LiveVehicleMap      - Hartă cu poziții GPS (Leaflet)
├── AlertsWidget        - Top 5 alerte active
├── TripsFeed           - Ultimele 5 curse
└── FuelConsumptionMini - Mini grafic consum
```

### Vehicle Components
```
VehicleModule/
├── VehicleList         - Tabel cu pagination, filtre, search
├── VehicleCard         - Card pentru grid view
├── VehicleDetails      - Pagină completă cu tabs
├── VehicleForm         - Formular add/edit
├── VehicleDocuments    - Secțiune documente
├── VehicleCosts        - Grafic costuri per tip
├── VehicleTrips        - Istoric curse
└── VehicleGPSTracker   - Tracking live individual
```

### Trip Components
```
TripModule/
├── TripList            - Tabel curse cu filtre
├── SimpleTripForm      - Formular cursă simplă
│   └── Fields: truck, driver, trailer, dates, km, revenue, diurnă
├── ComplexTripForm     - Wizard 4 steps
│   ├── Step1: BasicInfo (truck, driver, trailer, dates)
│   ├── Step2: StopsManager (add/edit/reorder stops)
│   ├── Step3: Documents (upload CMR, etc)
│   └── Step4: Summary (review & submit)
├── TripDetails         - Detalii complete
├── TripMap             - Hartă cu ruta și stops
├── TripProfitability   - Calcul profit detaliat
└── TripTimeline        - Timeline opriri
```

### Finance Components
```
FinanceModule/
├── TransactionList     - Toate tranzacțiile
├── TransactionFilters  - Filtre avansate
├── UnmatchedList       - Tranzacții nepotrivite
├── MatchingModal       - UI pentru matching manual
├── InvoiceList         - Facturi SmartBill
├── CostBreakdown       - Defalcare costuri
└── BulkImport          - Import CSV/Excel
```

## 5.4 State Management

### Redux Store
```javascript
store/
├── auth/           - User, session, permissions
├── company/        - Company settings
├── vehicles/       - Cache trucks & trailers
├── drivers/        - Cache drivers
├── alerts/         - Active alerts
└── ui/             - Sidebar state, modals, theme
```

### React Query (Server State)
```javascript
// Custom hooks
useVehicles(filters)     // List cu cache
useVehicle(id)           // Detalii vehicul
useDrivers(filters)
useDriver(id)
useTrips(filters)
useTrip(id)
useDocuments(entityType, entityId)
useTransactions(filters)
useReports(type, params)
useRealtime(channel)     // Supabase realtime
```

## 5.5 Design System

### Culori
```css
--primary:    #3B82F6;    /* Blue 500 */
--secondary:  #10B981;    /* Emerald 500 */
--danger:     #EF4444;    /* Red 500 */
--warning:    #F59E0B;    /* Amber 500 */
--success:    #10B981;    /* Emerald 500 */
--neutral:    #6B7280;    /* Gray 500 */
--background: #F9FAFB;    /* Gray 50 */
--surface:    #FFFFFF;
--border:     #E5E7EB;    /* Gray 200 */
```

### Tipografie
```css
font-family: 'Inter', system-ui, sans-serif;

/* Headings */
h1: 2.5rem/Bold
h2: 2rem/Semibold
h3: 1.5rem/Semibold
h4: 1.25rem/Medium

/* Body */
large: 1.125rem
base: 1rem
small: 0.875rem
tiny: 0.75rem
```

---

# 🔗 6. INTEGRĂRI EXTERNE

## 6.1 SmartBill API

### Setup
```javascript
// config/smartbill.js
const SMARTBILL_CONFIG = {
  baseUrl: 'https://ws.smartbill.ro/SBORO/api',
  rateLimit: { requests: 30, period: 10000 }, // 30 req/10 sec
};

// Headers
{
  'Authorization': 'Basic ' + btoa(username + ':' + token),
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Endpoints Folosite
```javascript
// Facturi emise
GET /invoice?cif={CUI}&startDate={date}&endDate={date}

// Facturi primite
GET /invoice/paymentsList?cif={CUI}

// Download PDF
GET /invoice/pdf?cif={CUI}&seriesname={series}&number={number}
```

### Sync Logic
```javascript
async function syncSmartBill(companyId, startDate, endDate) {
  // 1. Get issued invoices
  const issuedInvoices = await smartbillApi.getInvoices(startDate, endDate);
  
  // 2. For each invoice
  for (const invoice of issuedInvoices) {
    // Check if exists
    const existing = await db.invoices.findByExternalId(invoice.number);
    if (existing) continue;
    
    // Insert
    await db.invoices.create({
      company_id: companyId,
      invoice_type: 'emisa',
      invoice_number: invoice.number,
      invoice_date: invoice.date,
      client_name: invoice.client.name,
      client_cui: invoice.client.vatCode,
      total_amount: invoice.total,
      currency: invoice.currency,
      smartbill_id: invoice.number,
      // ... rest of fields
    });
  }
  
  return { processed: issuedInvoices.length };
}
```

## 6.2 Banca Transilvania PSD2 API

### Requirements
- Înregistrare aplicație TPP
- Certificate eIDAS (QWAC, QSEAL)
- OAuth2 consent flow

### Endpoints
```javascript
// Consent
POST /v1/consents              // Request consent
GET  /v1/consents/{consentId}  // Get consent status

// Accounts
GET /v1/accounts               // List accounts
GET /v1/accounts/{id}/balances // Account balance
GET /v1/accounts/{id}/transactions // Transactions
```

### Sync Logic
```javascript
async function syncBTTransactions(companyId, accountId, fromDate) {
  // 1. Check consent is valid
  const consent = await btApi.getConsent(consentId);
  if (consent.status !== 'valid') {
    throw new Error('Consent expired - need user re-authorization');
  }
  
  // 2. Fetch transactions
  const transactions = await btApi.getTransactions(accountId, fromDate);
  
  // 3. Process each transaction
  for (const tx of transactions) {
    // Parse and categorize
    const category = categorizeTransaction(tx.description);
    
    // Try to match with entity
    const match = await findEntityMatch(tx, companyId);
    
    await db.transactions.create({
      company_id: companyId,
      transaction_date: tx.bookingDate,
      transaction_type: category,
      amount: tx.amount.amount,
      currency: tx.amount.currency,
      entity_type: match?.entityType,
      entity_id: match?.entityId,
      is_matched: !!match,
      source_system: 'BT',
      external_id: tx.transactionId,
      description: tx.description,
      metadata: tx
    });
  }
}
```

## 6.3 DKV API

### Sync Logic
```javascript
async function syncDKV(companyId, startDate, endDate) {
  const transactions = await dkvApi.getTransactions(startDate, endDate);
  
  for (const tx of transactions) {
    // Match card to vehicle
    const cardMapping = await db.fuelCardMappings.findOne({
      card_number: tx.cardNumber,
      card_provider: 'DKV'
    });
    
    await db.transactions.create({
      company_id: companyId,
      entity_type: 'truck_head',
      entity_id: cardMapping?.truck_head_id,
      transaction_date: tx.date,
      transaction_type: 'combustibil',
      amount: tx.totalAmount,
      currency: tx.currency,
      fuel_liters: tx.quantity,
      fuel_price_per_liter: tx.pricePerLiter,
      fuel_station: tx.stationName,
      fuel_country: tx.country,
      source_system: 'DKV',
      external_id: tx.transactionId,
      is_matched: !!cardMapping
    });
  }
}
```

## 6.4 GPS APIs (Wialon, AROBS, Volvo, Ecomotive)

### Common Interface
```javascript
class GPSProvider {
  async getCurrentPositions() { }
  async getHistory(vehicleId, from, to) { }
  async getDailySummary(vehicleId, date) { }
}

// Sync every minute for live tracking
cron.schedule('* * * * *', async () => {
  const positions = await gpsProvider.getCurrentPositions();
  
  for (const pos of positions) {
    // Update latest position (upsert)
    await db.gpsData.upsert({
      truck_head_id: pos.vehicleId,
      timestamp: pos.timestamp,
      latitude: pos.lat,
      longitude: pos.lng,
      speed: pos.speed,
      engine_on: pos.engineOn,
      source: pos.provider
    });
    
    // Broadcast via WebSocket
    await supabase.channel('gps').send({
      type: 'gps_update',
      truck_id: pos.vehicleId,
      position: { lat: pos.lat, lng: pos.lng, speed: pos.speed }
    });
  }
});

// Daily summary at midnight
cron.schedule('0 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const trucks = await db.truckHeads.findAll();
  
  for (const truck of trucks) {
    const dayData = await gpsProvider.getDailySummary(truck.gps_device_id, yesterday);
    
    await db.gpsDailySummary.create({
      truck_head_id: truck.id,
      date: yesterday,
      total_km: dayData.totalKm,
      driving_time_minutes: dayData.drivingTime,
      avg_speed: dayData.avgSpeed,
      fuel_consumed: dayData.fuelConsumed
    });
  }
});
```

## 6.5 Gmail/Drive (Verag, Sprint Diesel, Documente)

### Gmail Parser
```javascript
async function parseEmailAttachments(gmailClient, query) {
  // Search emails
  const messages = await gmailClient.users.messages.list({
    userId: 'me',
    q: query // e.g., 'from:verag subject:raport'
  });
  
  for (const message of messages.data.messages) {
    const email = await gmailClient.users.messages.get({
      userId: 'me',
      id: message.id
    });
    
    // Get attachments
    for (const part of email.data.payload.parts) {
      if (part.filename) {
        const attachment = await gmailClient.users.messages.attachments.get({
          userId: 'me',
          messageId: message.id,
          id: part.body.attachmentId
        });
        
        const buffer = Buffer.from(attachment.data.data, 'base64');
        
        if (part.mimeType === 'text/csv') {
          await parseVeragCSV(buffer);
        } else if (part.mimeType === 'application/pdf') {
          await parseSprintDieselPDF(buffer);
        }
      }
    }
  }
}

async function parseVeragCSV(buffer) {
  const records = await csv.parse(buffer);
  
  for (const row of records) {
    // Map CSV columns to transaction
    await db.transactions.create({
      transaction_date: parseDate(row.Data),
      transaction_type: 'combustibil',
      amount: parseFloat(row.Valoare),
      fuel_liters: parseFloat(row.Litri),
      fuel_station: row.Statie,
      source_system: 'Verag',
      // ... match to vehicle
    });
  }
}

async function parseSprintDieselPDF(buffer) {
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;
  
  // Extract data using regex patterns
  const invoiceNumber = text.match(/Factura nr\.\s*(\d+)/)?.[1];
  const date = text.match(/Data:\s*(\d{2}\.\d{2}\.\d{4})/)?.[1];
  // ... etc
}
```

---

# 🔒 7. SECURITATE & GDPR

## 7.1 Authentication
```javascript
// Supabase Auth cu Row Level Security
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// RLS Policies
CREATE POLICY "Users can only access their company data"
ON truck_heads FOR ALL
USING (company_id = auth.jwt() -> 'user_metadata' ->> 'company_id');
```

## 7.2 Security Checklist
```
AUTENTIFICARE:
☐ 2FA pentru admin accounts
☐ Session timeout (30 min)
☐ Password complexity (min 8 chars, mixed)
☐ Account lockout după 5 încercări
☐ Refresh token rotation

PROTECȚIE DATE:
☐ Encryption at rest (Supabase default)
☐ Encryption in transit (HTTPS only)
☐ API rate limiting (100 req/15 min)
☐ SQL injection protection (Supabase)
☐ XSS protection (React default + sanitize)

ROW LEVEL SECURITY:
☐ Toate tabelele au RLS enabled
☐ company_id verificat pe toate queries
☐ Audit logs pentru acțiuni sensibile
```

## 7.3 GDPR Compliance
```
☐ Privacy Policy (page/document)
☐ Terms of Service
☐ Cookie Consent (dacă folosim cookies)
☐ Data Retention Policy (7 ani pentru fiscal)
☐ Right to Deletion (cu excepții legale)
☐ Data Export Capability
☐ Audit Logs pentru access la date personale
☐ CNP și date personale criptate
```

## 7.4 Backup Strategy
```
SUPABASE (inclus):
- Point-in-time recovery
- Daily backups

ADDITIONAL:
☐ Export săptămânal JSON/SQL
☐ Storage separat pentru documente
☐ Recovery Time Objective: 4 ore
☐ Recovery Point Objective: 24 ore
☐ Test restore lunar
```

---

# 📅 8. ROADMAP IMPLEMENTARE

## SĂPTĂMÂNA 1: Setup

### Ziua 1-2: Supabase
```bash
☐ Creare cont/proiect Supabase
☐ Rulare SQL schema (toate tabelele)
☐ Enable RLS pe toate tabelele
☐ Creare RLS policies
☐ Creare user admin pentru test
☐ Test conexiune + CRUD basic
```

### Ziua 2-3: Backend Express
```bash
☐ mkdir transport-backend && cd transport-backend
☐ npm init -y
☐ npm install express cors dotenv @supabase/supabase-js
☐ npm install multer axios node-cron pdf-parse csv-parser
☐ npm install -D nodemon

☐ Structura folders:
   /src
   ├── /routes
   ├── /controllers
   ├── /services
   ├── /middleware
   └── /config

☐ Setup Supabase client
☐ Middleware: auth, errorHandler, rateLimiter
☐ Primele endpoints: auth, vehicles (CRUD)
☐ Test cu Postman
```

### Ziua 3-4: Frontend React
```bash
☐ npm create vite@latest transport-frontend -- --template react
☐ cd transport-frontend
☐ npm install @supabase/supabase-js @reduxjs/toolkit react-redux
☐ npm install @tanstack/react-query react-router-dom axios
☐ npm install tailwindcss postcss autoprefixer
☐ npx tailwindcss init -p
☐ npm install @radix-ui/react-* lucide-react react-hot-toast
☐ npm install react-hook-form zod @hookform/resolvers
☐ npm install recharts leaflet react-leaflet date-fns

☐ Setup Tailwind config
☐ Setup Redux store
☐ Setup React Query provider
☐ Setup Supabase client
☐ Setup routes
☐ Layout components (Sidebar, Header)
☐ Login page + protected routes
```

### Ziua 5: Environment & Git
```bash
☐ Git repo init
☐ .gitignore
☐ .env files (dev)
☐ README cu setup instructions
☐ ESLint + Prettier config
```

---

## SĂPTĂMÂNA 2-3: Core Features

### Dashboard
```
☐ Stats cards (vehicule, șoferi, curse, km)
☐ Revenue chart (Recharts)
☐ Alerts widget
☐ Mini map cu poziții GPS (Leaflet)
☐ Recent activity feed
```

### Vehicles Module
```
☐ Truck list cu pagination, sorting, search
☐ Add truck form
☐ Edit truck form
☐ Truck details page cu tabs:
   - Info generală
   - Documente
   - Costuri
   - Curse
   - GPS tracking
☐ Trailers list + CRUD
```

### Drivers Module
```
☐ Drivers list
☐ Add/Edit driver form
☐ Driver details page
☐ Documents section
☐ Statistics (km, curse, diurnă)
```

---

## SĂPTĂMÂNA 3-4: Trips & Documents

### Trips Module
```
☐ Trip list cu filtre avansate
☐ Simple trip form:
   - Selectare truck, driver, trailer
   - Date plecare/întoarcere
   - Km total/încărcat/gol
   - Zile România/străinătate
   - Venit + monedă
   - Diurnă

☐ Complex trip wizard:
   - Step 1: Basic info
   - Step 2: Stops manager (add/edit/reorder)
   - Step 3: Documents upload
   - Step 4: Review & submit

☐ Trip details page
☐ Profitability calculation
☐ Route map visualization
```

### Documents Module
```
☐ Documents list by entity
☐ Expiring documents dashboard (30 zile)
☐ Upload document form
☐ Document viewer
☐ Auto-alert creation for expiring docs
```

---

## SĂPTĂMÂNA 4-5: Financial & Integrations

### Transactions Module
```
☐ Transactions list cu filtre
☐ Unmatched transactions view
☐ Matching modal UI
☐ Manual transaction form
☐ Bulk import (CSV/Excel)
```

### Integrations
```
☐ SmartBill sync service
☐ BT API integration (mock dacă nu sunt credentials)
☐ DKV sync service
☐ GPS sync service
☐ Sync status dashboard
☐ Manual sync triggers
☐ Sync logs view
```

### Reports
```
☐ Profit per vehicul
☐ Profit per șofer
☐ Fuel consumption analysis
☐ Trip statistics
☐ Export to Excel/PDF
```

---

## SĂPTĂMÂNA 6: GPS & Polish

### GPS Features
```
☐ Live map cu toate vehiculele
☐ Vehicle tracking individual
☐ Trip route visualization
☐ Realtime updates via WebSocket
```

### Polish
```
☐ Loading states
☐ Error boundaries
☐ Empty states
☐ Form validation messages
☐ Toast notifications
☐ Responsive design fixes
☐ Performance optimization
```

---

## SĂPTĂMÂNA 7: Testing & Deployment

### Testing
```
☐ Test CRUD toate entitățile
☐ Test calculele de profit
☐ Test matching algorithm
☐ Test sync services
☐ Test auth flow
☐ Test mobile responsiveness
```

### Deployment
```
☐ Setup hosting (Vercel pentru frontend)
☐ Setup backend (Railway/Render)
☐ Domain + SSL
☐ Environment variables production
☐ Sentry error tracking
☐ Final testing
```

---

# 📊 9. DATA MIGRATION

## 9.1 Date de Migrat (01.01.2025 - 01.11.2025)
```
☐ Vehicule (trucks + trailers) din Excel
☐ Șoferi din Excel
☐ Documente scanate (RCA, CASCO, ITP)
☐ Curse istorice din Excel
☐ Tranzacții combustibil
☐ Facturi din SmartBill
☐ Date GPS istorice
```

## 9.2 Template-uri Excel pentru Import
```
TRUCKS_IMPORT.xlsx:
- registration_number (obligatoriu)
- vin
- brand
- model
- year
- euro_standard
- purchase_date
- current_km
- status

DRIVERS_IMPORT.xlsx:
- first_name (obligatoriu)
- last_name (obligatoriu)
- cnp
- phone
- email
- hire_date
- base_salary
- has_adr

TRIPS_IMPORT.xlsx:
- settlement_number
- truck_registration (pentru match)
- driver_name (pentru match)
- trailer_registration
- departure_date
- return_date
- from_location
- to_location
- total_km
- loaded_km
- revenue_amount
- revenue_currency
- diurna_total
```

## 9.3 Import Scripts
```javascript
// scripts/importTrucks.js
const xlsx = require('xlsx');
const { supabase } = require('../config/supabase');

async function importTrucks(filePath, companyId) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    const truck = {
      company_id: companyId,
      registration_number: row.registration_number.trim().toUpperCase(),
      vin: row.vin,
      brand: row.brand,
      model: row.model,
      year: parseInt(row.year),
      euro_standard: row.euro_standard,
      purchase_date: row.purchase_date,
      current_km: parseInt(row.current_km) || 0,
      status: row.status || 'activ'
    };
    
    const { error } = await supabase
      .from('truck_heads')
      .upsert(truck, { onConflict: 'registration_number' });
    
    if (error) {
      console.error(`Error importing ${row.registration_number}:`, error);
    }
  }
}
```

---

# ✅ 10. TESTING CHECKLIST

## 10.1 Unit Tests
```
☐ Calcul profit cursă
☐ Calcul consum combustibil
☐ Currency conversion
☐ Date validations
☐ Matching algorithm
```

## 10.2 Integration Tests
```
☐ Auth flow (login, logout, protected routes)
☐ CRUD toate entitățile
☐ File upload
☐ API external calls (mock)
```

## 10.3 E2E Tests
```
☐ Complete trip flow (create → complete)
☐ Document upload flow
☐ Report generation
☐ Transaction matching
☐ User onboarding
```

## 10.4 UAT Scenarios
```
☐ Operator poate adăuga cursă simplă
☐ Operator poate adăuga cursă complexă
☐ Manager poate vedea raport profit
☐ Admin poate configura integrări
☐ Alerte se generează automat
```

---

# 🎯 11. COMENZI QUICK START

## Backend
```bash
# Setup
cd transport-backend
npm install
cp .env.example .env
# Edit .env with Supabase credentials

# Run
npm run dev
```

## Frontend
```bash
# Setup
cd transport-frontend
npm install
cp .env.example .env
# Edit .env with Supabase credentials

# Run
npm run dev
```

## Database
```sql
-- Run in Supabase SQL Editor
-- Copy entire schema from Section 3
```

---

# 📝 12. ENVIRONMENT VARIABLES

## Backend (.env)
```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_KEY=eyJxxxx

# External APIs
SMARTBILL_USERNAME=
SMARTBILL_TOKEN=
BT_CLIENT_ID=
BT_CLIENT_SECRET=
DKV_API_KEY=
EUROWAG_API_KEY=
WIALON_API_KEY=

# Google APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx
VITE_API_URL=http://localhost:3001/api/v1
VITE_MAPBOX_TOKEN=  # or use OpenStreetMap (free)
```

---

# 🚀 READY TO START!

**Primul pas:**
1. Creează proiect Supabase
2. Rulează SQL schema
3. Inițializează backend + frontend
4. Implementează Auth
5. Implementează CRUD Vehicles
6. Continue cu roadmap-ul

**Note importante:**
- Folosește TypeScript pentru type safety
- Documentează API cu Swagger/OpenAPI
- Git commits frecvente
- Test după fiecare feature majoră
