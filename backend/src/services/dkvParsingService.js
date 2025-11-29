const xlsx = require('xlsx');
const { supabaseAdmin: supabase } = require('../config/supabase');
const bnrService = require('./bnrExchangeService');

/**
 * DKV Excel Column Mappings
 * Based on Invoice-Transactions_Report format
 * Supports multiple variants (Romanian, German, English)
 */
const DKV_COLUMNS = {
  TRANSACTION_TIME: ['Timp tranzacție', 'Timp tranzactie', 'Transaction Time', 'Transaktionszeit', 'Datum', 'Date', 'Data', 'Data tranzacție', 'Data tranzactie'],
  STATION_NAME: ['Denumire stație', 'Denumire statie', 'Station Name', 'Tankstellenname', 'Station', 'Stație', 'Statie'],
  STATION_CITY: ['Orașul stației', 'Orasul statiei', 'Station City', 'Ort', 'City', 'Oraș', 'Oras', 'Localitate'],
  STATION_NUMBER: ['Număr stație', 'Numar statie', 'Station Number', 'Stationsnummer'],
  TRANSACTION_NUMBER: ['Numarul tranzactiei', 'Numărul tranzacției', 'Transaction Number', 'Transaktionsnummer', 'Belegnummer', 'Nr. tranzacție', 'Nr. tranzactie'],
  COUNTRY: ['Țara de servicii', 'Tara de servicii', 'Service Country', 'Land', 'Country', 'Țară', 'Tara'],
  COST_GROUP: ['Grupă cost', 'Grupa cost', 'Cost Group', 'Kostengruppe'],
  PRODUCT_GROUP: ['Grupă produs', 'Grupa produs', 'Product Group', 'Produktgruppe'],
  GOODS_TYPE: ['Tip mărfuri', 'Tip marfuri', 'Goods Type', 'Warenart', 'Product', 'Produs', 'Articol', 'Tip produs'],
  GOODS_CODE: ['Cod mărfuri', 'Cod marfuri', 'Goods Code', 'Warencode'],
  PAYMENT_CURRENCY: ['Moneda de plată', 'Moneda de plata', 'Payment Currency', 'Zahlungswährung', 'Währung', 'Currency', 'Valută', 'Valuta', 'Moneda'],
  UNIT: ['Unitate', 'Unit', 'Einheit', 'ME', 'UM'],
  QUANTITY: ['Cantitate', 'Quantity', 'Menge', 'Qty', 'Volum', 'Volume'],
  PRICE_PER_UNIT: ['Preț pe unitate', 'Pret pe unitate', 'Price Per Unit', 'Einzelpreis', 'Unit Price', 'Preț unitar', 'Pret unitar'],
  NET_BASE_VALUE: ['Valoare de bază Netă', 'Valoare de baza Neta', 'Net Base Value', 'Nettobasiswert'],
  NET_SERVICE_FEE: ['Taxă de serviciu netă', 'Taxa de serviciu neta', 'Net Service Fee', 'Netto Servicegebühr'],
  NET_PURCHASE_VALUE: ['Valoarea netă a achiziției', 'Valoarea neta a achizitiei', 'Net Purchase Value', 'Nettoeinkaufswert', 'Netto', 'Net', 'Net Amount', 'Sumă netă', 'Suma neta', 'Valoare netă', 'Valoare neta', 'Amount Net'],
  GROSS_VALUE: ['Valoare brută', 'Valoare bruta', 'Gross Value', 'Bruttowert', 'Brutto', 'Gross', 'Gross Amount', 'Total', 'Sumă brută', 'Suma bruta', 'Valoarea brută', 'Valoarea bruta', 'Amount Gross', 'Suma totală', 'Suma totala'],
  VAT_AMOUNT: ['TVA', 'VAT', 'MwSt', 'MWST', 'VAT Amount', 'Steuer', 'Taxă', 'Taxa', 'Impozit'],
  PAYMENT_VALUE: ['Valoarea în moneda de plată', 'Valoarea in moneda de plata', 'Payment Value', 'Zahlungsbetrag', 'Amount', 'Suma de plată', 'Suma de plata'],
  VEHICLE_REGISTRATION: ['Număr de înmatriculare vehicul', 'Numar de inmatriculare vehicul', 'Vehicle Registration', 'Fahrzeugkennzeichen', 'Kennzeichen', 'Registration', 'Nr. înmatriculare', 'Nr. inmatriculare', 'Înmatriculare', 'Inmatriculare', 'Vehicul', 'Vehicle'],
  CARD_NUMBER: ['Nr. card/cutie', 'Card Number', 'Kartennummer', 'Card', 'Nr. card', 'Cartelă', 'Cartela'],
};

