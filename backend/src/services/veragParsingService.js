const pdfParse = require('pdf-parse');
const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * VERAG Maut Report PDF Parser
 * Parses toll reports from VERAG 360 GMBH
 *
 * Structure:
 * - Grouped by truck (LKW-Kennzeichen)
 * - Columns: Land, Datum, Produkt, Kartennummer, Route Info, Netto, MWST, Brutto
 * - Countries: AT, BE, BG, CZ, DE, DEU, FR, GBR, HR, HU, IT, PL, ROM, SK, SVN
 */

// Country codes used in VERAG reports
const VERAG_COUNTRIES = [
  'AT', 'BE', 'BG', 'CZ', 'DE', 'DEU', 'FR', 'GBR', 'HR', 'HU',
  'IT', 'PL', 'ROM', 'SK', 'SVN', 'CH', 'SI', 'NL', 'LU'
];

// Product types for categorization
const TOLL_PRODUCTS = {
  'ÚTDÍJAK': 'toll_hungary',
  'PEDAGGIO BG': 'toll_bulgaria',
  'OPLATY DROGOWE': 'toll_poland',
  'TOLLS STALEXPORT': 'toll_poland_motorway',
  'Tolls Postpay': 'toll_czech',
  'Tolls': 'toll_generic',
  'Toll HR': 'toll_croatia',
  'Eurovignette': 'vignette_eu',
  'Vignette': 'vignette',
  'Maut SVN Postpay': 'toll_slovenia',
  'TOLLS MOTORWAY': 'toll_motorway_fr',
  'TOLLS TUNNEL': 'toll_tunnel',
  'PARKS DK TRUCKS': 'parking',
  'CONDITION OF USE': 'adjustment',
  'Deposit Postpay': 'deposit',
  'Rounding': 'rounding',
  'Fee for PLOSE BOX': 'equipment_fee',
  'Costi ETOLL': 'etoll_fee',
};

/**
 * Create a standardized key for truck matching
 */
function createMatchKey(registration) {
  if (!registration) return '';
  return registration
    .replace(/[\s\-_.]/g, '')
    .toUpperCase();
}

/**
 * Parse number from European format (1.234,56 or 1 234,56)
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  let str = String(value).trim();

  // Handle space as thousand separator (e.g., "1 234,56")
  str = str.replace(/\s/g, '');

  // Handle European format: 1.234,56
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parse date from DD.MM.YYYY format
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(year, month - 1, day);
  }

  return null;
}

/**
 * Determine product category
 */
function getProductCategory(product, country) {
  if (!product || product.trim() === '') {
    // Default based on country
    switch (country) {
      case 'AT': return 'toll_austria';
      case 'DE': return 'toll_germany';
      case 'FR': return 'toll_france';
      default: return 'toll_generic';
    }
  }

  for (const [key, category] of Object.entries(TOLL_PRODUCTS)) {
    if (product.includes(key)) {
      return category;
    }
  }

  return 'toll_other';
}

/**
 * Parse VERAG PDF content
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Object} Parsed data with transactions and metadata
 */
async function parseVeragPdf(fileBuffer) {
  const pdfData = await pdfParse(fileBuffer);
  const text = pdfData.text;

  // Split into lines and clean up
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // Extract report date from header
  let reportDate = null;
  const dateMatch = text.match(/Datum:\s*(\d{2}\.\d{2}\.\d{4})/);
  if (dateMatch) {
    reportDate = parseDate(dateMatch[1]);
  }

  // Extract company info
  let companyCode = null;
  const companyMatch = text.match(/(\d{6})\s+[A-Z\s]+SRL/);
  if (companyMatch) {
    companyCode = companyMatch[1];
  }

  const transactions = [];
  let currentTruck = null;
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;
  let minDate = null;
  let maxDate = null;
  const vehicles = new Set();
  const countries = new Set();

  // Parse line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for truck header: "LKW-Kennzeichen: B16TFL"
    const truckMatch = line.match(/LKW-Kennzeichen:\s*([A-Z0-9]+)/);
    if (truckMatch) {
      currentTruck = truckMatch[1];
      vehicles.add(currentTruck);
      continue;
    }

    // Skip summary sections
    if (line.includes('Gesamtsumme') || line.includes('Länder Gesamt') ||
        line.includes('Sachbearbeiter') || line.includes('VERAG 360 GMBH') ||
        line.includes('Seite') || line.includes('MAUT REPORT') ||
        line.includes('Anlage zur Sammelrechnung')) {
      continue;
    }

    // Try to parse transaction line
    // Format: Land Datum [Produkt] Kartennummer [RouteInfo] Netto MWST Brutto
    // Example: AT 29.03.2025 000490984032037 96,63 19,33 115,96
    // Example: HU 21.03.2025 ÚTDÍJAK 000490984032037 42U61K275M M0U26K100M 77,75 20,99 98,74

    if (!currentTruck) continue;

    // Check if line starts with a country code
    const countryCode = line.substring(0, 3).trim();
    if (!VERAG_COUNTRIES.includes(countryCode)) {
      // Check for 2-letter codes at start
      const twoLetterCode = line.substring(0, 2);
      if (!VERAG_COUNTRIES.includes(twoLetterCode)) {
        continue;
      }
    }

    // Parse the transaction line
    const transaction = parseTransactionLine(line, currentTruck);
    if (transaction) {
      transactions.push(transaction);

      if (transaction.country) {
        countries.add(transaction.country);
      }

      if (transaction.net_amount) {
        totalNetEUR += transaction.net_amount;
      }
      if (transaction.vat_amount) {
        totalVatEUR += transaction.vat_amount;
      }
      if (transaction.gross_amount) {
        totalGrossEUR += transaction.gross_amount;
      }

      if (transaction.transaction_date) {
        const txDate = new Date(transaction.transaction_date);
        if (!minDate || txDate < minDate) minDate = txDate;
        if (!maxDate || txDate > maxDate) maxDate = txDate;
      }
    }
  }

  return {
    transactions,
    metadata: {
      provider: 'verag',
      report_date: reportDate ? reportDate.toISOString().split('T')[0] : null,
      company_code: companyCode,
      total_transactions: transactions.length,
      total_net_eur: Math.round(totalNetEUR * 100) / 100,
      total_vat_eur: Math.round(totalVatEUR * 100) / 100,
      total_gross_eur: Math.round(totalGrossEUR * 100) / 100,
      currency: 'EUR',
      period_start: minDate ? minDate.toISOString().split('T')[0] : null,
      period_end: maxDate ? maxDate.toISOString().split('T')[0] : null,
      vehicles: [...vehicles],
      countries: [...countries],
    },
  };
}

