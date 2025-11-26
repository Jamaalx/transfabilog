# Transport SaaS

**Sistema de Management pentru Flotă de Transport**

[![Status](https://img.shields.io/badge/status-planning-yellow.svg)]()
[![Documentation](https://img.shields.io/badge/docs-available-green.svg)]()

---

## Despre Proiect

Transport SaaS este o aplicație web pentru managementul complet al unei flote de transport. Centralizează datele din multiple surse externe (facturi, bănci, combustibil, GPS) și oferă rapoarte detaliate pe trei axe principale:

- **Cap Tractor** - tracking, costuri, profitabilitate per vehicul
- **Șofer** - curse, diurnă, performanță
- **Remorcă** - utilizare, documente, costuri

## Funcționalități Principale

- Dashboard real-time cu GPS tracking
- Management vehicule și șoferi
- Curse simple și complexe (multi-stop)
- Sincronizare automată SmartBill, DKV, Eurowag
- Matching inteligent tranzacții
- Alerte documente care expiră
- Rapoarte profitabilitate și consum

## Stack Tehnologic

| Layer | Tehnologie |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Shadcn/ui |
| State | Redux Toolkit, TanStack Query |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RLS |
| Maps | Leaflet |
| Charts | Recharts |

## Documentație

Întreaga documentație tehnică se află în acest repository:

### Documente Core
| Document | Descriere |
|----------|-----------|
| [transport_saas_complete_plan.md](./transport_saas_complete_plan.md) | Plan tehnic complet - DB schema, API, security |
| [transport_saas_frontend_plan.md](./transport_saas_frontend_plan.md) | Arhitectură frontend React |
| [transport_saas_implementation_roadmap.md](./transport_saas_implementation_roadmap.md) | Roadmap implementare (7 săptămâni) |
| [transport_saas_remaining_plans.md](./transport_saas_remaining_plans.md) | Index documente proiect |

### Planuri Detaliate (`/plans`)
| Plan | Descriere |
|------|-----------|
| [01_data_migration_plan.md](./plans/01_data_migration_plan.md) | Migrare date istorice |
| [02_financial_cost_breakdown.md](./plans/02_financial_cost_breakdown.md) | Buget și ROI |
| [03_security_gdpr_plan.md](./plans/03_security_gdpr_plan.md) | Securitate și conformitate GDPR |
| [04_training_documentation_plan.md](./plans/04_training_documentation_plan.md) | Training și documentație utilizator |
| [05_go_live_launch_plan.md](./plans/05_go_live_launch_plan.md) | Plan lansare producție |
| [06_monitoring_kpi_plan.md](./plans/06_monitoring_kpi_plan.md) | Monitorizare și KPIs |
| [07_integration_specifications.md](./plans/07_integration_specifications.md) | Specificații API externe |
| [08_scalability_plan.md](./plans/08_scalability_plan.md) | Strategie scalabilitate |
| [09_support_maintenance_plan.md](./plans/09_support_maintenance_plan.md) | Suport și mentenanță |
| [10_mobile_app_strategy.md](./plans/10_mobile_app_strategy.md) | Strategie aplicație mobilă |
| [11_contingency_risk_plan.md](./plans/11_contingency_risk_plan.md) | Gestionare riscuri |
| [12_testing_plan.md](./plans/12_testing_plan.md) | Plan testare detaliat |

## Status Proiect

```
Faza 1: Planificare     ████████████████████ 100% ✅
Faza 2: Setup           ░░░░░░░░░░░░░░░░░░░░   0%
Faza 3: Integrări       ░░░░░░░░░░░░░░░░░░░░   0%
Faza 4: Frontend        ░░░░░░░░░░░░░░░░░░░░   0%
Faza 5: Date Istorice   ░░░░░░░░░░░░░░░░░░░░   0%
Faza 6: Go-Live         ░░░░░░░░░░░░░░░░░░░░   0%
```

## Quick Start (Când va fi implementat)

### Prerequisites
- Node.js 20 LTS
- npm 10+
- Cont Supabase

### Backend
```bash
cd transport-backend
npm install
cp .env.example .env
# Editează .env cu credențialele Supabase
npm run dev
```

### Frontend
```bash
cd transport-frontend
npm install
cp .env.example .env
# Editează .env cu credențialele Supabase
npm run dev
```

## Arhitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                   React + Vite + Redux                      │
├─────────────────────────────────────────────────────────────┤
│                          API                                │
│                   Express.js + Auth                         │
├─────────────────────────────────────────────────────────────┤
│                       DATABASE                              │
│              Supabase (PostgreSQL + RLS)                    │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL APIs                            │
│    SmartBill │ BT │ DKV │ Eurowag │ GPS │ Gmail/Drive      │
└─────────────────────────────────────────────────────────────┘
```

## Integrări

| Sursă | Tip | Status |
|-------|-----|--------|
| SmartBill | API REST | Planned |
| Banca Transilvania | PSD2 API | Planned |
| DKV | API REST | Planned |
| Eurowag | API REST | Planned |
| Wialon | API REST | Planned |
| AROBS | API REST | Planned |
| Volvo | API REST | Planned |
| Google Gmail/Drive | OAuth2 | Planned |

## Estimări

| Metric | Valoare |
|--------|---------|
| Timeline dezvoltare | 7 săptămâni |
| Cost dezvoltare | €9,000 - €15,000 |
| Cost lunar operațional | €80 - €150 |
| ROI estimat | 8-14 luni |

## Contribuire

Proiect intern. Pentru întrebări sau sugestii, contactați echipa de dezvoltare.

## Licență

Proprietar. Toate drepturile rezervate.

---

**Ultima actualizare:** 2025-11-26
