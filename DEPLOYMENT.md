# Floteris - Ghid de Deployment pentru Producție

Acest ghid descrie pașii necesari pentru a face deploy la Floteris în producție.

## Arhitectură

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILIZATORI                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NETLIFY (Frontend)                        │
│                 https://floteris.netlify.app                │
│                    React + Vite Build                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                          │
│              https://floteris-api.onrender.com              │
│                 Node.js + Express API                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Database)                       │
│                 PostgreSQL + Auth + RLS                      │
└─────────────────────────────────────────────────────────────┘
```

## Pas 1: Pregătirea Supabase

### 1.1 Creează proiect Supabase
1. Mergi la [supabase.com](https://supabase.com)
2. Creează un cont sau autentifică-te
3. New Project → completează detaliile
4. Salvează:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key**
   - **service_role key** (secret!)

### 1.2 Rulează migrările de bază de date
1. În Supabase Dashboard → SQL Editor
2. Rulează conținutul din `database/schema.sql` (dacă există)
3. Rulează `database/seed_real_data.sql` pentru date de test

### 1.3 Creează utilizatori de test
În Authentication → Users → Add User:
- Email: `admin@transfabilog.ro`
- Password: (setează o parolă sigură)

## Pas 2: Deploy Backend pe Render

### 2.1 Conectează repository-ul
1. Mergi la [render.com](https://render.com) și autentifică-te
2. New → Web Service
3. Connect repository (GitHub/GitLab)
4. Selectează acest repository

### 2.2 Configurare build
```
Name: floteris-backend
Region: Frankfurt (EU - pentru GDPR)
Branch: main (sau claude/floteris-production-setup-...)
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 2.3 Environment Variables
Adaugă în Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
FRONTEND_URL=https://floteris.netlify.app
```

### 2.4 Deploy
- Click "Create Web Service"
- Așteaptă build-ul (3-5 minute)
- Notează URL-ul generat (ex: `https://floteris-backend.onrender.com`)

### 2.5 Verifică deployment
```bash
curl https://floteris-backend.onrender.com/api/v1/health
# Trebuie să returneze: {"status":"healthy",...}
```

## Pas 3: Deploy Frontend pe Netlify

### 3.1 Conectează repository-ul
1. Mergi la [netlify.com](https://netlify.com) și autentifică-te
2. Add new site → Import an existing project
3. Connect to Git → selectează repository-ul

### 3.2 Configurare build
```
Branch to deploy: main (sau claude/floteris-production-setup-...)
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 3.3 Environment Variables
Adaugă în Site settings → Environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://floteris-backend.onrender.com/api/v1
```

### 3.4 Deploy
- Click "Deploy site"
- Așteaptă build-ul (1-2 minute)
- Site-ul va fi disponibil la URL-ul generat

### 3.5 Configurează custom domain (opțional)
1. Domain settings → Add custom domain
2. Adaugă `app.floteris.ro` (sau domeniul dorit)
3. Configurează DNS-ul conform instrucțiunilor

## Pas 4: Actualizare CORS

După ce ai ambele URL-uri, actualizează:

### În Render (Backend):
```env
FRONTEND_URL=https://floteris.netlify.app
```

## Pas 5: Testare finală

### Checklist de verificare:

- [ ] **Health check backend**: `GET /api/v1/health` returnează 200
- [ ] **Frontend încarcă**: pagina de login apare corect
- [ ] **Login funcționează**: poți te autentifica cu credențialele de test
- [ ] **Dashboard încarcă**: după login, vezi dashboard-ul
- [ ] **CORS ok**: nu sunt erori CORS în console
- [ ] **API calls ok**: datele se încarcă din backend

### Test rapid:
```bash
# Test backend health
curl https://YOUR-RENDER-URL.onrender.com/api/v1/health

# Test CORS (din browser console pe frontend)
fetch('https://YOUR-RENDER-URL.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

## Troubleshooting

### Backend nu pornește pe Render
1. Verifică logs în Render Dashboard
2. Asigură-te că PORT=10000 (Render folosește acest port)
3. Verifică toate env variables sunt setate

### CORS errors
1. Verifică FRONTEND_URL în backend este corect
2. Asigură-te că nu are trailing slash
3. Rebuild backend după schimbare

### Supabase connection failed
1. Verifică URL și keys sunt corecte
2. Verifică nu sunt spații extra în env vars
3. Verifică RLS policies permit operațiile

### Frontend build failed
1. Verifică npm run build local
2. Verifică toate env variables VITE_ sunt setate
3. Check TypeScript errors în build log

## Actualizări

Pentru actualizări viitoare:
1. Push la branch-ul configurat
2. Render și Netlify fac auto-deploy
3. Verifică deployment în dashboards

## Costuri estimate

| Serviciu | Plan | Cost/lună |
|----------|------|-----------|
| Supabase | Free tier | $0 |
| Render | Starter | $7 |
| Netlify | Free tier | $0 |
| **Total** | | **~$7/lună** |

Pentru producție reală, recomand:
- Supabase Pro ($25/lună) pentru backup și suport
- Render Standard ($25/lună) pentru uptime garantat
- Netlify Pro ($19/lună) pentru analytics

---

**Succes la deployment!**