/**
 * Parse a single transaction line
 */
function parseTransactionLine(line, vehicleRegistration) {
  // Extract numbers from the end (Netto, MWST, Brutto)
  // Numbers can be in format: 96,63 or 1 234,56
  const numberPattern = /(\d[\d\s]*[,.]?\d*)\s*$/;

  // Split line by whitespace but preserve structure
  const parts = line.split(/\s+/);

  if (parts.length < 4) return null;

  // First part is country code (2-3 characters)
  let country = parts[0];
  if (!VERAG_COUNTRIES.includes(country)) return null;

  // Second part should be date
  const dateMatch = parts[1]?.match(/(\d{2}\.\d{2}\.\d{4})/);
  if (!dateMatch) return null;

  const transactionDate = parseDate(dateMatch[1]);
  if (!transactionDate) return null;

  // Find the numbers at the end (last 3 numeric values)
  const numericValues = [];
  for (let i = parts.length - 1; i >= 0 && numericValues.length < 3; i--) {
    const num = parseNumber(parts[i]);
    if (num !== null || parts[i] === '0,00' || parts[i] === '0') {
      numericValues.unshift(num !== null ? num : 0);
    } else if (numericValues.length > 0) {
      // If we've started collecting numbers and hit a non-number, check if it's part of a number
      // Handle cases like "1 234,56" split into multiple parts
      break;
    }
  }

  if (numericValues.length < 3) return null;

  const [netAmount, vatAmount, grossAmount] = numericValues;

  // Extract product type and card number from middle parts
  let product = '';
  let cardNumber = '';
  let routeInfo = '';

  // Parts between date and numbers
  const middleParts = parts.slice(2, parts.length - 3);

  for (const part of middleParts) {
    // Card numbers are long numeric strings (15+ digits)
    if (/^\d{10,}$/.test(part)) {
      cardNumber = part;
    }
    // Product types contain specific keywords
    else if (Object.keys(TOLL_PRODUCTS).some(key => part.includes(key) || key.includes(part))) {
      product = product ? `${product} ${part}` : part;
    }
    // Route info (contains letters and numbers like M5U35K618M)
    else if (/^[A-Z0-9]+[UK]\d+/.test(part) || /^\d+[UK]/.test(part)) {
      routeInfo = routeInfo ? `${routeInfo} ${part}` : part;
    }
    // Other product names
    else if (part.length > 2 && !/^\d+$/.test(part)) {
      if (!product) {
        product = part;
      } else if (!routeInfo) {
        routeInfo = part;
      } else {
        routeInfo = `${routeInfo} ${part}`;
      }
    }
  }

  // Clean up product name
  product = product.trim();

  return {
    vehicle_registration: vehicleRegistration,
    transaction_date: transactionDate.toISOString(),
    country: country,
    product_type: product || null,
    product_category: getProductCategory(product, country),
    card_number: cardNumber || null,
    route_info: routeInfo || null,
    net_amount: netAmount,
    vat_amount: vatAmount,
    gross_amount: grossAmount,
    currency: 'EUR',
    provider: 'verag',
  };
}

/**
 * Import VERAG transactions into database
 */
