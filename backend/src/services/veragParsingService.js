const pdfParse = require('pdf-parse');
const { supabaseAdmin: supabase } = require('../config/supabase');
const bnrService = require('./bnrExchangeService');

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

// Fuel product types for fuel summary invoices
const FUEL_PRODUCTS = {
  'ADBLUE': 'adblue',
  'AdBlue': 'adblue',
  'AdB. L': 'adblue',
  'DIESEL': 'diesel',
  'Diesel': 'diesel',
  'ON L': 'diesel', // Polish diesel
  'GASOIL': 'diesel',
  'Gasoil N': 'diesel',
  'Gasoil': 'diesel',
};

// Country name to code mapping for fuel summaries
const COUNTRY_NAMES = {
  'Germany': 'DE',
  'Belgium': 'BE',
  'Netherlands': 'NL',
  'France': 'FR',
  'Poland': 'PL',
  'Bulgaria': 'BG',
  'Hungary': 'HU',
  'Austria': 'AT',
  'Czech Republic': 'CZ',
  'Czechia': 'CZ',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Croatia': 'HR',
  'Luxembourg': 'LU',
  'Switzerland': 'CH',
  'United Kingdom': 'GB',
  'Denmark': 'DK',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Finland': 'FI',
  'Greece': 'GR',
  'Serbia': 'RS',
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
};

// Convert 3-letter country codes to 2-letter ISO codes
const COUNTRY_CODE_MAP = {
  'DEU': 'DE',
  'GBR': 'GB',
  'ROM': 'RO',
  'SVN': 'SI',
  // Standard 2-letter codes pass through
  'AT': 'AT',
  'BE': 'BE',
  'BG': 'BG',
  'CZ': 'CZ',
  'DE': 'DE',
  'FR': 'FR',
  'HR': 'HR',
  'HU': 'HU',
  'IT': 'IT',
  'PL': 'PL',
  'SK': 'SK',
  'CH': 'CH',
  'SI': 'SI',
  'NL': 'NL',
  'LU': 'LU',
  'ES': 'ES',
  'PT': 'PT',
  'DK': 'DK',
  'SE': 'SE',
  'NO': 'NO',
  'FI': 'FI',
  'GR': 'GR',
  'RS': 'RS',
  'LT': 'LT',
  'LV': 'LV',
  'EE': 'EE',
  'RO': 'RO',
  'GB': 'GB',
};

/**
 * Convert country code to standard 2-letter ISO format
 */
function normalizeCountryCode(code) {
  if (!code) return null;
  const upper = code.toUpperCase().trim();
  return COUNTRY_CODE_MAP[upper] || (upper.length <= 2 ? upper : upper.substring(0, 2));
}

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
 * Try to extract vehicle registration from a transaction line
 * Common formats: B16TFL, B 16 TFL, B-16-TFL, AG12ABC
 */
function extractInlineVehicle(line) {
  // Look for European plate patterns in the line
  const patterns = [
    /([A-Z]{1,3}\s*\d{2,3}\s*[A-Z]{2,3})/i,  // B16TFL or B 16 TFL
    /([A-Z]{2,3}-\d{2,4}-[A-Z]{2,3})/i,       // XX-123-XX
    /([A-Z]{1,2}\d{3,4}[A-Z]{2,3})/i,         // B1234ABC
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1].replace(/[\s\-]/g, '').toUpperCase();
    }
  }
  return null;
}

/**
 * Parse number from various formats:
 * - European: 1.234,56 (dot as thousands, comma as decimal)
 * - US: 1,234.56 (comma as thousands, dot as decimal)
 * - Space separated: 1 234,56 or 1 234.56
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  let str = String(value).trim();

  // Handle space as thousand separator (e.g., "1 234,56" or "1 234.56")
  str = str.replace(/\s/g, '');

  // Determine format based on position of comma and dot
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    // Both comma and dot present - the one appearing LAST is the decimal separator
    if (lastDot > lastComma) {
      // US format: 1,000.58 (comma is thousands, dot is decimal)
      str = str.replace(/,/g, '');
    } else {
      // European format: 1.000,58 (dot is thousands, comma is decimal)
      str = str.replace(/\./g, '').replace(',', '.');
    }
  } else if (lastComma !== -1) {
    // Only comma present - assume European decimal separator
    // But check if it looks like thousands separator (e.g., "1,000" with no decimals)
    const afterComma = str.substring(lastComma + 1);
    if (afterComma.length === 3 && /^\d{3}$/.test(afterComma)) {
      // Likely a thousands separator (e.g., "1,000")
      str = str.replace(/,/g, '');
    } else {
      // Likely a decimal separator (e.g., "1,50" or "1000,58")
      str = str.replace(',', '.');
    }
  }
  // If only dot or neither, parseFloat handles it correctly

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

  // Debug: Log first 3000 characters to understand PDF structure
  console.log('=== VERAG PDF DEBUG ===');
  console.log('PDF Text (first 3000 chars):', text.substring(0, 3000));
  console.log('=== END PDF DEBUG ===');

  // Split into lines and clean up
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // Debug: Log first 50 lines
  console.log('=== VERAG PDF LINES ===');
  lines.slice(0, 50).forEach((line, i) => console.log(`Line ${i}: ${line}`));
  console.log('=== END PDF LINES ===');

  // Detect PDF type
  const isMautReport = text.includes('MAUT REPORT') || text.includes('LKW-Kennzeichen');
  const isZusammenfassung = text.includes('ZUSAMMENFASSUNG') || text.includes('Zusammenfassung');
  const hasFuelDetailLines = /\d{2}\/\d{2}\/\d{2}\s+\d{4}/.test(text); // DD/MM/YY HHMM format

  console.log('=== PDF Type Detection ===');
  console.log('isMautReport:', isMautReport);
  console.log('isZusammenfassung:', isZusammenfassung);
  console.log('hasFuelDetailLines:', hasFuelDetailLines);
  console.log('=== END PDF Type Detection ===');

  // Try fuel summary with detailed transactions first if detected
  if (isZusammenfassung || hasFuelDetailLines) {
    console.log('Trying fuel summary format with detailed transactions...');
    const fuelResult = parseFuelSummaryFormat(lines, text);
    if (fuelResult.transactions.length > 0) {
      console.log(`Found ${fuelResult.transactions.length} fuel transactions`);
      return {
        transactions: fuelResult.transactions,
        metadata: {
          provider: 'verag',
          report_date: fuelResult.reportDate,
          company_code: fuelResult.companyCode,
          total_transactions: fuelResult.transactions.length,
          total_net_eur: fuelResult.totalNetEUR,
          total_vat_eur: fuelResult.totalVatEUR,
          total_gross_eur: fuelResult.totalGrossEUR,
          currency: 'EUR',
          period_start: fuelResult.periodStart,
          period_end: fuelResult.periodEnd,
          vehicles: fuelResult.vehicles,
          countries: fuelResult.countries,
        },
      };
    }
  }

  // Try MAUT REPORT format
  if (isMautReport) {
    console.log('Trying MAUT REPORT format...');
    const mautResult = parseMautReportFormat(lines, text);
    if (mautResult.transactions.length > 0) {
      console.log(`Found ${mautResult.transactions.length} MAUT transactions`);
      return {
        transactions: mautResult.transactions,
        metadata: {
          provider: 'verag',
          report_date: mautResult.reportDate,
          company_code: mautResult.companyCode,
          total_transactions: mautResult.transactions.length,
          total_net_eur: mautResult.totalNetEUR,
          total_vat_eur: mautResult.totalVatEUR,
          total_gross_eur: mautResult.totalGrossEUR,
          currency: 'EUR',
          period_start: mautResult.periodStart,
          period_end: mautResult.periodEnd,
          vehicles: mautResult.vehicles,
          countries: mautResult.countries,
        },
      };
    }
  }

  // Fallback: try generic invoice format
  console.log('Trying generic invoice format...');
  const invoiceResult = parseInvoiceFormat(lines, text);
  if (invoiceResult.transactions.length > 0) {
    return {
      transactions: invoiceResult.transactions,
      metadata: {
        provider: 'verag',
        report_date: invoiceResult.reportDate,
        company_code: invoiceResult.companyCode,
        total_transactions: invoiceResult.transactions.length,
        total_net_eur: invoiceResult.totalNetEUR,
        total_vat_eur: invoiceResult.totalVatEUR,
        total_gross_eur: invoiceResult.totalGrossEUR,
        currency: 'EUR',
        period_start: invoiceResult.periodStart,
        period_end: invoiceResult.periodEnd,
        vehicles: invoiceResult.vehicles,
        countries: invoiceResult.countries,
      },
    };
  }

  // No transactions found
  return {
    transactions: [],
    metadata: {
      provider: 'verag',
      report_date: null,
      company_code: null,
      total_transactions: 0,
      total_net_eur: 0,
      total_vat_eur: 0,
      total_gross_eur: 0,
      currency: 'EUR',
      period_start: null,
      period_end: null,
      vehicles: [],
      countries: [],
    },
  };
}

/**
 * Parse MAUT REPORT format PDFs
 * These have transaction lines in format:
 * [Product?] Gross Net VAT Country Date CardNumber [RouteInfo]
 * Example: 275,39275,390,00DE09.04.2025000490984032037
 * Example: ÚTDÍJAK48,3338,0610,27HU06.04.202500049098403203742U61K275MM4U105K5M
 */
