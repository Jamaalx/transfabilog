# Transport SaaS - Plan Suport și Mentenanță
## Structura de Suport și Mentenanță Continuă

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. NIVELURI DE SUPORT

### 1.1 SLA (Service Level Agreement)

| Nivel | Descriere | Timp Răspuns | Timp Rezolvare | Cost |
|-------|-----------|--------------|----------------|------|
| **Basic** | Email only | 48h | 5 zile | Inclus |
| **Standard** | Email + Chat | 24h | 2 zile | €100/lună |
| **Premium** | Email + Chat + Tel | 4h | 24h | €300/lună |
| **Enterprise** | Dedicated support | 1h | 8h | Custom |

### 1.2 Canale Suport

| Canal | Disponibilitate | Best For |
|-------|-----------------|----------|
| Email | 24/7 (răspuns L-V) | Non-urgent, detailed issues |
| Chat | L-V 9:00-18:00 | Quick questions |
| Telefon | L-V 9:00-18:00 | Urgent issues |
| Documentation | 24/7 | Self-service |
| Video Call | Cu programare | Complex issues, training |

---

## 2. CATEGORII TICKETE

### 2.1 Prioritizare

| Prioritate | Descriere | SLA Standard | Exemple |
|------------|-----------|--------------|---------|
| **P1 Critical** | Sistem down | 1h răspuns, 4h fix | App inaccessibilă |
| **P2 High** | Major feature broken | 4h răspuns, 24h fix | Nu pot crea curse |
| **P3 Medium** | Minor feature issue | 24h răspuns, 3 zile | Export nu merge |
| **P4 Low** | Question/Enhancement | 48h răspuns, 5 zile | Cum fac X? |

### 2.2 Flow Ticket

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Received│────>│ Triaged │────>│In Progress────>│ Resolved│
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │                │
                     ▼                ▼
               ┌─────────┐     ┌─────────┐
               │Escalated│     │ On Hold │
               └─────────┘     └─────────┘
```

---

## 3. MENTENANȚĂ PLANIFICATĂ

### 3.1 Schedule

| Tip | Frecvență | Window | Notificare |
|-----|-----------|--------|------------|
| Security patches | La nevoie | 30 min | 24h înainte |
| Minor updates | Bi-weekly | 1h | 48h înainte |
| Major updates | Monthly | 2h | 1 săpt înainte |
| Database maintenance | Weekly | 15 min | Via status page |

### 3.2 Maintenance Window

```
MAINTENANCE WINDOW:
├── When: Duminică 02:00-04:00 (RO time)
├── Impact: Posibilă indisponibilitate 15-30 min
├── Notification: Status page + email 24h before
└── Emergency: Immediate fix, notify after
```

---

## 4. MONITORIZARE PROACTIVĂ

### 4.1 Health Checks

```javascript
// Automated checks every 5 minutes
const healthChecks = [
  { name: 'API Response', endpoint: '/api/health', threshold: 3000 },
  { name: 'Database', query: 'SELECT 1', threshold: 1000 },
  { name: 'SmartBill Sync', check: 'lastSync < 25h', threshold: null },
  { name: 'GPS Data Fresh', check: 'lastUpdate < 5min', threshold: null },
];

// Alert if any check fails 3 times in row
```

### 4.2 Automated Alerts

| Alert | Trigger | Action |
|-------|---------|--------|
| High Error Rate | > 5% în 5 min | Investigate immediately |
| Slow Response | P95 > 3s | Profile queries |
| Disk Space | > 80% | Clean up / expand |
| Sync Failed | 2 consecutive fails | Check integration |
| Security Alert | Any | Investigate immediately |

---

## 5. BACKUP & RECOVERY

### 5.1 Backup Schedule

| Type | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Database (full) | Daily 03:00 | 30 days | Supabase + S3 |
| Database (point-in-time) | Continuous | 7 days | Supabase |
| Files/Documents | Daily | 90 days | S3 |
| Configuration | On change | Forever | Git |

### 5.2 Recovery Procedures

```
RECOVERY TIME OBJECTIVES:
├── Database restore (full): < 2 hours
├── Database restore (point-in-time): < 30 min
├── Application redeploy: < 15 min
├── Full disaster recovery: < 4 hours
```

---

## 6. UPDATES & RELEASES

### 6.1 Release Process

```
RELEASE PIPELINE:
─────────────────────────────────────────────────────────────

1. Development
   ├── Feature branch
   ├── Local testing
   └── Code review

2. Staging
   ├── Deploy to staging
   ├── QA testing
   └── Stakeholder review

3. Pre-Production
   ├── Deploy to pre-prod
   ├── Smoke tests
   └── Performance check

4. Production
   ├── Deploy during maintenance window
   ├── Gradual rollout (if applicable)
   └── Monitor for 24h

5. Post-Release
   ├── Update documentation
   ├── Notify users (release notes)
   └── Monitor feedback
```

### 6.2 Rollback Procedure

```
ROLLBACK TRIGGERS:
├── Critical bug in production
├── Performance degradation > 50%
├── Security vulnerability

ROLLBACK STEPS:
1. Decision by Tech Lead (< 15 min)
2. Revert deployment (< 5 min)
3. Verify rollback (< 10 min)
4. Notify stakeholders
5. Post-mortem within 24h
```

---

## 7. DOCUMENTAȚIE MENTENANȚĂ

### 7.1 Runbooks

```
RUNBOOK INDEX:
├── RB-001: Daily health check
├── RB-002: Database maintenance
├── RB-003: Backup verification
├── RB-004: Security patch application
├── RB-005: Emergency response
├── RB-006: Rollback procedure
├── RB-007: Scaling procedure
└── RB-008: Integration troubleshooting
```

### 7.2 Knowledge Base

```
KNOWLEDGE BASE STRUCTURE:
├── Troubleshooting Guides
│   ├── Login issues
│   ├── Sync failures
│   ├── Performance issues
│   └── Common errors
├── How-To Articles
│   ├── Configure integrations
│   ├── Export data
│   └── User management
└── Release Notes
    └── Version history
```

---

## 8. RAPORTARE

### 8.1 Monthly Report Template

```markdown
# Support Report - {Month} {Year}

## Summary
- Total tickets: XX
- Resolved: XX (XX%)
- Average resolution time: XX hours
- Customer satisfaction: X.X/5

## Tickets by Priority
| Priority | Count | Avg Resolution |
|----------|-------|----------------|
| P1 | X | Xh |
| P2 | X | Xh |
| P3 | X | Xd |
| P4 | X | Xd |

## Top Issues
1. Issue description (X tickets)
2. Issue description (X tickets)
3. Issue description (X tickets)

## Improvements Made
- Bug fixes: X
- Enhancements: X
- Documentation updates: X

## Uptime
- Overall: XX.X%
- Incidents: X
- Planned maintenance: Xh

## Recommendations
- [List of suggested improvements]
```

### 8.2 Metrics Dashboard

| Metric | Target | Current |
|--------|--------|---------|
| First Response Time | < 4h | - |
| Resolution Time | < 24h | - |
| Customer Satisfaction | > 4.5/5 | - |
| Ticket Backlog | < 10 | - |
| Uptime | > 99.5% | - |