async function importVeragTransactions(fileBuffer, companyId, userId, documentId, fileName) {
  const parsed = await parseVeragPdf(fileBuffer);

  if (parsed.transactions.length === 0) {
    throw new Error('No transactions found in VERAG PDF');
  }

  // Get company trucks for matching
  const { data: trucks, error: trucksError } = await supabase
    .from('truck_heads')
    .select('id, registration_number')
    .eq('company_id', companyId);

  if (trucksError) {
    throw new Error('Failed to fetch company trucks: ' + trucksError.message);
  }

  // Create truck lookup map
  const truckMap = new Map();
  if (trucks) {
    trucks.forEach(truck => {
      const reg = truck.registration_number;
      truckMap.set(createMatchKey(reg), truck.id);
      truckMap.set(reg.toUpperCase(), truck.id);
      truckMap.set(reg.replace(/\s+/g, '').toUpperCase(), truck.id);
    });
  }

  // Create import batch
  const { data: batch, error: batchError } = await supabase
    .from('dkv_import_batches')
    .insert({
      company_id: companyId,
      uploaded_document_id: documentId,
      file_name: fileName,
      total_transactions: parsed.metadata.total_transactions,
      total_amount: parsed.metadata.total_gross_eur,
      total_vat: parsed.metadata.total_vat_eur,
      currency: 'EUR',
      period_start: parsed.metadata.period_start,
      period_end: parsed.metadata.period_end,
      status: 'processing',
      imported_by: userId,
      provider: 'verag',
      notes: `Provider: VERAG | Net: ${parsed.metadata.total_net_eur} EUR | VAT: ${parsed.metadata.total_vat_eur} EUR | Vehicles: ${parsed.metadata.vehicles.length}`,
    })
    .select()
    .single();

  if (batchError) {
    throw new Error('Failed to create import batch: ' + batchError.message);
  }

  // Process transactions
  let matchedCount = 0;
  let unmatchedCount = 0;
  const transactionsToInsert = [];

  for (const tx of parsed.transactions) {
    let truckId = null;
    let status = 'pending';

    if (tx.vehicle_registration) {
      const matchKey = createMatchKey(tx.vehicle_registration);

      if (truckMap.has(matchKey)) {
        truckId = truckMap.get(matchKey);
      } else if (truckMap.has(tx.vehicle_registration)) {
        truckId = truckMap.get(tx.vehicle_registration);
      }

      if (truckId) {
        status = 'matched';
        matchedCount++;
      } else {
        status = 'unmatched';
        unmatchedCount++;
      }
    } else {
      status = 'unmatched';
      unmatchedCount++;
    }

    // Map VERAG fields to DKV table structure
    transactionsToInsert.push({
      company_id: companyId,
      batch_id: batch.id,
      uploaded_document_id: documentId,
      truck_id: truckId,
      status: status,
      // Map fields
      transaction_time: tx.transaction_date,
      country: tx.country,
      cost_group: 'TOLL', // VERAG is toll-only
      goods_type: tx.product_type || tx.product_category,
      currency: 'EUR',
      // Amounts
      net_base_value: tx.net_amount,
      net_purchase_value: tx.net_amount,
      payment_value: tx.gross_amount,
      payment_currency: 'EUR',
      vehicle_registration: tx.vehicle_registration,
      card_number: tx.card_number,
      // VAT tracking
      vat_amount: tx.vat_amount,
      vat_country: tx.country,
      vat_refundable: tx.vat_amount > 0, // VAT is refundable if paid
      vat_refund_status: tx.vat_amount > 0 ? 'pending' : 'not_applicable',
      // Provider
      provider: 'verag',
      notes: `${tx.product_category}${tx.route_info ? ' | Route: ' + tx.route_info : ''}`,
    });
  }

  // Batch insert
  const CHUNK_SIZE = 100;
  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insertError } = await supabase
      .from('dkv_transactions')
      .insert(chunk);

    if (insertError) {
      console.error('Error inserting VERAG transactions chunk:', insertError);
    }
  }

  // Update batch status
  await supabase
    .from('dkv_import_batches')
    .update({
      matched_transactions: matchedCount,
      unmatched_transactions: unmatchedCount,
      status: unmatchedCount > 0 ? 'partial' : 'completed',
    })
    .eq('id', batch.id);

  return {
    success: true,
    provider: 'verag',
    batch_id: batch.id,
    total_transactions: parsed.metadata.total_transactions,
    matched_transactions: matchedCount,
    unmatched_transactions: unmatchedCount,
    total_net_eur: parsed.metadata.total_net_eur,
    total_vat_eur: parsed.metadata.total_vat_eur,
    total_gross_eur: parsed.metadata.total_gross_eur,
    period_start: parsed.metadata.period_start,
    period_end: parsed.metadata.period_end,
    vehicles: parsed.metadata.vehicles,
    countries: parsed.metadata.countries,
  };
}

module.exports = {
  parseVeragPdf,
  importVeragTransactions,
  VERAG_COUNTRIES,
  TOLL_PRODUCTS,
};