/**
 * Parse DKV Excel/CSV file buffer
 * @param {Buffer} fileBuffer - Excel or CSV file buffer
 * @param {string} mimeType - MIME type of the file (optional)
 * @returns {Object} Parsed data with transactions and metadata
 */
async function parseDKVExcel(fileBuffer, mimeType) {
  let workbook;

  // Check if this is a CSV file (might use semicolons as delimiter)
  const isCSV = mimeType === 'text/csv' ||
                (typeof fileBuffer === 'object' && fileBuffer.toString('utf-8', 0, 100).includes(';'));

  if (isCSV) {
    // For CSV files, first check the delimiter
    const csvText = fileBuffer.toString('utf-8');
    const firstLine = csvText.split('\n')[0];

    // Determine delimiter (semicolon or comma)
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    console.log(`Detected CSV delimiter: "${delimiter}" (semicolons: ${semicolonCount}, commas: ${commaCount})`);

    // Parse CSV with detected delimiter
    workbook = xlsx.read(csvText, {
      type: 'string',
      FS: delimiter,
      cellDates: true,
      raw: false  // Parse numbers and dates
    });
  } else {
    // For Excel files
    workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
  }

  // Get first sheet (transactions are typically on first sheet)
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (rawData.length < 2) {
    throw new Error('DKV Excel file is empty or has no data rows');
  }

  // First row is headers
  const headers = rawData[0];

  // Map column indices - supports multiple variants per column with diacritics normalization
  const columnMap = {};
  headers.forEach((header, index) => {
    if (!header) return;
    const trimmedHeader = String(header).trim().toLowerCase();
    // Normalize header by removing diacritics (ă->a, â->a, î->i, ș->s, ț->t, etc.)
    const normalizedHeader = trimmedHeader
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Find matching DKV column
    for (const [key, variants] of Object.entries(DKV_COLUMNS)) {
      // Skip if this column type is already mapped
      if (columnMap[key] !== undefined) continue;

      // Check if any variant matches
      let matched = false;
      for (const variant of variants) {
        const variantLower = variant.toLowerCase();
        const normalizedVariant = variantLower
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (trimmedHeader === variantLower ||
            normalizedHeader === normalizedVariant ||
            trimmedHeader.includes(variantLower) ||
            normalizedHeader.includes(normalizedVariant)) {
          columnMap[key] = index;
          console.log(`DKV: Mapped column "${header}" -> ${key} (index ${index})`);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
  });

  // Log found columns for debugging
  console.log('DKV Column mapping:', Object.keys(columnMap).join(', '));
  console.log('Headers found:', headers.slice(0, 25).join(' | '));

  // Validate required columns exist
  const requiredColumns = ['TRANSACTION_TIME', 'VEHICLE_REGISTRATION', 'QUANTITY', 'NET_PURCHASE_VALUE'];
  const missingColumns = requiredColumns.filter(col => columnMap[col] === undefined);
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Parse transaction rows
  const transactions = [];
  let totalAmount = 0;
  let minDate = null;
  let maxDate = null;

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];

    // Skip empty rows
    if (!row || row.length === 0) continue;

    // Parse transaction time
    let transactionTime = null;
    const timeValue = row[columnMap.TRANSACTION_TIME];
    if (timeValue) {
      if (timeValue instanceof Date) {
        transactionTime = timeValue;
      } else {
        // Try to parse string date formats
        transactionTime = parseDate(timeValue);
      }
    }

    if (!transactionTime) {
      console.warn(`Row ${i + 1}: Could not parse transaction time, skipping`);
      continue;
    }

    // Parse numeric values
    const quantity = parseNumber(row[columnMap.QUANTITY]);
    const pricePerUnit = parseNumber(row[columnMap.PRICE_PER_UNIT]);
    const netBaseValue = parseNumber(row[columnMap.NET_BASE_VALUE]);
    const netServiceFee = parseNumber(row[columnMap.NET_SERVICE_FEE]);
    const netPurchaseValue = parseNumber(row[columnMap.NET_PURCHASE_VALUE]);
    const grossValue = parseNumber(row[columnMap.GROSS_VALUE]);
    const vatAmountFromFile = parseNumber(row[columnMap.VAT_AMOUNT]);
    const paymentValue = parseNumber(row[columnMap.PAYMENT_VALUE]);

    // Get country info for VAT and currency
    const countryRaw = getString(row[columnMap.COUNTRY]);
    const countryCode = bnrService.getCountryCode(countryRaw);
    const vatInfo = bnrService.getVatRate(countryRaw);

    // Get the actual currency from payment column (for reference)
    const paymentCurrencyFromFile = (getString(row[columnMap.PAYMENT_CURRENCY]) || 'EUR').toUpperCase().trim();

    // IMPORTANT: The "Valoarea netă a achiziției" (net purchase value) is in the COUNTRY's currency,
    // not the payment currency. For example, in Romania it's RON, in Hungary it's HUF, etc.
    // The "Moneda de plată" column shows the billing currency (often EUR), not the transaction currency.
    const countryCurrency = bnrService.getCountryCurrency(countryRaw);

    // Use country currency for conversion of net purchase value, gross value, etc.
    const transactionCurrency = countryCurrency;

    // Calculate VAT amount with multiple fallback strategies
    let calculatedVatAmount = 0;
    let vatRate = 0;
    let effectiveGrossValue = grossValue;

    // Strategy 1: Calculate from Brutto - Netto (most reliable)
    if (grossValue && netPurchaseValue && grossValue > netPurchaseValue) {
      calculatedVatAmount = Math.round((grossValue - netPurchaseValue) * 100) / 100;
      vatRate = netPurchaseValue > 0
        ? Math.round((calculatedVatAmount / netPurchaseValue) * 10000) / 100
        : 0;
      console.log(`DKV Row: VAT calculated from Gross-Net: ${calculatedVatAmount} (rate: ${vatRate}%)`);
    }
    // Strategy 2: Use VAT from file directly
    else if (vatAmountFromFile && vatAmountFromFile > 0) {
      calculatedVatAmount = vatAmountFromFile;
      vatRate = netPurchaseValue > 0
        ? Math.round((calculatedVatAmount / netPurchaseValue) * 10000) / 100
        : 0;
      // Also calculate gross if missing: Gross = Net + VAT
      if (!effectiveGrossValue && netPurchaseValue) {
        effectiveGrossValue = netPurchaseValue + calculatedVatAmount;
      }
      console.log(`DKV Row: VAT from file: ${calculatedVatAmount} (rate: ${vatRate}%)`);
    }
    // Strategy 3: Calculate VAT using country's standard rate if we have Net but no Gross/VAT
    else if (netPurchaseValue && vatInfo.rate > 0 && !grossValue && !vatAmountFromFile) {
      calculatedVatAmount = Math.round((netPurchaseValue * vatInfo.rate / 100) * 100) / 100;
      vatRate = vatInfo.rate;
      effectiveGrossValue = netPurchaseValue + calculatedVatAmount;
      console.log(`DKV Row: VAT calculated using country rate (${vatInfo.rate}%): ${calculatedVatAmount}`);
    }
    // Strategy 4: Check if values might be swapped (gross < net indicates data issue)
    else if (grossValue && netPurchaseValue && grossValue < netPurchaseValue) {
      // Swap might be needed - use the larger value as gross
      effectiveGrossValue = netPurchaseValue;
      calculatedVatAmount = Math.round((netPurchaseValue - grossValue) * 100) / 100;
      vatRate = grossValue > 0
        ? Math.round((calculatedVatAmount / grossValue) * 10000) / 100
        : 0;
      console.log(`DKV Row: Values possibly swapped, recalculated VAT: ${calculatedVatAmount}`);
    }

    // Use effective gross value for subsequent calculations
    const finalGrossValue = effectiveGrossValue || grossValue;

    // Convert to EUR if needed
    let netPurchaseValueEur = netPurchaseValue;
    let grossValueEur = finalGrossValue;
    let vatAmountEur = calculatedVatAmount;
    let paymentValueEur = paymentValue;
    let exchangeRate = 1;
    let rateDate = null;

    // Convert ALL non-EUR currencies (RON, HUF, PLN, CZK, BGN, etc.)
    // Use the COUNTRY's currency (transactionCurrency) for net purchase value, gross value, VAT
    // because these values are in the local currency of the country where the transaction occurred
    if (transactionCurrency && transactionCurrency !== 'EUR') {
      // Convert to EUR using BNR rates based on transaction date
      const conversionResult = await bnrService.convertToEur(netPurchaseValue, transactionCurrency, transactionTime);
      netPurchaseValueEur = conversionResult.amountEur;
      exchangeRate = conversionResult.rate;
      rateDate = conversionResult.rateDate;

      // Convert other amounts with the same rate (they're all in the same country currency)
      if (finalGrossValue) {
        const grossConv = await bnrService.convertToEur(finalGrossValue, transactionCurrency, transactionTime);
        grossValueEur = grossConv.amountEur;
      }
      if (calculatedVatAmount) {
        const vatConv = await bnrService.convertToEur(calculatedVatAmount, transactionCurrency, transactionTime);
        vatAmountEur = vatConv.amountEur;
      }
    }

    // Payment value is in the payment currency (from "Moneda de plată" column)
    // This might be different from the transaction currency
    if (paymentValue && paymentCurrencyFromFile && paymentCurrencyFromFile !== 'EUR') {
      const payConv = await bnrService.convertToEur(paymentValue, paymentCurrencyFromFile, transactionTime);
      paymentValueEur = payConv.amountEur;
    }

    const transaction = {
      transaction_time: transactionTime.toISOString(),
      transaction_number: getString(row[columnMap.TRANSACTION_NUMBER]),
      station_name: getString(row[columnMap.STATION_NAME]),
      station_city: getString(row[columnMap.STATION_CITY]),
      station_number: getString(row[columnMap.STATION_NUMBER]),
      country: countryRaw,
      country_code: countryCode,
      cost_group: getString(row[columnMap.COST_GROUP]),
      product_group: getString(row[columnMap.PRODUCT_GROUP]),
      goods_type: getString(row[columnMap.GOODS_TYPE]),
      goods_code: getString(row[columnMap.GOODS_CODE]),
      payment_currency: paymentCurrencyFromFile, // Currency from "Moneda de plată" column
      unit: getString(row[columnMap.UNIT]) || 'L',
      quantity: quantity,
      price_per_unit: pricePerUnit,
      currency: 'EUR', // Amounts converted to EUR
      original_currency: transactionCurrency, // Country's currency (RON for Romania, HUF for Hungary, etc.)
      exchange_rate: exchangeRate,
      exchange_rate_date: rateDate,
      net_base_value: netBaseValue,
      net_service_fee: netServiceFee || 0,
      net_purchase_value: netPurchaseValue, // Original amount
      net_purchase_value_eur: netPurchaseValueEur, // Converted to EUR
      gross_value: finalGrossValue, // Effective gross value (original or calculated)
      gross_value_eur: grossValueEur, // Converted to EUR
      payment_value: paymentValue, // Original amount
      payment_value_eur: paymentValueEur, // Converted to EUR (use this for totals)
      vat_amount: calculatedVatAmount, // VAT in original currency
      vat_amount_eur: vatAmountEur, // VAT in EUR
      vat_amount_original: calculatedVatAmount, // VAT in original currency (backup)
      vat_rate: vatRate, // Calculated VAT percentage
      vat_country: countryCode,
      vat_country_rate: vatInfo.rate, // Standard VAT rate for country
      vat_refundable: vatInfo.refundable && calculatedVatAmount > 0,
      vehicle_registration: normalizeRegistration(getString(row[columnMap.VEHICLE_REGISTRATION])),
      card_number: getString(row[columnMap.CARD_NUMBER]),
    };

    transactions.push(transaction);

    // Track totals and date range - use EUR values
    if (paymentValueEur) {
      totalAmount += paymentValueEur;
    } else if (netPurchaseValueEur) {
      totalAmount += netPurchaseValueEur;
    }

    if (!minDate || transactionTime < minDate) {
      minDate = transactionTime;
    }
    if (!maxDate || transactionTime > maxDate) {
      maxDate = transactionTime;
    }
  }

  return {
    transactions,
    metadata: {
      total_transactions: transactions.length,
      total_amount: Math.round(totalAmount * 100) / 100,
      currency: 'EUR',
      period_start: minDate ? minDate.toISOString().split('T')[0] : null,
      period_end: maxDate ? maxDate.toISOString().split('T')[0] : null,
      vehicles: [...new Set(transactions.map(t => t.vehicle_registration).filter(Boolean))],
    },
  };
}

/**
 * Parse date from various formats
 */
function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  const str = String(value).trim();

  // Try ISO format first
  let date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try DD.MM.YYYY - HH:MM format (DKV CSV with dash separator)
  const euDashMatch = str.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (euDashMatch) {
    const [, day, month, year, hour, minute] = euDashMatch;
    return new Date(year, month - 1, day, hour, minute);
  }

  // Try DD.MM.YYYY HH:MM format (standard EU with space)
  const euMatch = str.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
  if (euMatch) {
    const [, day, month, year, hour, minute] = euMatch;
    return new Date(year, month - 1, day, hour, minute);
  }

  // Try YYYY-MM-DD HH:MM:SS format
  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):?(\d{2})?/);
  if (isoMatch) {
    const [, year, month, day, hour, minute, second] = isoMatch;
    return new Date(year, month - 1, day, hour, minute, second || 0);
  }

  return null;
}