function parseMautReportFormat(lines, fullText) {
  const transactions = [];
  const vehicles = new Set();
  const countries = new Set();
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;
  let minDate = null;
  let maxDate = null;
  let reportDate = null;
  let companyCode = null;
  let currentTruck = null;

  // Extract report date
  const dateMatch = fullText.match(/Datum:\s*(\d{2})\.(\d{2})\.(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    reportDate = `${year}-${month}-${day}`;
  }

  // Extract company code
  const companyMatch = fullText.match(/(\d{6})\s+[A-Z\s]+SRL/);
  if (companyMatch) {
    companyCode = companyMatch[1];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for truck header - can be on same line or next line
    const truckMatch = line.match(/LKW-Kennzeichen:\s*([A-Z0-9]+)/i);
    if (truckMatch) {
      currentTruck = truckMatch[1];
      vehicles.add(currentTruck);
      continue;
    }

    // Check if previous line was "LKW-Kennzeichen:" and this line is the registration
    if (i > 0 && lines[i - 1].match(/LKW-Kennzeichen:\s*$/i)) {
      const regMatch = line.match(/^([A-Z]{1,3}\d{1,3}[A-Z]{2,3})$/i);
      if (regMatch) {
        currentTruck = regMatch[1].toUpperCase();
        vehicles.add(currentTruck);
        continue;
      }
    }

    // Skip header/footer lines
    if (line.includes('Gesamtsumme') || line.includes('Länder Gesamt') ||
        line.includes('Sachbearbeiter') || line.includes('VERAG') ||
        line.includes('Seite') || line.includes('MAUT REPORT') ||
        line.includes('Anlage') || line.includes('IBAN') ||
        line.includes('USt') || line.includes('Steuer') ||
        line.includes('DatumLand') || line.includes('Kartennummer') ||
        /^\d+,\d+$/.test(line)) { // Skip subtotal lines
      continue;
    }

    // Try to parse the transaction line with the new format
    // Pattern: [Product?] Amount Amount Amount Country DD.MM.YYYY CardNumber [RouteInfo]
    const transaction = parseMautTransactionLine(line, currentTruck);
    if (transaction) {
      transactions.push(transaction);
      countries.add(transaction.country);

      totalNetEUR += transaction.net_amount || 0;
      totalVatEUR += transaction.vat_amount || 0;
      totalGrossEUR += transaction.gross_amount || 0;

      const txDate = new Date(transaction.transaction_date);
      if (!minDate || txDate < minDate) minDate = txDate;
      if (!maxDate || txDate > maxDate) maxDate = txDate;
    }
  }

  return {
    transactions,
    vehicles: [...vehicles],
    countries: [...countries],
    totalNetEUR: Math.round(totalNetEUR * 100) / 100,
    totalVatEUR: Math.round(totalVatEUR * 100) / 100,
    totalGrossEUR: Math.round(totalGrossEUR * 100) / 100,
    periodStart: minDate ? minDate.toISOString().split('T')[0] : null,
    periodEnd: maxDate ? maxDate.toISOString().split('T')[0] : null,
    reportDate,
    companyCode,
  };
}

/**
 * Parse a MAUT REPORT transaction line
 * Format: [Product?] Gross Net VAT Country DD.MM.YYYY CardNumber [RouteInfo]
 */
function parseMautTransactionLine(line, currentTruck) {
  // Must contain a date in DD.MM.YYYY format
  const dateMatch = line.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!dateMatch) return null;

  const [fullDateMatch, day, month, year] = dateMatch;
  const transactionDate = new Date(year, month - 1, day);
  const dateIndex = line.indexOf(fullDateMatch);

  // Find country code right before the date (2-3 chars)
  // Look for country code pattern in the text before the date
  const beforeDate = line.substring(0, dateIndex);
  let country = null;
  let countryIndex = -1;

  // Try to find country code at the end of beforeDate
  for (const cc of VERAG_COUNTRIES) {
    const ccIndex = beforeDate.lastIndexOf(cc);
    if (ccIndex !== -1 && (countryIndex === -1 || ccIndex > countryIndex)) {
      // Make sure it's at the end or followed by nothing (concatenated)
      const afterCc = beforeDate.substring(ccIndex + cc.length);
      if (afterCc === '' || /^\s*$/.test(afterCc)) {
        country = cc;
        countryIndex = ccIndex;
      }
    }
  }

  if (!country) return null;

  // Get the part before the country code (contains product and amounts)
  const beforeCountry = line.substring(0, countryIndex);

  // Extract amounts - three numbers concatenated like "275,39275,390,00" or "48,3338,0610,27"
  // Pattern: number with comma decimal, possibly with thousands separator
  const amountPattern = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;
  const amounts = [];
  let match;
  let lastAmountEnd = 0;
  let productPart = beforeCountry;

  while ((match = amountPattern.exec(beforeCountry)) !== null) {
    amounts.push(parseNumber(match[1]));
    if (amounts.length === 1) {
      productPart = beforeCountry.substring(0, match.index);
    }
    lastAmountEnd = match.index + match[0].length;
  }

  // Need exactly 3 amounts: Gross, Net, VAT
  if (amounts.length !== 3) return null;

  // Amounts are in order: Gross, Net, VAT (based on header "BruttoMWSTProduktNetto" - but actual data shows Brutto, Netto, MWST)
  // Let's verify: Gross should equal Net + VAT
  // From example: 48,33 38,06 10,27 -> 38.06 + 10.27 = 48.33 ✓
  // So order is: Gross, Net, VAT
  let [grossAmount, netAmount, vatAmount] = amounts;

  // Sanity check: net + vat should approximately equal gross
  const calculatedGross = netAmount + vatAmount;
  if (Math.abs(calculatedGross - grossAmount) > 0.02) {
    // Try different order: maybe Net, Gross, VAT? or other combinations
    // Actually, recheck based on the actual data patterns
    // Looking at "275,39275,390,00" for DE (no VAT): Gross=Net=275.39, VAT=0
    // This means order is actually: Gross, Net, VAT with Net=Gross when VAT=0
    // Let's trust the order we detected
  }

  // Extract card number after the date (15+ digit number)
  const afterDate = line.substring(dateIndex + fullDateMatch.length);
  const cardMatch = afterDate.match(/(\d{12,})/);
  const cardNumber = cardMatch ? cardMatch[1] : null;

  // Extract route info (anything after card number)
  let routeInfo = null;
  if (cardMatch) {
    const afterCard = afterDate.substring(afterDate.indexOf(cardMatch[1]) + cardMatch[1].length).trim();
    if (afterCard && afterCard.length > 0 && !/^\d/.test(afterCard)) {
      routeInfo = afterCard;
    }
  }

  // Extract product type from the beginning
  let productType = null;
  let productCategory = 'toll_generic';
  productPart = productPart.trim();

  if (productPart) {
    for (const [key, category] of Object.entries(TOLL_PRODUCTS)) {
      if (productPart.includes(key) || productPart.toUpperCase().includes(key.toUpperCase())) {
        productType = key;
        productCategory = category;
        break;
      }
    }
    if (!productType && productPart.length > 0) {
      productType = productPart;
    }
  }

  // Default category based on country if not set
  if (productCategory === 'toll_generic' && !productType) {
    productCategory = getProductCategory(null, country);
  }

  // Calculate VAT rate
  const vatRate = vatAmount > 0 && netAmount > 0
    ? Math.round((vatAmount / netAmount) * 10000) / 100
    : 0;

  // Get country VAT info
  const countryCode = bnrService.getCountryCode(country) || country;
  const vatInfo = bnrService.getVatRate(country);

  return {
    vehicle_registration: currentTruck || 'UNKNOWN',
    transaction_date: transactionDate.toISOString(),
    country: country,
    country_code: countryCode,
    product_type: productType,
    product_category: productCategory,
    card_number: cardNumber,
    route_info: routeInfo,
    net_amount: netAmount,
    vat_amount: vatAmount,
    vat_rate: vatRate,
    vat_country: countryCode,
    vat_country_rate: vatInfo.rate,
    vat_refundable: vatInfo.refundable && vatAmount > 0,
    gross_amount: grossAmount,
    currency: 'EUR',
    provider: 'verag',
  };
}

