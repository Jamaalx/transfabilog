# Transport SaaS - Plan Contingency și Risk Management
## Gestionarea Riscurilor și Planuri de Backup

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. RISK REGISTER

### 1.1 Riscuri Tehnice

| ID | Risc | Probabilitate | Impact | Scor | Mitigare |
|----|------|---------------|--------|------|----------|
| T1 | Supabase downtime | Low | Critical | Medium | Backup local, status monitoring |
| T2 | API externă indisponibilă | Medium | High | High | Cache, fallback manual |
| T3 | Data corruption | Low | Critical | Medium | Backup zilnic, audit logs |
| T4 | Security breach | Low | Critical | Medium | Security measures, audit |
| T5 | Performance degradation | Medium | Medium | Medium | Monitoring, optimization |
| T6 | Integration breaks (API changes) | Medium | High | High | Versioning, tests |

### 1.2 Riscuri Business

| ID | Risc | Probabilitate | Impact | Scor | Mitigare |
|----|------|---------------|--------|------|----------|
| B1 | Low user adoption | Medium | High | High | Training, UX focus |
| B2 | Scope creep | High | Medium | High | Clear requirements, PM |
| B3 | Key person dependency | Medium | High | High | Documentation, cross-training |
| B4 | Budget overrun | Medium | Medium | Medium | Buffer 20%, MVP focus |
| B5 | Timeline delay | High | Medium | High | Realistic estimates, buffer |

### 1.3 Riscuri Externe

| ID | Risc | Probabilitate | Impact | Scor | Mitigare |
|----|------|---------------|--------|------|----------|
| E1 | Regulatory changes (GDPR) | Low | High | Medium | Compliance monitoring |
| E2 | Provider pricing increase | Medium | Medium | Medium | Multi-vendor strategy |
| E3 | API deprecation | Low | High | Medium | Abstraction layer |
| E4 | Economic downturn | Low | Medium | Low | Flexible pricing |

---

## 2. CONTINGENCY PLANS

### 2.1 Supabase Down

```
SCENARIO: Supabase indisponibil > 1 oră
─────────────────────────────────────────────────────────────

IMPACT:
├── Aplicație complet indisponibilă
├── Nu se pot face operațiuni
└── Date GPS nu se mai colectează

ACȚIUNI IMEDIATE (0-15 min):
├── Verificare status.supabase.com
├── Verificare nu e problemă locală
├── Notificare utilizatori via email/SMS
└── Activare pagină maintenance

ACȚIUNI SHORT-TERM (15 min - 4h):
├── Monitorizare recovery
├── Update periodic utilizatori
└── Log incidents for SLA claim

ACȚIUNI LONG-TERM (dacă > 4h):
├── Evaluare backup restore
├── Consider failover (dacă există)
└── Post-mortem cu Supabase

PREVENȚIE:
☐ Supabase Pro pentru SLA
☐ Status page monitoring
☐ Local cache pentru date critice
☐ Backup extern săptămânal
```

### 2.2 SmartBill API Broken

```
SCENARIO: SmartBill API nu răspunde sau erori
─────────────────────────────────────────────────────────────

IMPACT:
├── Facturile noi nu se sincronizează
├── Rapoartele pot fi incomplete
└── Matching manual pentru tranzacții

ACȚIUNI IMEDIATE:
├── Verificare SmartBill status
├── Retry automat (exponential backoff)
├── Log erori pentru debugging
└── Alertă admin

FALLBACK:
├── Manual CSV export din SmartBill
├── Import CSV în aplicație
├── Queue sync pentru când revine

PREVENȚIE:
☐ Circuit breaker pattern
☐ Retry with exponential backoff
☐ Cache last successful sync
☐ Alert pe consecutive failures
```

### 2.3 Data Loss

```
SCENARIO: Pierdere date (ștergere accidentală, corrupție)
─────────────────────────────────────────────────────────────

IMPACT:
├── Pierdere date operaționale
├── Impact business critic
└── Posibil impact legal (fiscal)

ACȚIUNI IMEDIATE:
├── STOP orice operațiuni write
├── Identificare scope pierdere
├── Verificare backup disponibil
└── Notificare stakeholders

RECOVERY:
├── Point-in-time restore (Supabase)
├── Restore din backup zilnic
├── Reconciliere date pierdute
└── Audit log pentru ce s-a pierdut

PREVENȚIE:
☐ Soft delete (nu hard delete)
☐ Audit logs pentru toate modificările
☐ Backup zilnic testat
☐ RLS previne ștergeri accidentale
```

### 2.4 Security Breach