/**
 * Parse number from various formats
 * Handles European format: 5.972,33 or 5.972.33 (thousands sep = period, decimal = comma or last period)
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number') {
    return value;
  }

  let str = String(value)
    .replace(/\s/g, '') // Remove spaces
    .replace(/[A-Za-z]/g, ''); // Remove currency codes like PLN, EUR, CZK

  // Handle European number formats
  // Examples: "5.972,33" or "5.972.33" or "357,59" or "357.59"

  // Count periods and commas
  const periods = (str.match(/\./g) || []).length;
  const commas = (str.match(/,/g) || []).length;

  if (periods > 1) {
    // Multiple periods like "5.972.33" - last one is decimal separator
    const parts = str.split('.');
    const decimal = parts.pop();
    str = parts.join('') + '.' + decimal;
  } else if (periods === 1 && commas === 1) {
    // Both present like "5.972,33" - comma is decimal
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (commas === 1 && periods === 0) {
    // Single comma, no period - comma is decimal like "357,59"
    str = str.replace(',', '.');
  }
  // else: single period is already decimal separator

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Get string value safely
 */
function getString(value) {
  if (value === null || value === undefined) return null;
  return String(value).trim() || null;
}

/**
 * Normalize vehicle registration for matching
 * Returns the original with normalized spaces
 */