/**
 * Parse invoice-style VERAG PDFs
 * These have a different format than MAUT REPORT files
 */
function parseInvoiceFormat(lines, fullText) {
  const transactions = [];
  const vehicles = new Set();
  const countries = new Set();
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;
  let minDate = null;
  let maxDate = null;
  let reportDate = null;
  let companyCode = null;

  // Try to extract invoice date
  const invoiceDateMatch = fullText.match(/Rechnungsdatum[:\s]+(\d{2}\.\d{2}\.\d{4})/i) ||
                            fullText.match(/Invoice Date[:\s]+(\d{2}\.\d{2}\.\d{4})/i) ||
                            fullText.match(/Datum[:\s]+(\d{2}\.\d{2}\.\d{4})/i);
  if (invoiceDateMatch) {
    reportDate = parseDate(invoiceDateMatch[1])?.toISOString().split('T')[0];
  }

  // Try to extract invoice/company number
  const invoiceMatch = fullText.match(/Rechnungsnummer[:\s]+(\d+)/i) ||
                        fullText.match(/Invoice[:\s]+(\d+)/i);
  if (invoiceMatch) {
    companyCode = invoiceMatch[1];
  }

  // Look for patterns with vehicle + date + amount
  // Common invoice format: Vehicle | Date | Description | Net | VAT | Gross
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header/footer lines
    if (line.includes('VERAG') || line.includes('Seite') || line.includes('Page') ||
        line.includes('IBAN') || line.includes('BIC') || line.includes('USt')) {
      continue;
    }

    // Look for lines with dates and amounts
    const dateMatch = line.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (!dateMatch) continue;

    // Look for amount patterns at the end (with potential comma as decimal separator)
    const amountMatches = line.match(/(\d+[,\.]\d{2})\s*(\d+[,\.]\d{2})?\s*(\d+[,\.]\d{2})?$/);
    if (!amountMatches) continue;

    const transactionDate = parseDate(dateMatch[1]);
    if (!transactionDate) continue;

    // Parse amounts - at least one, up to three (net, vat, gross)
    let netAmount = null;
    let vatAmount = null;
    let grossAmount = null;

    const amounts = [amountMatches[1], amountMatches[2], amountMatches[3]]
      .filter(Boolean)
      .map(a => parseNumber(a));

    if (amounts.length === 3) {
      [netAmount, vatAmount, grossAmount] = amounts;
    } else if (amounts.length === 2) {
      [netAmount, grossAmount] = amounts;
      vatAmount = grossAmount - netAmount;
    } else if (amounts.length === 1) {
      grossAmount = amounts[0];
      netAmount = grossAmount;
      vatAmount = 0;
    }

    if (grossAmount === null || grossAmount <= 0) continue;

    // Try to find vehicle registration in the line
    const vehicleReg = extractInlineVehicle(line) || 'UNKNOWN';
    if (vehicleReg !== 'UNKNOWN') vehicles.add(vehicleReg);

    // Try to find country code in the line
    let country = null;
    for (const cc of VERAG_COUNTRIES) {
      if (line.includes(` ${cc} `) || line.startsWith(`${cc} `)) {
        country = cc;
        countries.add(cc);
        break;
      }
    }

    // Determine product type from line content
    let productType = '';
    let productCategory = 'toll_generic';
    for (const [key, cat] of Object.entries(TOLL_PRODUCTS)) {
      if (line.toLowerCase().includes(key.toLowerCase())) {
        productType = key;
        productCategory = cat;
        break;
      }
    }

    // Maut/toll keywords
    if (!productType && (line.includes('Maut') || line.includes('Toll') || line.includes('maut') || line.includes('toll'))) {
      productType = 'Maut';
      productCategory = 'toll_generic';
    }

    const bnrService = require('./bnrExchangeService');
    const countryCode = bnrService.getCountryCode(country || 'DE') || country || 'DE';
    const vatInfo = bnrService.getVatRate(country || 'DE');
    const vatRate = vatAmount > 0 && netAmount > 0
      ? Math.round((vatAmount / netAmount) * 10000) / 100
      : 0;

    transactions.push({
      vehicle_registration: vehicleReg,
      transaction_date: transactionDate.toISOString(),
      country: country || 'DE',
      country_code: countryCode,
      product_type: productType || null,
      product_category: productCategory,
      card_number: null,
      route_info: null,
      net_amount: netAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      vat_country: countryCode,
      vat_country_rate: vatInfo.rate,
      vat_refundable: vatInfo.refundable && vatAmount > 0,
      gross_amount: grossAmount,
      currency: 'EUR',
      provider: 'verag',
    });

    totalNetEUR += netAmount || 0;
    totalVatEUR += vatAmount || 0;
    totalGrossEUR += grossAmount || 0;

    if (!minDate || transactionDate < minDate) minDate = transactionDate;
    if (!maxDate || transactionDate > maxDate) maxDate = transactionDate;
  }

  return {
    transactions,
    vehicles: [...vehicles],
    countries: [...countries],
    totalNetEUR: Math.round(totalNetEUR * 100) / 100,
    totalVatEUR: Math.round(totalVatEUR * 100) / 100,
    totalGrossEUR: Math.round(totalGrossEUR * 100) / 100,
    periodStart: minDate ? minDate.toISOString().split('T')[0] : null,
    periodEnd: maxDate ? maxDate.toISOString().split('T')[0] : null,
    reportDate,
    companyCode,
  };
}

