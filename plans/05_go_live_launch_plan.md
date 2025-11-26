# Transport SaaS - Plan Go-Live
## Lansare în Producție și Tranziție

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. FAZE DE LANSARE

### 1.1 Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMELINE GO-LIVE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FAZA 1: SOFT LAUNCH (Săpt. -2)                                │
│  ├── 3-5 utilizatori test                                      │
│  ├── Date reale, volum limitat                                 │
│  ├── Feedback intensiv                                         │
│  └── Bug fixes zilnice                                         │
│                                                                 │
│  FAZA 2: PILOT (Săpt. -1)                                      │
│  ├── Toți utilizatorii                                         │
│  ├── Parallel run cu sistem vechi                              │
│  ├── Comparare rezultate                                       │
│  └── Training sessions                                         │
│                                                                 │
│  FAZA 3: GO-LIVE (Ziua 0)                                      │
│  ├── Cutover weekend                                           │
│  ├── Import date complete                                      │
│  ├── Sistem vechi → read-only                                  │
│  └── Suport intensiv                                           │
│                                                                 │
│  FAZA 4: STABILIZARE (Săpt. +1-2)                              │
│  ├── Monitorizare intensivă                                    │
│  ├── Bug fixes prioritare                                      │
│  ├── Optimizări performance                                    │
│  └── Feedback collection                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. CHECKLIST PRE-LAUNCH

### 2.1 Tehnic

```
INFRASTRUCTURĂ:
☐ Supabase Pro activat
☐ Backend deployed și testat
☐ Frontend deployed și testat
☐ Domain configurat cu SSL
☐ Backup automat funcțional
☐ Monitoring activ (Sentry, Uptime)
☐ Rate limiting configurat
☐ Security headers OK

INTEGRĂRI:
☐ SmartBill conectat și testat
☐ GPS APIs conectate
☐ DKV/Eurowag configurat (dacă disponibil)
☐ Banking API (dacă aprobat)

DATE:
☐ Schema DB finală aplicată
☐ RLS policies testate
☐ Date master importate (vehicule, șoferi)
☐ Utilizatori creați
☐ Backup pre-launch făcut
```

### 2.2 Business

```
DOCUMENTAȚIE:
☐ Manual utilizator finalizat
☐ Video tutoriale încărcate
☐ FAQ actualizat
☐ Contact suport comunicat

TRAINING:
☐ Training administratori completat
☐ Training utilizatori completat
☐ Q&A session făcut
☐ Materiale distribuite

LEGAL:
☐ Privacy Policy publicată
☐ Terms of Service acceptate
☐ GDPR compliance verificat
☐ DPA-uri semnate (furnizori)

COMUNICARE:
☐ Email anunț go-live pregătit
☐ Stakeholders informați
☐ Plan escalare comunicat
```

---

## 3. RUNBOOK GO-LIVE

### 3.1 Cutover Weekend

```
VINERI SEARA (T-2 zile):
─────────────────────────────────────────────────────────────
18:00  □ Freeze sistem vechi (no new entries)
18:30  □ Export final date din sistem vechi
19:00  □ Backup complet sistem vechi
19:30  □ Verificare export completitudine
20:00  □ Comunicare către utilizatori: "Sistem offline weekend"

SÂMBĂTĂ (T-1 zi):
─────────────────────────────────────────────────────────────
09:00  □ Start import date în sistem nou
10:00  □ Import vehicule + verificare
10:30  □ Import șoferi + verificare
11:00  □ Import curse istorice (batch 1)
12:00  □ PAUZĂ - verificare progres
13:00  □ Import curse istorice (batch 2)
14:00  □ Import tranzacții
15:00  □ Import documente + upload fișiere
16:00  □ Verificare integritate referențială
17:00  □ Reconciliere totals
18:00  □ Raport import - review cu business owner

DUMINICĂ (T-0):
─────────────────────────────────────────────────────────────
10:00  □ Smoke tests - toate funcționalitățile
11:00  □ Test cu 2-3 utilizatori cheie
12:00  □ Fix orice issue critice
13:00  □ GO/NO-GO decision meeting
14:00  □ Dacă GO: activare access pentru toți
15:00  □ Email notificare: "Sistemul nou este LIVE"
16:00  □ Monitorizare primele accesuri
18:00  □ Review ziua și prep pentru Luni

LUNI (T+1 zi):
─────────────────────────────────────────────────────────────
08:00  □ Suport on-site disponibil
08:30  □ Verificare noapte - logs, erori
09:00  □ Standup rapid echipă
...    □ Suport continuu
17:00  □ Review zi 1 - issues list
17:30  □ Prioritizare fixes pentru mâine
```

### 3.2 Echipa Go-Live