function normalizeRegistration(registration) {
  if (!registration) return null;
  return registration.replace(/\s+/g, ' ').trim().toUpperCase();
}

/**
 * Create a standardized key for truck matching
 * Removes all spaces, hyphens, and converts to uppercase
 */
function createMatchKey(registration) {
  if (!registration) return '';
  return registration
    .replace(/[\s\-_.]/g, '') // Remove spaces, hyphens, underscores, dots
    .toUpperCase();
}

/**
 * Import DKV transactions into database
 * @param {Buffer} fileBuffer - Excel file buffer
 * @param {string} companyId - Company UUID
 * @param {string} userId - User UUID who uploaded
 * @param {string} documentId - Optional uploaded_documents ID
 * @param {string} fileName - Original file name
 * @returns {Object} Import result
 */
async function importDKVTransactions(fileBuffer, companyId, userId, documentId, fileName, mimeType) {
  // Parse Excel/CSV file (async for BNR currency conversion)
  const parsed = await parseDKVExcel(fileBuffer, mimeType);

  if (parsed.transactions.length === 0) {
    throw new Error('No transactions found in DKV file');
  }

  // Check for existing transactions to prevent duplicates
  const { data: existingTx, error: existingError } = await supabase
    .from('dkv_temp_transactions')
    .select('transaction_time, vehicle_registration, net_purchase_value')
    .eq('company_id', companyId)
    .gte('transaction_time', parsed.metadata.period_start)
    .lte('transaction_time', parsed.metadata.period_end + 'T23:59:59');

  if (existingError) {
    console.warn('Could not check for existing transactions:', existingError.message);
  }

  // Create a Set of existing transaction keys for fast lookup
  const existingKeys = new Set();
  if (existingTx) {
    existingTx.forEach(tx => {
      const key = `${tx.transaction_time}|${tx.vehicle_registration}|${tx.net_purchase_value}`;
      existingKeys.add(key);
    });
  }

  // Filter out duplicates
  const newTransactions = parsed.transactions.filter(tx => {
    const key = `${tx.transaction_time}|${tx.vehicle_registration}|${tx.net_purchase_value}`;
    return !existingKeys.has(key);
  });

  const duplicatesSkipped = parsed.transactions.length - newTransactions.length;
  if (duplicatesSkipped > 0) {
    console.log(`DKV: Skipping ${duplicatesSkipped} duplicate transactions`);
  }

  if (newTransactions.length === 0) {
    throw new Error(`All ${parsed.transactions.length} transactions already exist in database. No new data to import.`);
  }

  // Get company trucks for matching
  const { data: trucks, error: trucksError } = await supabase
    .from('truck_heads')
    .select('id, registration_number')
    .eq('company_id', companyId);

  if (trucksError) {
    throw new Error('Failed to fetch company trucks: ' + trucksError.message);
  }

  // Create normalized truck lookup map with multiple key variations
  const truckMap = new Map();
  if (trucks) {
    trucks.forEach(truck => {
      const reg = truck.registration_number;
      // Add multiple variations for matching
      truckMap.set(createMatchKey(reg), truck.id);                    // MS35TFL
      truckMap.set(reg.toUpperCase(), truck.id);                      // MS 35 TFL
      truckMap.set(reg.replace(/\s+/g, '').toUpperCase(), truck.id);  // MS35TFL
      // Handle UNIVERSAL type names
      if (reg.toUpperCase().includes('UNIVERSAL')) {
        truckMap.set('UNIVERSAL2', truck.id);
        truckMap.set('UNIVERSAL 2', truck.id);
      }
    });
  }

  console.log('Truck map keys:', [...truckMap.keys()]);

  // Create import batch
  const { data: batch, error: batchError } = await supabase
    .from('dkv_temp_import_batches')
    .insert({
      company_id: companyId,
      uploaded_document_id: documentId,
      file_name: fileName,
      total_transactions: newTransactions.length,
      total_amount: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.payment_value_eur || tx.gross_value_eur || 0), 0) * 100) / 100,
      currency: parsed.metadata.currency,
      period_start: parsed.metadata.period_start,
      period_end: parsed.metadata.period_end,
      status: 'processing',
      imported_by: userId,
      provider: 'dkv',
      notes: duplicatesSkipped > 0 ? `Skipped ${duplicatesSkipped} duplicates` : null,
    })
    .select()
    .single();

  if (batchError) {
    throw new Error('Failed to create import batch: ' + batchError.message);
  }

  // Process and insert transactions
  let matchedCount = 0;
  let unmatchedCount = 0;
  const transactionsToInsert = [];

  for (const tx of newTransactions) {
    // Try to match truck
    let truckId = null;
    let status = 'pending';

    if (tx.vehicle_registration) {
      const matchKey = createMatchKey(tx.vehicle_registration);
      const regUpper = tx.vehicle_registration.toUpperCase();

      // Try multiple matching strategies
      if (truckMap.has(matchKey)) {
        // Match by normalized key (no spaces/hyphens)
        truckId = truckMap.get(matchKey);
      } else if (truckMap.has(regUpper)) {
        // Match by uppercase with spaces
        truckId = truckMap.get(regUpper);
      } else {
        // Fuzzy match - check if registration contains any known truck key
        for (const [key, id] of truckMap.entries()) {
          const keyNorm = createMatchKey(key);
          if (matchKey.includes(keyNorm) || keyNorm.includes(matchKey)) {
            truckId = id;
            console.log(`Fuzzy matched: "${tx.vehicle_registration}" -> "${key}"`);
            break;
          }
        }
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

    transactionsToInsert.push({
      company_id: companyId,
      batch_id: batch.id,
      uploaded_document_id: documentId,
      truck_id: truckId,
      status: status,
      provider: 'dkv',
      ...tx,
    });
  }

  // Batch insert transactions (in chunks to avoid limits)
  const CHUNK_SIZE = 100;
  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insertError } = await supabase
      .from('dkv_temp_transactions')
      .insert(chunk);

    if (insertError) {
      console.error('Error inserting transactions chunk:', insertError);
      // Continue with next chunk, don't fail entire import
    }
  }

  // Update batch with final counts
  const { error: updateError } = await supabase
    .from('dkv_temp_import_batches')
    .update({
      matched_transactions: matchedCount,
      unmatched_transactions: unmatchedCount,
      status: unmatchedCount > 0 ? 'partial' : 'completed',
    })
    .eq('id', batch.id);

  if (updateError) {
    console.warn('Failed to update batch status:', updateError);
  }

  return {
    success: true,
    batch_id: batch.id,
    total_transactions: newTransactions.length,
    matched_transactions: matchedCount,
    unmatched_transactions: unmatchedCount,
    duplicates_skipped: duplicatesSkipped,
    total_amount: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.payment_value_eur || tx.gross_value_eur || 0), 0) * 100) / 100,
    currency: parsed.metadata.currency,
    period_start: parsed.metadata.period_start,
    period_end: parsed.metadata.period_end,
    vehicles: parsed.metadata.vehicles,
  };
}

