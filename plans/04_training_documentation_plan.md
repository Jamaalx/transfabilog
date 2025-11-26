# Transport SaaS - Plan Training și Documentație
## Materiale de Instruire și Documentație Utilizator

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. DOCUMENTAȚIE UTILIZATOR

### 1.1 Quick Start Guide (2 pagini)

```
GHID RAPID - TRANSPORT SAAS

1. PRIMUL LOGIN
   - Accesează: app.transport-saas.ro
   - Introdu email și parola primite
   - Schimbă parola la prima autentificare

2. NAVIGARE
   - Dashboard: vedere generală
   - Vehicule: gestionare flotă
   - Șoferi: gestionare personal
   - Curse: înregistrare și urmărire
   - Documente: acte și expirări
   - Financiar: tranzacții și rapoarte

3. ACȚIUNI FRECVENTE
   - Adaugă cursă nouă: Curse → + Cursă Nouă
   - Vezi poziții GPS: Dashboard → Hartă
   - Generează raport: Rapoarte → Selectează tip

4. SUPORT
   - Email: support@...
   - Tel: 07xx...
```

### 1.2 Manual Utilizator (Structură)

```
MANUAL UTILIZATOR COMPLET

Cap. 1: INTRODUCERE
├── Despre aplicație
├── Cerințe sistem (browser)
└── Primul login

Cap. 2: DASHBOARD
├── Statistici principale
├── Hartă GPS live
├── Widget alerte
└── Activitate recentă

Cap. 3: VEHICULE
├── Lista vehicule
├── Adăugare vehicul nou
├── Editare detalii
├── Documente vehicul
├── Costuri și statistici
└── Tracking GPS individual

Cap. 4: ȘOFERI
├── Lista șoferi
├── Profil șofer
├── Documente (permis, ADR)
├── Istoric curse
└── Diurnă și salarii

Cap. 5: CURSE
├── Curse active vs. istorice
├── Cursă simplă (pas cu pas)
├── Cursă complexă (wizard)
├── Calcul profitabilitate
└── Export decont

Cap. 6: DOCUMENTE
├── Tipuri documente
├── Upload și asociere
├── Calendar expirări
└── Alerte automate

Cap. 7: FINANCIAR
├── Tranzacții
├── Matching automat
├── Facturi SmartBill
└── Analiza costurilor

Cap. 8: RAPOARTE
├── Profit per vehicul/șofer
├── Consum combustibil
├── Export Excel/PDF
└── Rapoarte personalizate

Cap. 9: SETĂRI
├── Profil utilizator
├── Setări companie
├── Integrări API
└── Gestionare utilizatori

Cap. 10: FAQ
├── Întrebări frecvente
├── Troubleshooting
└── Contact suport
```

---

## 2. VIDEO TUTORIALE

### 2.1 Lista Video-uri

| # | Titlu | Durată | Conținut |
|---|-------|--------|----------|
| 1 | Introducere și Login | 3 min | Login, navigare, profil |
| 2 | Dashboard și Hartă GPS | 5 min | Statistici, hartă live |
| 3 | Gestionare Vehicule | 7 min | CRUD vehicule, documente |
| 4 | Gestionare Șoferi | 5 min | CRUD șoferi, istoric |
| 5 | Creare Cursă Simplă | 6 min | Pas cu pas, calcul profit |
| 6 | Creare Cursă Complexă | 10 min | Wizard complet |
| 7 | Upload Documente | 4 min | Upload, asociere, alerte |
| 8 | Tranzacții și Matching | 8 min | Import, matching, reconciliere |
| 9 | Generare Rapoarte | 5 min | Tipuri, filtre, export |
| 10 | Setări și Integrări | 6 min | Configurare API, utilizatori |

### 2.2 Script Video #5: Creare Cursă Simplă

