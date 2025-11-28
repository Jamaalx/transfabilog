const express = require('express');
const multer = require('multer');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');
const {
  importDKVTransactions,
  matchDKVTransaction,
  createExpenseFromDKV,
  getDKVBatches,
  getDKVTransactions,
  bulkIgnoreTransactions,
} = require('../services/dkvParsingService');
const { importEurowagTransactions } = require('../services/eurowagParsingService');
const { importVeragTransactions } = require('../services/veragParsingService');
const bnrService = require('../services/bnrExchangeService');

const router = express.Router();

// Helper function to get table names based on provider
function getTableNames(provider) {
  switch (provider) {
    case 'eurowag':
      return {
        transactions: 'eurowag_transactions',
        batches: 'eurowag_import_batches',
      };
    case 'verag':
      return {
        transactions: 'verag_transactions',
        batches: 'verag_import_batches',
      };
    case 'dkv':
    default:
      return {
        transactions: 'dkv_transactions',
        batches: 'dkv_import_batches',
      };
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel, CSV, and PDF files
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/pdf', // .pdf for VERAG
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls), CSV, and PDF files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/dkv/import
 * Upload and import fuel card report (DKV, EUROWAG, etc.)
 * Query param: provider=dkv|eurowag (default: auto-detect)
 */
router.post(
  '/import',
  authorize('admin', 'manager', 'operator'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No file uploaded',
        });
      }

      const provider = req.query.provider || req.body.provider || 'auto';
      const fileName = req.file.originalname.toLowerCase();

      // Auto-detect provider from filename and mimetype
      let detectedProvider = provider;
      if (provider === 'auto') {
        const isPdf = req.file.mimetype === 'application/pdf' || fileName.endsWith('.pdf');

        if (fileName.includes('ew_export') || fileName.includes('eurowag')) {
          detectedProvider = 'eurowag';
        } else if (fileName.includes('invoice-transactions') || fileName.includes('dkv')) {
          detectedProvider = 'dkv';
        } else if (fileName.includes('maut') || fileName.includes('verag') || (isPdf && !fileName.includes('dkv'))) {
          // VERAG reports are PDFs with "Maut" in the name, or any PDF that's not DKV
          detectedProvider = 'verag';
        } else {
          // Default to DKV for CSV/Excel files
          detectedProvider = 'dkv';
        }
      }

      console.log(`Importing fuel report - Provider: ${detectedProvider}, File: ${req.file.originalname}`);

      let result;
      switch (detectedProvider) {
        case 'eurowag':
          result = await importEurowagTransactions(
            req.file.buffer,
            req.companyId,
            req.user.id,
            null,
            req.file.originalname
          );
          break;
        case 'verag':
          result = await importVeragTransactions(
            req.file.buffer,
            req.companyId,
            req.user.id,
            null,
            req.file.originalname
          );
          break;
        case 'dkv':
        default:
          result = await importDKVTransactions(
            req.file.buffer,
            req.companyId,
            req.user.id,
            null,
            req.file.originalname,
            req.file.mimetype
          );
          break;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Fuel import error:', error);
      res.status(400).json({
        error: 'Import Error',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/dkv/batches
 * List all import batches for a provider
 * Query param: provider=dkv|eurowag|verag (required for separate tables)
 */
router.get(
  '/batches',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const provider = req.query.provider || 'dkv';
      const offset = (page - 1) * limit;

      const tables = getTableNames(provider);

      // Query from provider-specific table
      const { data, error, count } = await supabase
        .from(tables.batches)
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('import_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/batches/:id
 * Get a single batch with summary
 * Query param: provider=dkv|eurowag|verag
 */
router.get(
  '/batches/:id',
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);

      const { data, error } = await supabase
        .from(tables.batches)
        .select('*')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Batch not found',
        });
      }

      // Get transaction summary by status
      const { data: statusCounts } = await supabase
        .from(tables.transactions)
        .select('status')
        .eq('batch_id', req.params.id);

      const summary = {
        pending: 0,
        matched: 0,
        unmatched: 0,
        created_expense: 0,
        ignored: 0,
      };

      if (statusCounts) {
        statusCounts.forEach((tx) => {
          if (summary[tx.status] !== undefined) {
            summary[tx.status]++;
          }
        });
      }

      res.json({
        ...data,
        status_summary: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/dkv/batches/:id
 * Delete a batch and all its transactions
 * Query param: provider=dkv|eurowag|verag
 */
router.delete(
  '/batches/:id',
  authorize('admin', 'manager'),
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);

      // Verify batch belongs to company
      const { data: batch, error: fetchError } = await supabase
        .from(tables.batches)
        .select('id')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !batch) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Batch not found',
        });
      }

      // Delete batch (transactions will cascade delete)
      const { error: deleteError } = await supabase
        .from(tables.batches)
        .delete()
        .eq('id', req.params.id);

      if (deleteError) throw deleteError;

      res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/transactions
 * List transactions with filters
 * Query params:
 *   - provider: dkv|eurowag|verag - select table (required)
 *   - hide_processed: true|false - hide ignored/created_expense (default: true)
 *   - status: filter by specific status (overrides hide_processed)
 */
