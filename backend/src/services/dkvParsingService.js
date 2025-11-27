const xlsx = require('xlsx');
const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * DKV Excel Column Mappings
 * Based on Invoice-Transactions_Report format
 */
const DKV_COLUMNS = {
  TRANSACTION_TIME: 'Timp tranzacție',
  STATION_NAME: 'Denumire stație',
  STATION_CITY: 'Orașul stației',
  STATION_NUMBER: 'Număr stație',
  TRANSACTION_NUMBER: 'Numarul tranzactiei',
  COUNTRY: 'Țara de servicii',
  COST_GROUP: 'Grupă cost',
  PRODUCT_GROUP: 'Grupă produs',
  GOODS_TYPE: 'Tip mărfuri',
  GOODS_CODE: 'Cod mărfuri',
  PAYMENT_CURRENCY: 'Moneda de plată',
  UNIT: 'Unitate',
  QUANTITY: 'Cantitate',
  PRICE_PER_UNIT: 'Preț pe unitate',
  NET_BASE_VALUE: 'Valoare de bază Netă',
  NET_SERVICE_FEE: 'Taxă de serviciu netă',
  NET_PURCHASE_VALUE: 'Valoarea netă a achiziției',
  PAYMENT_VALUE: 'Valoarea în moneda de plată',
  VEHICLE_REGISTRATION: 'Număr de înmatriculare vehicul',
  CARD_NUMBER: 'Nr. card/cutie',
};

/**
 * Parse DKV Excel/CSV file buffer
 * @param {Buffer} fileBuffer - Excel or CSV file buffer
 * @param {string} mimeType - MIME type of the file (optional)
 * @returns {Object} Parsed data with transactions and metadata
 */
function parseDKVExcel(fileBuffer, mimeType) {
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

  // Map column indices
  const columnMap = {};
  headers.forEach((header, index) => {
    const trimmedHeader = String(header).trim();
    // Find matching DKV column
    for (const [key, label] of Object.entries(DKV_COLUMNS)) {
      if (trimmedHeader === label || trimmedHeader.includes(label)) {
        columnMap[key] = index;
        break;
      }
    }
  });

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
    const paymentValue = parseNumber(row[columnMap.PAYMENT_VALUE]);

    const transaction = {
      transaction_time: transactionTime.toISOString(),
      transaction_number: getString(row[columnMap.TRANSACTION_NUMBER]),
      station_name: getString(row[columnMap.STATION_NAME]),
      station_city: getString(row[columnMap.STATION_CITY]),
      station_number: getString(row[columnMap.STATION_NUMBER]),
      country: getString(row[columnMap.COUNTRY]),
      cost_group: getString(row[columnMap.COST_GROUP]),
      product_group: getString(row[columnMap.PRODUCT_GROUP]),
      goods_type: getString(row[columnMap.GOODS_TYPE]),
      goods_code: getString(row[columnMap.GOODS_CODE]),
      payment_currency: getString(row[columnMap.PAYMENT_CURRENCY]) || 'EUR',
      unit: getString(row[columnMap.UNIT]) || 'L',
      quantity: quantity,
      price_per_unit: pricePerUnit,
      currency: 'EUR', // DKV reports are typically in EUR
      net_base_value: netBaseValue,
      net_service_fee: netServiceFee || 0,
      net_purchase_value: netPurchaseValue,
      payment_value: paymentValue,
      vehicle_registration: normalizeRegistration(getString(row[columnMap.VEHICLE_REGISTRATION])),
      card_number: getString(row[columnMap.CARD_NUMBER]),
    };

    transactions.push(transaction);

    // Track totals and date range
    // Use payment_value (EUR) for totals, not net_purchase_value (local currency)
    if (paymentValue) {
      totalAmount += paymentValue;
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
  // Parse Excel/CSV file
  const parsed = parseDKVExcel(fileBuffer, mimeType);

  if (parsed.transactions.length === 0) {
    throw new Error('No transactions found in DKV file');
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
    .from('dkv_import_batches')
    .insert({
      company_id: companyId,
      uploaded_document_id: documentId,
      file_name: fileName,
      total_transactions: parsed.metadata.total_transactions,
      total_amount: parsed.metadata.total_amount,
      currency: parsed.metadata.currency,
      period_start: parsed.metadata.period_start,
      period_end: parsed.metadata.period_end,
      status: 'processing',
      imported_by: userId,
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

  for (const tx of parsed.transactions) {
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
      ...tx,
    });
  }

  // Batch insert transactions (in chunks to avoid limits)
  const CHUNK_SIZE = 100;
  for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
    const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insertError } = await supabase
      .from('dkv_transactions')
      .insert(chunk);

    if (insertError) {
      console.error('Error inserting transactions chunk:', insertError);
      // Continue with next chunk, don't fail entire import
    }
  }

  // Update batch with final counts
  const { error: updateError } = await supabase
    .from('dkv_import_batches')
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
    total_transactions: parsed.metadata.total_transactions,
    matched_transactions: matchedCount,
    unmatched_transactions: unmatchedCount,
    total_amount: parsed.metadata.total_amount,
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
    .from('dkv_transactions')
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
    .from('dkv_transactions')
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

  // Create expense transaction
  const expenseData = {
    company_id: companyId,
    type: 'expense',
    category: category,
    amount: tx.payment_value || tx.net_purchase_value, // payment_value is in EUR
    currency: tx.currency || 'EUR',
    date: tx.transaction_time ? tx.transaction_time.split('T')[0] : new Date().toISOString().split('T')[0],
    description: `DKV - ${tx.goods_type || 'Fuel'} - ${tx.station_name || ''} (${tx.country || ''}) - ${tx.quantity || ''}${tx.unit || 'L'}`,
    truck_id: tx.truck_id,
    trip_id: tripId,
    payment_method: 'dkv',
    external_ref: tx.card_number,
    created_by: userId,
  };

  const { data: expense, error: expenseError } = await supabase
    .from('transactions')
    .insert(expenseData)
    .select()
    .single();

  if (expenseError) throw expenseError;

  // Update DKV transaction status
  await supabase
    .from('dkv_transactions')
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
    .from('dkv_import_batches')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId);

  // Filter by provider based on file name patterns
  if (provider) {
    if (provider === 'eurowag') {
      query = query.or('file_name.ilike.%ew_export%,file_name.ilike.%eurowag%');
    } else if (provider === 'verag') {
      query = query.or('file_name.ilike.%maut%,file_name.ilike.%verag%,file_name.ilike.%.pdf');
    } else if (provider === 'dkv') {
      query = query.or('file_name.ilike.%invoice-transactions%,file_name.ilike.%dkv%')
        .not('file_name', 'ilike', '%eurowag%')
        .not('file_name', 'ilike', '%maut%')
        .not('file_name', 'ilike', '%verag%');
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
 */
async function getDKVTransactions(companyId, filters = {}) {
  const { batch_id, truck_id, status, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('dkv_transactions')
    .select(`
      *,
      truck:truck_heads(id, registration_number, brand),
      batch:dkv_import_batches(id, file_name, import_date)
    `, { count: 'exact' })
    .eq('company_id', companyId)
    .order('transaction_time', { ascending: false });

  if (batch_id) {
    query = query.eq('batch_id', batch_id);
  }

  if (truck_id) {
    query = query.eq('truck_id', truck_id);
  }

  if (status) {
    query = query.eq('status', status);
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
      .from('dkv_transactions')
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