```
[INTRO - 10 sec]
"În acest tutorial, vom învăța cum să creăm o cursă simplă
și să vedem calculul automat al profitabilității."

[NAVIGARE - 20 sec]
"Din meniul principal, accesăm Curse, apoi click pe
butonul Cursă Nouă. Alegem Cursă Simplă."

[FORMULAR - 3 min]
"Completăm informațiile:
- Selectăm vehiculul din dropdown
- Alegem șoferul
- Opțional, selectăm remorca
- Introducem data plecare și întoarcere
- Locația de start și destinație
- Kilometrii total, încărcat și gol
- Zilele în România și străinătate
- Venitul și moneda
- Diurna se calculează automat"

[SALVARE - 30 sec]
"După completare, click Salvează.
Cursa apare în listă cu status Planificată."

[PROFITABILITATE - 1.5 min]
"Pentru a vedea profitabilitatea, deschidem detaliile cursei.
Sistemul calculează automat:
- Costuri combustibil (din carduri DKV/Eurowag)
- Taxe de drum
- Diurna șofer
- Costuri alocate vehicul
- Profit net și marjă"

[OUTRO - 20 sec]
"Acum știți cum să creați o cursă simplă.
Pentru curse cu mai multe opriri, urmăriți tutorialul
despre curse complexe."
```

---

## 3. PLAN DE TRAINING

### 3.1 Sesiuni Training

| Sesiune | Audiență | Durată | Conținut |
|---------|----------|--------|----------|
| **Inițială** | Toți utilizatorii | 2h | Prezentare generală, hands-on |
| **Operatori** | Operatori | 1.5h | Curse, documente, tranzacții |
| **Manageri** | Manageri | 1h | Rapoarte, analize, export |
| **Admin** | Administratori | 1.5h | Setări, integrări, utilizatori |
| **Q&A** | Toți | 1h | Întrebări, scenarii reale |

### 3.2 Agenda Training Inițial (2h)

```
TRAINING INIȚIAL - AGENDA

00:00 - 00:15  Introducere
               - Prezentare trainer
               - Obiective training
               - Materiale furnizate

00:15 - 00:30  Overview Aplicație
               - De ce acest sistem
               - Beneficii principale
               - Arhitectură simplificată

00:30 - 00:45  Demonstrație Live
               - Login și navigare
               - Dashboard
               - Hartă GPS

00:45 - 01:00  PAUZĂ (15 min)

01:00 - 01:30  Hands-On: Module Principale
               - Participanții urmează pașii
               - Adaugă vehicul de test
               - Creează cursă simplă

01:30 - 01:45  Rapoarte și Export
               - Generare raport
               - Export Excel

01:45 - 02:00  Q&A și Suport
               - Întrebări
               - Canal suport
               - Next steps
```

### 3.3 Materiale Training

```
MATERIALE FURNIZATE:
☐ Quick Start Guide (print, A4)
☐ Manual utilizator (PDF)
☐ Link video tutoriale
☐ Credențiale cont demo
☐ Contact suport
☐ FAQ printabil
```

---

## 4. DOCUMENTAȚIE TEHNICĂ

### 4.1 API Documentation (Swagger)

```yaml
# Exemplu specificație OpenAPI
openapi: 3.0.0
info:
  title: Transport SaaS API
  version: 1.0.0
  description: API pentru managementul flotei de transport

servers:
  - url: https://api.transport-saas.ro/v1
    description: Production

security:
  - bearerAuth: []

paths:
  /vehicles/trucks:
    get:
      summary: Lista vehicule
      tags: [Vehicles]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum: [activ, inactiv, service]
      responses:
        '200':
          description: Lista vehicule
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TruckList'
```

### 4.2 Database Schema Documentation

```markdown
# Schema Bază de Date

## Tabele Principale

### truck_heads
Stochează informații despre capurile tractor.

| Coloană | Tip | Nullable | Descriere |
|---------|-----|----------|-----------|
| id | UUID | NO | Primary key |
| company_id | UUID | NO | FK → companies |
| registration_number | VARCHAR(20) | NO | Număr înmatriculare (unic) |
| vin | VARCHAR(50) | YES | Vehicle Identification Number |
| brand | VARCHAR(100) | YES | Marca (Volvo, MAN, etc.) |
| model | VARCHAR(100) | YES | Model |
| year | INTEGER | YES | Anul fabricației |
| euro_standard | VARCHAR(10) | YES | Standard emisii (Euro 6) |
| current_km | INTEGER | NO | Kilometraj curent |
| status | VARCHAR(20) | NO | activ/inactiv/service/avariat |
| gps_provider | VARCHAR(50) | YES | wialon/arobs/volvo/ecomotive |
| gps_device_id | VARCHAR(100) | YES | ID dispozitiv GPS |
| created_at | TIMESTAMP | NO | Data creare |
| updated_at | TIMESTAMP | NO | Data ultimei modificări |

### Relații
- `company_id` → `companies.id` (Many-to-One)
- `truck_heads.id` ← `trips.truck_head_id` (One-to-Many)
- `truck_heads.id` ← `documents.entity_id` WHERE entity_type='truck_head'
```