| Rol | Persoană | Responsabilități | Contact |
|-----|----------|------------------|---------|
| Go-Live Manager | TBD | Coordonare, decizii | Tel: xxx |
| Tech Lead | TBD | Import, debugging | Tel: xxx |
| DBA | TBD | Database, backup | Tel: xxx |
| Business Owner | TBD | Validare, sign-off | Tel: xxx |
| Support Lead | TBD | Suport utilizatori | Tel: xxx |

---

## 4. CRITERII GO/NO-GO

### 4.1 GO Criteria (toate trebuie îndeplinite)

```
TEHNIC:
☑ Zero erori critice în smoke tests
☑ Toate integrările funcționale
☑ Performance acceptabilă (< 3s page load)
☑ Backup verificat și funcțional
☑ Rollback testat și documentat

DATE:
☑ Import completat 100%
☑ Discrepanțe totals < 1%
☑ Documente asociate corect
☑ Sampling validat (min 5%)

BUSINESS:
☑ Training completat
☑ Documentație disponibilă
☑ Suport pregătit
☑ Stakeholders aligned
```

### 4.2 NO-GO Triggers

```
BLOCANȚI ABSOLUȚI:
✗ Erori critice nerezolvate
✗ Pierdere date > 0.1%
✗ Integrare critică nefuncțională
✗ Security vulnerability identificată
✗ Business owner nu semnează

NECESITĂ DECIZIE:
? Discrepanțe totals între 1-5%
? Performance marginal (3-5s)
? Funcționalitate non-critică broken
? < 80% utilizatori trained
```

---

## 5. ROLLBACK PLAN

### 5.1 Trigger Rollback

```
DECIZIE ROLLBACK dacă în primele 48h:
- Erori critice care afectează > 50% utilizatori
- Pierdere date confirmate
- Sistem indisponibil > 2 ore
- Integrare critică eșuează complet
```

### 5.2 Procedură Rollback

```
ROLLBACK STEPS:
─────────────────────────────────────────────────────────────
1. DECIZIE (15 min)
   □ Go-Live Manager convoacă meeting
   □ Evaluare situație
   □ Decizie documentată

2. COMUNICARE (15 min)
   □ Email urgent către utilizatori
   □ Notificare stakeholders
   □ Update status page

3. REVERT ACCESS (30 min)
   □ Dezactivare access sistem nou
   □ Reactivare sistem vechi (read-write)
   □ Verificare sistem vechi funcțional

4. DATE (dacă necesar, 2-4h)
   □ Export date noi introduse în sistem nou
   □ Import în sistem vechi (manual dacă necesar)
   □ Verificare

5. POST-MORTEM (24h)
   □ Root cause analysis
   □ Action items
   □ New go-live date planning
```

---

## 6. SUPORT POST-LAUNCH

### 6.1 Suport Intensiv (Primele 2 săptămâni)

| Perioadă | Acoperire | Canal |
|----------|-----------|-------|
| Ziua 1-3 | On-site 8h + remote | Toate |
| Ziua 4-7 | Remote 8-18 | Tel, WhatsApp, Email |
| Săpt. 2 | Remote 9-17 | Email, WhatsApp |

### 6.2 Escalare

| Nivel | Timp răspuns | Cine rezolvă |
|-------|--------------|--------------|
| L1: How-to | < 2h | Support Lead |
| L2: Bug minor | < 4h | Developer |
| L3: Bug major | < 1h | Tech Lead |
| L4: Sistem down | < 15min | Toată echipa |

### 6.3 Daily Standup (Prima săptămână)

```
AGENDA STANDUP ZILNIC (15 min):
─────────────────────────────────────────────────────────────
1. Număr tickete deschise/închise
2. Issues critice
3. Feedback utilizatori
4. Metrics (uptime, errors)
5. Plan pentru azi
```

---

## 7. SUCCESS METRICS

### 7.1 KPIs Go-Live

| Metric | Target Ziua 1 | Target Săpt. 1 | Target Lună 1 |
|--------|---------------|----------------|---------------|
| Uptime | > 95% | > 99% | > 99.5% |
| Error rate | < 5% | < 1% | < 0.5% |
| User adoption | > 50% | > 80% | > 95% |
| Support tickets | < 20 | < 10/zi | < 3/zi |
| Critical bugs | 0 | 0 | 0 |

### 7.2 User Feedback Collection

```
FEEDBACK COLLECTION:
─────────────────────────────────────────────────────────────
□ Survey după Ziua 3 (scurt, 5 întrebări)
□ Interview-uri 1:1 cu power users (Săpt. 1)
□ Feedback form în aplicație
□ Review meeting end of Săpt. 2

ÎNTREBĂRI CHEIE:
1. Cât de ușor a fost să începi lucrul? (1-5)
2. Ce funcționalitate lipsește cel mai mult?
3. Ce funcționalitate îți place cel mai mult?
4. Ai întâmpinat probleme tehnice? Care?
5. Recomanzi sistemul colegilor? (NPS)
```
