# Transport SaaS - Specificații Integrări
## Documentație Tehnică pentru API-uri Externe

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. SMARTBILL API

### 1.1 Configurare

```javascript
// config/smartbill.js
const SmartBillConfig = {
  baseUrl: 'https://ws.smartbill.ro/SBORO/api',
  rateLimit: {
    requests: 30,
    perSeconds: 10,
  },
  timeout: 30000,
  retries: 3,
};
```

### 1.2 Autentificare

```javascript
// Headers
{
  'Authorization': 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64'),
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### 1.3 Endpoints Folosite

| Endpoint | Metodă | Scop | Rate Limit |
|----------|--------|------|------------|
| `/invoice` | GET | Lista facturi emise | 30/10s |
| `/invoice/paymentsList` | GET | Lista facturi primite | 30/10s |
| `/invoice/pdf` | GET | Download PDF factură | 30/10s |

### 1.4 Request/Response Examples

```javascript
// GET /invoice - Lista facturi
// Request
GET /invoice?cif=RO12345678&startDate=2025-01-01&endDate=2025-01-31

// Response
{
  "invoices": [
    {
      "seriesName": "FCT",
      "number": "0001",
      "date": "2025-01-15",
      "client": {
        "name": "Client SRL",
        "vatCode": "RO87654321"
      },
      "products": [...],
      "total": 1500.00,
      "currency": "RON",
      "status": "issued"
    }
  ]
}
```

### 1.5 Sync Service

```javascript
// services/smartbill.sync.js
class SmartBillSyncService {
  async syncInvoices(companyId, startDate, endDate) {
    const config = await this.getConfig(companyId);

    // Fetch issued invoices
    const issued = await this.fetchInvoices(config, 'issued', startDate, endDate);

    for (const invoice of issued) {
      // Check if exists
      const existing = await supabase
        .from('invoices')
        .select('id')
        .eq('smartbill_id', `${invoice.seriesName}-${invoice.number}`)
        .single();

      if (!existing.data) {
        await supabase.from('invoices').insert({
          company_id: companyId,
          invoice_type: 'emisa',
          invoice_number: `${invoice.seriesName}-${invoice.number}`,
          invoice_date: invoice.date,
          client_name: invoice.client.name,
          client_cui: invoice.client.vatCode,
          total_amount: invoice.total,
          currency: invoice.currency,
          smartbill_id: `${invoice.seriesName}-${invoice.number}`,
          metadata: invoice,
        });
      }
    }

    return { processed: issued.length };
  }
}
```

---

## 2. BANCA TRANSILVANIA PSD2 API

### 2.1 Pre-requisite

```
CERINȚE PENTRU INTEGRARE:
☐ Înregistrare ca TPP (Third Party Provider)
☐ Certificate eIDAS (QWAC pentru TLS, QSEAL pentru semnare)
☐ Înregistrare aplicație în Developer Portal BT
☐ Sandbox testing (minim 2 săptămâni)
☐ Production approval

TIMELINE ESTIMAT: 4-8 săptămâni
```

### 2.2 OAuth2 Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │   App   │     │   BT    │     │  Bank   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. Init       │               │               │
     │──────────────>│               │               │
     │               │ 2. Create     │               │
     │               │   Consent     │               │
     │               │──────────────>│               │
     │               │               │ 3. Redirect   │
     │               │<──────────────│               │
     │ 4. Auth       │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ 5. Login &    │               │               │
     │    Consent    │               │               │
     │───────────────────────────────>               │
     │               │               │               │
     │ 6. Code       │               │               │
     │<───────────────────────────────               │
     │               │               │               │
     │ 7. Code       │               │               │
     │──────────────>│               │               │
     │               │ 8. Exchange   │               │
     │               │──────────────>│               │
     │               │ 9. Token      │               │
     │               │<──────────────│               │
     │               │               │               │
     │               │ 10. API calls │               │
     │               │──────────────>│──────────────>│
     │               │<──────────────│<──────────────│
```

### 2.3 Endpoints

| Endpoint | Metodă | Scop |
|----------|--------|------|
| `POST /v1/consents` | POST | Creare consent |
| `GET /v1/consents/{id}` | GET | Status consent |
| `GET /v1/accounts` | GET | Lista conturi |
| `GET /v1/accounts/{id}/balances` | GET | Sold cont |
| `GET /v1/accounts/{id}/transactions` | GET | Tranzacții |

### 2.4 Response Example

```javascript
// GET /v1/accounts/{accountId}/transactions
{
  "account": {
    "iban": "RO12BTRL0000000000000000"
  },
  "transactions": {
    "booked": [
      {
        "transactionId": "TX123456",
        "bookingDate": "2025-01-15",
        "valueDate": "2025-01-15",
        "transactionAmount": {
          "amount": "-500.00",
          "currency": "RON"
        },
        "creditorName": "DKV Euro Service",
        "remittanceInformationUnstructured": "Combustibil factura 12345"
      }
    ]
  }
}
```

---

## 3. GPS PROVIDERS

### 3.1 Wialon API

```javascript
// config/wialon.js
const WialonConfig = {
  baseUrl: 'https://hst-api.wialon.com/wialon/ajax.html',
  pollInterval: 60000, // 1 minut
};

// Login
async function wialonLogin(token) {
  const response = await axios.get(WialonConfig.baseUrl, {
    params: {
      svc: 'token/login',
      params: JSON.stringify({ token }),
    },
  });
  return response.data.eid; // Session ID
}

// Get positions
async function getPositions(sessionId, unitIds) {
  const response = await axios.get(WialonConfig.baseUrl, {
    params: {
      svc: 'core/search_items',
      params: JSON.stringify({
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_id',
          propValueMask: unitIds.join(','),
          sortType: 'sys_name',
        },
        force: 1,
        flags: 1025, // Position + status
        from: 0,
        to: 0,
      }),
      sid: sessionId,
    },
  });

  return response.data.items.map(unit => ({
    deviceId: unit.id,
    lat: unit.pos?.y,
    lng: unit.pos?.x,
    speed: unit.pos?.s,
    timestamp: new Date(unit.pos?.t * 1000),
    engineOn: unit.prms?.engine?.v === 1,
  }));
}
```

