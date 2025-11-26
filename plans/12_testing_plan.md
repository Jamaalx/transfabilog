# Transport SaaS - Plan de Testare Detaliat
## Strategia de Testare și Scenarii

**Versiune:** 1.0
**Data:** 2025-11-26
**Status:** Draft

---

## 1. STRATEGIA DE TESTARE

### 1.1 Piramida de Testare

```
                    ┌─────────┐
                    │   E2E   │  5%  - Critical flows
                   ─┼─────────┼─
                  │ Integration│ 20% - API, DB, Services
                 ─┼───────────┼─
                │    Unit      │ 75% - Functions, Components
               ─┼─────────────┼─
              │   Static       │ - TypeScript, ESLint
             └─────────────────┘
```

### 1.2 Coverage Targets

| Tip Test | Coverage Target | Tool |
|----------|-----------------|------|
| Unit Tests | > 80% | Vitest |
| Integration Tests | > 60% | Vitest + Supertest |
| E2E Tests | Critical paths | Playwright |
| Static Analysis | 100% | TypeScript, ESLint |

---

## 2. UNIT TESTS

### 2.1 Funcții Utility

```javascript
// tests/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTripProfit, calculateFuelConsumption } from '@/lib/calculations';

describe('calculateTripProfit', () => {
  it('should calculate profit correctly', () => {
    const trip = {
      revenue: 2500,
      fuelCost: 800,
      tollCost: 150,
      driverDiurna: 435,
      vehicleDailyCost: 50,
      days: 5,
    };

    const result = calculateTripProfit(trip);

    expect(result.totalCosts).toBe(800 + 150 + 435 + 250); // 1635
    expect(result.profit).toBe(2500 - 1635); // 865
    expect(result.margin).toBeCloseTo(34.6); // 865/2500 * 100
  });

  it('should handle zero revenue', () => {
    const trip = { revenue: 0, fuelCost: 100, ...defaults };
    const result = calculateTripProfit(trip);
    expect(result.profit).toBeLessThan(0);
    expect(result.margin).toBe(0);
  });

  it('should handle missing costs', () => {
    const trip = { revenue: 1000, fuelCost: undefined };
    const result = calculateTripProfit(trip);
    expect(result.totalCosts).toBe(0);
  });
});

describe('calculateFuelConsumption', () => {
  it('should calculate l/100km correctly', () => {
    const result = calculateFuelConsumption(320, 1000);
    expect(result).toBe(32); // 320l / 1000km * 100
  });

  it('should return 0 for zero km', () => {
    const result = calculateFuelConsumption(100, 0);
    expect(result).toBe(0);
  });
});
```

### 2.2 Validation Schemas

```javascript
// tests/lib/validators.test.ts
import { describe, it, expect } from 'vitest';
import { truckSchema, driverSchema, tripSchema } from '@/lib/validators';

describe('truckSchema', () => {
  it('should validate correct truck data', () => {
    const validTruck = {
      registration_number: 'B-123-ABC',
      brand: 'Volvo',
      year: 2020,
      status: 'activ',
    };

    const result = truckSchema.safeParse(validTruck);
    expect(result.success).toBe(true);
  });

  it('should reject invalid registration number', () => {
    const invalidTruck = {
      registration_number: '123',
    };

    const result = truckSchema.safeParse(invalidTruck);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('registration_number');
  });

  it('should reject future year', () => {
    const invalidTruck = {
      registration_number: 'B-123-ABC',
      year: 2030,
    };

    const result = truckSchema.safeParse(invalidTruck);
    expect(result.success).toBe(false);
  });
});

describe('driverSchema', () => {
  it('should validate valid CNP', () => {
    const driver = {
      first_name: 'Ion',
      last_name: 'Popescu',
      cnp: '1850315123456', // Valid format
    };

    const result = driverSchema.safeParse(driver);
    expect(result.success).toBe(true);
  });

  it('should reject invalid CNP length', () => {
    const driver = {
      first_name: 'Ion',
      last_name: 'Popescu',
      cnp: '123456', // Too short
    };

    const result = driverSchema.safeParse(driver);
    expect(result.success).toBe(false);
  });
});
```

### 2.3 React Components