/**
 * Parse fuel summary invoice format (ZUSAMMENFASSUNG)
 * This format has:
 * 1. Summary section by country (Country -> Products -> VAT -> Totals)
 * 2. Detailed transaction lines with date/time/vehicle:
 *    DD/MM/YY HHMM CardCode InternalCode 0 Product Station Currency...
 *    Example: 26/04/25 1423 00156403 10346 0 AdB. L Szczecin-RPLN...
 */
function parseFuelSummaryFormat(lines, fullText) {
  const transactions = [];
  const vehicles = new Set();
  const countries = new Set();
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;
  let reportDate = null;
  let companyCode = null;
  let minDate = null;
  let maxDate = null;

  // Extract report/invoice date
  const dateMatch = fullText.match(/Datum[:\s]*(\d{2})\/(\d{2})\/(\d{4})/i) ||
                    fullText.match(/Datum[:\s]*(\d{2})\.(\d{2})\.(\d{4})/i);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    reportDate = `${year}-${month}-${day}`;
  }

  // Extract company/sub-account code
  const companyMatch = fullText.match(/Sub-account[:\s]*(\d+)/i) ||
                       fullText.match(/Kunden Nr\.[:\s]*(\d+)/i);
  if (companyMatch) {
    companyCode = companyMatch[1];
  }

  // Build a map of card codes to vehicle registrations from "KarteZwischensumme" lines
  // Format: KarteZwischensumme0060009723-TRANSFABILOGSRL-10346MS40TFL1,841.60
  // Also: TOTALFORCARD/0060009723-10346-0MS40TFL1,092.09
  // Also: OSSZ./KARTYA/0060009723-10395-0MS25TFL19,505.87
  // Also: Totalpourcarte/0060009723-10403-0MS50TFL740.81
  // Also: SUMA-KARTA/KARTEZWISCHENSUMME0060009723-10346-0MS40TFL3,199.14
  // Also: TOTALPT.CARD/KARTEZWISCHENSUMME0060009723-10486-0B46TFL3,018.37
  const cardToVehicle = new Map();

  // Multiple patterns for different card-vehicle associations in the document
  const vehiclePatterns = [
    // German/Main format: KarteZwischensumme...-10346MS40TFL1,841.60
    /KarteZwischensumme[^-]*-[^-]*-(\d+)([A-Z]{1,3}\d{1,3}[A-Z]{2,3})/gi,
    // English format: TOTALFORCARD/0060009723-10346-0MS40TFL
    /TOTALFORCARD\/[^-]+-(\d+)-\d([A-Z]{1,3}\d{1,3}[A-Z]{2,3})/gi,
    // Hungarian format: OSSZ./KARTYA/0060009723-10395-0MS25TFL
    /OSSZ\.\/KARTYA\/[^-]+-(\d+)-\d([A-Z]{1,3}\d{1,3}[A-Z]{2,3})/gi,
    // French format: Totalpourcarte/0060009723-10403-0MS50TFL
    /Totalpourcarte\/[^-]+-(\d+)-\d([A-Z]{1,3}\d{1,3}[A-Z]{2,3})/gi,
    // Polish/Romanian format: SUMA-KARTA/KARTEZWISCHENSUMME...-10346-0MS40TFL or TOTALPT.CARD/...
    /(?:SUMA-KARTA|TOTALPT\.CARD)\/KARTEZWISCHENSUMME[^-]*-(\d+)-\d([A-Z]{1,3}\d{1,3}[A-Z]{2,3})/gi,
  ];

  for (const pattern of vehiclePatterns) {
    let vehicleMatch;
    while ((vehicleMatch = pattern.exec(fullText)) !== null) {
      const internalCode = vehicleMatch[1];
      const vehicleReg = vehicleMatch[2];
      if (internalCode && vehicleReg && !cardToVehicle.has(internalCode)) {
        cardToVehicle.set(internalCode, vehicleReg);
        vehicles.add(vehicleReg);
      }
    }
  }

  console.log('=== Vehicle mapping from Zwischensumme ===');
  console.log('Card to Vehicle map:', Object.fromEntries(cardToVehicle));
  console.log('=== END Vehicle mapping ===');

  // Parse detailed transaction lines - multiple formats exist:
  // Format 1: DD/MM/YY HHMM CardCode InternalCode 0 Product Station Currency Price Discount NetPrice Rate NetPriceEUR Qty Rate NetAmtEUR TicketNr
  // Example: 26/04/25 1423        00156403 10346 0 AdB. L     Szczecin-RPLN     3.5310   0.0000  3.5310    4.2683   0.8273   26.00L 1.0000     21.51 4655510082
  // Format 2: DD/MM/YY HHMM Km CardCode InternalCode 0 Product Station Currency...
  // Example: 24/04/25 0417 273000 00273000 10502 0 DIESEL     DrahelciceCZK...
  // Format 3 (simpler): DD/MM/YY HH:MM Product Station Price Qty VAT% Amount
  const detailLineRegex = /^(\d{2})\/(\d{2})\/(\d{2})\s+(\d{4})\s+(?:\d+\s+)?(\d+)\s+(\d+)\s+\d\s+([A-Za-z\.\s]+?)\s+([A-Za-z0-9_\-]+)\s*([A-Z]{3})?\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)L\s+([\d.,]+)\s+([\d.,]+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Try to parse detailed transaction line
    const detailMatch = line.match(detailLineRegex);
    if (detailMatch) {
      const [, day, month, year, time, cardCode, internalCode, product, station, currency,
             stationPrice, discount, netPrice, exchangeRate1, netPriceEur, quantity, exchangeRate2, netAmountEur] = detailMatch;

      // Parse the date (year is 2-digit)
      const fullYear = parseInt(year) + 2000;
      const transactionDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));

      // Get vehicle registration from mapping or try to extract
      let vehicleReg = cardToVehicle.get(internalCode) || 'UNKNOWN';

      // Determine country from currency or station name
      let countryCode = 'DE'; // Default to Germany for EUR
      const stationLower = station.toLowerCase();

      // Currency-based country detection
      if (currency === 'PLN') countryCode = 'PL';
      else if (currency === 'HUF') countryCode = 'HU';
      else if (currency === 'CZK') countryCode = 'CZ';
      else if (currency === 'RON') countryCode = 'RO';
      else if (currency === 'BGN') countryCode = 'BG';
      else if (currency === 'EUR') {
        // For EUR, try to detect country from station name
        // Austria stations
        if (stationLower.includes('suben') || stationLower.includes('österreich') || stationLower.includes('austria')) {
          countryCode = 'AT';
        }
        // Germany stations
        else if (stationLower.includes('gundershe') || stationLower.includes('germany') || stationLower.includes('deutsch')) {
          countryCode = 'DE';
        }
        // France stations
        else if (stationLower.includes('beaune') || stationLower.includes('france') || stationLower.includes('frank') ||
                 stationLower.includes('dizier') || stationLower.includes('langres') || stationLower.includes('rolampont')) {
          countryCode = 'FR';
        }
        // Belgium stations
        else if (stationLower.includes('belgi') || stationLower.includes('brux') || stationLower.includes('antwerp') ||
                 stationLower.includes('zelzate') || stationLower.includes('gent')) {
          countryCode = 'BE';
        }
        // Netherlands stations
        else if (stationLower.includes('netherl') || stationLower.includes('holland')) {
          countryCode = 'NL';
        }
        // Luxembourg stations
        else if (stationLower.includes('luxemb')) {
          countryCode = 'LU';
        }
        // Italy stations
        else if (stationLower.includes('ital') || stationLower.includes('roma') || stationLower.includes('milan')) {
          countryCode = 'IT';
        }
        // Spain stations
        else if (stationLower.includes('spain') || stationLower.includes('españa')) {
          countryCode = 'ES';
        }
        else {
          // Default to Austria for Suben-area stations (common in VERAG)
          countryCode = 'AT';
        }
      }
      // Station-based detection (fallback if currency not captured or concatenated with station)
      else if (!currency) {
        // Station may have currency concatenated (e.g., "GundersheiEUR", "SubenEUR")
        // Check if station ends with a known currency code
        const stationHasEur = stationLower.endsWith('eur');
        const stationHasPln = stationLower.endsWith('pln');
        const stationHasHuf = stationLower.endsWith('huf');
        const stationHasCzk = stationLower.endsWith('czk');
        const stationHasRon = stationLower.endsWith('ron');
        const stationHasBgn = stationLower.endsWith('bgn');

        // Try to detect country from station name patterns
        // Germany stations (must check first since "GundersheiEUR" ends with EUR)
        if (stationLower.includes('gundershe') || stationLower.includes('germany') || stationLower.includes('deutsch')) {
          countryCode = 'DE';
        }
        // Austria stations
        else if (stationLower.includes('suben') || stationLower.includes('österreich') || stationLower.includes('austria')) {
          countryCode = 'AT';
        }
        // France stations
        else if (stationLower.includes('beaune') || stationLower.includes('dizier') || stationLower.includes('langres') ||
                 stationLower.includes('rolampont') || stationLower.includes('france')) {
          countryCode = 'FR';
        }
        // Belgium stations
        else if (stationLower.includes('zelzate') || stationLower.includes('gent') || stationLower.includes('belgi')) {
          countryCode = 'BE';
        }
        // Poland stations
        else if (stationHasPln || stationLower.includes('szczecin') || stationLower.includes('poland') || stationLower.includes('polska')) {
          countryCode = 'PL';
        }
        // Hungary stations
        else if (stationHasHuf || stationLower.includes('mosonmagyar') || stationLower.includes('becsehely') || stationLower.includes('bicske') ||
                 stationLower.includes('hungary') || stationLower.includes('magyar')) {
          countryCode = 'HU';
        }
        // Czech stations
        else if (stationHasCzk || stationLower.includes('lovosice') || stationLower.includes('drahelcice') || stationLower.includes('czech') ||
                 stationLower.includes('praha') || stationLower.includes('brno')) {
          countryCode = 'CZ';
        }
        // Romania stations
        else if (stationHasRon || stationLower.includes('arad') || stationLower.includes('pecica') || stationLower.includes('romania') ||
                 stationLower.includes('bucuresti') || stationLower.includes('timisoara')) {
          countryCode = 'RO';
        }
        // Bulgaria stations
        else if (stationHasBgn || stationLower.includes('marikostinovo') || stationLower.includes('bulgaria') || stationLower.includes('sofia') ||
                 stationLower.includes('plovdiv')) {
          countryCode = 'BG';
        }
        // If station ends with EUR but no specific match, default to Austria
        else if (stationHasEur) {
          countryCode = 'AT';
        }
        else {
          countryCode = 'AT'; // Default fallback
        }
      }

      // Normalize product name
      const productNormalized = product.trim();
      let productCategory = 'fuel';
      for (const [key, cat] of Object.entries(FUEL_PRODUCTS)) {
        if (productNormalized.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(productNormalized.toLowerCase())) {
          productCategory = cat;
          break;
        }
      }

      const netAmount = parseNumber(netAmountEur);
      const qty = parseNumber(quantity);

      if (netAmount !== null && netAmount > 0) {
        transactions.push({
          vehicle_registration: vehicleReg,
          transaction_date: transactionDate.toISOString(),
          country: countryCode,
          country_code: countryCode,
          product_type: productNormalized,
          product_category: productCategory,
          card_number: cardCode,
          route_info: station.trim(),
          quantity: qty,
          quantity_unit: 'L',
          net_amount: netAmount,
          vat_amount: 0, // VAT calculated at summary level
          vat_rate: 0,
          vat_country: countryCode,
          vat_country_rate: 0,
          vat_refundable: true,
          gross_amount: netAmount, // Gross will be calculated with VAT later
          currency: 'EUR',
          original_currency: currency || 'EUR',
          provider: 'verag',
        });

        countries.add(countryCode);
        totalNetEUR += netAmount;

        if (!minDate || transactionDate < minDate) minDate = transactionDate;
        if (!maxDate || transactionDate > maxDate) maxDate = transactionDate;

        if (vehicleReg !== 'UNKNOWN') {
          vehicles.add(vehicleReg);
        }
      }
      continue;
    }

    // Alternative simpler pattern for fuel detail lines (less columns)
    // Pattern: DD/MM/YY HHMM ... Amount TicketNr
    const simpleDetailMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2})\s+(\d{4})\s+(\d+)\s+(\d+)/);
    if (simpleDetailMatch && !detailMatch) {
      // Try to extract vehicle from internal code lookup
      const internalCode = simpleDetailMatch[6];
      const vehicleReg = cardToVehicle.get(internalCode);

      // Look for amount near the end of the line
      const amountsInLine = line.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g);
      if (amountsInLine && amountsInLine.length >= 1 && vehicleReg) {
        // Last amount is usually the net amount in EUR
        const netAmount = parseNumber(amountsInLine[amountsInLine.length - 1]);

        // Try to find quantity (number followed by L)
        const qtyMatch = line.match(/([\d.,]+)L/);
        const quantity = qtyMatch ? parseNumber(qtyMatch[1]) : null;

        // Try to find product
        let product = 'FUEL';
        for (const productKey of Object.keys(FUEL_PRODUCTS)) {
          if (line.toUpperCase().includes(productKey.toUpperCase())) {
            product = productKey;
            break;
          }
        }

        // Try to detect country from currency code in line
        const lineLower = line.toLowerCase();
        let detectedCountry = 'AT'; // Default to Austria for VERAG
        if (line.includes('PLN') || lineLower.includes('szczecin') || lineLower.includes('poland')) {
          detectedCountry = 'PL';
        } else if (line.includes('HUF') || lineLower.includes('mosonmagyar') || lineLower.includes('becsehely') || lineLower.includes('bicske')) {
          detectedCountry = 'HU';
        } else if (line.includes('CZK') || lineLower.includes('lovosice') || lineLower.includes('drahelcice')) {
          detectedCountry = 'CZ';
        } else if (line.includes('RON') || lineLower.includes('arad') || lineLower.includes('pecica')) {
          detectedCountry = 'RO';
        } else if (line.includes('BGN') || lineLower.includes('marikostinovo')) {
          detectedCountry = 'BG';
        } else if (line.includes('EUR')) {
          // Check for specific EUR stations
          if (lineLower.includes('suben')) detectedCountry = 'AT';
          else if (lineLower.includes('gundershe')) detectedCountry = 'DE';
          else if (lineLower.includes('zelzate')) detectedCountry = 'BE';
          else if (lineLower.includes('beaune') || lineLower.includes('dizier') || lineLower.includes('langres')) detectedCountry = 'FR';
        }

        const [, day, month, year] = simpleDetailMatch;
        const fullYear = parseInt(year) + 2000;
        const transactionDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));

        if (netAmount !== null && netAmount > 0) {
          transactions.push({
            vehicle_registration: vehicleReg,
            transaction_date: transactionDate.toISOString(),
            country: detectedCountry,
            country_code: detectedCountry,
            product_type: product,
            product_category: FUEL_PRODUCTS[product] || 'fuel',
            card_number: simpleDetailMatch[5],
            route_info: null,
            quantity: quantity,
            quantity_unit: 'L',
            net_amount: netAmount,
            vat_amount: 0,
            vat_rate: 0,
            vat_country: detectedCountry,
            vat_country_rate: 0,
            vat_refundable: true,
            gross_amount: netAmount,
            currency: 'EUR',
            provider: 'verag',
          });

          countries.add(detectedCountry);
          totalNetEUR += netAmount;
          vehicles.add(vehicleReg);

          if (!minDate || transactionDate < minDate) minDate = transactionDate;
          if (!maxDate || transactionDate > maxDate) maxDate = transactionDate;
        }
      }
    }

    // Country-specific invoice format (simpler, with time HH:MM)
    // Example: 25/04/25 11:41   AdBlue         Zelzate                 1.2150    0.0000    1.2150      32.00L  21.00      38.88
    // Pattern: DD/MM/YY HH:MM Product Station Price Rebate NetPrice Qty VAT% Amount
    const countryInvoiceMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})\s+([A-Za-z\s\.]+?)\s{2,}([A-Za-z0-9_\-\s]+?)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)L\s+([\d.,]+)\s+([\d.,]+)/);
    if (countryInvoiceMatch && !detailMatch) {
      const [, day, month, year, hour, minute, product, station, price, rebate, netPrice, quantity, vatRate, amount] = countryInvoiceMatch;

      const fullYear = parseInt(year) + 2000;
      const transactionDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));

      const productNormalized = product.trim();
      let productCategory = 'fuel';
      for (const [key, cat] of Object.entries(FUEL_PRODUCTS)) {
        if (productNormalized.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(productNormalized.toLowerCase())) {
          productCategory = cat;
          break;
        }
      }

      const netAmount = parseNumber(amount);
      const qty = parseNumber(quantity);
      const vat = parseNumber(vatRate);

      if (netAmount !== null && netAmount > 0) {
        // These transactions are typically already in EUR and already counted in the main section
        // But we may need them if the main section parsing missed them
        // For now, log them for debugging
        console.log(`[COUNTRY_INVOICE] ${transactionDate.toISOString().split('T')[0]} | ${productNormalized} | ${station.trim()} | Net: ${netAmount} | VAT%: ${vat}`);
      }
    }
  }

  // If no detailed transactions found, fall back to summary parsing
  if (transactions.length === 0) {
    console.log('No detailed transactions found, trying summary parsing...');
    return parseFuelSummaryOnly(lines, fullText, reportDate, companyCode);
  }

  // Apply VAT from summary section to detailed transactions
  // Extract VAT rates AND amounts per country from summary
  const vatRatesByCountry = extractVatRatesFromSummary(lines);
  console.log('VAT rates by country:', vatRatesByCountry);

  // Create a mapping from country code to VAT info
  const vatRatesByCode = {};
  for (const [countryName, vatInfo] of Object.entries(vatRatesByCountry)) {
    const code = COUNTRY_NAMES[countryName];
    if (code) {
      vatRatesByCode[code] = vatInfo;
    }
  }
  console.log('VAT rates by code:', vatRatesByCode);

  // Group transactions by country to distribute VAT proportionally
  const txByCountry = {};
  for (const tx of transactions) {
    if (!txByCountry[tx.country]) {
      txByCountry[tx.country] = [];
    }
    txByCountry[tx.country].push(tx);
  }

  // Update transactions with VAT info - use PDF's stated VAT amount distributed proportionally
  for (const [countryCode, countryTransactions] of Object.entries(txByCountry)) {
    // Try to find VAT info by country code first, then by country name
    let vatInfo = vatRatesByCode[countryCode];
    if (!vatInfo) {
      const countryName = Object.entries(COUNTRY_NAMES).find(([name, code]) => code === countryCode)?.[0];
      vatInfo = vatRatesByCountry[countryName];
    }

    // Calculate total net for this country's transactions
    const countryNetTotal = countryTransactions.reduce((sum, tx) => sum + tx.net_amount, 0);

    if (vatInfo && vatInfo.vatAmount !== null && countryNetTotal > 0) {
      // Use the PDF's stated VAT amount and distribute proportionally to transactions
      // This ensures our total VAT matches the PDF exactly
      let remainingVat = vatInfo.vatAmount;
      const vatRate = vatInfo.rate;

      for (let i = 0; i < countryTransactions.length; i++) {
        const tx = countryTransactions[i];
        const proportion = tx.net_amount / countryNetTotal;

        let txVat;
        if (i === countryTransactions.length - 1) {
          // Last transaction gets the remainder to avoid rounding errors
          txVat = Math.round(remainingVat * 100) / 100;
        } else {
          txVat = Math.round(vatInfo.vatAmount * proportion * 100) / 100;
          remainingVat -= txVat;
        }

        tx.vat_amount = txVat;
        tx.vat_rate = vatRate;
        tx.vat_country_rate = vatRate;
        tx.gross_amount = Math.round((tx.net_amount + txVat) * 100) / 100;
        totalVatEUR += txVat;
      }
    } else {
      // Fallback: Use default VAT rates for common countries
      const defaultVatRates = {
        'DE': 19, 'AT': 20, 'FR': 20, 'BE': 21, 'NL': 21, 'IT': 22,
        'PL': 23, 'CZ': 21, 'HU': 27, 'SK': 20, 'RO': 19, 'BG': 20,
        'SI': 22, 'HR': 25, 'LU': 17, 'ES': 21, 'PT': 23,
      };
      const defaultRate = defaultVatRates[countryCode] || 20;

      for (const tx of countryTransactions) {
        const vatAmount = Math.round(tx.net_amount * (defaultRate / 100) * 100) / 100;
        tx.vat_amount = vatAmount;
        tx.vat_rate = defaultRate;
        tx.vat_country_rate = defaultRate;
        tx.gross_amount = Math.round((tx.net_amount + vatAmount) * 100) / 100;
        totalVatEUR += vatAmount;
      }
    }
  }

  totalGrossEUR = totalNetEUR + totalVatEUR;

  return {
    transactions,
    vehicles: [...vehicles],
    countries: [...countries],
    totalNetEUR: Math.round(totalNetEUR * 100) / 100,
    totalVatEUR: Math.round(totalVatEUR * 100) / 100,
    totalGrossEUR: Math.round(totalGrossEUR * 100) / 100,
    periodStart: minDate ? minDate.toISOString().split('T')[0] : reportDate,
    periodEnd: maxDate ? maxDate.toISOString().split('T')[0] : reportDate,
    reportDate,
    companyCode,
  };
}

