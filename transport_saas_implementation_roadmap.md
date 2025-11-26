# Transport SaaS - ROADMAP DE IMPLEMENTARE
## Următorii Pași Concreți

**Versiune:** 1.1
**Ultima actualizare:** 2025-11-26
**Status:** Planificare completă

---

## CUPRINS

1. [Status Curent](#-unde-suntem-acum)
2. [Faza 2: Setup](#-faza-2-setup-săptămâna-1)
3. [Faza 3: Integrări API](#-faza-3-integrări-api-săptămâna-2-3)
4. [Faza 4: Frontend Development](#-faza-4-frontend-development-săptămâna-3-5)
5. [Faza 5: Import Date Istorice](#-faza-5-import-date-istorice-săptămâna-6)
6. [Faza 6: Testing & Deployment](#-faza-6-testing--deployment-săptămâna-7)
7. [Timeline Overview](#-timeline-overview)
8. [Criterii de Succes](#-criterii-de-succes)
9. [Acțiuni Imediate](#-next-immediate-actions)

---

## 📍 UNDE SUNTEM ACUM

### Progres General
```
┌────────────────────────────────────────────────────────────────┐
│ FAZA 1: PLANIFICARE     ████████████████████████████ 100% ✅   │
│ FAZA 2: SETUP           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%      │
│ FAZA 3: INTEGRĂRI       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%      │
│ FAZA 4: FRONTEND        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%      │
│ FAZA 5: DATE ISTORICE   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%      │
│ FAZA 6: TESTING & GO    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%      │
└────────────────────────────────────────────────────────────────┘
```

### ✅ FAZA 1 - PLANIFICARE (COMPLETĂ)
| Deliverable | Status | Document |
|-------------|--------|----------|
| Definire cerințe | ✅ Complet | transport_saas_complete_plan.md |
| Plan arhitectural | ✅ Complet | transport_saas_complete_plan.md |
| Schema bazei de date | ✅ Complet | 26 tabele definite |
| Design API endpoints | ✅ Complet | 50+ endpoints |
| Plan Frontend React | ✅ Complet | transport_saas_frontend_plan.md |

---

## 🚀 FAZA 2: SETUP (Săptămâna 1)
**Obiectiv:** Infrastructura de bază funcțională

### 2.1 Setup Supabase (Zi 1-2)
```bash
TASKS:
□ Creare cont Supabase (dacă nu există)
□ Creare proiect nou "transport-saas"
□ Rulare schema SQL în Supabase SQL Editor
□ Verificare tabele create (26 tabele)
□ Setup Row Level Security policies
□ Creare user de test pentru development
□ Configurare environment variables
□ Test conexiune cu Supabase client
```

**Deliverables:**
- Database live și funcțional
- Documentație credențiale
- Test queries funcționale

### 2.2 Setup Backend Express.js (Zi 2-3)
```bash
TASKS:
□ Inițializare proiect Node.js
□ Instalare dependencies (express, cors, supabase-js, etc.)
□ Structură foldere pentru API
□ Setup Supabase client pentru backend
□ Implementare middleware (auth, error handling)
□ Create primele 5 endpoints de test
□ Setup Nodemon pentru development
□ Test cu Postman/Insomnia
```

**Structure:**
```
/backend
├── /src
│   ├── /routes
│   ├── /controllers
│   ├── /middleware
│   ├── /services
│   └── /config
├── .env
├── package.json
└── server.js
```

### 2.3 Setup Frontend React (Zi 3-4)
```bash
TASKS:
□ Create Vite + React project
□ Instalare Tailwind CSS
□ Setup Redux Toolkit
□ Setup React Query
□ Configurare Supabase client frontend
□ Setup React Router
□ Creare layout components (Header, Sidebar)
□ Implementare Auth flow (login/logout)
□ Protected routes setup
```

**Test Milestone:** Login funcțional + Dashboard gol

### 2.4 Setup Development Environment (Zi 4-5)
```bash
TASKS:
□ Setup Git repository
□ .gitignore pentru toate proiectele
□ Docker Compose pentru local dev (opțional)
□ VS Code workspace settings
□ ESLint + Prettier config
□ Pre-commit hooks
□ README cu instrucțiuni setup
```

---

## 🔌 FAZA 3: INTEGRĂRI API (Săptămâna 2-3)
**Obiectiv:** Conectare cu sursele externe de date

### 3.1 SmartBill Integration (Prioritate: HIGH)
```bash
TASKS:
□ Obține API credentials de la SmartBill
□ Implementare client SmartBill în backend
□ Endpoint pentru fetch facturi emise
□ Endpoint pentru fetch facturi primite  
□ Salvare facturi în DB
□ Sync automat zilnic (CRON job)
□ UI pentru vizualizare facturi
```

### 3.2 Banca Transilvania PSD2 API (Prioritate: HIGH)
```bash
TASKS:
□ Înregistrare aplicație pentru PSD2
□ Obținere certificat și credentials
□ Implementare OAuth flow pentru BT
□ Fetch tranzacții cont
□ Parsing și categorizare tranzacții
□ Matching automat cu entități
□ UI pentru unmatched transactions
```

### 3.3 DKV API Integration (Prioritate: MEDIUM)
```bash
TASKS:
□ Așteaptă documentație DKV
□ Test endpoint cu date mock
□ Implementare client DKV
□ Import tranzacții combustibil
□ Card mapping către vehicule
□ Calcul consum per vehicul
```

### 3.4 Eurowag API Integration (Prioritate: MEDIUM)
```bash
TASKS:
□ API key de la Eurowag
□ Client pentru Eurowag API
□ Sync tranzacții combustibil
□ Reconciliere cu DKV data
```

### 3.5 GPS APIs Integration (Prioritate: HIGH)
```bash
TASKS - pentru fiecare (Wialon, AROBS, Volvo, Ecomotive):
□ Credentials pentru API
□ Test conectivitate
□ Fetch date GPS vehicule
□ Salvare în gps_data table
□ Agregare date zilnice
□ Real-time tracking setup
□ Implementare hartă live
```

### 3.6 Gmail/Drive Integration (Prioritate: LOW)
```bash
TASKS:
□ Setup Google Cloud Project
□ OAuth pentru Gmail/Drive access
□ Parser pentru PDF-uri (Sprint Diesel)
□ Parser pentru CSV-uri (Verag)
□ Extract date din atașamente
□ Import automat în transactions
```

---

## 💻 FAZA 4: FRONTEND DEVELOPMENT (Săptămâna 3-5)
**Obiectiv:** Interfață completă și funcțională

### 4.1 Core Modules (Săptămâna 3)
```bash
MODULE: Dashboard
□ Stats cards (vehicule, șoferi, curse, km)
□ Revenue chart (ultimele 30 zile)
□ Alerts widget
□ GPS map cu toate vehiculele
□ Recent activity feed

MODULE: Vehicles
□ Vehicle list cu pagination
□ Add/Edit vehicle form
□ Vehicle details page
□ Documents per vehicul
□ Costs breakdown
□ GPS tracking individual
```

### 4.2 Operational Modules (Săptămâna 4)
```bash
MODULE: Drivers  
□ Driver list și search
□ Add/Edit driver
□ Driver statistics
□ Documents (CIM, ADR)
□ Salary și diurnă

MODULE: Trips
□ Trip list cu filtre
□ Simple trip form
□ Complex trip wizard (4 steps)
□ Trip details și profitability
□ Route visualization pe hartă
□ Print settlement (decont)
```

### 4.3 Financial Modules (Săptămâna 5)
```bash
MODULE: Documents
□ Expiring documents dashboard
□ Upload documents
□ OCR pentru extragere date
□ Calendar view pentru expirări

MODULE: Finance
□ Transactions list
□ Matching interface
□ Import wizard (CSV/Excel)
□ Invoices from SmartBill
□ Cost analysis charts
```

### 4.4 Reporting Module (Săptămâna 5)
```bash
MODULE: Reports
□ Profit per vehicul
□ Profit per șofer
□ Consum combustibil
□ Statistici curse
□ KPIs dashboard
□ Export Excel/PDF
□ Custom report builder
```

---

## 📥 FAZA 5: IMPORT DATE ISTORICE (Săptămâna 6)
**Obiectiv:** Migrare date 01.01.2025 - 01.11.2025

### 5.1 Pregătire Date
```bash
TASKS:
□ Colectare toate Excel/CSV existente
□ Standardizare format date
□ Validare și curățare date
□ Mapping către noua structură
```

### 5.2 Import Scripts
```bash
TASKS:
□ Script import vehicule
□ Script import șoferi
□ Script import curse istorice
□ Script import documente
□ Script import tranzacții
□ Verificare integritate date
```

### 5.3 Reconciliere
```bash
TASKS:
□ Verificare totaluri (venituri, costuri)
□ Matching tranzacții cu curse
□ Calcul retroactiv profitabilitate
□ Generare rapoarte de verificare
□ Fix discrepanțe
```

---

## 🚀 FAZA 6: TESTING & DEPLOYMENT (Săptămâna 7)
**Obiectiv:** Aplicație live și stabilă

### 6.1 Testing
```bash
TASKS:
□ Unit tests pentru business logic
□ Integration tests pentru APIs
□ E2E tests pentru flows critice
□ Performance testing
□ Security audit
□ UAT cu utilizatori reali
```

### 6.2 Deployment
```bash
TASKS:
□ Setup hosting (Vercel/Railway/VPS)
□ Domain și SSL
□ CI/CD pipeline
□ Monitoring (Sentry, Analytics)
□ Backup strategy
□ Documentation utilizator
```

---

## 📊 TIMELINE OVERVIEW

```
Săptămâna 1: SETUP
├── Zi 1-2: Supabase
├── Zi 2-3: Backend  
├── Zi 3-4: Frontend base
└── Zi 4-5: Dev environment

Săptămâna 2-3: INTEGRĂRI
├── SmartBill API
├── Banca Transilvania
├── GPS systems
└── DKV/Eurowag

Săptămâna 3-5: FRONTEND
├── Dashboard & Core
├── Modules operaționale
└── Rapoarte

Săptămâna 6: DATE ISTORICE
├── Prepare & clean
└── Import & verify

Săptămâna 7: LIVE
├── Testing
└── Deployment
```

---

## ✅ CRITERII DE SUCCES

### Pentru FAZA 2 (Setup):
- [ ] Database funcțional cu toate tabelele
- [ ] API poate face CRUD pe entități principale
- [ ] Frontend poate face login și afișa dashboard
- [ ] Development environment complet configurat

### Pentru FAZA 3 (Integrări):
- [ ] Cel puțin 3 surse externe conectate
- [ ] Date se sincronizează automat zilnic
- [ ] Matching automat funcționează >80% accuracy

### Pentru FAZA 4 (Frontend):
- [ ] Toate modulele principale funcționale
- [ ] Poate adăuga/edita toate entitățile
- [ ] Rapoarte se generează corect
- [ ] UX testat cu utilizatori

### Pentru FAZA 5 (Date istorice):
- [ ] 11 luni de date importate complet
- [ ] Discrepanțe <1% față de sistemul vechi
- [ ] Toate documentele asociate corect

---

## 🎯 NEXT IMMEDIATE ACTIONS

### ACUM - Pentru a începe FAZA 2:

1. **Setup Supabase (AZI)**
   ```bash
   # Pași concreți:
   1. Du-te la: https://supabase.com
   2. Create new project: "transport-saas"
   3. Copiază SQL schema în SQL Editor
   4. Run schema
   5. Verifică tabelele create
   ```

2. **Inițializare Backend (AZI)**
   ```bash
   mkdir transport-backend
   cd transport-backend
   npm init -y
   npm install express cors dotenv @supabase/supabase-js
   npm install -D nodemon
   ```

3. **Inițializare Frontend (MÂINE)**
   ```bash
   npm create vite@latest transport-frontend -- --template react
   cd transport-frontend
   npm install
   npm install @supabase/supabase-js @reduxjs/toolkit react-redux
   npm install tailwindcss postcss autoprefixer
   ```

---

## 🔥 PRIORITĂȚI CRITICE

### Must Have pentru MVP (Minimum Viable Product):
1. **Vehicule** - add, view, costs
2. **Șoferi** - manage drivers
3. **Curse simple** - add trips
4. **SmartBill sync** - facturi
5. **Banca sync** - tranzacții
6. **Raport profit** - basic P&L

### Nice to Have (poate aștepta):
- Curse complexe
- GPS live tracking  
- OCR documente
- Custom reports
- Mobile app

---

## ❓ DECIZII NECESARE

Înainte de a continua, clarifică:

1. **Hosting preference?**
   - Cloud (Vercel, Railway) - mai simplu
   - VPS (DigitalOcean, Hetzner) - mai control
   
2. **Domeniu?**
   - Sub-domeniu: app.firma-ta.ro
   - Domeniu nou: transport-app.ro

3. **Priorități business?**
   - Ce modul e cel mai urgent?
   - Care integrare API e critică?

4. **Resurse disponibile?**
   - Cine va testa?
   - Cine introduce date istorice?

---

## 📞 SUPPORT PLAN

### Daily Standup Questions:
1. Ce am terminat ieri?
2. Ce fac azi?
3. Există blocaje?

### Weekly Review:
- Demo funcționalități noi
- Ajustare priorități
- Planning săptămâna următoare

### Communication:
- Updates zilnice pe Slack/Discord
- Code review pe GitHub
- Bug tracking în GitHub Issues

---

**🚦 READY TO START?**

Următorul pas concret: **Deschide Supabase și creează proiectul!**

Apoi revino și putem continua cu setup-ul efectiv al codului.