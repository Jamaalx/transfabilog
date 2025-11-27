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
 * List all DKV import batches
 * Query param: provider=dkv|eurowag|verag (optional filter)
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
      const provider = req.query.provider;

      const result = await getDKVBatches(req.companyId, page, limit, provider);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/batches/:id
 * Get a single batch with summary
 */
router.get(
  '/batches/:id',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('dkv_import_batches')
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
        .from('dkv_transactions')
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
 */
router.delete(
  '/batches/:id',
  authorize('admin', 'manager'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify batch belongs to company
      const { data: batch, error: fetchError } = await supabase
        .from('dkv_import_batches')
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
        .from('dkv_import_batches')
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
 * List DKV transactions with filters
 * Query params:
 *   - provider: dkv|eurowag|verag - filter by provider
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

      // Default hide_processed to true unless explicitly set to false
      const hideProcessed = req.query.hide_processed !== false;

      const result = await getDKVTransactions(req.companyId, {
        batch_id: req.query.batch_id,
        truck_id: req.query.truck_id,
        status: req.query.status,
        provider: req.query.provider,
        hide_processed: hideProcessed,
        page: req.query.page || 1,
        limit: req.query.limit || 50,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/transactions/:id
 * Get a single DKV transaction
 */
router.get(
  '/transactions/:id',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('dkv_transactions')
        .select(`
          *,
          truck:truck_heads(id, registration_number, brand, model),
          batch:dkv_import_batches(id, file_name, import_date),
          expense:transactions(id, amount, currency, category)
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
 * Match a DKV transaction to a truck
 */
router.patch(
  '/transactions/:id/match',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('truck_id').isUUID(),
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

      const result = await matchDKVTransaction(req.params.id, req.body.truck_id);
      res.json(result);
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
 * Mark a DKV transaction as ignored
 */
router.patch(
  '/transactions/:id/ignore',
  authorize('admin', 'manager', 'operator'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('dkv_transactions')
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
 * Get DKV summary statistics
 * Query param: provider=dkv|eurowag|verag (optional filter)
 */
router.get(
  '/summary',
  [query('provider').optional().isIn(['dkv', 'eurowag', 'verag'])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = req.query.provider;

      // First, get batch IDs for the provider filter if needed
      let batchIds = null;
      if (provider) {
        let batchQuery = supabase
          .from('dkv_import_batches')
          .select('id')
          .eq('company_id', req.companyId);

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
        batchIds = batches?.map((b) => b.id) || [];
      }

      // Get transactions, filtered by batch if provider specified
      let txQuery = supabase
        .from('dkv_transactions')
        .select('status, net_purchase_value')
        .eq('company_id', req.companyId);

      if (batchIds && batchIds.length > 0) {
        txQuery = txQuery.in('batch_id', batchIds);
      } else if (batchIds && batchIds.length === 0) {
        // No batches match the provider filter
        return res.json({
          total_transactions: 0,
          pending: 0,
          matched: 0,
          unmatched: 0,
          created_expense: 0,
          ignored: 0,
          total_value: 0,
          pending_value: 0,
        });
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
          if (tx.net_purchase_value) {
            summary.total_value += parseFloat(tx.net_purchase_value);
            if (tx.status !== 'created_expense' && tx.status !== 'ignored') {
              summary.pending_value += parseFloat(tx.net_purchase_value);
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
