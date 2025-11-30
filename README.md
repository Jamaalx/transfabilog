# Floteris

**Platformă Inteligentă pentru Managementul Flotei de Transport**

[![Status](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-Netlify-00C7B7.svg)]()
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7.svg)]()

---

## Despre Floteris

Floteris este o aplicație SaaS pentru managementul complet al flotelor de transport. Centralizează datele din multiple surse externe (facturi, bănci, combustibil, GPS) și oferă rapoarte detaliate pe trei axe principale:

- **Cap Tractor** - tracking, costuri, profitabilitate per vehicul
- **Sofer** - curse, diurnă, performanță
- **Remorcă** - utilizare, documente, costuri

## Funcționalități Principale

- Dashboard real-time cu statistici
- Management vehicule și șoferi
- Curse simple și complexe (multi-stop)
- Import automat DKV, Eurowag, VERAG
- Validare documente cu AI
- Alerte documente care expiră
- Rapoarte profitabilitate și consum
- Analiză AI pentru optimizare

## Stack Tehnologic

| Layer | Tehnologie |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Shadcn/ui |
| State | Zustand, TanStack Query |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RLS |
| Charts | Recharts |
| Hosting | Netlify (frontend), Render (backend) |

## Quick Start - Development

### Prerequisites
- Node.js 20 LTS
- npm 10+
- Cont Supabase

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editează .env cu credențialele tale
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editează .env cu credențialele tale
npm run dev
```

## Production Deployment

### Frontend pe Netlify

1. **Conectează repository-ul la Netlify**
   - New site from Git → selectează acest repo
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

2. **Configurează Environment Variables** (Site settings → Environment variables):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://your-render-app.onrender.com/api/v1
   ```

3. **Deploy** - se face automat la fiecare push

### Backend pe Render

1. **Creează un nou Web Service**
   - Connect repository → selectează acest repo
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Configurează Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   FRONTEND_URL=https://your-netlify-app.netlify.app
   ```

3. **Deploy** - se face automat la fiecare push

### Post-Deployment Checklist

- [ ] Verifică health endpoint: `https://your-render-app.onrender.com/api/v1/health`
- [ ] Verifică frontend se încarcă corect
- [ ] Testează login cu credențialele de test
- [ ] Verifică CORS funcționează (frontend poate accesa API)
- [ ] Testează import documente (DKV, Eurowag, VERAG)

## Structura Proiectului

```
floteris/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities & API client
│   │   └── store/           # Zustand state
│   ├── netlify.toml         # Netlify config
│   └── package.json
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utilities
│   ├── render.yaml          # Render config
│   └── package.json
│
├── database/                 # SQL migrations & seeds
│   └── seed_real_data.sql   # Sample data
│
└── plans/                    # Documentation
```

## API Endpoints

| Endpoint | Descriere |
|----------|-----------|
| `GET /api/v1/health` | Health check |
| `POST /api/v1/auth/login` | Autentificare |
| `GET /api/v1/vehicles` | Lista vehicule |
| `GET /api/v1/drivers` | Lista șoferi |
| `GET /api/v1/trips` | Lista curse |
| `GET /api/v1/dashboard` | Date dashboard |
| `POST /api/v1/dkv/import` | Import DKV |
| `POST /api/v1/uploaded-documents` | Upload documente |

## Clienți

Floteris este o platformă multi-tenant. Fiecare companie de transport are propriul spațiu izolat.

**Clientul actual:** TRANSFABI LOG SRL

## Test Credentials

Vezi `TEST_CREDENTIALS.md` pentru credențialele de test.

## Licență

Proprietar. Toate drepturile rezervate.

---

**Floteris** - Flotă. Management. Inteligent.
