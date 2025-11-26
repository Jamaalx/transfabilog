# Transport SaaS - Plan de Scalabilitate
## Strategia de Creștere și Optimizare

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. FAZE DE CREȘTERE

### 1.1 Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GROWTH PHASES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FAZA 1: SINGLE TENANT (Luni 0-6)                              │
│  ├── 1 companie                                                │
│  ├── ~25 vehicule                                              │
│  ├── ~15 utilizatori                                           │
│  ├── ~500 curse/lună                                           │
│  └── Supabase Pro (shared)                                     │
│                                                                 │
│  FAZA 2: GROWTH (Luni 6-12)                                    │
│  ├── 1 companie (sau 2-3 mici)                                 │
│  ├── ~50 vehicule                                              │
│  ├── ~30 utilizatori                                           │
│  ├── ~1,500 curse/lună                                         │
│  └── Optimizări DB, cache                                      │
│                                                                 │
│  FAZA 3: MULTI-TENANT (Luni 12-24)                             │
│  ├── 5-15 companii                                             │
│  ├── ~200 vehicule total                                       │
│  ├── ~100 utilizatori                                          │
│  ├── ~5,000 curse/lună                                         │
│  └── Dedicated resources                                       │
│                                                                 │
│  FAZA 4: SCALE (24+ luni)                                      │
│  ├── 50+ companii                                              │
│  ├── 1,000+ vehicule                                           │
│  ├── 500+ utilizatori                                          │
│  └── Enterprise infrastructure                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. INFRASTRUCTURE SCALING

### 2.1 Database Scaling

| Fază | Plan Supabase | DB Size | Conexiuni | Cost/lună |
|------|---------------|---------|-----------|-----------|
| 1 | Pro | 8GB | 60 | $25 |
| 2 | Pro + Read Replica | 16GB | 120 | $50 |
| 3 | Team | 64GB | 300 | $599 |
| 4 | Enterprise | Custom | Custom | Custom |

### 2.2 Query Optimization

```sql
-- Indexes critice pentru scale
CREATE INDEX CONCURRENTLY idx_trips_company_date
  ON trips(company_id, departure_date DESC);

CREATE INDEX CONCURRENTLY idx_transactions_entity
  ON transactions(company_id, entity_type, entity_id, transaction_date);

CREATE INDEX CONCURRENTLY idx_gps_truck_timestamp
  ON gps_data(truck_head_id, timestamp DESC);

-- Partitioning pentru GPS data (la volum mare)
CREATE TABLE gps_data_partitioned (
  LIKE gps_data INCLUDING ALL
) PARTITION BY RANGE (timestamp);

CREATE TABLE gps_data_2025_q1 PARTITION OF gps_data_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
```

### 2.3 Backend Scaling

```
FAZA 1-2: Single Instance
├── Railway/DigitalOcean
├── 1GB RAM, 1 vCPU
└── Auto-restart on crash

FAZA 3: Horizontal Scale
├── Load Balancer (CloudFlare)
├── 2-3 Backend instances
├── Redis for sessions
└── Queue for background jobs

FAZA 4: Microservices
├── API Gateway
├── Auth Service
├── Trip Service
├── GPS Service
├── Sync Service
└── Kubernetes orchestration
```

---

## 3. CACHING STRATEGY

### 3.1 Cache Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CLIENT                                                         │
│  └── React Query cache (5 min default)                         │
│      ├── staleTime: 5 * 60 * 1000                              │
│      └── cacheTime: 30 * 60 * 1000                             │
│                                                                 │
│  CDN (CloudFlare)                                               │
│  └── Static assets (1 year)                                    │
│      └── Cache-Control: public, max-age=31536000               │
│                                                                 │
│  API                                                            │
│  └── Redis (pentru Faza 3+)                                    │
│      ├── Session data (30 min TTL)                             │
│      ├── API responses (5 min TTL)                             │
│      └── Rate limit counters                                   │
│                                                                 │
│  DATABASE                                                       │
│  └── Supabase                                                  │
│      ├── Connection pooling (PgBouncer)                        │
│      └── Query result caching                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 React Query Configuration