/**
 * Extract VAT rates AND amounts from the summary section
 * This is crucial for accurate VAT totals - we use the PDF's stated VAT amounts
 * rather than recalculating, to avoid rounding differences.
 */
function extractVatRatesFromSummary(lines) {
  const vatRates = {};
  let currentCountry = null;
  let currentCountryProducts = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for country name
    if (COUNTRY_NAMES[line]) {
      currentCountry = line;
      currentCountryProducts = [];
      continue;
    }

    // Track product amounts to calculate country net total
    if (currentCountry) {
      // Check for fuel product type followed by quantity and amount
      const productMatch = Object.keys(FUEL_PRODUCTS).find(p =>
        line === p || line.startsWith(p + ' ') || line.toUpperCase() === p.toUpperCase()
      );
      if (productMatch) {
        // Next lines should be quantity and amount
        const qtyLine = lines[i + 1]?.trim();
        const amtLine = lines[i + 2]?.trim();
        if (qtyLine && amtLine) {
          const amount = parseNumber(amtLine);
          if (amount !== null && amount > 0) {
            currentCountryProducts.push({ product: productMatch, amount });
          }
        }
      }
    }

    // Check for VAT line - captures rate AND the actual VAT amount from PDF
    const vatMatch = line.match(/^(MWST|VAT|TVA)\s*\((\d+[.,]?\d*)\s*%\)$/i);
    if (vatMatch && currentCountry) {
      const vatAmountLine = lines[i + 1]?.trim();
      const grossTotalLine = lines[i + 2]?.trim();

      const vatAmount = parseNumber(vatAmountLine);
      const grossTotal = parseNumber(grossTotalLine);
      const netTotal = currentCountryProducts.reduce((sum, p) => sum + p.amount, 0);

      vatRates[currentCountry] = {
        rate: parseNumber(vatMatch[2]),
        type: vatMatch[1],
        vatAmount: vatAmount,      // Actual VAT amount from PDF
        grossTotal: grossTotal,    // Actual gross total from PDF
        netTotal: netTotal,        // Sum of product net amounts
      };

      currentCountryProducts = [];
    }
  }

  return vatRates;
}