```javascript
// tests/components/VehicleCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from '@/components/vehicles/VehicleCard';

describe('VehicleCard', () => {
  const mockVehicle = {
    id: '1',
    registration_number: 'B-123-ABC',
    brand: 'Volvo',
    model: 'FH16',
    status: 'activ',
    current_km: 450000,
  };

  it('should render vehicle information', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText('B-123-ABC')).toBeInTheDocument();
    expect(screen.getByText('Volvo FH16')).toBeInTheDocument();
    expect(screen.getByText('450,000 km')).toBeInTheDocument();
  });

  it('should show active badge for active vehicles', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    const badge = screen.getByText('Activ');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<VehicleCard vehicle={mockVehicle} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith(mockVehicle.id);
  });
});
```

---

## 3. INTEGRATION TESTS

### 3.1 API Endpoints

```javascript
// tests/api/vehicles.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/server';
import { supabase } from '@/config/supabase';

describe('Vehicles API', () => {
  let authToken: string;
  let testTruckId: string;

  beforeAll(async () => {
    // Login to get token
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'testpassword',
    });
    authToken = data.session.access_token;
  });

  describe('GET /api/v1/vehicles/trucks', () => {
    it('should return list of trucks', async () => {
      const response = await request(app)
        .get('/api/v1/vehicles/trucks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/vehicles/trucks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/vehicles/trucks?status=activ')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(truck => {
        expect(truck.status).toBe('activ');
      });
    });
  });

  describe('POST /api/v1/vehicles/trucks', () => {
    it('should create a new truck', async () => {
      const newTruck = {
        registration_number: 'TEST-001',
        brand: 'Test Brand',
        status: 'activ',
      };

      const response = await request(app)
        .post('/api/v1/vehicles/trucks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTruck);

      expect(response.status).toBe(201);
      expect(response.body.registration_number).toBe('TEST-001');
      testTruckId = response.body.id;
    });

    it('should reject duplicate registration number', async () => {
      const duplicateTruck = {
        registration_number: 'TEST-001',
      };

      const response = await request(app)
        .post('/api/v1/vehicles/trucks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateTruck);

      expect(response.status).toBe(409);
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles/trucks')
        .send({ registration_number: 'TEST-002' });

      expect(response.status).toBe(401);
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testTruckId) {
      await supabase.from('truck_heads').delete().eq('id', testTruckId);
    }
  });
});
```

### 3.2 Service Integration

```javascript
// tests/services/smartbill.test.ts
import { describe, it, expect, vi } from 'vitest';
import { SmartBillService } from '@/services/smartbill.service';
import axios from 'axios';

vi.mock('axios');

describe('SmartBillService', () => {
  const service = new SmartBillService({
    username: 'test',
    token: 'test-token',
  });

  it('should fetch invoices successfully', async () => {
    const mockInvoices = [
      { number: 'FCT-001', total: 1000 },
      { number: 'FCT-002', total: 2000 },
    ];

    vi.mocked(axios.get).mockResolvedValue({ data: { invoices: mockInvoices } });

    const result = await service.getInvoices('2025-01-01', '2025-01-31');

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe('FCT-001');
  });

  it('should handle API errors', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'));

    await expect(service.getInvoices('2025-01-01', '2025-01-31'))
      .rejects.toThrow('API Error');
  });

  it('should retry on temporary failure', async () => {
    vi.mocked(axios.get)
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValue({ data: { invoices: [] } });

    const result = await service.getInvoices('2025-01-01', '2025-01-31');

    expect(result).toEqual([]);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
```

---

## 4. E2E TESTS

### 4.1 Critical User Journeys

```javascript
// tests/e2e/trips.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Trip Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a simple trip', async ({ page }) => {
    // Navigate to trips
    await page.click('text=Curse');
    await page.click('text=Cursă Nouă');
    await page.click('text=Cursă Simplă');

    // Fill form
    await page.selectOption('[name="truck_head_id"]', { index: 1 });
    await page.selectOption('[name="driver_id"]', { index: 1 });
    await page.fill('[name="departure_date"]', '2025-01-15');
    await page.fill('[name="return_date"]', '2025-01-20');
    await page.fill('[name="from_location"]', 'București');
    await page.fill('[name="to_location"]', 'Berlin');
    await page.fill('[name="total_km"]', '2500');
    await page.fill('[name="revenue_amount"]', '2500');

    // Submit
    await page.click('button[type="submit"]');

    // Verify
    await expect(page.locator('text=Cursă creată cu succes')).toBeVisible();
    await expect(page.url()).toContain('/trips');
  });

  test('should view trip details and profitability', async ({ page }) => {
    await page.click('text=Curse');
    await page.click('text=Istoric');

    // Click first trip
    await page.click('table tbody tr:first-child');

    // Verify details page
    await expect(page.locator('text=Detalii Cursă')).toBeVisible();
    await expect(page.locator('text=Profitabilitate')).toBeVisible();
    await expect(page.locator('[data-testid="profit-amount"]')).toBeVisible();
  });
});

test.describe('Document Expiry Alerts', () => {
  test('should show expiring documents', async ({ page }) => {
    await page.goto('/documents/expiring');

    await expect(page.locator('h1')).toContainText('Documente care Expiră');

    // Should show documents expiring in 30 days
    const expiringDocs = await page.locator('[data-testid="expiring-doc"]').count();
    expect(expiringDocs).toBeGreaterThanOrEqual(0);
  });
});
```

