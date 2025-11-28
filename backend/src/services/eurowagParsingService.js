const xlsx = require('xlsx');
const { supabaseAdmin: supabase } = require('../config/supabase');
const bnrService = require('./bnrExchangeService');

/**
 * EUROWAG Excel Column Mappings
 * Supports multiple variants (Romanian, English, alternative spellings)
 * Each key maps to an array of possible column names
 */
const EUROWAG_COLUMNS = {
  SERVICE: ['Serviciu', 'Service', 'Tip serviciu', 'Service Type'],
  DATETIME: ['Data si ora', 'Data și ora', 'Date and time', 'DateTime', 'Date', 'Datum', 'Data'],
  REGISTRATION: ['Înmatriculare', 'Inmatriculare', 'Registration', 'Reg. Number', 'Vehicle', 'Nr. înmatriculare', 'Numar inmatriculare'],
  CARD: ['Cartelă', 'Cartela', 'Card', 'Card Number', 'Nr. Card'],
  PRODUCT: ['Articol', 'Product', 'Produs', 'Article', 'Item'],
  NET_AMOUNT: ['Sumă netă', 'Suma neta', 'Net Amount', 'Net', 'Valoare netă', 'Valoare neta', 'Net Value', 'Amount Net'],
  CURRENCY: ['Valută', 'Valuta', 'Currency', 'Moneda'],
  GROSS_AMOUNT: ['Valoarea brută', 'Valoarea bruta', 'Gross Amount', 'Gross', 'Valoare brută', 'Brutto', 'Amount Gross', 'Total'],
  QUANTITY: ['Cantitate', 'Quantity', 'Qty', 'Volum', 'Volume'],
  UNIT: ['Unităte de cantitate', 'Unitate de cantitate', 'Unit', 'Unitate', 'UOM'],
  COUNTRY: ['Țară', 'Tara', 'Country', 'Land'],
  LOCATION: ['Locație', 'Locatie', 'Location', 'Station', 'Stație', 'Statie'],
  OBU_ID: ['ID OBU', 'OBU ID', 'OBU', 'Toll Box'],
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
 * Parse number from various formats (European style)
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  let str = String(value).replace(/\s/g, '');

  const periods = (str.match(/\./g) || []).length;
  const commas = (str.match(/,/g) || []).length;

  if (periods > 1) {
    const parts = str.split('.');
    const decimal = parts.pop();
    str = parts.join('') + '.' + decimal;
  } else if (periods === 1 && commas === 1) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (commas === 1 && periods === 0) {
    str = str.replace(',', '.');
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parse date from various formats
 */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();

  // Try ISO format
  let date = new Date(str);
  if (!isNaN(date.getTime())) return date;

  // Try DD.MM.YYYY HH:MM format
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
 * Parse EUROWAG Excel file buffer
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Object} Parsed data with transactions and metadata
 */
async function parseEurowagExcel(fileBuffer) {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (rawData.length < 2) {
    throw new Error('EUROWAG Excel file is empty or has no data rows');
  }

  const headers = rawData[0];

  console.log('EUROWAG: Found headers:', headers);

  // Map column indices - now supports arrays of possible names
  const columnMap = {};
  headers.forEach((header, index) => {
    if (!header) return;
    const trimmedHeader = String(header).trim().toLowerCase();
    const normalizedHeader = trimmedHeader
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics for comparison

    for (const [key, labels] of Object.entries(EUROWAG_COLUMNS)) {
      // Skip if this column type is already mapped
      if (columnMap[key] !== undefined) continue;

      let matched = false;
      for (const label of labels) {
        const normalizedLabel = label.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (trimmedHeader === label.toLowerCase() ||
            normalizedHeader === normalizedLabel ||
            trimmedHeader.includes(label.toLowerCase()) ||
            normalizedHeader.includes(normalizedLabel)) {
          columnMap[key] = index;
          console.log(`EUROWAG: Mapped column "${header}" -> ${key} (index ${index})`);
          matched = true;
          break;
        }
      }
      // Found a match for this header, no need to check other column types
      if (matched) break;
    }
  });

  console.log('EUROWAG: Column mapping result:', columnMap);

  // Validate required columns
  const requiredColumns = ['DATETIME', 'REGISTRATION', 'NET_AMOUNT'];
  const missingColumns = requiredColumns.filter(col => columnMap[col] === undefined);
  if (missingColumns.length > 0) {
    console.error('EUROWAG: Missing columns. Headers found:', headers);
    console.error('EUROWAG: Column map:', columnMap);
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Found headers: ${headers.filter(h => h).join(', ')}`);
  }

  const transactions = [];
  let totalNetEUR = 0;
  let totalGrossEUR = 0;
  let totalVatEUR = 0;
  let minDate = null;
  let maxDate = null;

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    // Parse date
    let transactionTime = null;
    const timeValue = row[columnMap.DATETIME];
    if (timeValue) {
      transactionTime = timeValue instanceof Date ? timeValue : parseDate(timeValue);
    }

    if (!transactionTime) {
      console.warn(`EUROWAG Row ${i + 1}: Could not parse date, skipping`);
      continue;
    }

    const netAmount = parseNumber(row[columnMap.NET_AMOUNT]);
    const grossAmount = parseNumber(row[columnMap.GROSS_AMOUNT]);
    const quantity = parseNumber(row[columnMap.QUANTITY]);
    const currency = String(row[columnMap.CURRENCY] || 'EUR').trim().toUpperCase();

    // Calculate VAT (Brutto - Netto)
    const vatAmount = grossAmount && netAmount && grossAmount > netAmount
      ? Math.round((grossAmount - netAmount) * 100) / 100
      : 0;

    // Calculate VAT rate
    const vatRate = vatAmount > 0 && netAmount > 0
      ? Math.round((vatAmount / netAmount) * 10000) / 100
      : 0;

    // Convert to EUR if needed - ALL non-EUR currencies (RON, HUF, PLN, CZK, etc.)
    let netEUR = netAmount;
    let grossEUR = grossAmount;
    let vatEUR = vatAmount;
    let exchangeRate = 1;
    let rateDate = null;

    if (currency && currency !== 'EUR') {
      // Convert to EUR using BNR rates based on transaction date
      if (netAmount) {
        const netConv = await bnrService.convertToEur(netAmount, currency, transactionTime);
        netEUR = netConv.amountEur;
        exchangeRate = netConv.rate;
        rateDate = netConv.rateDate;
      }
      if (grossAmount) {
        const grossConv = await bnrService.convertToEur(grossAmount, currency, transactionTime);
        grossEUR = grossConv.amountEur;
      }
      if (vatAmount) {
        const vatConv = await bnrService.convertToEur(vatAmount, currency, transactionTime);
        vatEUR = vatConv.amountEur;
      }
    }

    // Get country info for VAT
    const country = String(row[columnMap.COUNTRY] || '').trim();
    const countryCode = bnrService.getCountryCode(country);
    const vatInfo = bnrService.getVatRate(country);

    const registration = String(row[columnMap.REGISTRATION] || '').trim().toUpperCase();
    const service = String(row[columnMap.SERVICE] || '').trim();
    const product = String(row[columnMap.PRODUCT] || '').trim();

    const transaction = {
      transaction_time: transactionTime.toISOString(),
      service_type: service, // FUEL, TOLL, etc.
      vehicle_registration: registration,
      card_number: String(row[columnMap.CARD] || '').trim(),
      product_type: product, // Motorină, AdBlue, etc.
      quantity: quantity,
      unit: String(row[columnMap.UNIT] || 'LTR').trim(),
      country: country,
      country_code: countryCode,
      location: String(row[columnMap.LOCATION] || '').trim(),
      obu_id: String(row[columnMap.OBU_ID] || '').trim(),
      // Amounts in original currency
      net_amount: netAmount,
      gross_amount: grossAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      original_currency: currency,
      exchange_rate: exchangeRate,
      exchange_rate_date: rateDate,
      // VAT info
      vat_country: countryCode,
      vat_country_rate: vatInfo.rate,
      vat_refundable: vatInfo.refundable && vatEUR > 0,
      // Amounts converted to EUR
      currency: 'EUR',
      net_amount_eur: Math.round((netEUR || 0) * 100) / 100,
      gross_amount_eur: Math.round((grossEUR || 0) * 100) / 100,
      vat_amount_eur: Math.round((vatEUR || 0) * 100) / 100,
      // Provider info
      provider: 'eurowag',
    };

    transactions.push(transaction);

    // Track totals in EUR
    if (netEUR) totalNetEUR += netEUR;
    if (grossEUR) totalGrossEUR += grossEUR;
    if (vatEUR) totalVatEUR += vatEUR;

    if (!minDate || transactionTime < minDate) minDate = transactionTime;
    if (!maxDate || transactionTime > maxDate) maxDate = transactionTime;
  }

  return {
    transactions,
    metadata: {
      provider: 'eurowag',
      total_transactions: transactions.length,
      total_net_eur: Math.round(totalNetEUR * 100) / 100,
      total_gross_eur: Math.round(totalGrossEUR * 100) / 100,
      total_vat_eur: Math.round(totalVatEUR * 100) / 100,
      currency: 'EUR',
      period_start: minDate ? minDate.toISOString().split('T')[0] : null,
      period_end: maxDate ? maxDate.toISOString().split('T')[0] : null,
      vehicles: [...new Set(transactions.map(t => t.vehicle_registration).filter(Boolean))],
      countries: [...new Set(transactions.map(t => t.country).filter(Boolean))],
    },
  };
}

/**
 * Import EUROWAG transactions into database
 */
async function importEurowagTransactions(fileBuffer, companyId, userId, documentId, fileName) {
  // Parse with async currency conversion
  const parsed = await parseEurowagExcel(fileBuffer);

  if (parsed.transactions.length === 0) {
    throw new Error('No transactions found in EUROWAG file');
  }

  // Check for existing transactions to prevent duplicates
  // Build a list of transaction keys to check
  const txKeys = parsed.transactions.map(tx => ({
    time: tx.transaction_time,
    reg: tx.vehicle_registration,
    net: tx.net_amount_eur,
  }));

  // Get existing transactions for this company within the date range
  const { data: existingTx, error: existingError } = await supabase
    .from('eurowag_transactions')
    .select('transaction_time, vehicle_registration, net_amount_eur')
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
      const key = `${tx.transaction_time}|${tx.vehicle_registration}|${tx.net_amount_eur}`;
      existingKeys.add(key);
    });
  }

  // Filter out duplicates
  const newTransactions = parsed.transactions.filter(tx => {
    const key = `${tx.transaction_time}|${tx.vehicle_registration}|${tx.net_amount_eur}`;
    return !existingKeys.has(key);
  });

  const duplicatesSkipped = parsed.transactions.length - newTransactions.length;
  if (duplicatesSkipped > 0) {
    console.log(`EUROWAG: Skipping ${duplicatesSkipped} duplicate transactions`);
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

  // Create truck lookup map
  const truckMap = new Map();
  if (trucks) {
    trucks.forEach(truck => {
      const reg = truck.registration_number;
      truckMap.set(createMatchKey(reg), truck.id);
      truckMap.set(reg.toUpperCase(), truck.id);
      truckMap.set(reg.replace(/\s+/g, '').toUpperCase(), truck.id);
      if (reg.toUpperCase().includes('UNIVERSAL')) {
        truckMap.set('UNIVERSAL2', truck.id);
        truckMap.set('UNIVERSAL 2', truck.id);
      }
    });
  }

  // Create import batch in eurowag_import_batches table
  const { data: batch, error: batchError } = await supabase
    .from('eurowag_import_batches')
    .insert({
      company_id: companyId,
      uploaded_document_id: documentId,
      file_name: fileName,
      total_transactions: newTransactions.length,
      total_net_eur: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.net_amount_eur || 0), 0) * 100) / 100,
      total_gross_eur: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.gross_amount_eur || 0), 0) * 100) / 100,
      total_vat_eur: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.vat_amount_eur || 0), 0) * 100) / 100,
      period_start: parsed.metadata.period_start,
      period_end: parsed.metadata.period_end,
      status: 'processing',
      imported_by: userId,
      notes: duplicatesSkipped > 0
        ? `Vehicles: ${parsed.metadata.vehicles.length} | Countries: ${parsed.metadata.countries.join(', ')} | Skipped ${duplicatesSkipped} duplicates`
        : `Vehicles: ${parsed.metadata.vehicles.length} | Countries: ${parsed.metadata.countries.join(', ')}`,
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

  for (const tx of newTransactions) {
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

    // Map EUROWAG fields to eurowag_transactions table
    transactionsToInsert.push({
      company_id: companyId,
      batch_id: batch.id,
      uploaded_document_id: documentId,
      truck_id: truckId,
      status: status,
      // Transaction info
      transaction_time: tx.transaction_time,
      service_type: tx.service_type, // FUEL, TOLL, etc.
      // Vehicle and card
      vehicle_registration: tx.vehicle_registration,
      card_number: tx.card_number,
      obu_id: tx.obu_id,
      // Product info
      product_type: tx.product_type,
      quantity: tx.quantity,
      unit: tx.unit,
      // Location
      country: tx.country,
      country_code: tx.country_code,
      location: tx.location,
      // Original currency amounts
      original_currency: tx.original_currency,
      net_amount: tx.net_amount,
      gross_amount: tx.gross_amount,
      vat_amount: tx.vat_amount,
      // EUR converted amounts
      exchange_rate: tx.exchange_rate,
      exchange_rate_date: tx.exchange_rate_date,
      net_amount_eur: tx.net_amount_eur,
      gross_amount_eur: tx.gross_amount_eur,
      vat_amount_eur: tx.vat_amount_eur,
      // VAT details
      vat_rate: tx.vat_rate,
      vat_country: tx.vat_country,
      vat_country_rate: tx.vat_country_rate,
      vat_refundable: tx.vat_refundable,
      // Notes
      notes: tx.original_currency !== 'EUR'
        ? `Original: ${tx.net_amount?.toFixed(2)} ${tx.original_currency} | VAT: ${tx.vat_amount?.toFixed(2)} ${tx.original_currency} | Rate: ${tx.exchange_rate?.toFixed(4)}`
        : `VAT: ${tx.vat_amount_eur?.toFixed(2)} EUR (${tx.vat_rate?.toFixed(0)}%)`,
    });
  }

  // Batch insert into eurowag_transactions
  const CHUNK_SIZE = 100;
  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insertError } = await supabase
      .from('eurowag_transactions')
      .insert(chunk);

    if (insertError) {
      console.error('Error inserting EUROWAG transactions chunk:', insertError);
    }
  }

  // Update batch status
  await supabase
    .from('eurowag_import_batches')
    .update({
      matched_transactions: matchedCount,
      unmatched_transactions: unmatchedCount,
      status: unmatchedCount > 0 ? 'partial' : 'completed',
    })
    .eq('id', batch.id);

  return {
    success: true,
    provider: 'eurowag',
    batch_id: batch.id,
    total_transactions: newTransactions.length,
    matched_transactions: matchedCount,
    unmatched_transactions: unmatchedCount,
    duplicates_skipped: duplicatesSkipped,
    total_net_eur: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.net_amount_eur || 0), 0) * 100) / 100,
    total_vat_eur: Math.round(newTransactions.reduce((sum, tx) => sum + (tx.vat_amount_eur || 0), 0) * 100) / 100,
    period_start: parsed.metadata.period_start,
    period_end: parsed.metadata.period_end,
    vehicles: parsed.metadata.vehicles,
    countries: parsed.metadata.countries,
  };
}

module.exports = {
  parseEurowagExcel,
  importEurowagTransactions,
  EUROWAG_COLUMNS,
};