### 3.2 Common GPS Interface

```typescript
// interfaces/gps-provider.interface.ts
interface GPSProvider {
  name: string;

  // Get current positions for all vehicles
  getCurrentPositions(): Promise<VehiclePosition[]>;

  // Get historical data
  getHistory(
    deviceId: string,
    from: Date,
    to: Date
  ): Promise<PositionPoint[]>;

  // Get daily summary
  getDailySummary(
    deviceId: string,
    date: Date
  ): Promise<DailySummary>;
}

interface VehiclePosition {
  deviceId: string;
  lat: number;
  lng: number;
  speed: number;
  heading?: number;
  timestamp: Date;
  engineOn: boolean;
  odometer?: number;
  fuelLevel?: number;
}
```

### 3.3 GPS Sync Service

```javascript
// services/gps.sync.js
const cron = require('node-cron');

class GPSSyncService {
  constructor() {
    this.providers = {
      wialon: new WialonProvider(),
      arobs: new AROBSProvider(),
      volvo: new VolvoProvider(),
      ecomotive: new EcomotiveProvider(),
    };
  }

  // Run every minute
  startRealtimeSync() {
    cron.schedule('* * * * *', async () => {
      for (const [name, provider] of Object.entries(this.providers)) {
        try {
          const positions = await provider.getCurrentPositions();

          for (const pos of positions) {
            // Update latest position
            await supabase.from('gps_data').upsert({
              truck_head_id: await this.mapDeviceToTruck(pos.deviceId),
              timestamp: pos.timestamp,
              latitude: pos.lat,
              longitude: pos.lng,
              speed: pos.speed,
              engine_on: pos.engineOn,
              source: name,
            });

            // Broadcast to realtime
            await supabase.channel('gps').send({
              type: 'broadcast',
              event: 'position_update',
              payload: pos,
            });
          }
        } catch (error) {
          console.error(`GPS sync failed for ${name}:`, error);
        }
      }
    });
  }
}
```

---

## 4. DKV / EUROWAG

### 4.1 DKV Integration

```javascript
// services/dkv.service.js
class DKVService {
  constructor(config) {
    this.baseUrl = 'https://api.dkv.com/v1';
    this.apiKey = config.apiKey;
  }

  async getTransactions(startDate, endDate) {
    const response = await axios.get(`${this.baseUrl}/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      params: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });

    return response.data.transactions.map(tx => ({
      externalId: tx.transactionId,
      date: new Date(tx.transactionDate),
      cardNumber: tx.cardNumber,
      amount: tx.totalAmount,
      currency: tx.currency,
      liters: tx.quantity,
      pricePerLiter: tx.unitPrice,
      station: tx.merchantName,
      country: tx.country,
      productType: tx.productType,
    }));
  }

  async syncToDatabase(companyId, transactions) {
    for (const tx of transactions) {
      // Find card mapping
      const mapping = await supabase
        .from('fuel_card_mappings')
        .select('truck_head_id, driver_id')
        .eq('card_number', tx.cardNumber)
        .eq('card_provider', 'DKV')
        .single();

      await supabase.from('transactions').upsert({
        company_id: companyId,
        entity_type: 'truck_head',
        entity_id: mapping.data?.truck_head_id,
        transaction_date: tx.date,
        transaction_type: 'combustibil',
        amount: tx.amount,
        currency: tx.currency,
        fuel_liters: tx.liters,
        fuel_price_per_liter: tx.pricePerLiter,
        fuel_station: tx.station,
        fuel_country: tx.country,
        source_system: 'DKV',
        external_id: tx.externalId,
        is_matched: !!mapping.data?.truck_head_id,
      }, { onConflict: 'external_id' });
    }
  }
}
```

---

## 5. GMAIL / GOOGLE DRIVE

### 5.1 Setup OAuth2

```javascript
// config/google.js
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes needed
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];
```

### 5.2 Gmail Parser Service

```javascript
// services/gmail-parser.service.js
class GmailParserService {
  constructor(auth) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async parseVeragEmails(query = 'from:verag subject:raport') {
    const messages = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
    });

    const results = [];

    for (const msg of messages.data.messages || []) {
      const email = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      // Find CSV attachment
      const csvPart = email.data.payload.parts?.find(
        p => p.mimeType === 'text/csv'
      );

      if (csvPart) {
        const attachment = await this.gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: msg.id,
          id: csvPart.body.attachmentId,
        });

        const csvData = Buffer.from(attachment.data.data, 'base64').toString();
        const records = await this.parseVeragCSV(csvData);
        results.push(...records);
      }
    }

    return results;
  }

  async parseVeragCSV(csvData) {
    // Parse CSV and return structured transactions
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        date: values[0],
        cardNumber: values[1],
        liters: parseFloat(values[2]),
        amount: parseFloat(values[3]),
        station: values[4],
      };
    });
  }
}
```

---

## 6. ERROR HANDLING

### 6.1 Retry Strategy

```javascript
// utils/retry.js
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    exponential = true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries - 1) break;

      const delay = exponential
        ? Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        : baseDelay;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const data = await withRetry(
  () => smartbillApi.getInvoices(),
  { maxRetries: 3, baseDelay: 2000 }
);
```

### 6.2 Circuit Breaker

```javascript
// utils/circuit-breaker.js
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailure = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```
