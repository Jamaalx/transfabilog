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

  // Debug: Log first 2000 characters to understand PDF structure
  console.log('=== VERAG PDF DEBUG ===');
  console.log('PDF Text (first 2000 chars):', text.substring(0, 2000));
  console.log('=== END PDF DEBUG ===');

  // Split into lines and clean up
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // Debug: Log first 50 lines
  console.log('=== VERAG PDF LINES ===');
  lines.slice(0, 50).forEach((line, i) => console.log(`Line ${i}: ${line}`));
  console.log('=== END PDF LINES ===');

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

    // Alternative truck patterns for invoice format
    // Pattern: "Kennzeichen: XX-XXXX" or just registration number like "B 16 TFL" or "B16TFL"
    const altTruckMatch = line.match(/Kennzeichen[:\s]+([A-Z]{1,3}[\s\-]?\d{2,3}[\s\-]?[A-Z]{2,3})/i) ||
                          line.match(/^([A-Z]{1,3}[\s\-]?\d{2,3}[\s\-]?[A-Z]{2,3})$/i);
    if (altTruckMatch && !currentTruck) {
      currentTruck = altTruckMatch[1].replace(/[\s\-]/g, '');
      vehicles.add(currentTruck);
      continue;
    }

    // Skip summary sections
    if (line.includes('Gesamtsumme') || line.includes('Länder Gesamt') ||
        line.includes('Sachbearbeiter') || line.includes('VERAG 360 GMBH') ||
        line.includes('Seite') || line.includes('MAUT REPORT') ||
        line.includes('Anlage zur Sammelrechnung') ||
        line.includes('Bankverbindung') || line.includes('IBAN') ||
        line.includes('USt-IdNr') || line.includes('Steuernummer')) {
      continue;
    }

    // Try to parse transaction line
    // Format: Land Datum [Produkt] Kartennummer [RouteInfo] Netto MWST Brutto
    // Example: AT 29.03.2025 000490984032037 96,63 19,33 115,96
    // Example: HU 21.03.2025 ÚTDÍJAK 000490984032037 42U61K275M M0U26K100M 77,75 20,99 98,74

    // Check if line starts with a country code
    const countryCode = line.substring(0, 3).trim();
    let hasCountryCode = VERAG_COUNTRIES.includes(countryCode);
    if (!hasCountryCode) {
      // Check for 2-letter codes at start
      const twoLetterCode = line.substring(0, 2);
      hasCountryCode = VERAG_COUNTRIES.includes(twoLetterCode);
    }

    if (!hasCountryCode) continue;

    // Parse the transaction line - try with currentTruck or extract from line
    const transaction = parseTransactionLine(line, currentTruck || 'UNKNOWN');
    if (transaction) {
      // If no currentTruck yet, try to extract vehicle registration from line or use UNKNOWN
      if (!currentTruck && transaction.vehicle_registration === 'UNKNOWN') {
        // Try to find vehicle in the line itself (for invoice formats with inline vehicle)
        const inlineVehicle = extractInlineVehicle(line);
        if (inlineVehicle) {
          transaction.vehicle_registration = inlineVehicle;
          vehicles.add(inlineVehicle);
        }
      }

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

  // If no transactions found with standard format, try invoice format
  if (transactions.length === 0) {
    console.log('No transactions found with standard format, trying invoice format...');
    const invoiceResult = parseInvoiceFormat(lines, text);
    if (invoiceResult.transactions.length > 0) {
      return {
        transactions: invoiceResult.transactions,
        metadata: {
          provider: 'verag',
          report_date: invoiceResult.reportDate || reportDate?.toISOString().split('T')[0],
          company_code: invoiceResult.companyCode || companyCode,
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

    // If invoice format also fails, try fuel summary format (ZUSAMMENFASSUNG)
    console.log('No transactions found with invoice format, trying fuel summary format...');
    const fuelSummaryResult = parseFuelSummaryFormat(lines, text);
    if (fuelSummaryResult.transactions.length > 0) {
      console.log(`Found ${fuelSummaryResult.transactions.length} fuel transactions in summary format`);
      return {
        transactions: fuelSummaryResult.transactions,
        metadata: {
          provider: 'verag',
          report_date: fuelSummaryResult.reportDate || reportDate?.toISOString().split('T')[0],
          company_code: fuelSummaryResult.companyCode || companyCode,
          total_transactions: fuelSummaryResult.transactions.length,
          total_net_eur: fuelSummaryResult.totalNetEUR,
          total_vat_eur: fuelSummaryResult.totalVatEUR,
          total_gross_eur: fuelSummaryResult.totalGrossEUR,
          currency: 'EUR',
          period_start: fuelSummaryResult.periodStart,
          period_end: fuelSummaryResult.periodEnd,
          vehicles: fuelSummaryResult.vehicles,
          countries: fuelSummaryResult.countries,
        },
      };
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
 * Structure: Country -> Products with quantities and amounts -> VAT -> Gross total
 * Example lines:
 *   Germany
 *   AdBlue
 *   28.00L
 *   34.02
 *   DIESEL
 *   2,140.80L
 *   3,067.36
 *   MWST(19.00%)
 *   589.26
 *   3,690.64
 */
function parseFuelSummaryFormat(lines, fullText) {
  const transactions = [];
  const countries = new Set();
  let totalNetEUR = 0;
  let totalVatEUR = 0;
  let totalGrossEUR = 0;
  let reportDate = null;
  let companyCode = null;

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

  // State machine to parse the structure
  let currentCountry = null;
  let currentCountryCode = null;
  let currentProducts = []; // Array of {product, quantity, netAmount}
  let pendingProduct = null;
  let pendingQuantity = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and header/footer content
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

    // Check if this is a country name
    if (COUNTRY_NAMES[line]) {
      // If we have a previous country with products, finalize it
      if (currentCountry && currentProducts.length > 0) {
        // Products were collected but no VAT line found yet - wait for it
      }

      // Start new country
      currentCountry = line;
      currentCountryCode = COUNTRY_NAMES[line];
      countries.add(currentCountryCode);
      currentProducts = [];
      pendingProduct = null;
      pendingQuantity = null;
      continue;
    }

    // Check if this is a fuel product type
    const productMatch = Object.keys(FUEL_PRODUCTS).find(p =>
      line === p || line.startsWith(p + ' ') || line.toUpperCase() === p.toUpperCase()
    );
    if (productMatch && currentCountry) {
      // Save any pending product first
      if (pendingProduct && pendingQuantity !== null) {
        // We have product + quantity but no amount yet - next numeric line will be amount
      }
      pendingProduct = productMatch;
      pendingQuantity = null;
      continue;
    }

    // Check if this is a quantity line (ends with L for liters)
    const quantityMatch = line.match(/^([\d,.\s]+)L$/i);
    if (quantityMatch && currentCountry && pendingProduct) {
      pendingQuantity = parseNumber(quantityMatch[1]);
      continue;
    }

    // Check if this is a VAT line (MWST, VAT, TVA with percentage)
    const vatLineMatch = line.match(/^(MWST|VAT|TVA)\s*\((\d+[.,]?\d*)\s*%\)$/i);
    if (vatLineMatch && currentCountry && currentProducts.length > 0) {
      const vatRate = parseNumber(vatLineMatch[2]);
      // Next line should be VAT amount, then gross total
      const vatAmountLine = lines[i + 1]?.trim();
      const grossTotalLine = lines[i + 2]?.trim();

      const countryVatAmount = parseNumber(vatAmountLine);
      const countryGrossTotal = parseNumber(grossTotalLine);

      if (countryVatAmount !== null && countryGrossTotal !== null) {
        // Calculate total net for this country
        const countryNetTotal = currentProducts.reduce((sum, p) => sum + (p.netAmount || 0), 0);

        // Create transactions for each product in this country
        for (const prod of currentProducts) {
          // Proportionally allocate VAT based on net amount
          const proportion = countryNetTotal > 0 ? (prod.netAmount / countryNetTotal) : (1 / currentProducts.length);
          const productVat = Math.round(countryVatAmount * proportion * 100) / 100;
          const productGross = Math.round((prod.netAmount + productVat) * 100) / 100;

          transactions.push({
            vehicle_registration: 'SUMMARY', // Fuel summaries don't have individual vehicles
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

        // Reset for next country
        currentProducts = [];
        i += 2; // Skip VAT amount and gross total lines
      }
      continue;
    }

    // Check if this is a plain amount (after product + quantity)
    const amountValue = parseNumber(line);
    if (amountValue !== null && currentCountry && pendingProduct) {
      // This could be the net amount for the pending product
      currentProducts.push({
        product: pendingProduct,
        quantity: pendingQuantity,
        netAmount: amountValue,
      });
      pendingProduct = null;
      pendingQuantity = null;
      continue;
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

  // Calculate VAT rate from amounts
  const vatRate = vatAmount > 0 && netAmount > 0
    ? Math.round((vatAmount / netAmount) * 10000) / 100
    : 0;

  // Get country VAT info
  const countryCode = bnrService.getCountryCode(country) || country;
  const vatInfo = bnrService.getVatRate(country);

  return {
    vehicle_registration: vehicleRegistration,
    transaction_date: transactionDate.toISOString(),
    country: country,
    country_code: countryCode,
    product_type: product || null,
    product_category: getProductCategory(product, country),
    card_number: cardNumber || null,
    route_info: routeInfo || null,
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
      country_code: tx.country_code,
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
  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insertError } = await supabase
      .from('verag_transactions')
      .insert(chunk);

    if (insertError) {
      console.error('Error inserting VERAG transactions chunk:', insertError);
    }
  }

  // Update batch status
  await supabase
    .from('verag_import_batches')
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
  FUEL_PRODUCTS,
  COUNTRY_NAMES,
};