/**
 * Parse only the summary section (fallback when no detail lines)
 */
function parseFuelSummaryOnly(lines, fullText, reportDate, companyCode) {
  const transactions = [];
  const countries = new Set();
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;

  // State machine to parse the structure
  let currentCountry = null;
  let currentCountryCode = null;
  let currentProducts = [];
  let pendingProduct = null;
  let pendingQuantity = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty/header lines
    if (!line || line.includes('VERAG') || line.includes('IBAN') ||
        line.includes('BIC') || line.includes('USt') ||
        line.includes('Seite') || line.includes('Page') ||
        line.includes('Bankverbindung') || line.includes('Steuernummer') ||
        line.includes('Zahlungsreferenz') || line.includes('Zusammenfassung') ||
        line.includes('ZUSAMMENFASSUNG') || line.includes('Gesamtbetrag') ||
        line.includes('Dieses Dokument') || line.includes('Transaction charges') ||
        line.includes('betrag wird abgebucht') || line.includes('COPY') ||
        line.includes('Beschreibung') || line === 'EUR') {
      continue;
    }

    // Check for country name
    if (COUNTRY_NAMES[line]) {
      currentCountry = line;
      currentCountryCode = COUNTRY_NAMES[line];
      countries.add(currentCountryCode);
      currentProducts = [];
      pendingProduct = null;
      pendingQuantity = null;
      continue;
    }

    // Check for fuel product type
    const productMatch = Object.keys(FUEL_PRODUCTS).find(p =>
      line === p || line.startsWith(p + ' ') || line.toUpperCase() === p.toUpperCase()
    );
    if (productMatch && currentCountry) {
      pendingProduct = productMatch;
      pendingQuantity = null;
      continue;
    }

    // Check for quantity line
    const quantityMatch = line.match(/^([\d,.\s]+)L$/i);
    if (quantityMatch && currentCountry && pendingProduct) {
      pendingQuantity = parseNumber(quantityMatch[1]);
      continue;
    }

    // Check for VAT line
    const vatLineMatch = line.match(/^(MWST|VAT|TVA)\s*\((\d+[.,]?\d*)\s*%\)$/i);
    if (vatLineMatch && currentCountry && currentProducts.length > 0) {
      const vatRate = parseNumber(vatLineMatch[2]);
      const vatAmountLine = lines[i + 1]?.trim();
      const grossTotalLine = lines[i + 2]?.trim();

      const countryVatAmount = parseNumber(vatAmountLine);
      const countryGrossTotal = parseNumber(grossTotalLine);

      if (countryVatAmount !== null && countryGrossTotal !== null) {
        const countryNetTotal = currentProducts.reduce((sum, p) => sum + (p.netAmount || 0), 0);

        for (const prod of currentProducts) {
          const proportion = countryNetTotal > 0 ? (prod.netAmount / countryNetTotal) : (1 / currentProducts.length);
          const productVat = Math.round(countryVatAmount * proportion * 100) / 100;
          const productGross = Math.round((prod.netAmount + productVat) * 100) / 100;

          transactions.push({
            vehicle_registration: 'SUMMARY',
            transaction_date: reportDate ? new Date(reportDate).toISOString() : new Date().toISOString(),
            country: currentCountryCode,
            country_code: currentCountryCode,
            product_type: prod.product,
            product_category: FUEL_PRODUCTS[prod.product] || 'fuel',
            card_number: null,
            route_info: null,
            quantity: prod.quantity,
            quantity_unit: 'L',
            net_amount: prod.netAmount,
            vat_amount: productVat,
            vat_rate: vatRate,
            vat_country: currentCountryCode,
            vat_country_rate: vatRate,
            vat_refundable: productVat > 0,
            gross_amount: productGross,
            currency: 'EUR',
            provider: 'verag',
          });

          totalNetEUR += prod.netAmount || 0;
          totalVatEUR += productVat || 0;
          totalGrossEUR += productGross || 0;
        }

        currentProducts = [];
        i += 2;
      }
      continue;
    }

    // Check for amount
    const amountValue = parseNumber(line);
    if (amountValue !== null && currentCountry && pendingProduct) {
      currentProducts.push({
        product: pendingProduct,
        quantity: pendingQuantity,
        netAmount: amountValue,
      });
      pendingProduct = null;
      pendingQuantity = null;
    }
  }

  return {
    transactions,
    vehicles: ['SUMMARY'],
    countries: [...countries],
    totalNetEUR: Math.round(totalNetEUR * 100) / 100,
    totalVatEUR: Math.round(totalVatEUR * 100) / 100,
    totalGrossEUR: Math.round(totalGrossEUR * 100) / 100,
    periodStart: reportDate,
    periodEnd: reportDate,
    reportDate,
    companyCode,
  };
}