router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('batch_id').optional().isUUID(),
    query('truck_id').optional().isUUID(),
    query('status').optional().isIn(['pending', 'matched', 'unmatched', 'created_expense', 'ignored']),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
    query('hide_processed').optional().isBoolean().toBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const offset = (page - 1) * limit;

      // Default hide_processed to true unless explicitly set to false
      const hideProcessed = req.query.hide_processed !== false;

      // Build query based on provider table
      let txQuery = supabase
        .from(tables.transactions)
        .select(`
          *,
          truck:truck_heads(id, registration_number, brand, model)
        `, { count: 'exact' })
        .eq('company_id', req.companyId);

      // Apply filters
      if (req.query.batch_id) {
        txQuery = txQuery.eq('batch_id', req.query.batch_id);
      }
      if (req.query.truck_id) {
        txQuery = txQuery.eq('truck_id', req.query.truck_id);
      }
      if (req.query.status) {
        txQuery = txQuery.eq('status', req.query.status);
      } else if (hideProcessed) {
        txQuery = txQuery.not('status', 'in', '("created_expense","ignored")');
      }

      // Order and paginate
      // Use transaction_time for eurowag, transaction_date for verag
      const timeColumn = provider === 'verag' ? 'transaction_date' : 'transaction_time';
      txQuery = txQuery
        .order(timeColumn, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await txQuery;

      if (error) throw error;

      res.json({
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/transactions/:id
 * Get a single transaction
 * Query param: provider=dkv|eurowag|verag
 */
router.get(
  '/transactions/:id',
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);

      const { data, error } = await supabase
        .from(tables.transactions)
        .select(`
          *,
          truck:truck_heads(id, registration_number, brand, model)
        `)
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found',
        });
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/dkv/transactions/:id/match
 * Match a transaction to a truck
 * Query param: provider=dkv|eurowag|verag
 */
router.patch(
  '/transactions/:id/match',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('truck_id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);

      // Verify transaction belongs to company
      const { data: tx, error: fetchError } = await supabase
        .from(tables.transactions)
        .select('id')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !tx) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found',
        });
      }

      // Verify truck belongs to company
      const { data: truck, error: truckError } = await supabase
        .from('truck_heads')
        .select('id')
        .eq('id', req.body.truck_id)
        .eq('company_id', req.companyId)
        .single();

      if (truckError || !truck) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid truck_id',
        });
      }

      // Update transaction with truck
      const { data, error } = await supabase
        .from(tables.transactions)
        .update({
          truck_id: req.body.truck_id,
          status: 'matched',
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/transactions/:id/create-expense
 * Create expense transaction from DKV transaction
 */
router.post(
  '/transactions/:id/create-expense',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('trip_id').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify transaction belongs to company
      const { data: tx, error: fetchError } = await supabase
        .from('dkv_transactions')
        .select('id, company_id')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !tx) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found',
        });
      }

      const expense = await createExpenseFromDKV(
        req.params.id,
        req.companyId,
        req.user.id,
        req.body.trip_id
      );

      res.status(201).json(expense);
    } catch (error) {
      if (error.message.includes('already created')) {
        return res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
      }
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/transactions/bulk-create-expenses
 * Create expenses for multiple DKV transactions
 */
router.post(
  '/transactions/bulk-create-expenses',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 100 }),
    body('transaction_ids.*').isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const results = {
        success: [],
        failed: [],
      };

      for (const txId of req.body.transaction_ids) {
        try {
          const expense = await createExpenseFromDKV(txId, req.companyId, req.user.id);
          results.success.push({ transaction_id: txId, expense_id: expense.id });
        } catch (error) {
          results.failed.push({ transaction_id: txId, error: error.message });
        }
      }

      res.json({
        total: req.body.transaction_ids.length,
        created: results.success.length,
        failed: results.failed.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/transactions/bulk-ignore
 * Bulk ignore DKV transactions
 */
router.post(
  '/transactions/bulk-ignore',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 500 }),
    body('transaction_ids.*').isUUID(),
    body('notes').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await bulkIgnoreTransactions(
        req.body.transaction_ids,
        req.companyId,
        req.body.notes
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/dkv/transactions/:id/ignore
 * Mark a transaction as ignored
 * Query param: provider=dkv|eurowag|verag
 */
router.patch(
  '/transactions/:id/ignore',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);

      const { data, error } = await supabase
        .from(tables.transactions)
        .update({ status: 'ignored', notes: req.body.notes })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Transaction not found',
          });
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/summary
 * Get summary statistics for a provider
 * Query param: provider=dkv|eurowag|verag
 */