```
SCENARIO: Acces neautorizat la date
─────────────────────────────────────────────────────────────

ACȚIUNI IMEDIATE (Prima oră):
├── Izolare sistem (dacă posibil)
├── Revocare toate token-urile
├── Force logout all sessions
├── Preservare logs pentru investigație
└── Notificare echipă de răspuns

INVESTIGAȚIE (1-24h):
├── Identificare vector de atac
├── Determinare date afectate
├── Timeline incident
├── Impact assessment

NOTIFICĂRI (dacă necesar):
├── ANSPDCP (< 72h dacă breach date personale)
├── Utilizatori afectați
├── Stakeholders

POST-INCIDENT:
├── Fix vulnerability
├── Enhance security
├── Post-mortem complet
├── Training echipă
```

---

## 3. BUSINESS CONTINUITY

### 3.1 Fallback Procedures

| Sistem | Fallback | RTO |
|--------|----------|-----|
| Aplicație web | Maintenance page | 15 min |
| Database | Restore from backup | 2-4h |
| GPS tracking | Provider dashboard direct | 30 min |
| Facturi | SmartBill interface direct | Imediat |
| Email alerts | Manual notifications | 1h |

### 3.2 Communication Plan

```
INCIDENT COMMUNICATION:
─────────────────────────────────────────────────────────────

NIVEL 1 (Minor - < 30 min downtime):
├── Update status page
└── No user notification needed

NIVEL 2 (Moderate - 30 min - 2h):
├── Update status page
├── Email to affected users
└── Social media update (if applicable)

NIVEL 3 (Major - > 2h):
├── All of above
├── SMS to key stakeholders
├── Regular updates every 30 min
└── Post-incident communication
```

---

## 4. DISASTER RECOVERY

### 4.1 Recovery Objectives

| Metric | Target | Tested |
|--------|--------|--------|
| RTO (Recovery Time) | 4 ore | TBD |
| RPO (Recovery Point) | 24 ore | TBD |
| MTTR (Mean Time to Repair) | 2 ore | TBD |

### 4.2 DR Procedure

```
DISASTER RECOVERY STEPS:
─────────────────────────────────────────────────────────────

1. ASSESS (15 min)
   □ Confirm disaster (not false alarm)
   □ Identify scope
   □ Activate DR team

2. COMMUNICATE (15 min)
   □ Notify stakeholders
   □ Update status page
   □ Assign roles

3. RECOVER DATABASE (2-4h)
   □ Identify best backup
   □ Restore to new instance
   □ Verify data integrity
   □ Update connection strings

4. RECOVER APPLICATION (30 min)
   □ Deploy to backup hosting (if needed)
   □ Update DNS (if needed)
   □ Verify functionality

5. VERIFY (1h)
   □ Smoke tests all features
   □ Check integrations
   □ Verify data consistency

6. RESUME (30 min)
   □ Gradual traffic restore
   □ Monitor closely
   □ Notify users system is back

7. POST-MORTEM (24-48h)
   □ Root cause analysis
   □ Timeline documentation
   □ Improvements identified
   □ Update DR plan
```

---

## 5. RISK MITIGATION BUDGET

### 5.1 Investment în Mitigation

| Area | Investment | Risk Reduction |
|------|------------|----------------|
| Backup system | €50/month | Data loss risk |
| Monitoring | €50/month | Downtime detection |
| Security audit (annual) | €500 | Security breach |
| Training/Documentation | €500 one-time | Key person risk |
| **TOTAL** | **€1,700/year** | |

### 5.2 Insurance (Optional)

| Type | Coverage | Estimated Cost |
|------|----------|----------------|
| Cyber Insurance | Data breach, downtime | €500-2,000/year |
| Professional Liability | Errors & omissions | €300-1,000/year |

---

## 6. TESTING & VALIDATION

### 6.1 DR Test Schedule

| Test | Frecvență | Last Tested | Next Due |
|------|-----------|-------------|----------|
| Backup restore | Lunar | - | TBD |
| Failover procedure | Trimestrial | - | TBD |
| Full DR drill | Anual | - | TBD |
| Security audit | Anual | - | TBD |

### 6.2 Test Checklist

```
MONTHLY BACKUP TEST:
☐ Select random backup
☐ Restore to test environment
☐ Verify data integrity
☐ Run test queries
☐ Document results

QUARTERLY FAILOVER TEST:
☐ Simulate primary failure
☐ Execute failover procedure
☐ Measure RTO actual
☐ Verify functionality
☐ Failback to primary
☐ Document lessons learned
```

---

## 7. CONTACTS & ESCALATION

### 7.1 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Tech Lead | TBD | +40... | ... |
| Project Manager | TBD | +40... | ... |
| Business Owner | TBD | +40... | ... |
| Supabase Support | - | - | support@supabase.io |

### 7.2 Escalation Matrix

| Time Elapsed | Action |
|--------------|--------|
| 0-15 min | On-call engineer investigates |
| 15-30 min | Tech Lead notified |
| 30-60 min | Project Manager notified |
| 1h+ | Business Owner notified |
| 2h+ | Executive escalation |
