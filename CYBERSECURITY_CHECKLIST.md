# CHECKLIST CYBERSECURITY - Pre-Production
## Floteris - Fleet Management Platform

**Data:** 30 Noiembrie 2025
**Status:** De verificat înainte de lansare

---

## 1. VERIFICARE DEPENDENȚE (npm audit)

### Backend
```bash
cd backend
npm audit
```

### Frontend
```bash
cd frontend
npm audit
```

**Rezultat așteptat:** 0 vulnerabilități HIGH sau CRITICAL

**Dacă găsiți vulnerabilități:**
```bash
npm audit fix
# sau pentru fix forțat (poate sparge compatibilitatea)
npm audit fix --force
```

---

## 2. CHECKLIST SECURITATE BACKEND

### 2.1 Environment Variables
- [ ] `.env` NU este în git (verificat în .gitignore)
- [ ] Toate cheile API sunt în variabile de mediu
- [ ] `SUPABASE_SERVICE_KEY` nu este expusă în frontend
- [ ] `OPENAI_API_KEY` este securizată
- [ ] Credențialele de test NU sunt în producție

### 2.2 Autentificare & Autorizare
- [ ] Rate limiting activ pe `/api/auth/*` (max 10 încercări/oră)
- [ ] Rate limiting general (100 req/15min per IP)
- [ ] JWT tokens expiră (verificați `expiresIn`)
- [ ] Refresh token rotation activat în Supabase
- [ ] Session timeout configurat (30 min recomandabil)

### 2.3 Headers de Securitate (Helmet.js)
```javascript
// Verificați în server.js că aveți:
app.use(helmet());
```
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Content-Security-Policy` configurat

### 2.4 CORS
```javascript
// Verificați configurația CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL, // NU '*' în producție!
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};
```
- [ ] CORS nu permite `origin: '*'` în producție
- [ ] Doar domeniile cunoscute sunt permise

### 2.5 Input Validation
- [ ] Toate endpoint-urile validează input (express-validator)
- [ ] File uploads verifică tipul și mărimea
- [ ] SQL injection prevenit (Supabase prepared statements)
- [ ] NoSQL injection prevenit
- [ ] Path traversal prevenit pentru file uploads

### 2.6 Logging & Monitoring
- [ ] Winston logger configurat
- [ ] Loguri NU conțin date sensibile (parole, tokens)
- [ ] Erori logate pentru debugging
- [ ] Request logging cu Morgan

---

## 3. CHECKLIST SECURITATE FRONTEND

### 3.1 Build & Deployment
- [ ] Build în mod producție: `npm run build`
- [ ] Source maps dezactivate în producție
- [ ] Console.log-uri eliminate
- [ ] DevTools React Query dezactivate în prod

### 3.2 Protecție XSS
- [ ] React escapează automat - NU folosiți `dangerouslySetInnerHTML`
- [ ] Input-uri sanitizate înainte de afișare
- [ ] URL-uri validate înainte de redirect

### 3.3 Autentificare Client
- [ ] Tokens stocate securizat (httpOnly cookies preferat)
- [ ] Logout șterge toate datele locale
- [ ] Protected routes funcționează corect
- [ ] Redirect la login pentru pagini protejate

### 3.4 API Calls
- [ ] Toate request-urile folosesc HTTPS
- [ ] Tokens trimise în headers (nu în URL)
- [ ] Erori de API gestionate corect (nu expun detalii)

---

## 4. CHECKLIST SUPABASE

### 4.1 Row Level Security (RLS)
```sql
-- Verificați că RLS este activat pe TOATE tabelele
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
- [ ] RLS activat pe toate tabelele
- [ ] Policies verifică `company_id` pentru izolare date
- [ ] Utilizatorii nu pot accesa date ale altor companii

### 4.2 Politici RLS de Verificat
- [ ] `truck_heads` - izolare per companie
- [ ] `trailers` - izolare per companie
- [ ] `drivers` - izolare per companie (DATE SENSIBILE!)
- [ ] `trips` - izolare per companie
- [ ] `transactions` - izolare per companie
- [ ] `documents` - izolare per companie
- [ ] `users` - admin poate vedea doar userii companiei sale

### 4.3 Service Key
- [ ] `SUPABASE_SERVICE_KEY` folosită DOAR în backend
- [ ] NICIODATĂ expusă în frontend
- [ ] Folosită doar pentru operații admin

### 4.4 Auth Settings
- [ ] Email confirmation activat
- [ ] Password minimum 8 caractere
- [ ] Rate limiting pe auth endpoints
- [ ] Allowed redirect URLs configurate corect

---

## 5. CHECKLIST HTTPS & DNS