/**
 * Match a single DKV transaction to a truck
 */
async function matchDKVTransaction(transactionId, truckId) {
  const { data, error } = await supabase
    .from('dkv_temp_transactions')
    .update({
      truck_id: truckId,
      status: 'matched',
      matched_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create expense from DKV transaction
 */
async function createExpenseFromDKV(transactionId, companyId, userId, tripId = null) {
  // Get transaction details
  const { data: tx, error: txError } = await supabase
    .from('dkv_temp_transactions')
    .select('*, truck:truck_heads(id, registration_number)')
    .eq('id', transactionId)
    .single();

  if (txError || !tx) {
    throw new Error('DKV transaction not found');
  }

  if (tx.status === 'created_expense') {
    throw new Error('Expense already created for this transaction');
  }

  // Determine category based on goods type
  let category = 'combustibil'; // Default
  const goodsType = (tx.goods_type || '').toLowerCase();
  if (goodsType.includes('adblue')) {
    category = 'combustibil'; // AdBlue is also fuel category
  } else if (goodsType.includes('toll') || goodsType.includes('taxa') || goodsType.includes('maut')) {
    category = 'taxa_drum';
  }

  // Create expense transaction - use EUR converted values
  const amountEur = tx.payment_value_eur || tx.gross_value_eur || tx.net_purchase_value_eur || tx.payment_value || tx.net_purchase_value;

  const expenseData = {
    company_id: companyId,
    type: 'expense',
    category: category,
    amount: amountEur,
    currency: 'EUR', // Always store in EUR
    date: tx.transaction_time ? tx.transaction_time.split('T')[0] : new Date().toISOString().split('T')[0],
    description: `${tx.provider?.toUpperCase() || 'DKV'} - ${tx.goods_type || 'Fuel'} - ${tx.station_name || ''} (${tx.country || ''}) - ${tx.quantity || ''}${tx.unit || 'L'}${tx.original_currency && tx.original_currency !== 'EUR' ? ` (${tx.original_currency} @${tx.exchange_rate?.toFixed(4)})` : ''}`,
    truck_id: tx.truck_id,
    trip_id: tripId,
    payment_method: tx.provider || 'dkv',
    external_ref: tx.card_number,
    created_by: userId,
    vat_amount: tx.vat_amount || 0,
  };

  const { data: expense, error: expenseError } = await supabase
    .from('transactions')
    .insert(expenseData)
    .select()
    .single();

  if (expenseError) throw expenseError;

  // Update DKV transaction status
  await supabase
    .from('dkv_temp_transactions')
    .update({
      status: 'created_expense',
      transaction_id: expense.id,
    })
    .eq('id', transactionId);

  return expense;
}

/**
 * Get DKV import batches for a company
 * @param {string} companyId - Company UUID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} provider - Optional provider filter (dkv, eurowag, verag)
 */
async function getDKVBatches(companyId, page = 1, limit = 20, provider = null) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('dkv_temp_import_batches')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId);

  // Filter by provider - use provider column if set, otherwise fall back to file name patterns
  if (provider) {
    if (provider === 'eurowag') {
      query = query.or('provider.eq.eurowag,file_name.ilike.%ew_export%,file_name.ilike.%eurowag%')
        .not('provider', 'eq', 'verag')
        .not('provider', 'eq', 'dkv');
    } else if (provider === 'verag') {
      query = query.or('provider.eq.verag,file_name.ilike.%maut%')
        .not('provider', 'eq', 'eurowag')
        .not('provider', 'eq', 'dkv');
    } else if (provider === 'dkv') {
      query = query.or('provider.eq.dkv,provider.is.null')
        .not('provider', 'eq', 'eurowag')
        .not('provider', 'eq', 'verag')
        .not('file_name', 'ilike', '%eurowag%')
        .not('file_name', 'ilike', '%maut%')
        .not('file_name', 'ilike', '%ew_export%');
    }
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get DKV transactions for a batch or company
 * @param {string} companyId - Company UUID
 * @param {Object} filters - Filter options
 * @param {string} filters.batch_id - Filter by batch ID
 * @param {string} filters.truck_id - Filter by truck ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.provider - Filter by provider (dkv, eurowag, verag)
 * @param {boolean} filters.hide_processed - Hide ignored and created_expense items (default: true)
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 */
async function getDKVTransactions(companyId, filters = {}) {
  const { batch_id, truck_id, status, provider, hide_processed = true, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  // For provider filtering, we can filter transactions directly by provider column
  // Fall back to batch-based filtering for older data without provider column
  let providerBatchIds = null;
  let directProviderFilter = null;

  if (provider && !batch_id) {
    // First try to filter by provider column directly on transactions
    directProviderFilter = provider;

    // Also get batch IDs for older data that may not have provider on transactions
    let batchQuery = supabase
      .from('dkv_temp_import_batches')
      .select('id')
      .eq('company_id', companyId);

    if (provider === 'eurowag') {
      batchQuery = batchQuery.or('provider.eq.eurowag,file_name.ilike.%ew_export%,file_name.ilike.%eurowag%')
        .not('provider', 'eq', 'verag')
        .not('provider', 'eq', 'dkv');
    } else if (provider === 'verag') {
      batchQuery = batchQuery.or('provider.eq.verag,file_name.ilike.%maut%')
        .not('provider', 'eq', 'eurowag')
        .not('provider', 'eq', 'dkv');
    } else if (provider === 'dkv') {
      batchQuery = batchQuery.or('provider.eq.dkv,provider.is.null')
        .not('provider', 'eq', 'eurowag')
        .not('provider', 'eq', 'verag')
        .not('file_name', 'ilike', '%eurowag%')
        .not('file_name', 'ilike', '%maut%')
        .not('file_name', 'ilike', '%ew_export%');
    }

    const { data: batches } = await batchQuery;
    providerBatchIds = batches?.map((b) => b.id) || [];

    // If no batches match, return empty result
    if (providerBatchIds.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  let query = supabase
    .from('dkv_temp_transactions')
    .select(`
      *,
      truck:truck_heads(id, registration_number, brand),
      batch:dkv_temp_import_batches(id, file_name, import_date)
    `, { count: 'exact' })
    .eq('company_id', companyId)
    .order('transaction_time', { ascending: false });

  // Apply provider batch filter
  if (providerBatchIds && providerBatchIds.length > 0) {
    query = query.in('batch_id', providerBatchIds);
  }

  if (batch_id) {
    query = query.eq('batch_id', batch_id);
  }

  if (truck_id) {
    query = query.eq('truck_id', truck_id);
  }

  if (status) {
    query = query.eq('status', status);
  } else if (hide_processed) {
    // By default, hide processed items (ignored and created_expense)
    query = query.in('status', ['pending', 'matched', 'unmatched']);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Bulk ignore DKV transactions
 * @param {string[]} transactionIds - Array of transaction UUIDs
 * @param {string} companyId - Company UUID for validation
 * @param {string} notes - Optional notes for why transactions were ignored
 */
async function bulkIgnoreTransactions(transactionIds, companyId, notes = null) {
  const results = {
    success: [],
    failed: [],
  };

  // Process in chunks to avoid hitting limits
  const CHUNK_SIZE = 50;
  for (let i = 0; i < transactionIds.length; i += CHUNK_SIZE) {
    const chunk = transactionIds.slice(i, i + CHUNK_SIZE);

    const { data, error } = await supabase
      .from('dkv_temp_transactions')
      .update({
        status: 'ignored',
        notes: notes || 'Bulk ignored'
      })
      .eq('company_id', companyId)
      .in('id', chunk)
      .neq('status', 'created_expense') // Don't ignore already processed
      .select('id');

    if (error) {
      chunk.forEach(id => results.failed.push({ id, error: error.message }));
    } else {
      data.forEach(tx => results.success.push(tx.id));
      // Track which ones weren't updated (already processed)
      const updatedIds = new Set(data.map(tx => tx.id));
      chunk.forEach(id => {
        if (!updatedIds.has(id)) {
          results.failed.push({ id, error: 'Already processed or not found' });
        }
      });
    }
  }

  return {
    total: transactionIds.length,
    ignored: results.success.length,
    failed: results.failed.length,
    results,
  };
}

module.exports = {
  parseDKVExcel,
  importDKVTransactions,
  matchDKVTransaction,
  createExpenseFromDKV,
  getDKVBatches,
  getDKVTransactions,
  bulkIgnoreTransactions,
  DKV_COLUMNS,
};
