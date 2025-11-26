# Transport SaaS - Plan Securitate și GDPR
## Conformitate, Protecția Datelor și Securitate Aplicație

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft
**Responsabil:** TBD

---

## CUPRINS

1. [Cerințe GDPR](#1-cerințe-gdpr)
2. [Securitate Tehnică](#2-securitate-tehnică)
3. [Gestionarea Datelor Personale](#3-gestionarea-datelor-personale)
4. [Incident Response](#4-incident-response)
5. [Audit și Conformitate](#5-audit-și-conformitate)

---

## 1. CERINȚE GDPR

### 1.1 Date Personale Procesate

| Categorie | Date | Bază Legală | Retenție |
|-----------|------|-------------|----------|
| **Șoferi** | Nume, CNP, telefon, adresă | Contract muncă | 50 ani |
| **Utilizatori** | Email, nume, IP | Consimțământ | Cont activ + 2 ani |
| **Operațional** | GPS, ore lucrate | Interes legitim | 12 luni |
| **Financiar** | IBAN, salarii | Obligație legală | 10 ani |

### 1.2 Drepturi GDPR Implementate

| Drept | Implementare | Timp Răspuns |
|-------|--------------|--------------|
| **Acces** | Export date din setări cont | Instant |
| **Rectificare** | Edit profile, cerere admin | 24-48h |
| **Ștergere** | Cerere formală, cu excepții legale | 30 zile |
| **Portabilitate** | Export JSON/CSV | Instant |
| **Opoziție** | Dezabonare marketing | Instant |
| **Restricție** | Blocare cont temporară | 24h |

### 1.3 Documente GDPR Necesare

```
DOCUMENTE OBLIGATORII:
☐ Privacy Policy (ro/en)
☐ Terms of Service
☐ Cookie Policy
☐ Data Processing Agreement (DPA)
☐ Record of Processing Activities (ROPA)
☐ Data Protection Impact Assessment (DPIA)
☐ Breach Notification Procedure
☐ Data Subject Request Procedure
```

### 1.4 Privacy Policy - Secțiuni Cheie

```markdown
1. IDENTITATEA OPERATORULUI
   - Denumire societate
   - CUI, J
   - Adresă, contact DPO

2. DATELE COLECTATE
   - Date identificare
   - Date contact
   - Date operaționale (GPS, curse)
   - Date financiare

3. SCOPURI PROCESARE
   - Executare contract
   - Obligații legale (fiscal, muncă)
   - Interese legitime (optimizare flotă)

4. BAZA LEGALĂ
   - Art. 6(1)(b) - Contract
   - Art. 6(1)(c) - Obligație legală
   - Art. 6(1)(f) - Interes legitim

5. DESTINATARI
   - Furnizori servicii (Supabase, hosting)
   - Autorități (ANAF, ITM)
   - Parteneri (DKV, GPS providers)

6. TRANSFER INTERNAȚIONAL
   - Supabase (EU region)
   - Clauze contractuale standard

7. PERIOADA DE PĂSTRARE
   - Per categorie de date

8. DREPTURILE TALE
   - Lista completă GDPR

9. COOKIES
   - Tipuri, scopuri, durată

10. CONTACT DPO
    - Email, telefon, adresă
```

---

## 2. SECURITATE TEHNICĂ

### 2.1 Arhitectură Securitate

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: NETWORK                                               │
│  ├── CloudFlare WAF                                             │
│  ├── DDoS Protection                                            │
│  ├── SSL/TLS 1.3                                                │
│  └── IP Whitelisting (admin)                                    │
│                                                                 │
│  LAYER 2: APPLICATION                                           │
│  ├── Rate Limiting (100 req/15min)                              │
│  ├── Input Validation (Zod)                                     │
│  ├── CORS Policy                                                │
│  ├── Security Headers (Helmet)                                  │
│  └── CSRF Protection                                            │
│                                                                 │
│  LAYER 3: AUTHENTICATION                                        │
│  ├── Supabase Auth (JWT)                                        │
│  ├── Refresh Token Rotation                                     │
│  ├── Session Timeout (30 min)                                   │
│  ├── Password Policy                                            │
│  └── 2FA pentru Admin (planned)                                 │
│                                                                 │
│  LAYER 4: AUTHORIZATION                                         │
│  ├── Row Level Security (RLS)                                   │
│  ├── Role-Based Access Control                                  │
│  └── Resource-Level Permissions                                 │
│                                                                 │
│  LAYER 5: DATA                                                  │
│  ├── Encryption at Rest (AES-256)                               │
│  ├── Encryption in Transit (TLS)                                │
│  ├── Sensitive Fields Encrypted (CNP, IBAN)                     │
│  └── Audit Logging                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Autentificare & Autorizare

#### Password Policy
```javascript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // opțional
  maxAge: 90, // zile (opțional)
  preventReuse: 5, // ultimele 5 parole
};
```

#### Rate Limiting
```javascript
// Configurație rate limiting
const rateLimits = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 100, // requests per window
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 oră
    max: 10, // încercări login
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minut
    max: 60, // requests per minute
  },
};
```

#### Role Permissions Matrix

| Acțiune | Admin | Manager | Operator | Viewer |
|---------|-------|---------|----------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Vehicles | ✅ | ✅ | ✅ | ✅ |
| Edit Vehicles | ✅ | ✅ | ✅ | ❌ |
| Delete Vehicles | ✅ | ❌ | ❌ | ❌ |
| View Trips | ✅ | ✅ | ✅ | ✅ |
| Create Trips | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| API Integrations | ✅ | ❌ | ❌ | ❌ |

### 2.3 Security Headers

```javascript
// helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // pentru React
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
```

---

## 3. GESTIONAREA DATELOR PERSONALE

### 3.1 Criptare Date Sensibile

```sql
-- Extension pentru criptare
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Funcție criptare
CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      data,
      current_setting('app.encryption_key')
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție decriptare
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Câmpuri Criptate

| Tabel | Câmp | Motiv |
|-------|------|-------|
| drivers | cnp | Date identificare națională |
| drivers | iban | Date financiare |
| users | phone | PII |
| api_configurations | api_key | Credențiale |
| api_configurations | api_secret | Credențiale |

### 3.3 Anonimizare la Ștergere

```javascript
// Procedură de anonimizare pentru dreptul la ștergere
async function anonymizeDriver(driverId) {
  const anonymizedData = {
    first_name: 'DELETED',
    last_name: 'USER',
    cnp: null,
    phone: null,
    email: `deleted_${driverId}@deleted.local`,
    address: null,
    is_active: false,
    termination_date: new Date(),
    // Păstrăm date operaționale pentru rapoarte
    // hire_date, trips, transactions rămân pentru integritate
  };

  await supabase
    .from('drivers')
    .update(anonymizedData)
    .eq('id', driverId);

  // Log acțiune pentru audit
  await logAudit('GDPR_DELETION', 'driver', driverId);
}
```

### 3.4 Audit Logging

```sql
-- Tabel audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100)
);

-- Index pentru căutări
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action, timestamp DESC);

-- Trigger pentru audit automat
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    company_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.company_id, OLD.company_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. INCIDENT RESPONSE

### 4.1 Clasificare Incidente

| Nivel | Descriere | Exemple | Timp Răspuns |
|-------|-----------|---------|--------------|
| **Critical** | Breach date personale | Leak DB, acces neautorizat | < 1 oră |
| **High** | Compromitere sistem | Malware, DDoS | < 4 ore |
| **Medium** | Vulnerabilitate | Bug securitate, misconfigurare | < 24 ore |
| **Low** | Anomalie | Login suspect, pattern neobișnuit | < 72 ore |

### 4.2 Procedură Breach Notification

```
TIMELINE GDPR BREACH (72 ore):
─────────────────────────────────────────────────────────────

ORA 0: DETECTARE
├── Alertă primită (Sentry, monitoring, raport user)
├── Confirmare incident (nu false positive)
└── Notificare echipă de răspuns

ORA 0-4: CONTAINMENT
├── Izolare sistem afectat
├── Revocare acces compromis
├── Preservare log-uri pentru investigație
└── Evaluare inițială impact

ORA 4-24: INVESTIGAȚIE
├── Identificare cauză root
├── Determinare date afectate
├── Număr persoane afectate
├── Evaluare risc pentru persoane

ORA 24-48: DOCUMENTARE
├── Raport incident complet
├── Lista persoane afectate
├── Măsuri remediere implementate
├── Plan comunicare

ORA 48-72: NOTIFICARE
├── Notificare ANSPDCP (dacă risc ridicat)
├── Notificare persoane afectate (dacă risc ridicat)
├── Comunicat public (dacă necesar)

POST-INCIDENT:
├── Post-mortem complet
├── Actualizare proceduri
├── Training echipă
├── Audit suplimentar
```

### 4.3 Template Notificare ANSPDCP

```markdown
NOTIFICARE ÎNCĂLCARE SECURITATE DATE

1. DATELE OPERATORULUI
   - Denumire: [Nume Companie]
   - CUI: [CUI]
   - DPO: [Nume], [Email], [Telefon]

2. DESCRIERE INCIDENT
   - Data/ora detectare: [DD.MM.YYYY HH:MM]
   - Data/ora estimată producere: [DD.MM.YYYY HH:MM]
   - Descriere: [Ce s-a întâmplat]

3. CATEGORII DATE AFECTATE
   - [x] Date identificare
   - [ ] Date financiare
   - [ ] Date de localizare
   - [ ] Categorii speciale

4. NUMĂR PERSOANE AFECTATE
   - Estimate: [Număr]
   - Confirmate: [Număr]

5. CONSECINȚE PROBABILE
   - [Descriere impact pentru persoane]

6. MĂSURI LUATE
   - [Lista măsuri tehnice și organizatorice]

7. MĂSURI PROPUSE
   - [Plan remediere și prevenire]

8. COMUNICARE CĂTRE PERSOANE
   - [Da/Nu și justificare]

Semnătură DPO: _______________
Data: _______________
```

---

## 5. AUDIT ȘI CONFORMITATE

### 5.1 Checklist Audit Securitate

```
INFRASTRUCTURĂ:
☐ SSL/TLS configurat corect (A+ rating)
☐ Security headers prezente (A rating)
☐ Firewall configurat
☐ Porturi nefolosite închise
☐ Updates sistem aplicate

AUTENTIFICARE:
☐ Password policy activă
☐ Rate limiting funcțional
☐ Session management corect
☐ Logout funcțional
☐ Token expiry corect

AUTORIZARE:
☐ RLS activ pe toate tabelele
☐ Permissions testate
☐ No privilege escalation posibil
☐ API endpoints protejate

DATE:
☐ Encryption at rest activ
☐ Backup-uri criptate
☐ Audit logs complete
☐ Data retention respectată

GDPR:
☐ Privacy policy publicată
☐ Consent collection funcțional
☐ Data export funcțional
☐ Deletion process documentat
```

### 5.2 Calendar Audit

| Frecvență | Tip Audit | Responsabil |
|-----------|-----------|-------------|
| Zilnic | Log review (automated) | System |
| Săptămânal | Access review | Admin |
| Lunar | Vulnerability scan | DevOps |
| Trimestrial | Penetration test | External |
| Anual | GDPR compliance audit | DPO/External |

### 5.3 Metrici Securitate

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Failed login attempts/day | < 50 | - | TBD |
| Avg response to alerts | < 1h | - | TBD |
| Security patches applied | < 7 days | - | TBD |
| Uptime | > 99.5% | - | TBD |
| Data breach incidents | 0 | - | TBD |

---

## ANEXE

### A. Contact Autorități

| Autoritate | Contact | Situație |
|------------|---------|----------|
| ANSPDCP | anspdcp@dataprotection.ro | Breach notification |
| CERT-RO | alerts@cert.ro | Cyber incident |
| Poliție Cyber | - | Atac criminal |

### B. Resurse GDPR

- [Regulamentul GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Ghid ANSPDCP](https://www.dataprotection.ro/)
- [EDPB Guidelines](https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en)
