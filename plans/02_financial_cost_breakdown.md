# Transport SaaS - Plan Financiar și Costuri
## Buget, ROI și Proiecții Financiare

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft
**Responsabil:** TBD

---

## CUPRINS

1. [Sumar Executiv](#1-sumar-executiv)
2. [Costuri de Dezvoltare](#2-costuri-de-dezvoltare)
3. [Costuri Infrastructură](#3-costuri-infrastructură)
4. [Costuri Operaționale](#4-costuri-operaționale)
5. [Proiecții ROI](#5-proiecții-roi)
6. [Cash Flow](#6-cash-flow)

---

## 1. SUMAR EXECUTIV

### 1.1 Overview Costuri

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUMAR COSTURI PROIECT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COSTURI INIȚIALE (One-time)                                   │
│  ├── Dezvoltare Software      €8,500 - €12,000                 │
│  ├── Design UI/UX             €1,200 - €2,000                  │
│  ├── Setup Infrastructură     €200 - €500                      │
│  └── TOTAL INIȚIAL            €9,900 - €14,500                 │
│                                                                 │
│  COSTURI LUNARE (Recurring)                                     │
│  ├── Infrastructură           €80 - €150                       │
│  ├── API-uri externe          €50 - €100                       │
│  ├── Mentenanță               €200 - €400                      │
│  └── TOTAL LUNAR              €330 - €650                      │
│                                                                 │
│  COST ANUL 1                  €13,860 - €22,300                │
│  ROI ESTIMAT                  8-14 luni                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Beneficii Estimate

| Beneficiu | Economie Lunară | Bază Calcul |
|-----------|-----------------|-------------|
| Reducere timp introducere date | €400-600 | 20h × €25/h |
| Reducere erori/omisiuni | €200-300 | 2% din tranzacții |
| Optimizare consum combustibil | €300-500 | 1-2% economie |
| Rapoarte automate | €100-150 | 5h × €25/h |
| **TOTAL ECONOMII** | **€1,000-1,550/lună** | |

---

## 2. COSTURI DE DEZVOLTARE

### 2.1 Breakdown pe Module

| Modul | Ore Estimate | Cost (€50/h) | Prioritate |
|-------|-------------|--------------|------------|
| **Setup & Infrastructure** | | | |
| - Supabase setup + schema | 8h | €400 | HIGH |
| - Backend Express boilerplate | 12h | €600 | HIGH |
| - Frontend React setup | 8h | €400 | HIGH |
| **Core Modules** | | | |
| - Auth & User Management | 16h | €800 | HIGH |
| - Vehicles CRUD | 20h | €1,000 | HIGH |
| - Drivers CRUD | 16h | €800 | HIGH |
| - Trips Module | 32h | €1,600 | HIGH |
| - Documents Module | 20h | €1,000 | MEDIUM |
| **Financial Modules** | | | |
| - Transactions | 24h | €1,200 | HIGH |
| - Matching System | 16h | €800 | HIGH |
| - Reports | 24h | €1,200 | MEDIUM |
| **Integrations** | | | |
| - SmartBill API | 12h | €600 | HIGH |
| - Banking API | 20h | €1,000 | HIGH |
| - GPS APIs | 16h | €800 | MEDIUM |
| - DKV/Eurowag | 12h | €600 | MEDIUM |
| **Polish & Testing** | | | |
| - UI/UX refinements | 16h | €800 | MEDIUM |
| - Testing | 16h | €800 | HIGH |
| - Bug fixes buffer | 12h | €600 | - |
| **TOTAL** | **300h** | **€15,000** | |

### 2.2 Scenarii de Cost

```
SCENARIUL MINIMAL (MVP):
├── Focus: Core features only
├── Ore: ~150h
├── Cost: €7,500
├── Timeline: 4 săptămâni
└── Excluderi: GPS live, complex trips, advanced reports

SCENARIUL RECOMANDAT:
├── Focus: Full MVP + key integrations
├── Ore: ~220h
├── Cost: €11,000
├── Timeline: 6 săptămâni
└── Include: Toate features core

SCENARIUL COMPLET:
├── Focus: All features + polish
├── Ore: ~300h
├── Cost: €15,000
├── Timeline: 8 săptămâni
└── Include: GPS live, mobile-ready, advanced analytics
```

### 2.3 Design Costs

| Element | Cost | Livrabile |
|---------|------|-----------|
| UI Design (Figma) | €800-1,500 | 15-20 screens |
| Component Library | €300-500 | Design system |
| Icons & Assets | €100-200 | Custom icons |
| **TOTAL Design** | **€1,200-2,200** | |

---

## 3. COSTURI INFRASTRUCTURĂ

### 3.1 Supabase Pricing

| Plan | Cost/lună | Include | Recomandat Pentru |
|------|-----------|---------|-------------------|
| Free | €0 | 500MB DB, 1GB storage | Development |
| Pro | €25 | 8GB DB, 100GB storage | **Producție** |
| Team | €599 | Unlimited, priority support | Enterprise |

**Recomandat: Supabase Pro (€25/lună)**

### 3.2 Backend Hosting

| Provider | Plan | Cost/lună | Specs |
|----------|------|-----------|-------|
| Railway | Starter | €5 | 512MB RAM, shared CPU |
| Railway | Pro | €20 | 1GB RAM, dedicated |
| Render | Starter | €7 | 512MB RAM |
| **DigitalOcean** | **Droplet** | **€12** | **1GB RAM, 1 vCPU** |

**Recomandat: Railway Pro sau DigitalOcean (€12-20/lună)**

### 3.3 Frontend Hosting

| Provider | Plan | Cost/lună | Include |
|----------|------|-----------|---------|
| **Vercel** | **Hobby** | **€0** | **100GB bandwidth** |
| Vercel | Pro | €20 | 1TB bandwidth, team |
| Netlify | Free | €0 | 100GB bandwidth |
| Cloudflare Pages | Free | €0 | Unlimited bandwidth |

**Recomandat: Vercel Hobby (€0/lună) → Pro când crește**

### 3.4 Servicii Adiționale

| Serviciu | Provider | Cost/lună | Scop |
|----------|----------|-----------|------|
| Domain | Any | €1 | transport-app.ro |
| SSL | Let's Encrypt | €0 | Inclus în hosting |
| Email | Resend | €0-20 | Tranzacțional emails |
| Error Tracking | Sentry | €0-26 | Bug monitoring |
| Uptime Monitor | UptimeRobot | €0 | 50 monitors free |
| Analytics | Plausible | €9 | Privacy-friendly |

### 3.5 Total Infrastructură Lunară

```
OPȚIUNEA ECONOMICĂ:
├── Supabase Pro        €25
├── Railway Starter     €5
├── Vercel Free         €0
├── Domain              €1
├── Monitoring Free     €0
└── TOTAL               €31/lună

OPȚIUNEA RECOMANDATĂ:
├── Supabase Pro        €25
├── Railway Pro         €20
├── Vercel Free         €0
├── Domain              €1
├── Sentry Team         €26
├── Plausible           €9
└── TOTAL               €81/lună

OPȚIUNEA PREMIUM:
├── Supabase Pro        €25
├── DigitalOcean (2x)   €24
├── Vercel Pro          €20
├── CloudFlare          €20
├── Sentry Business     €80
└── TOTAL               €169/lună
```

---

## 4. COSTURI OPERAȚIONALE

### 4.1 API-uri Externe

| API | Pricing Model | Cost Estimat/lună | Note |
|-----|---------------|-------------------|------|
| SmartBill | Inclus în abonament | €0 | Cu abonament existent |
| Banca Transilvania | Free (PSD2) | €0 | Cerințe reglementare |
| Google Maps | Pay-per-use | €0-50 | $200 credit/lună gratis |
| DKV | Custom | TBD | Negociere necesară |
| Eurowag | Custom | TBD | Negociere necesară |
| GPS APIs | Varies | €0-100 | Depinde de provider |

**Estimare totală API-uri: €50-150/lună**

### 4.2 Mentenanță și Suport

| Tip | Cost/lună | Include |
|-----|-----------|---------|
| Bug fixes | €100-200 | 2-4h/lună |
| Updates minore | €50-100 | Security patches |
| Monitorizare | €50-100 | Verificare logs, uptime |
| **TOTAL** | **€200-400** | |

### 4.3 Backup și Storage Adițional

| Serviciu | Cost/lună | Capacitate |
|----------|-----------|------------|
| Supabase Storage | Inclus | 100GB |
| AWS S3 (backup) | €5-10 | 50GB |
| **TOTAL** | **€5-10** | |

---

## 5. PROIECȚII ROI

### 5.1 Economii Operaționale

```
ECONOMII DIRECTE (per lună):
─────────────────────────────────────────────────────────────
1. Timp introducere date manual
   Înainte: 40 ore/lună × €25/oră = €1,000
   După: 10 ore/lună × €25/oră = €250
   ECONOMIE: €750/lună

2. Reducere erori și omisiuni
   Erori evitate: 2% din valoare tranzacții
   Valoare tranzacții: €50,000/lună
   ECONOMIE: €1,000/lună

3. Timp generare rapoarte
   Înainte: 8 ore/lună × €25/oră = €200
   După: 1 oră/lună × €25/oră = €25
   ECONOMIE: €175/lună

4. Optimizare consum combustibil (GPS tracking)
   Consum lunar combustibil: €15,000
   Optimizare: 2%
   ECONOMIE: €300/lună

TOTAL ECONOMII LUNARE: ~€2,225/lună
─────────────────────────────────────────────────────────────
```

### 5.2 Calcul ROI

```
INVESTIȚIE INIȚIALĂ
├── Dezvoltare:     €11,000
├── Design:         €1,500
├── Setup:          €500
└── TOTAL:          €13,000

COSTURI LUNARE
├── Infrastructură: €80
├── Mentenanță:     €300
├── API-uri:        €70
└── TOTAL:          €450/lună

ECONOMII LUNARE:    €2,225/lună

PROFIT NET LUNAR:   €2,225 - €450 = €1,775/lună

PAYBACK PERIOD:     €13,000 / €1,775 = 7.3 luni

ROI ANUL 1:         (€1,775 × 12 - €13,000) / €13,000 = 64%
```

### 5.3 Proiecție 3 Ani

| An | Investiție | Costuri Op. | Economii | Profit Net | ROI Cumulat |
|----|------------|-------------|----------|------------|-------------|
| 1 | €13,000 | €5,400 | €26,700 | €8,300 | 64% |
| 2 | €0 | €6,000 | €28,000 | €22,000 | 233% |
| 3 | €0 | €6,500 | €30,000 | €23,500 | 414% |

---

## 6. CASH FLOW

### 6.1 Proiecție Cash Flow (Primul An)

| Lună | Investiție | Costuri | Economii | Cash Flow | Cumulat |
|------|------------|---------|----------|-----------|---------|
| 1 | €5,000 | €100 | €0 | -€5,100 | -€5,100 |
| 2 | €4,000 | €100 | €0 | -€4,100 | -€9,200 |
| 3 | €2,500 | €200 | €500 | -€2,200 | -€11,400 |
| 4 | €1,000 | €400 | €1,500 | €100 | -€11,300 |
| 5 | €500 | €450 | €2,000 | €1,050 | -€10,250 |
| 6 | €0 | €450 | €2,200 | €1,750 | -€8,500 |
| 7 | €0 | €450 | €2,200 | €1,750 | -€6,750 |
| 8 | €0 | €450 | €2,200 | €1,750 | -€5,000 |
| 9 | €0 | €450 | €2,200 | €1,750 | -€3,250 |
| 10 | €0 | €450 | €2,200 | €1,750 | -€1,500 |
| 11 | €0 | €450 | €2,200 | €1,750 | €250 |
| 12 | €0 | €450 | €2,200 | €1,750 | €2,000 |

### 6.2 Grafic Break-Even

```
Cash Flow Cumulat (€)
     │
 2000│                                              ●────
     │                                           ●
     │                                        ●
    0├─────────────────────────────────────●───────────────
     │                                  ●     Break-Even
     │                               ●        (Luna 11)
-5000│                         ● ●
     │                    ● ●
     │               ● ●
-10000│          ●
     │     ●
-12000│●
     └────┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───→ Lună
          1   2   3   4   5   6   7   8   9  10  11  12
```

---

## ANEXE

### A. Assumptions

1. Rate development: €50/oră (poate varia €40-70)
2. Economii bazate pe flotă de ~25 vehicule
3. Prețuri infrastructură la cursul actual (pot crește 5-10%/an)
4. Nu include costuri de training (vezi plan separat)
5. Mentenanță minimă în primul an (aplicație nouă)

### B. Risc și Contingency

| Risc | Impact | Mitigare | Buffer |
|------|--------|----------|--------|
| Depășire development | +20-30% cost | Scope fix, MVP first | €3,000 |
| Creștere prețuri cloud | +10%/an | Lock-in pricing | €500/an |
| Integrări complexe | +15% timp | Early prototyping | €1,500 |

**Buffer recomandat: 15-20% din buget total**

### C. Alternativă: Buy vs Build

| Factor | Build (Custom) | Buy (SaaS existent) |
|--------|----------------|---------------------|
| Cost inițial | €13,000 | €0 |
| Cost lunar | €450 | €300-500/user |
| Personalizare | 100% | Limitată |
| Integrări RO | Custom | Rareori |
| Time to market | 2-3 luni | 1 săptămână |
| **Verdict** | **Recomandat** | Cost mare pe termen lung |

> **Concluzie**: Pentru o flotă de ~25 vehicule cu nevoi specifice de integrare (SmartBill, BT, GPS providers locali), soluția custom oferă ROI superior pe termen mediu-lung.
