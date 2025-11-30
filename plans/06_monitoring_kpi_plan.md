# Transport SaaS - Plan Monitorizare și KPI
## Metrici, Alerting și Dashboard-uri Operaționale

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. KPIs TEHNICE

### 1.1 Infrastructură

| Metric | Target | Warning | Critical | Tool |
|--------|--------|---------|----------|------|
| Uptime | > 99.5% | < 99% | < 95% | UptimeRobot |
| Response Time (P95) | < 500ms | > 1s | > 3s | Sentry |
| Error Rate | < 0.5% | > 1% | > 5% | Sentry |
| CPU Usage | < 70% | > 80% | > 95% | Railway/DigitalOcean |
| Memory Usage | < 80% | > 85% | > 95% | Railway/DigitalOcean |
| DB Connections | < 80% | > 90% | > 95% | Supabase |
| Storage Usage | < 70% | > 80% | > 90% | Supabase |

### 1.2 Application Performance

| Metric | Target | Măsurare |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| Time to First Byte | < 200ms | Monitoring |
| API Response (avg) | < 300ms | Sentry |
| DB Query Time (avg) | < 50ms | Supabase |

### 1.3 Sync & Integration Health

| Metric | Target | Frecvență Check |
|--------|--------|-----------------|
| SmartBill Sync Success | 100% | Daily |
| GPS Data Freshness | < 2 min | Real-time |
| Bank Sync Success | 100% | Daily |
| DKV/Eurowag Sync | 100% | Daily |
| Failed Jobs | 0 | Hourly |
| Queue Length | < 100 | Real-time |

---

## 2. KPIs BUSINESS

### 2.1 Adopție și Utilizare

| Metric | Formula | Target Luna 1 | Target Luna 3 |
|--------|---------|---------------|---------------|
| Daily Active Users | Users/zi | > 80% | > 90% |
| Feature Adoption | Users using feature / Total | > 50% | > 80% |
| Session Duration | Avg time in app | > 10 min | > 15 min |
| Actions per Session | Avg actions | > 5 | > 10 |
| Return Rate | Users returning next day | > 70% | > 85% |

### 2.2 Eficiență Operațională

| Metric | Înainte | După | Target Improvement |
|--------|---------|------|-------------------|
| Timp creare cursă | 15 min | 5 min | -66% |
| Timp matching tranzacții | 2h/zi | 15 min/zi | -87% |
| Timp generare raport | 4h | 5 min | -98% |
| Erori introducere date | 5% | < 1% | -80% |
| Documente expirate nedetectate | 10% | 0% | -100% |

### 2.3 Business Impact

| Metric | Măsurare | Target |
|--------|----------|--------|
| Cost per km | Total costs / Total km | Trend descendent |
| Profit margin per cursă | Profit / Revenue | > 15% |
| Fuel consumption l/100km | Litri / (km/100) | < 32 |
| Vehicle utilization | Days active / Total days | > 85% |
| Driver productivity | Revenue per driver | Trend ascendent |

---

## 3. ALERTING

### 3.1 Configurare Alerte

```javascript
// alert-config.js
const alertRules = {
  infrastructure: [
    {
      name: 'High Error Rate',
      condition: 'error_rate > 5%',
      window: '5 minutes',
      severity: 'critical',
      channels: ['slack', 'email', 'sms'],
    },
    {
      name: 'Slow Response Time',
      condition: 'p95_response > 3000ms',
      window: '5 minutes',
      severity: 'warning',
      channels: ['slack', 'email'],
    },
    {
      name: 'Service Down',
      condition: 'health_check == false',
      window: '1 minute',
      severity: 'critical',
      channels: ['slack', 'email', 'sms', 'phone'],
    },
  ],

  sync: [
    {
      name: 'SmartBill Sync Failed',
      condition: 'smartbill_sync_status == failed',
      severity: 'high',
      channels: ['slack', 'email'],
    },
    {
      name: 'GPS Data Stale',
      condition: 'gps_last_update > 10 minutes',
      severity: 'warning',
      channels: ['slack'],
    },
  ],

  business: [
    {
      name: 'Document Expiring Soon',
      condition: 'days_until_expiry <= 7',
      severity: 'warning',
      channels: ['email', 'in-app'],
    },
    {
      name: 'Unmatched Transactions High',
      condition: 'unmatched_count > 50',
      severity: 'info',
      channels: ['email'],
    },
  ],
};
```

### 3.2 Canale Notificare

| Canal | Use Case | Config |
|-------|----------|--------|
| Slack | Toate alertele tehnice | #transport-alerts |
| Email | Warning + Critical | devops@company.ro |
| SMS | Critical only | +40xxx |
| In-App | Business alerts | Toast notifications |
| PagerDuty | After-hours critical | Rotation schedule |

### 3.3 Escalare

```
ESCALATION MATRIX:
─────────────────────────────────────────────────────────────

Level 1 (0-15 min): Auto-notification
├── Slack alert
├── Email to on-call
└── Dashboard update

Level 2 (15-30 min): On-call response
├── Acknowledge alert
├── Initial investigation
└── Update status

Level 3 (30-60 min): Team escalation
├── Notify Tech Lead
├── War room if needed
└── Stakeholder update

Level 4 (60+ min): Management escalation
├── Notify CTO/CEO
├── External communication prep
└── Incident commander assigned
```

