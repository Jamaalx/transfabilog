-- Migration: Add new trip fields for driver expenses and reporting
-- Date: 2025-11-27
-- Description: Adds diurna (per diem), cash expenses, and expense report number fields

-- Add new columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS diurna DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS diurna_currency VARCHAR(3) DEFAULT 'EUR';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cash_expenses DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cash_expenses_currency VARCHAR(3) DEFAULT 'EUR';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS expense_report_number VARCHAR(100);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS total_km INTEGER; -- calculated from km_end - km_start

-- Add index for expense report number for quick lookups
CREATE INDEX IF NOT EXISTS idx_trips_expense_report ON trips(expense_report_number);

-- Add comment for documentation
COMMENT ON COLUMN trips.diurna IS 'Per diem (diurna) amount given to driver for this trip';
COMMENT ON COLUMN trips.diurna_currency IS 'Currency for diurna (EUR, RON, etc)';
COMMENT ON COLUMN trips.cash_expenses IS 'Cash expenses (cheltuieli cash) on this trip';
COMMENT ON COLUMN trips.cash_expenses_currency IS 'Currency for cash expenses';
COMMENT ON COLUMN trips.expense_report_number IS 'Expense report number (nr decont) for accounting';
COMMENT ON COLUMN trips.total_km IS 'Total kilometers for this trip (km_end - km_start)';