### 4.3 Deployment Guide

```markdown
# Ghid Deployment

## Prerequisites
- Node.js 20 LTS
- npm 10+
- Cont Supabase
- Cont Vercel/Railway

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=https://app.transport-saas.ro
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://api.transport-saas.ro
```

## Deploy Steps

1. Backend (Railway)
   ```bash
   railway login
   railway link
   railway up
   ```

2. Frontend (Vercel)
   ```bash
   vercel --prod
   ```

3. Database (Supabase)
   - Rulează migrații din dashboard
   - Verifică RLS policies
```

---

## 5. FAQ

### 5.1 Întrebări Frecvente

```markdown
## GENERAL

**Q: Ce browser pot folosi?**
A: Chrome, Firefox, Edge, Safari (versiuni recente).
   Recomandăm Chrome pentru cea mai bună experiență.

**Q: Pot folosi aplicația pe telefon?**
A: Da, interfața este responsive. Pentru GPS tracking
   în timp real, recomandăm desktop.

**Q: Cât de des se actualizează datele GPS?**
A: La fiecare 1 minut pentru poziții, sumar zilnic
   pentru statistici.

## CURSE

**Q: Care e diferența între cursă simplă și complexă?**
A: Cursa simplă: A→B, fără opriri intermediare.
   Cursa complexă: Multiple opriri, încărcare/descărcare
   în diferite locații.

**Q: Cum se calculează profitul?**
A: Profit = Venit - (Combustibil + Taxe + Diurnă +
   Costuri alocate vehicul)

**Q: Pot modifica o cursă după ce e completată?**
A: Da, dar modificările sunt logate pentru audit.

## FINANCIAR

**Q: De ce unele tranzacții sunt "nepotrivite"?**
A: Sistemul nu a putut asocia automat tranzacția cu
   un vehicul/cursă. Trebuie matching manual.

**Q: Cât de des se sincronizează facturile SmartBill?**
A: Zilnic, automat. Poți forța sync manual din Setări.

## DOCUMENTE

**Q: Ce formate de fișiere pot încărca?**
A: PDF, JPG, PNG. Maximum 50MB per fișier.

**Q: Când primesc alertă pentru documente care expiră?**
A: Default 30 zile înainte. Configurabil din Setări.
```

---

## 6. CALENDAR TRAINING

### 6.1 Timeline

```
SĂPTĂMÂNA -1 (Pre Go-Live):
├── Luni: Pregătire materiale training
├── Marți: Test sistem demo
├── Miercuri: Training administratori (1.5h)
├── Joi: Training inițial grup 1 (2h)
└── Vineri: Training inițial grup 2 (2h)

SĂPTĂMÂNA 0 (Go-Live):
├── Luni: GO-LIVE
├── Marți: Support on-site (4h)
├── Miercuri: Q&A session (1h)
├── Joi: Training operatori avansat (1.5h)
└── Vineri: Training manageri rapoarte (1h)

SĂPTĂMÂNA +1 (Post Go-Live):
├── Luni-Joi: Support la cerere
└── Vineri: Review și feedback (1h)
```

### 6.2 Canale Suport Post-Training

| Canal | Disponibilitate | Timp Răspuns |
|-------|-----------------|--------------|
| Email | 24/7 | < 24h |
| WhatsApp | L-V 9-18 | < 2h |
| Telefon | L-V 9-18 | Imediat |
| Documentație | 24/7 | Self-service |