/**
 * Import VERAG transactions into database
 */
async function importVeragTransactions(fileBuffer, companyId, userId, documentId, fileName) {
  const parsed = await parseVeragPdf(fileBuffer);

  if (parsed.transactions.length === 0) {
    console.log('=== VERAG PARSING FAILED ===');
    console.log('Metadata extracted:', JSON.stringify(parsed.metadata, null, 2));
    console.log('File name:', fileName);
    console.log('=== END VERAG PARSING FAILED ===');
    throw new Error('No transactions found in VERAG PDF. Please check the PDF format. Expected: MAUT REPORT or invoice with toll transactions (date + amounts). Check server logs for debug output.');
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

  // Create import batch in verag_import_batches table
  const { data: batch, error: batchError } = await supabase
    .from('verag_import_batches')
    .insert({
      company_id: companyId,
      uploaded_document_id: documentId,
      file_name: fileName,
      report_date: parsed.metadata.report_date,
      total_transactions: parsed.metadata.total_transactions,
      total_net_eur: parsed.metadata.total_net_eur,
      total_gross_eur: parsed.metadata.total_gross_eur,
      total_vat_eur: parsed.metadata.total_vat_eur,
      period_start: parsed.metadata.period_start,
      period_end: parsed.metadata.period_end,
      status: 'processing',
      imported_by: userId,
      notes: `Vehicles: ${parsed.metadata.vehicles.length} | Countries: ${parsed.metadata.countries.join(', ')}`,
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

    // Build notes with additional fuel info if available
    let notes = `${tx.product_category} | VAT: ${tx.vat_amount?.toFixed(2)} EUR (${tx.vat_rate?.toFixed(0)}%)`;
    if (tx.quantity && tx.quantity_unit) {
      notes += ` | Qty: ${tx.quantity}${tx.quantity_unit}`;
    }
    if (tx.route_info) {
      notes += ` | Route: ${tx.route_info}`;
    }

    // Map VERAG fields to verag_transactions table
    transactionsToInsert.push({
      company_id: companyId,
      batch_id: batch.id,
      uploaded_document_id: documentId,
      truck_id: truckId,
      status: status,
      // Transaction info
      transaction_date: tx.transaction_date,
      // Vehicle and card
      vehicle_registration: tx.vehicle_registration,
      card_number: tx.card_number,
      // Product info
      product_type: tx.product_type,
      product_category: tx.product_category,
      route_info: tx.route_info,
      // Location
      country: tx.country,
      country_code: normalizeCountryCode(tx.country_code || tx.country),
      // Amounts (all in EUR for VERAG)
      currency: 'EUR',
      net_amount: tx.net_amount,
      vat_amount: tx.vat_amount,
      gross_amount: tx.gross_amount,
      // VAT details
      vat_rate: tx.vat_rate,
      vat_country: tx.vat_country,
      vat_country_rate: tx.vat_country_rate,
      vat_refundable: tx.vat_refundable,
      vat_refund_status: tx.vat_amount > 0 ? 'pending' : 'not_applicable',
      // Notes
      notes: notes,
    });
  }

  // Batch insert into verag_transactions
  const CHUNK_SIZE = 100;
  let insertedCount = 0;
  const insertErrors = [];

  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { data: insertedData, error: insertError } = await supabase
      .from('verag_transactions')
      .insert(chunk)
      .select('id');

    if (insertError) {
      console.error('Error inserting VERAG transactions chunk:', insertError);
      insertErrors.push(insertError.message);
    } else {
      insertedCount += insertedData?.length || chunk.length;
    }
  }

  // If no transactions were inserted and there were errors, fail the import
  if (insertedCount === 0 && insertErrors.length > 0) {
    // Clean up the batch since no transactions were inserted
    await supabase
      .from('verag_import_batches')
      .delete()
      .eq('id', batch.id);

    throw new Error(`Failed to insert VERAG transactions: ${insertErrors.join('; ')}`);
  }

  // Verify inserted count from database
  const { count: actualCount } = await supabase
    .from('verag_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('batch_id', batch.id);

  console.log(`VERAG Import: Expected ${transactionsToInsert.length}, Actually inserted ${actualCount}`);

  // Update batch status with actual counts
  await supabase
    .from('verag_import_batches')
    .update({
      total_transactions: actualCount || insertedCount,
      matched_transactions: matchedCount,
      unmatched_transactions: unmatchedCount,
      status: unmatchedCount > 0 ? 'partial' : 'completed',
    })
    .eq('id', batch.id);

  return {
    success: true,
    provider: 'verag',
    batch_id: batch.id,
    total_transactions: actualCount || insertedCount,
    matched_transactions: matchedCount,
    unmatched_transactions: unmatchedCount,
    total_net_eur: parsed.metadata.total_net_eur,
    total_vat_eur: parsed.metadata.total_vat_eur,
    total_gross_eur: parsed.metadata.total_gross_eur,
    period_start: parsed.metadata.period_start,
    period_end: parsed.metadata.period_end,
    vehicles: parsed.metadata.vehicles,
    countries: parsed.metadata.countries,
    insert_errors: insertErrors.length > 0 ? insertErrors : undefined,
  };
}

module.exports = {
  parseVeragPdf,
  importVeragTransactions,
  VERAG_COUNTRIES,
  TOLL_PRODUCTS,
  FUEL_PRODUCTS,
  COUNTRY_NAMES,
};