```javascript
// queryClient.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      cacheTime: 30 * 60 * 1000, // 30 min
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// Per-query override for real-time data
const { data: gpsData } = useQuery({
  queryKey: ['gps', 'positions'],
  queryFn: fetchGPSPositions,
  staleTime: 30 * 1000, // 30 sec for GPS
  refetchInterval: 60 * 1000, // Poll every minute
});
```

---

## 4. PERFORMANCE OPTIMIZATION

### 4.1 Frontend Bundle Optimization

```javascript
// vite.config.js - Code splitting
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
};
```

### 4.2 Lazy Loading

```javascript
// routes.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Trips = lazy(() => import('./pages/Trips'));
const Reports = lazy(() => import('./pages/Reports'));
const GPSTracking = lazy(() => import('./pages/GPSTracking'));

// Only load GPS/Maps when needed (heavy bundle)
<Route
  path="/gps-tracking"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <GPSTracking />
    </Suspense>
  }
/>
```

### 4.3 Database Query Optimization

```javascript
// Pagination obligatorie
async function getTrips(companyId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { data, count } = await supabase
    .from('trips')
    .select('*, driver:drivers(first_name, last_name)', { count: 'exact' })
    .eq('company_id', companyId)
    .order('departure_date', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, total: count, page, limit };
}

// Select only needed fields
async function getTripsForList(companyId) {
  // BAD: .select('*')
  // GOOD:
  return supabase
    .from('trips')
    .select(`
      id,
      settlement_number,
      departure_date,
      return_date,
      status,
      revenue_amount,
      profit,
      truck:truck_heads(registration_number),
      driver:drivers(first_name, last_name)
    `)
    .eq('company_id', companyId);
}
```

---

## 5. MULTI-TENANCY

### 5.1 Isolation Strategy

```
CURRENT (Faza 1-2): Logical Isolation
├── Same database, same tables
├── company_id column pe toate tabelele
├── RLS policies pentru izolare
└── Cost-efficient, simple

FUTURE (Faza 4): Schema Isolation
├── Separate schema per company
├── Better performance isolation
├── Easier backup/restore per tenant
└── Higher complexity
```

### 5.2 RLS Policies (Current)

```sql
-- Toate tabelele au company_id
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON trips
FOR ALL USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- Admin bypass pentru super-admin (dacă necesar)
CREATE POLICY "super_admin_access" ON trips
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);
```

---

## 6. COST PROJECTIONS

### 6.1 Infrastructure Cost per Phase

| Fază | Supabase | Hosting | CDN | Monitoring | Total/lună |
|------|----------|---------|-----|------------|------------|
| 1 | $25 | $20 | $0 | $0 | $45 |
| 2 | $50 | $40 | $20 | $26 | $136 |
| 3 | $599 | $200 | $50 | $100 | $949 |
| 4 | Custom | Custom | Custom | Custom | $2,000+ |

### 6.2 Revenue per Phase (Estimated)

| Fază | Clienți | Revenue/client | MRR |
|------|---------|----------------|-----|
| 1 | 1 | N/A (internal) | N/A |
| 2 | 3 | €200-500 | €600-1,500 |
| 3 | 15 | €150-400 | €2,250-6,000 |
| 4 | 50+ | €100-300 | €5,000-15,000 |

---

## 7. MIGRATION CHECKLIST

### 7.1 Faza 1 → Faza 2

```
☐ Review și optimize slow queries
☐ Add database indexes
☐ Setup Redis pentru cache
☐ Configure CDN pentru static assets
☐ Setup monitoring avansat
☐ Load testing cu date reale
```

### 7.2 Faza 2 → Faza 3

```
☐ Horizontal scaling backend (2+ instanțe)
☐ Database read replicas
☐ Queue system pentru background jobs
☐ Multi-tenant onboarding flow
☐ Tenant management dashboard
☐ Billing/subscription system
```

---

## 8. METRICS TO WATCH

| Metric | Warning | Action |
|--------|---------|--------|
| DB Connections > 80% | Alert | Add read replica |
| P95 Response > 2s | Alert | Profile queries |
| Error Rate > 1% | Alert | Debug & fix |
| Storage > 70% | Plan | Increase storage |
| CPU > 80% sustained | Alert | Scale up/out |
