# Transport SaaS - Strategie Mobile App
## Plan pentru Aplicație Mobilă (Viitor)

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Planning (Nice-to-Have)
**Timeline:** Post-MVP, Faza 2-3

---

## 1. OPȚIUNI TEHNICE

### 1.1 Comparație Abordări

| Criteriu | PWA | React Native | Flutter |
|----------|-----|--------------|---------|
| Cost dezvoltare | Low | Medium | Medium |
| Time to market | 2-3 săpt | 6-8 săpt | 6-8 săpt |
| Performanță | Good | Excellent | Excellent |
| Acces hardware | Limited | Full | Full |
| Offline | Partial | Full | Full |
| Push notifications | Limited (iOS) | Full | Full |
| App Store | Nu | Da | Da |
| Maintenance | Single codebase | Shared codebase | Shared codebase |
| **Recomandare** | **Faza 1** | **Faza 2** | Alternativă |

### 1.2 Recomandare: PWA First

```
FAZA 1: PWA (Progressive Web App)
├── Cost minimal (inclus în web development)
├── Timp: 2-3 săptămâni extra
├── Features: Offline basic, GPS, camera
├── Limitări: iOS push, background sync

FAZA 2: React Native (dacă necesar)
├── Când: Dacă PWA insuficient
├── Cost: €8,000-15,000 extra
├── Features: Full native capabilities
├── Avantaj: Reutilizare React knowledge
```

---

## 2. FEATURES MOBILE

### 2.1 Must Have (MVP Mobile)

```
CORE FEATURES:
☐ Login/Authentication
☐ Dashboard overview
☐ View trips list
☐ Create simple trip
☐ GPS tracking (view map)
☐ Notifications (alerts)
☐ Offline mode (read-only)
```

### 2.2 Nice to Have

```
EXTENDED FEATURES:
☐ Document scanner (camera)
☐ Photo capture pentru CMR
☐ Digital signature
☐ Full offline with sync
☐ Push notifications (native)
☐ Background GPS tracking
☐ Widget pentru dashboard
```

### 2.3 User Stories

```markdown
ȘOFER:
- Ca șofer, vreau să văd cursele mele pe telefon
- Ca șofer, vreau să fotografiez CMR și să-l upload
- Ca șofer, vreau să raportez probleme din aplicație
- Ca șofer, vreau să primesc notificări despre curse noi

OPERATOR:
- Ca operator, vreau să creez curse rapide de pe telefon
- Ca operator, vreau să văd poziția vehiculelor live
- Ca operator, vreau să primesc alerte despre documente

MANAGER:
- Ca manager, vreau să văd dashboard pe telefon
- Ca manager, vreau să aprob cursele de pe mobil
- Ca manager, vreau rapoarte rapide
```

---

## 3. PWA IMPLEMENTATION

### 3.1 Service Worker

```javascript
// service-worker.js
const CACHE_NAME = 'transport-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192.png',
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch with network-first strategy
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request);
      })
    );
  }
});
```

### 3.2 Manifest

```json
{
  "name": "Transport SaaS",
  "short_name": "Transport",
  "description": "Fleet management application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3.3 Mobile-Optimized Components

```jsx
// components/MobileNavigation.tsx
function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-2">
        <NavLink to="/dashboard" icon={<Home />} label="Acasă" />
        <NavLink to="/trips" icon={<Truck />} label="Curse" />
        <NavLink to="/gps" icon={<Map />} label="GPS" />
        <NavLink to="/alerts" icon={<Bell />} label="Alerte" />
        <NavLink to="/menu" icon={<Menu />} label="Meniu" />
      </div>
    </nav>
  );
}
```

---

## 4. REACT NATIVE (FAZA 2)

### 4.1 Project Structure

```
transport-mobile/
├── src/
│   ├── screens/
│   │   ├── Dashboard/
│   │   ├── Trips/
│   │   ├── GPS/
│   │   └── Settings/
│   ├── components/
│   │   ├── common/
│   │   └── features/
│   ├── navigation/
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── offline.ts
│   ├── store/
│   └── utils/
├── ios/
├── android/
├── app.json
└── package.json
```

### 4.2 Shared Code cu Web

```
CODE SHARING STRATEGY:
├── Business logic (60% shared)
│   ├── API clients
│   ├── State management (Redux)
│   ├── Validation (Zod)
│   └── Utils
├── UI Components (0% shared)
│   └── Platform-specific
└── Types/Interfaces (100% shared)
```

---

## 5. TIMELINE & COST

### 5.1 PWA Implementation

| Task | Ore | Cost (€50/h) |
|------|-----|--------------|
| Service Worker setup | 8h | €400 |
| Manifest & icons | 4h | €200 |
| Offline mode | 16h | €800 |
| Mobile UI optimization | 16h | €800 |
| Testing | 8h | €400 |
| **TOTAL** | **52h** | **€2,600** |

### 5.2 React Native (Estimare)

| Task | Ore | Cost (€50/h) |
|------|-----|--------------|
| Setup & boilerplate | 16h | €800 |
| Core screens | 40h | €2,000 |
| Navigation | 8h | €400 |
| API integration | 16h | €800 |
| Offline sync | 24h | €1,200 |
| Camera/Scanner | 16h | €800 |
| Push notifications | 12h | €600 |
| Testing | 20h | €1,000 |
| App Store submission | 8h | €400 |
| **TOTAL** | **160h** | **€8,000** |

---

## 6. ROADMAP MOBILE

```
Q1 2026: PWA Optimization
├── Service Worker robust
├── Offline read mode
├── Mobile-first UI polish
└── Basic push (web push)

Q2 2026: Evaluate Native Need
├── Collect user feedback
├── Identify PWA limitations
├── Decide: PWA sufficient or Native needed

Q3 2026: Native Development (if needed)
├── React Native setup
├── Core features port
└── Beta testing

Q4 2026: Native Launch
├── App Store submission
├── Android + iOS launch
└── Feature parity with web
```

---

## 7. DECISION CRITERIA

### When to Build Native App

```
BUILD NATIVE IF:
☐ PWA limitations impact >30% of users
☐ Need background GPS tracking
☐ Need complex offline sync
☐ Users request App Store app
☐ Competitor pressure

STAY WITH PWA IF:
☐ Current features sufficient
☐ Users satisfied
☐ Budget constrained
☐ Development resources limited
```