### 4.2 Authentication Flow

```javascript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@test.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
```

---

## 5. TEST SCENARIOS (UAT)

### 5.1 Checklist per Modul

```
MODULE: VEHICULE
─────────────────────────────────────────────────────────────
☐ Adaugă vehicul nou cu toate câmpurile
☐ Adaugă vehicul doar cu câmpuri obligatorii
☐ Editează vehicul existent
☐ Încearcă să adaugi vehicul cu număr duplicat
☐ Filtrează vehicule după status
☐ Sortează vehicule după dată
☐ Caută vehicul după număr înmatriculare
☐ Vizualizează detalii vehicul
☐ Vizualizează documente vehicul
☐ Vizualizează costuri vehicul

MODULE: CURSE
─────────────────────────────────────────────────────────────
☐ Creează cursă simplă completă
☐ Creează cursă complexă cu 3 opriri
☐ Editează cursă existentă
☐ Marchează cursă ca finalizată
☐ Verifică calcul profit corect
☐ Filtrează curse după perioadă
☐ Filtrează curse după vehicul
☐ Filtrează curse după șofer
☐ Exportă curse în Excel

MODULE: DOCUMENTE
─────────────────────────────────────────────────────────────
☐ Upload document PDF
☐ Upload document imagine
☐ Asociază document la vehicul
☐ Verifică alerte documente care expiră
☐ Vizualizează document
☐ Descarcă document
☐ Șterge document

MODULE: FINANCIAR
─────────────────────────────────────────────────────────────
☐ Vizualizează lista tranzacții
☐ Filtrează tranzacții după tip
☐ Matching automat funcționează
☐ Matching manual tranzacție
☐ Import tranzacții din CSV
☐ Vizualizează facturi SmartBill
```

### 5.2 Performance Tests

```
LOAD TESTING SCENARIOS:
─────────────────────────────────────────────────────────────

Scenario 1: Normal Load
├── Users: 20 concurrent
├── Duration: 10 minutes
├── Actions: Browse, create trips
├── Expected: P95 < 1s

Scenario 2: Peak Load
├── Users: 50 concurrent
├── Duration: 5 minutes
├── Actions: Heavy read operations
├── Expected: P95 < 3s

Scenario 3: Stress Test
├── Users: 100 concurrent
├── Duration: 2 minutes
├── Actions: Mixed operations
├── Expected: No crashes, graceful degradation

Scenario 4: Endurance
├── Users: 15 concurrent
├── Duration: 2 hours
├── Actions: Normal usage pattern
├── Expected: No memory leaks, stable performance
```

---

## 6. TEST ENVIRONMENT

### 6.1 Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Local | Development | Mock/minimal |
| Test | Automated tests | Seeded test data |
| Staging | UAT, integration | Copy of production |
| Production | Live | Real data |

### 6.2 Test Data Seeding

```javascript
// scripts/seed-test-data.ts
async function seedTestData() {
  // Create test company
  const company = await supabase.from('companies').insert({
    name: 'Test Company',
    cui: 'RO12345678',
  }).select().single();

  // Create test trucks
  const trucks = await Promise.all([
    supabase.from('truck_heads').insert({
      company_id: company.data.id,
      registration_number: 'TEST-001',
      brand: 'Volvo',
      status: 'activ',
    }),
    // ... more trucks
  ]);

  // Create test drivers
  // Create test trips
  // Create test transactions
}
```

---

## 7. CI/CD INTEGRATION

### 7.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```
