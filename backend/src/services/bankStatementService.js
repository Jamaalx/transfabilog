const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Process a bank statement document and extract individual transactions
 * into the bank_statement_payments table
 */
async function processBankStatement(documentId, companyId, userId) {
  try {
    // Get the document with extracted data
    const { data: doc, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .eq('document_type', 'extras_bancar')
      .single();

    if (docError || !doc) {
      throw new Error('Document not found or is not a bank statement');
    }

    const extractedData = doc.extracted_data?.structured;
    if (!extractedData || !extractedData.transactions || extractedData.transactions.length === 0) {
      throw new Error('No transactions found in bank statement');
    }

    // Get company data for matching
    const [{ data: clients }, { data: invoices }, { data: trucks }] = await Promise.all([
      supabase.from('clients').select('id, company_name, cui, iban').eq('company_id', companyId),
      supabase
        .from('uploaded_documents')
        .select('id, document_number, amount, currency, supplier_name, supplier_cui, document_type')
        .eq('company_id', companyId)
        .in('document_type', ['factura_intrare', 'factura_iesire'])
        .eq('is_paid', false),
      supabase.from('truck_heads').select('id, registration_number').eq('company_id', companyId),
    ]);

    const processedPayments = [];
    let matchedCount = 0;

    for (const tx of extractedData.transactions) {
      // Try to match invoice
      const matchedInvoice = await matchTransactionToInvoice(tx, invoices, clients);

      // Try to match truck (for expenses)
      const matchedTruck = await matchTransactionToTruck(tx, trucks);

      const payment = {
        company_id: companyId,
        bank_statement_id: documentId,
        transaction_type: tx.type, // credit or debit
        transaction_date: tx.date,
        amount: Math.abs(tx.amount),
        currency: extractedData.currency || 'RON',
        description: tx.description,
        reference: tx.reference,
        counterparty: tx.counterparty,
        counterparty_iban: tx.counterparty_iban,
        ai_suggested_category: tx.ai_category,
        expense_category: tx.ai_category,
        matched_invoice_id: matchedInvoice?.id || null,
        truck_id: matchedTruck?.id || null,
        status: matchedInvoice || matchedTruck ? 'matched' : 'pending',
        processed_by: userId,
        processed_at: new Date().toISOString(),
      };

      if (matchedInvoice || matchedTruck) {
        matchedCount++;
      }

      processedPayments.push(payment);
    }

    // Insert all payments
    const { data: insertedPayments, error: insertError } = await supabase
      .from('bank_statement_payments')
      .insert(processedPayments)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Update document status
    await supabase
      .from('uploaded_documents')
      .update({
        status: 'processed',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    // Auto-mark matched invoices as paid
    for (const payment of insertedPayments) {
      if (payment.matched_invoice_id && payment.transaction_type === 'credit') {
        await markInvoiceAsPaid(payment.matched_invoice_id, payment.id);
      }
    }

    return {
      success: true,
      documentId,
      totalTransactions: processedPayments.length,
      matchedTransactions: matchedCount,
      unmatchedTransactions: processedPayments.length - matchedCount,
      payments: insertedPayments,
    };
  } catch (error) {
    console.error('Error processing bank statement:', error);
    throw error;
  }
}

/**
 * Match a transaction to an invoice
 */
async function matchTransactionToInvoice(transaction, invoices, clients) {
  if (!invoices || invoices.length === 0) return null;

  const txDesc = (transaction.description || '').toLowerCase();
  const txCounterparty = (transaction.counterparty || '').toLowerCase();
  const txAmount = Math.abs(transaction.amount);

  // For credit transactions (incoming), match to factura_iesire
  // For debit transactions (outgoing), match to factura_intrare
  const relevantInvoices = invoices.filter((inv) => {
    if (transaction.type === 'credit') {
      return inv.document_type === 'factura_iesire';
    } else {
      return inv.document_type === 'factura_intrare';
    }
  });

  for (const invoice of relevantInvoices) {
    // Match by amount (with small tolerance for bank fees)
    const amountMatch = Math.abs(txAmount - invoice.amount) < 1;

    // Match by invoice number in description
    const invoiceNumberMatch =
      invoice.document_number && txDesc.includes(invoice.document_number.toLowerCase());

    // Match by supplier/client name
    const nameMatch =
      invoice.supplier_name && txCounterparty.includes(invoice.supplier_name.toLowerCase());

    // Match by CUI
    const cuiMatch = invoice.supplier_cui && txDesc.includes(invoice.supplier_cui);

    if ((amountMatch && (invoiceNumberMatch || nameMatch || cuiMatch)) || invoiceNumberMatch) {
      return invoice;
    }
  }

  return null;
}

/**
 * Match transaction to a truck (for fuel, toll, parking expenses)
 */
async function matchTransactionToTruck(transaction, trucks) {
  if (!trucks || trucks.length === 0) return null;

  const txDesc = (transaction.description || '').toUpperCase();

  // Only match for expense categories related to trucks
  const truckCategories = ['combustibil', 'taxa_drum', 'parcare', 'reparatii'];
  if (!truckCategories.includes(transaction.ai_category)) {
    return null;
  }

  // Look for truck registration in description
  for (const truck of trucks) {
    const regNormalized = truck.registration_number.replace(/\s/g, '').toUpperCase();
    const regWithSpaces = truck.registration_number.toUpperCase();

    if (txDesc.includes(regNormalized) || txDesc.includes(regWithSpaces)) {
      return truck;
    }
  }

  return null;
}

/**
 * Mark an invoice as paid
 */
async function markInvoiceAsPaid(invoiceId, paymentId) {
  const { error } = await supabase
    .from('uploaded_documents')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
      paid_from_document_id: paymentId,
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error marking invoice as paid:', error);
  }
}

/**
 * Get bank statement payments for review
 */
async function getBankStatementPayments(companyId, filters = {}) {
  let query = supabase
    .from('bank_statement_payments')
    .select(
      `
      *,
      bank_statement:uploaded_documents!bank_statement_id(id, file_name, document_date),
      matched_invoice:uploaded_documents!matched_invoice_id(id, document_number, amount, supplier_name),
      truck:truck_heads(id, registration_number),
      trip:trips(id, origin_city, destination_city)
    `
    )
    .eq('company_id', companyId)
    .order('transaction_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.bank_statement_id) {
    query = query.eq('bank_statement_id', filters.bank_statement_id);
  }

  if (filters.type) {
    query = query.eq('transaction_type', filters.type);
  }

  if (filters.category) {
    query = query.eq('expense_category', filters.category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Update payment category or matching
 */
async function updatePayment(paymentId, companyId, updates, userId) {
  const allowedUpdates = [
    'expense_category',
    'matched_invoice_id',
    'truck_id',
    'trip_id',
    'status',
    'notes',
  ];

  const filteredUpdates = {};
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  // Track if user modified the category
  if (updates.expense_category) {
    filteredUpdates.user_modified_category = true;
  }

  filteredUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('bank_statement_payments')
    .update(filteredUpdates)
    .eq('id', paymentId)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) throw error;

  // If matched to invoice, mark it as paid
  if (updates.matched_invoice_id && data.transaction_type === 'credit') {
    await markInvoiceAsPaid(updates.matched_invoice_id, paymentId);
  }

  return data;
}

/**
 * Get summary statistics for bank statements
 */
async function getBankStatementStats(companyId, bankStatementId) {
  const { data: payments, error } = await supabase
    .from('bank_statement_payments')
    .select('transaction_type, amount, expense_category, status')
    .eq('company_id', companyId)
    .eq('bank_statement_id', bankStatementId);

  if (error) throw error;

  const stats = {
    totalTransactions: payments.length,
    totalCredits: 0,
    totalDebits: 0,
    matched: 0,
    pending: 0,
    byCategory: {},
  };

  for (const p of payments) {
    if (p.transaction_type === 'credit') {
      stats.totalCredits += parseFloat(p.amount);
    } else {
      stats.totalDebits += parseFloat(p.amount);
    }

    if (p.status === 'matched') {
      stats.matched++;
    } else {
      stats.pending++;
    }

    const cat = p.expense_category || 'necategorizat';
    if (!stats.byCategory[cat]) {
      stats.byCategory[cat] = { count: 0, amount: 0 };
    }
    stats.byCategory[cat].count++;
    stats.byCategory[cat].amount += parseFloat(p.amount);
  }

  return stats;
}

module.exports = {
  processBankStatement,
  getBankStatementPayments,
  updatePayment,
  getBankStatementStats,
  matchTransactionToInvoice,
  matchTransactionToTruck,
  markInvoiceAsPaid,
};
