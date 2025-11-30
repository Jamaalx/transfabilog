# Transport SaaS - Plan Frontend React
## Arhitectură & Strategie de Implementare

**Versiune:** 1.1
**Ultima actualizare:** 2025-11-26
**Status:** În dezvoltare

---

## CUPRINS

1. [Overview Tehnic](#-overview-tehnic)
2. [Arhitectura Aplicației](#️-arhitectura-aplicației)
3. [Componente Principale](#-componente-principale)
4. [State Management Strategy](#-state-management-strategy)
5. [Data Flow](#-data-flow)
6. [Faze de Implementare](#-faze-de-implementare)
7. [Design System](#-design-system)
8. [Responsive Design](#-responsive-design)
9. [Security Considerations](#-security-considerations)
10. [Performance Targets](#-performance-targets)
11. [Testing Strategy](#-testing-strategy)
12. [Deployment Strategy](#-deployment-strategy)

---

## 📋 OVERVIEW TEHNIC

### Stack Frontend Propus:

| Categorie | Tehnologie | Versiune | Scop |
|-----------|------------|----------|------|
| **Core** | React | 18.2+ | Framework UI |
| **Build** | Vite | 5.0+ | Bundler rapid (10x vs CRA) |
| **Routing** | React Router | v6.20+ | Client-side routing, lazy loading |
| **State (Global)** | Redux Toolkit | 2.0+ | Auth, UI state, cache |
| **State (Server)** | TanStack Query | v5.0+ | Data fetching, cache, mutations |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Components** | Shadcn/ui | latest | Radix UI based, accessible |
| **Forms** | React Hook Form | 7.48+ | Performant form management |
| **Validation** | Zod | 3.22+ | Schema validation |
| **Charts** | Recharts | 2.10+ | Data visualization |
| **Maps** | Leaflet + react-leaflet | 1.9/4.2 | GPS tracking maps |
| **Tables** | TanStack Table | v8.10+ | Advanced data tables |
| **Dates** | date-fns | 3.0+ | Date manipulation |
| **Notifications** | React Hot Toast | 2.4+ | Toast messages |
| **Icons** | Lucide React | 0.300+ | Icon library |
| **HTTP** | Axios | 1.6+ | API requests |
| **Auth** | Supabase JS | 2.38+ | Authentication |

### De ce aceste alegeri?

```
✅ Vite vs Create React App
   - Build 10-20x mai rapid
   - HMR instant
   - Bundle size mai mic
   - Native ESM support

✅ Redux Toolkit vs Context API
   - DevTools pentru debugging
   - Middleware (thunk, saga)
   - Structură predictabilă
   - Compatibil cu React Query

✅ Shadcn/ui vs Material UI
   - Zero-runtime (copy-paste components)
   - Fully customizable
   - Accessibility built-in (Radix)
   - Bundle size minimal

✅ TanStack Query vs SWR
   - Devtools mai bune
   - Mutations handling superior
   - Offline support
   - Infinite queries
```

---

## 🏗️ ARHITECTURA APLICAȚIEI

### Structura Folder-elor

```
transport-frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── locales/              # i18n files (future)
├── src/
│   ├── api/                  # API layer
│   │   ├── client.ts         # Axios instance configured
│   │   ├── supabase.ts       # Supabase client
│   │   └── endpoints/        # API functions by domain
│   │       ├── auth.ts
│   │       ├── vehicles.ts
│   │       ├── drivers.ts
│   │       ├── trips.ts
│   │       └── reports.ts
│   ├── components/
│   │   ├── ui/               # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── common/           # Shared components
│   │   │   ├── DataTable/
│   │   │   ├── PageHeader/
│   │   │   ├── LoadingSpinner/
│   │   │   └── EmptyState/
│   │   ├── layout/           # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── features/         # Feature-specific components
│   │       ├── dashboard/
│   │       ├── vehicles/
│   │       ├── drivers/
│   │       ├── trips/
│   │       ├── documents/
│   │       ├── finance/
│   │       └── reports/
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useVehicles.ts
│   │   ├── useRealtime.ts
│   │   └── useDebounce.ts
│   ├── store/                # Redux store
│   │   ├── index.ts
│   │   ├── auth/
│   │   ├── ui/
│   │   └── middleware/
│   ├── pages/                # Route pages
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── drivers/
│   │   ├── trips/
│   │   ├── documents/
│   │   ├── finance/
│   │   ├── reports/
│   │   └── settings/
│   ├── lib/                  # Utility libraries
│   │   ├── utils.ts          # Helper functions
│   │   ├── constants.ts      # App constants
│   │   └── validators.ts     # Zod schemas
│   ├── types/                # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── components.ts
│   ├── styles/               # Global styles
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 1. Structura de Pagini (Routes)

```
/ (redirect → /dashboard)
├── /dashboard                 - Pagina principală cu statistici
├── /vehicles
│   ├── /trucks               - Listă capuri remorcă
│   ├── /trucks/:id           - Detalii cap remorcă
│   ├── /trucks/new           - Adaugă cap remorcă
│   ├── /trailers             - Listă remorci
│   └── /gps-tracking         - Hartă live cu toate vehiculele
├── /drivers
│   ├── /list                 - Listă șoferi
│   ├── /:id                  - Detalii șofer
│   └── /new                  - Adaugă șofer
├── /trips
│   ├── /active               - Curse în desfășurare
│   ├── /history              - Istoric curse
│   ├── /new-simple           - Cursă simplă nouă
│   ├── /new-complex          - Cursă complexă nouă
│   └── /:id                  - Detalii cursă
├── /documents
│   ├── /expiring             - Documente care expiră
│   ├── /by-entity            - Grupate per entitate
│   └── /upload               - Upload documente
├── /finance
│   ├── /transactions         - Toate tranzacțiile
│   ├── /unmatched           - Tranzacții nepotrivite
│   ├── /invoices            - Facturi
│   └── /costs               - Analiză costuri
├── /reports
│   ├── /profit              - Raport profit
│   ├── /fuel                - Consum combustibil
│   ├── /trips               - Statistici curse
│   └── /export              - Export date
└── /settings
    ├── /company             - Setări companie
    ├── /integrations        - API-uri externe
    ├── /users               - Utilizatori
    └── /alerts              - Configurare alerte
```

---

## 🎨 COMPONENTE PRINCIPALE

### NIVEL 1: Layout & Common Components

#### 1.1 Layout Components
- **AppLayout** - Container principal cu sidebar + header
- **Sidebar** - Navigație principală (collapsible)
- **Header** - User info, notificări, search global
- **Footer** - Info versiune, link-uri utile

#### 1.2 Common UI Components
- **Button** - Variantele: primary, secondary, danger, ghost
- **Card** - Container pentru conținut
- **Table** - Tabel reusabil cu sorting/filtering
- **Modal** - Dialog modal pentru forms/confirmări
- **DatePicker** - Selector dată cu calendar
- **Select** - Dropdown cu search
- **MultiSelect** - Select multiple opțiuni
- **LoadingSpinner** - Loading states
- **EmptyState** - Când nu sunt date
- **ErrorBoundary** - Error handling
- **ConfirmDialog** - Confirmări acțiuni

### NIVEL 2: Feature Components

#### 2.1 Dashboard Components
```
DashboardPage/
├── StatsGrid           - 4 card-uri cu statistici principale
├── RevenueChart        - Grafic venituri 30 zile
├── LiveVehicleMap      - Hartă cu poziții vehicule
├── AlertsWidget        - Top 5 alerte active
├── TripsFeed          - Ultimele 5 curse
└── FuelConsumptionMini - Mini grafic consum
```

#### 2.2 Vehicle Components
```
VehicleModule/
├── VehicleList         - Tabel cu toate vehiculele
├── VehicleCard         - Card pentru grid view
├── VehicleDetails      - Pagină completă detalii
├── VehicleForm         - Formular add/edit
├── VehicleDocuments    - Secțiune documente
├── VehicleCosts        - Grafic costuri
├── VehicleTrips        - Istoric curse vehicul
└── VehicleGPSTracker   - Tracking live individual
```

#### 2.3 Trip Components  
```
TripModule/
├── TripList            - Listă/tabel curse
├── SimpleTripForm      - Formular cursă simplă
├── ComplexTripForm     - Wizard cursă complexă
│   ├── Step1: BasicInfo
│   ├── Step2: StopsManager  
│   ├── Step3: Documents
│   └── Step4: Summary
├── TripDetails         - Vezi detalii complete
├── TripMap            - Hartă cu ruta
├── TripProfitability  - Calcul profit
└── TripTimeline       - Timeline opriri
```

#### 2.4 Financial Components
```
FinanceModule/
├── TransactionList     - Toate tranzacțiile
├── TransactionFilters  - Filtre avansate
├── UnmatchedList      - Tranzacții de verificat
├── MatchingModal      - UI pentru matching manual
├── InvoiceList        - Facturi SmartBill
├── CostBreakdown      - Defalcare costuri
└── BulkImport         - Import CSV/Excel
```

---

## 📊 STATE MANAGEMENT STRATEGY

### Global State (Redux Toolkit)
```javascript
store/
├── auth/         - User, permissions, session
├── company/      - Company settings, config
├── vehicles/     - Trucks & trailers cache
├── drivers/      - Drivers list cache
├── alerts/       - Active alerts
└── ui/           - Sidebar state, modals, theme
```

### Server State (React Query)
```javascript
queries/
├── useVehicles     - Fetch & cache vehicles
├── useDrivers      - Fetch & cache drivers
├── useTrips        - Trips with filters
├── useDocuments    - Documents by entity
├── useTransactions - Financial data
├── useReports      - Generated reports
└── useRealtime     - Supabase realtime subscriptions
```

### Local State (Component)
- Form data (React Hook Form)
- UI toggles (dropdowns, modals)
- Temporary filters
- Pagination state

---

## 🔄 DATA FLOW

### Pattern Principal: Container/Presenter
```
Page (Container)
  ├── Fetches data (React Query)
  ├── Handles business logic
  └── Passes props to →
      
      Presentational Components
        ├── Display data
        ├── Handle UI events
        └── Pure components
```

### Real-time Updates
```
Supabase Realtime
  ├── GPS positions (1min interval)
  ├── New alerts (instant)
  ├── Trip status changes (instant)
  └── Document expiry (daily check)
```

---

## 🎯 FAZE DE IMPLEMENTARE

### FAZA 1: Foundation (Săptămâna 1)
✅ **Setup & Infrastructură**
- Setup Vite + React + TypeScript
- Configurare Tailwind CSS
- Setup Redux Toolkit
- Configurare React Query
- Supabase client setup
- Routing setup
- Layout components (Sidebar, Header)

✅ **Auth Flow**
- Login page
- Protected routes
- Session management
- Role-based access

### FAZA 2: Core Features (Săptămâna 2-3)
✅ **Dashboard**
- Stats cards
- Charts (revenue, fuel)
- Alerts widget
- Recent activity

✅ **Vehicles Module**
- Vehicle list cu pagination
- Add/Edit vehicle
- Vehicle details page
- Basic filtering

✅ **Drivers Module**  
- Drivers list
- Add/Edit driver
- Driver details

### FAZA 3: Trips & Documents (Săptămâna 3-4)
✅ **Trips Module**
- Simple trip form
- Complex trip wizard
- Trip list & filters
- Trip details & profitability

✅ **Documents Module**
- Document list by entity
- Upload documents
- Expiry alerts
- Document viewer

### FAZA 4: Financial (Săptămâna 4-5)
✅ **Transactions**
- Transaction list
- Matching interface
- Filters & search
- Import from sources

✅ **Reports**
- Profit reports
- Fuel consumption
- Trip statistics
- Export to Excel

### FAZA 5: Advanced Features (Săptămâna 5-6)
✅ **GPS & Maps**
- Live vehicle tracking
- Trip route visualization
- Geofencing alerts

✅ **Sync & Integrations**
- Sync status dashboard
- Manual sync triggers
- Error logs

### FAZA 6: Polish & Optimization (Săptămâna 6)
✅ **Performance**
- Code splitting
- Lazy loading
- Image optimization
- Caching strategy

✅ **UX Improvements**
- Loading states
- Error boundaries
- Empty states
- Animations

---

## 🎨 DESIGN SYSTEM

### Culori Principale
```scss
Primary:     #3B82F6  (Blue 500)
Secondary:   #10B981  (Emerald 500)  
Danger:      #EF4444  (Red 500)
Warning:     #F59E0B  (Amber 500)
Success:     #10B981  (Emerald 500)
Neutral:     #6B7280  (Gray 500)

Background:  #F9FAFB  (Gray 50)
Surface:     #FFFFFF
Border:      #E5E7EB  (Gray 200)
```

### Tipografie
```scss
Font Family: 'Inter', system-ui, sans-serif

Headings:
- H1: 2.5rem (40px) - Bold
- H2: 2rem (32px) - Semibold  
- H3: 1.5rem (24px) - Semibold
- H4: 1.25rem (20px) - Medium

Body:
- Large: 1.125rem (18px)
- Base: 1rem (16px)
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)
```

### Componente Stil
- **Border Radius**: 0.5rem (8px) pentru cards
- **Shadow**: shadow-sm pentru cards, shadow-lg pentru modals
- **Spacing**: 8px grid system (0.5rem increments)
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## 📱 RESPONSIVE DESIGN

### Mobile First Approach
1. **Dashboard** - Stack cards vertical pe mobile
2. **Tables** - Horizontal scroll sau card view
3. **Forms** - Full width inputs pe mobile
4. **Navigation** - Bottom nav pe mobile
5. **Maps** - Full screen pe mobile

### Tablet Optimizations
- 2 column layouts
- Collapsible sidebar
- Touch-friendly buttons (min 44px)

### Desktop Features
- Multi-column layouts
- Keyboard shortcuts
- Hover states
- Dense tables option

---

## 🔐 SECURITY CONSIDERATIONS

1. **Authentication**
   - JWT tokens în httpOnly cookies
   - Refresh token rotation
   - Session timeout (30 min inactivity)

2. **Authorization**
   - Role-based access control
   - Feature flags per role
   - API request signing

3. **Data Protection**
   - Input sanitization
   - XSS protection
   - CSRF tokens
   - Rate limiting on client

4. **Sensitive Data**
   - No sensitive data in localStorage
   - Encrypt local storage if needed
   - Clear data on logout

---

## ⚡ PERFORMANCE TARGETS

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Bundle Size
- Initial bundle: < 200KB
- Lazy loaded chunks: < 50KB each
- Total app size: < 1MB

### Optimization Strategies
1. Code splitting by route
2. Dynamic imports for heavy components
3. Image lazy loading
4. Virtual scrolling for long lists
5. Debounced search inputs
6. Memoization for expensive computations
7. Service Worker for offline support

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest + React Testing Library)
- Utility functions
- Custom hooks
- Redux reducers

### Component Tests
- Render tests
- User interaction
- Props validation

### Integration Tests
- API integration
- Form submissions
- Navigation flows

### E2E Tests (Playwright)
- Critical user journeys
- Cross-browser testing

---

## 📚 DEPENDENCIES PRINCIPALE

### package.json
```json
{
  "name": "transport-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "recharts": "^2.10.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.0",
    "@tanstack/react-table": "^8.10.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
```

---

## 🚀 DEPLOYMENT STRATEGY

### Environment Setup
- **Development**: localhost:5173
- **Staging**: staging.transport-app.ro
- **Production**: app.transport-app.ro

### CI/CD Pipeline
1. GitHub Actions pentru build & test
2. Vercel/Netlify pentru hosting
3. Sentry pentru error tracking
4. Google Analytics pentru usage

### Environment Variables
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
VITE_MAPBOX_TOKEN=
VITE_SENTRY_DSN=
```

---

## 📈 METRICI DE SUCCES

### User Experience
- Page load time < 3s
- Time to interactive < 5s  
- Zero runtime errors în production
- 99.9% uptime

### Business Metrics
- User adoption rate > 80%
- Daily active users > 90%
- Feature usage tracking
- Error rate < 0.1%

---

## 🎯 URMĂTORII PAȘI

1. **Aprobare plan** - Review cu stakeholders
2. **Setup environment** - Instalare tools & dependencies
3. **Design mockups** - Figma designs pentru main pages
4. **Start development** - Începe cu Faza 1
5. **Weekly demos** - Review progres săptămânal

---

## 📝 NOTE ADIȚIONALE

- Folosim TypeScript pentru type safety (opțional dar recomandat)
- Documentație cu Storybook pentru component library
- Accessibility (WCAG 2.1 AA compliance)
- i18n ready (pentru multi-language în viitor)
- Dark mode support (nice to have)

---

**Întrebări de clarificat:**
1. Preferințe pentru UI library? (Shadcn/ui, MUI, Ant Design?)
2. TypeScript sau JavaScript pur?
3. Necesită mobile app în viitor?
4. Cerințe speciale pentru rapoarte/export?
5. Limbi multiple necesare?