---

## 4. DASHBOARD-URI

### 4.1 Operations Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPERATIONS DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │  UPTIME     │ │ ERROR RATE  │ │ AVG RESP    │ │ ACTIVE     ││
│  │  99.8%  ✓   │ │  0.2%   ✓   │ │  245ms  ✓   │ │ USERS: 15  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                                                                 │
│  REQUEST VOLUME (last 24h)                                     │
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅                                    │
│                                                                 │
│  SYNC STATUS                                                    │
│  ├── SmartBill    ✓ Last sync: 5 min ago                       │
│  ├── GPS Wialon   ✓ Last update: 1 min ago                     │
│  ├── GPS AROBS    ✓ Last update: 1 min ago                     │
│  └── DKV          ✓ Last sync: 2 hours ago                     │
│                                                                 │
│  RECENT ERRORS                                                  │
│  └── (none in last hour)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Business Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODAY'S METRICS                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ ACTIVE TRIPS│ │ COMPLETED   │ │ REVENUE     │ │ AVG PROFIT ││
│  │     12      │ │      5      │ │  €8,500     │ │    18%     ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                                                                 │
│  REVENUE TREND (last 30 days)                                  │
│  ████████████████████████████████████████                       │
│  ▲ +12% vs previous month                                      │
│                                                                 │
│  ALERTS                                                         │
│  ├── 3 documents expiring this week                            │
│  ├── 8 unmatched transactions                                  │
│  └── 1 vehicle due for service                                 │
│                                                                 │
│  TOP PERFORMERS (this month)                                    │
│  1. B-123-ABC  Revenue: €25,000  Margin: 22%                   │
│  2. B-456-DEF  Revenue: €22,500  Margin: 19%                   │
│  3. B-789-GHI  Revenue: €21,000  Margin: 17%                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. TOOLS & SETUP

### 5.1 Monitoring Stack

| Layer | Tool | Cost | Setup |
|-------|------|------|-------|
| Uptime | UptimeRobot | Free (50 monitors) | 5 min |
| Errors | Sentry | Free (5k events/mo) | 30 min |
| Logs | Supabase Dashboard | Included | - |
| Analytics | Plausible | €9/mo | 10 min |
| APM | Sentry Performance | Included | 15 min |

### 5.2 Custom Metrics Collection

```javascript
// metrics.service.js
const Sentry = require('@sentry/node');

class MetricsService {
  // Track sync operations
  async trackSync(source, status, recordsProcessed, duration) {
    await supabase.from('sync_logs').insert({
      source,
      status,
      records_processed: recordsProcessed,
      duration_ms: duration,
      started_at: new Date(),
    });

    // Send to Sentry for aggregation
    Sentry.metrics.gauge('sync.duration', duration, {
      tags: { source, status },
    });

    Sentry.metrics.increment('sync.count', 1, {
      tags: { source, status },
    });
  }

  // Track API performance
  trackApiCall(endpoint, method, duration, statusCode) {
    Sentry.metrics.distribution('api.duration', duration, {
      tags: { endpoint, method, status: statusCode },
    });
  }

  // Track business metrics
  async trackBusinessMetric(metric, value, dimensions = {}) {
    await supabase.from('business_metrics').insert({
      metric_name: metric,
      value,
      dimensions,
      recorded_at: new Date(),
    });
  }
}
```

### 5.3 Health Check Endpoint

```javascript
// routes/health.js
router.get('/health', async (req, res) => {
  const checks = {
    api: 'ok',
    database: await checkDatabase(),
    redis: await checkRedis(),
    integrations: {
      smartbill: await checkSmartBill(),
      gps: await checkGPS(),
    },
  };

  const allOk = Object.values(checks).every(
    v => v === 'ok' || (typeof v === 'object' &&
      Object.values(v).every(x => x === 'ok'))
  );

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 6. REPORTING

### 6.1 Daily Report (Automated)

```
DAILY OPERATIONS REPORT - {DATE}
══════════════════════════════════════════════════════════════

SYSTEM HEALTH
├── Uptime: 99.9%
├── Errors: 12 (0.1%)
├── Avg Response: 234ms
└── Peak Users: 18 (14:30)

SYNC STATUS
├── SmartBill: ✓ 45 invoices synced
├── GPS: ✓ 1,440 position updates
└── DKV: ✓ 23 transactions

BUSINESS METRICS
├── Trips Created: 8
├── Trips Completed: 5
├── Revenue Recorded: €12,500
├── Transactions Matched: 34
└── Unmatched: 5

ALERTS TRIGGERED
├── Warning: 2
└── Critical: 0

ACTION ITEMS
└── Review 5 unmatched transactions
```

### 6.2 Weekly Report Template

```markdown
# Weekly Report - Week {N}

## Executive Summary
- Overall system health: GOOD/DEGRADED/CRITICAL
- Key achievement: [...]
- Main concern: [...]

## Metrics Summary
| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Uptime | 99.8% | 99.5% | ↑ |
| Users | 18 | 15 | ↑ |
| Trips | 42 | 38 | ↑ |
| Revenue | €85k | €78k | ↑ |

## Incidents
- [Date] [Severity] [Description] [Resolution]

## Improvements Made
- [List of fixes and enhancements]

## Next Week Focus
- [Priority items]
```