router.get(
  '/summary',
  [
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
    query('batch_id').optional().isUUID(),
    query('latest').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider || 'dkv';
      const batchIdParam = req.query.batch_id;
      const latestOnly = req.query.latest === 'true';
      const tables = getTableNames(provider);

      // Build transactions query
      let txQuery = supabase
        .from(tables.transactions)
        .select('status, gross_amount_eur, net_amount_eur')
        .eq('company_id', req.companyId);

      // Filter by batch if specified
      if (batchIdParam) {
        txQuery = txQuery.eq('batch_id', batchIdParam);
      } else if (latestOnly) {
        // Get the most recent batch ID
        const { data: batches } = await supabase
          .from(tables.batches)
          .select('id')
          .eq('company_id', req.companyId)
          .order('import_date', { ascending: false })
          .limit(1);

        if (batches && batches.length > 0) {
          txQuery = txQuery.eq('batch_id', batches[0].id);
        }
      }

      const { data: transactions, error: txError } = await txQuery;

      if (txError) throw txError;

      const summary = {
        total_transactions: transactions?.length || 0,
        pending: 0,
        matched: 0,
        unmatched: 0,
        created_expense: 0,
        ignored: 0,
        total_value: 0,
        pending_value: 0,
      };

      if (transactions) {
        transactions.forEach((tx) => {
          if (summary[tx.status] !== undefined) {
            summary[tx.status]++;
          }
          // Use gross_amount_eur (BRUTTO) for totals
          const valueEur = tx.gross_amount_eur || tx.net_amount_eur || 0;
          if (valueEur) {
            summary.total_value += parseFloat(valueEur);
            if (tx.status !== 'created_expense' && tx.status !== 'ignored') {
              summary.pending_value += parseFloat(valueEur);
            }
          }
        });
      }

      summary.total_value = Math.round(summary.total_value * 100) / 100;
      summary.pending_value = Math.round(summary.pending_value * 100) / 100;

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/vat-rates
 * Get VAT rates for all countries
 */
router.get('/vat-rates', async (req, res, next) => {
  try {
    const vatRates = bnrService.getAllVatRates();

    // Transform to array format for easier frontend consumption
    const rates = Object.entries(vatRates).map(([code, info]) => ({
      country_code: code,
      country_name: info.name,
      vat_rate: info.rate,
      refundable: info.refundable !== false,
    }));

    res.json({
      rates,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dkv/vat-rates/:country
 * Get VAT rate for a specific country
 */
router.get(
  '/vat-rates/:country',
  param('country').isString().isLength({ min: 2 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vatInfo = bnrService.getVatRate(req.params.country);

      if (!vatInfo.code) {
        return res.status(404).json({
          error: 'Not Found',
          message: `VAT rate not found for country: ${req.params.country}`,
        });
      }

      res.json(vatInfo);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/exchange-rates
 * Get current BNR exchange rates
 */
router.get('/exchange-rates', async (req, res, next) => {
  try {
    const rates = await bnrService.fetchCurrentRates();

    res.json({
      rates,
      base_currency: 'EUR',
      source: 'BNR (Banca Națională a României)',
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dkv/exchange-rates/historical
 * Get historical BNR exchange rates for a specific date
 * Query param: date=YYYY-MM-DD
 */
router.get(
  '/exchange-rates/historical',
  query('date').isISO8601().toDate(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const rates = await bnrService.fetchHistoricalRates(req.query.date);

      res.json({
        rates,
        date: req.query.date.toISOString().split('T')[0],
        base_currency: 'EUR',
        source: 'BNR (Banca Națională a României)',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/convert
 * Convert an amount between currencies
 * Body: { amount, from_currency, to_currency, date? }
 */
router.post(
  '/convert',
  [
    body('amount').isFloat({ min: 0 }),
    body('from_currency').isString().isLength({ min: 3, max: 3 }),
    body('to_currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('date').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, from_currency, to_currency = 'EUR', date } = req.body;

      let result;
      if (to_currency === 'EUR') {
        result = await bnrService.convertToEur(amount, from_currency, date);
        res.json({
          original_amount: amount,
          original_currency: from_currency,
          converted_amount: result.amountEur,
          converted_currency: 'EUR',
          exchange_rate: result.rate,
          rate_date: result.rateDate,
        });
      } else if (from_currency === 'EUR') {
        result = await bnrService.convertFromEur(amount, to_currency, date);
        res.json({
          original_amount: amount,
          original_currency: 'EUR',
          converted_amount: result.amount,
          converted_currency: to_currency,
          exchange_rate: result.rate,
          rate_date: result.rateDate,
        });
      } else {
        // Convert through EUR
        const toEur = await bnrService.convertToEur(amount, from_currency, date);
        const fromEur = await bnrService.convertFromEur(toEur.amountEur, to_currency, date);

        res.json({
          original_amount: amount,
          original_currency: from_currency,
          converted_amount: fromEur.amount,
          converted_currency: to_currency,
          intermediate_eur: toEur.amountEur,
          exchange_rate_to_eur: toEur.rate,
          exchange_rate_from_eur: fromEur.rate,
          rate_date: toEur.rateDate,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