### 5.1 Certificate SSL
- [ ] Certificate SSL valid (Let's Encrypt sau comercial)
- [ ] Certificate nu expiră în curând
- [ ] HTTPS forțat (redirect HTTP → HTTPS)
- [ ] HSTS header activ

### 5.2 DNS
- [ ] DNS configurat corect
- [ ] DNSSEC activat (opțional dar recomandat)
- [ ] CAA records configurate

---

## 6. CHECKLIST GDPR & LEGAL

### 6.1 Documente Legale
- [ ] Privacy Policy publicată și accesibilă
- [ ] Terms of Service publicate și accesibile
- [ ] Cookie Policy (dacă folosiți cookies)
- [ ] OpenAI disclosure în Privacy Policy ✓

### 6.2 Consimțământ
- [ ] Accept Terms la înregistrare
- [ ] Accept Privacy Policy la înregistrare
- [ ] Consimțământ separat pentru funcții AI
- [ ] Cookie consent banner (dacă e cazul)

### 6.3 Drepturi Utilizatori
- [ ] Export date funcțional
- [ ] Ștergere cont funcțională
- [ ] Modificare date personale funcțională

---

## 7. TESTE DE SECURITATE

### 7.1 Teste Manuale
```bash
# Test 1: Verificare că nu se poate accesa date ale altor companii
# Login ca user A, încearcă să accesezi date user B

# Test 2: Verificare rate limiting
# Fă 15 request-uri rapide și verifică că primești 429

# Test 3: Verificare auth
# Încearcă să accesezi /api/trips fără token - trebuie să primești 401

# Test 4: Verificare CORS
curl -H "Origin: https://evil.com" https://your-api.com/api/health
# Trebuie să primești eroare CORS
```

### 7.2 Tools de Scanare (opțional dar recomandat)
```bash
# OWASP ZAP - scanare vulnerabilități web
# https://www.zaproxy.org/

# Nikto - web server scanner
nikto -h https://your-api.com

# SSL Labs - verificare configurație SSL
# https://www.ssllabs.com/ssltest/
```

### 7.3 Penetration Testing
- [ ] Consider un pentest profesionist înainte de lansare cu date reale
- [ ] Sau folosiți platforme ca HackerOne, Bugcrowd

---

## 8. BACKUP & DISASTER RECOVERY

### 8.1 Backup-uri
- [ ] Backup-uri Supabase activate (verificați în dashboard)
- [ ] Point-in-time recovery disponibil
- [ ] Backup-uri testate (puteți restaura?)

### 8.2 Monitorizare
- [ ] Sentry sau similar pentru error tracking
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Alerting pe erori critice
- [ ] Logs centralizate

---

## 9. COMENZI DE VERIFICARE RAPIDĂ

### Verificare completă înainte de deploy:

```bash
# 1. Audit npm packages
cd backend && npm audit && cd ../frontend && npm audit

# 2. Build test
cd frontend && npm run build

# 3. Lint check
cd backend && npm run lint
cd frontend && npm run lint

# 4. Verificare .env nu e în git
git status | grep -i env

# 5. Verificare secrets nu sunt hardcodate
grep -r "sk-" --include="*.js" --include="*.ts" .
grep -r "supabase" --include="*.js" --include="*.ts" . | grep -v ".env"
```

---

## 10. CHECKLIST FINAL PRE-PRODUCTION

### Must Have (Obligatoriu):
- [ ] npm audit fără HIGH/CRITICAL
- [ ] RLS activat pe toate tabelele
- [ ] HTTPS configurat
- [ ] Environment variables securizate
- [ ] Rate limiting activ
- [ ] CORS restrictiv
- [ ] Privacy Policy publicată
- [ ] Terms of Service publicate
- [ ] Backup-uri funcționale

### Should Have (Recomandat):
- [ ] Error monitoring (Sentry)
- [ ] Uptime monitoring
- [ ] Logging centralizat
- [ ] 2FA pentru admin
- [ ] Pentest sau security scan

### Nice to Have:
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection (Cloudflare)
- [ ] Bug bounty program

---

## SEMNĂTURI VERIFICARE

| Verificare | Data | Responsabil | Status |
|------------|------|-------------|--------|
| npm audit backend | | | |
| npm audit frontend | | | |
| RLS Supabase | | | |
| Environment vars | | | |
| HTTPS/SSL | | | |
| CORS config | | | |
| Rate limiting | | | |
| Privacy Policy | | | |
| Backup test | | | |

---

**IMPORTANT:** Nu lansați în producție până când toate itemele "Must Have" nu sunt bifate!

---

*Document creat la 30 Noiembrie 2025*
