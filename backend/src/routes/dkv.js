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

// Helper function to get TEMP staging table names based on provider
function getTempTableNames(provider) {
  switch (provider) {
    case 'eurowag':
      return {
        transactions: 'eurowag_temp_transactions',
        batches: 'eurowag_temp_import_batches',
      };
    case 'verag':
      return {
        transactions: 'verag_temp_transactions',
        batches: 'verag_temp_import_batches',
      };
    case 'dkv':
    default:
      return {
        transactions: 'dkv_temp_transactions',
        batches: 'dkv_temp_import_batches',
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
 * Create expense transaction from a fuel transaction
 * Query param: provider=dkv|eurowag|verag
 */
router.post(
  '/transactions/:id/create-expense',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('trip_id').optional().isUUID(),
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

      // Get transaction details from provider-specific table
      const { data: tx, error: fetchError } = await supabase
        .from(tables.transactions)
        .select('*, truck:truck_heads(id, registration_number)')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !tx) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found',
        });
      }

      if (tx.status === 'created_expense') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Expense already created for this transaction',
        });
      }

      // Determine category based on service/goods type
      let category = 'combustibil';
      const serviceType = (tx.service_type || tx.cost_group || '').toLowerCase();
      const goodsType = (tx.goods_type || tx.product_type || '').toLowerCase();
      const productCategory = (tx.product_category || '').toLowerCase();

      if (goodsType.includes('adblue') || productCategory.includes('adblue')) {
        category = 'adblue';
      } else if (
        serviceType.includes('toll') ||
        goodsType.includes('toll') ||
        productCategory.includes('toll') ||
        productCategory.includes('vignette') ||
        productCategory.includes('maut')
      ) {
        category = 'taxe_drum';
      } else if (
        goodsType.includes('diesel') ||
        goodsType.includes('gasoil') ||
        productCategory.includes('diesel') ||
        productCategory.includes('fuel')
      ) {
        category = 'combustibil';
      }

      // Get amount in EUR (use gross for total cost)
      const amountEur = tx.gross_amount_eur || tx.gross_amount || tx.net_amount_eur || tx.net_amount || 0;
      const transactionDate = tx.transaction_time || tx.transaction_date;

      // Create expense in transactions table
      const { data: expense, error: expenseError } = await supabase
        .from('transactions')
        .insert({
          company_id: req.companyId,
          truck_id: tx.truck_id,
          trip_id: req.body.trip_id || null,
          type: 'expense',
          category: category,
          amount: amountEur,
          currency: 'EUR',
          date: transactionDate,
          description: `${provider.toUpperCase()} - ${tx.vehicle_registration || ''} - ${goodsType || serviceType || 'Fuel'}`,
          notes: `Import from ${provider.toUpperCase()} | ${tx.country || ''} | ${tx.location || tx.station_name || ''}`,
          created_by: req.user.id,
        })
        .select()
        .single();

      if (expenseError) {
        throw new Error('Failed to create expense: ' + expenseError.message);
      }

      // Update transaction status
      await supabase
        .from(tables.transactions)
        .update({
          status: 'created_expense',
          expense_id: expense.id,
        })
        .eq('id', req.params.id);

      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/transactions/bulk-create-expenses
 * Create expenses for multiple transactions
 * Query param: provider=dkv|eurowag|verag
 */
router.post(
  '/transactions/bulk-create-expenses',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 100 }),
    body('transaction_ids.*').isUUID(),
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

      const results = {
        success: [],
        failed: [],
      };

      for (const txId of req.body.transaction_ids) {
        try {
          // Get transaction
          const { data: tx, error: txError } = await supabase
            .from(tables.transactions)
            .select('*, truck:truck_heads(id, registration_number)')
            .eq('id', txId)
            .eq('company_id', req.companyId)
            .single();

          if (txError || !tx) {
            results.failed.push({ transaction_id: txId, error: 'Transaction not found' });
            continue;
          }

          if (tx.status === 'created_expense') {
            results.failed.push({ transaction_id: txId, error: 'Expense already created' });
            continue;
          }

          // Determine category based on service/goods type and product_category
          let category = 'combustibil';
          const serviceType = (tx.service_type || tx.cost_group || '').toLowerCase();
          const goodsType = (tx.goods_type || tx.product_type || '').toLowerCase();
          const productCategory = (tx.product_category || '').toLowerCase();

          if (goodsType.includes('adblue') || productCategory.includes('adblue')) {
            category = 'adblue';
          } else if (
            serviceType.includes('toll') ||
            goodsType.includes('toll') ||
            productCategory.includes('toll') ||
            productCategory.includes('vignette') ||
            productCategory.includes('maut')
          ) {
            category = 'taxe_drum';
          } else if (
            goodsType.includes('diesel') ||
            goodsType.includes('gasoil') ||
            productCategory.includes('diesel') ||
            productCategory.includes('fuel')
          ) {
            category = 'combustibil';
          }

          const amountEur = tx.gross_amount_eur || tx.gross_amount || tx.net_amount_eur || tx.net_amount || 0;
          const transactionDate = tx.transaction_time || tx.transaction_date;

          // Create expense
          const { data: expense, error: expenseError } = await supabase
            .from('transactions')
            .insert({
              company_id: req.companyId,
              truck_id: tx.truck_id,
              type: 'expense',
              category: category,
              amount: amountEur,
              currency: 'EUR',
              date: transactionDate,
              description: `${provider.toUpperCase()} - ${tx.vehicle_registration || ''} - ${goodsType || serviceType || 'Fuel'}`,
              notes: `Import from ${provider.toUpperCase()} | ${tx.country || ''}`,
              created_by: req.user.id,
            })
            .select()
            .single();

          if (expenseError) {
            results.failed.push({ transaction_id: txId, error: expenseError.message });
            continue;
          }

          // Update transaction status
          await supabase
            .from(tables.transactions)
            .update({ status: 'created_expense', expense_id: expense.id })
            .eq('id', txId);

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
 * Bulk ignore transactions
 * Query param: provider=dkv|eurowag|verag
 */
router.post(
  '/transactions/bulk-ignore',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 500 }),
    body('transaction_ids.*').isUUID(),
    body('notes').optional().isString().trim(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTableNames(provider);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Update transactions in provider-specific table
      const { data, error } = await supabase
        .from(tables.transactions)
        .update({
          status: 'ignored',
          notes: req.body.notes || 'Bulk ignored',
        })
        .in('id', req.body.transaction_ids)
        .eq('company_id', req.companyId)
        .select('id');

      if (error) throw error;

      res.json({
        success: true,
        updated: data?.length || 0,
        total: req.body.transaction_ids.length,
      });
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
 * DELETE /api/v1/dkv/transactions/bulk-delete
 * Permanently delete transactions (ignored or all)
 * Query params:
 *   - provider=dkv|eurowag|verag
 *   - status=ignored|all (default: ignored)
 */
router.delete(
  '/transactions/bulk-delete',
  authorize('admin', 'manager', 'operator'),
  [
    query('status').optional().isIn(['ignored', 'all']),
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
      const statusFilter = req.query.status || 'ignored'; // Default to deleting only ignored

      console.log(`[BULK-DELETE] Provider: ${provider}, Status: ${statusFilter}, Table: ${tables.transactions}, CompanyId: ${req.companyId}`);

      // First, count how many will be deleted
      let countQuery = supabase
        .from(tables.transactions)
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId);

      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('status', statusFilter);
      }

      const { count: toDeleteCount, error: countError } = await countQuery;
      console.log(`[BULK-DELETE] Found ${toDeleteCount} transactions to delete, error: ${countError?.message || 'none'}`);

      if (toDeleteCount === 0) {
        return res.json({
          success: true,
          deleted: 0,
          message: `No ${statusFilter} transactions found to delete`,
        });
      }

      // Now perform the delete
      let deleteQuery = supabase
        .from(tables.transactions)
        .delete()
        .eq('company_id', req.companyId);

      // Only filter by status if not 'all'
      if (statusFilter !== 'all') {
        deleteQuery = deleteQuery.eq('status', statusFilter);
      }

      const { data, error } = await deleteQuery.select('id');

      console.log(`[BULK-DELETE] Deleted ${data?.length || 0} rows, error: ${error?.message || 'none'}`);

      if (error) throw error;

      // Update batch statistics after deletion
      // Get all batches and recalculate their stats
      const { data: batches } = await supabase
        .from(tables.batches)
        .select('id')
        .eq('company_id', req.companyId);

      if (batches) {
        for (const batch of batches) {
          const { data: remaining } = await supabase
            .from(tables.transactions)
            .select('status')
            .eq('batch_id', batch.id);

          if (!remaining || remaining.length === 0) {
            // No transactions left, delete the batch
            await supabase
              .from(tables.batches)
              .delete()
              .eq('id', batch.id);
          } else {
            // Update batch counts
            const matched = remaining.filter(t => t.status === 'matched').length;
            const unmatched = remaining.filter(t => t.status === 'unmatched' || t.status === 'pending').length;
            await supabase
              .from(tables.batches)
              .update({
                total_transactions: remaining.length,
                matched_transactions: matched,
                unmatched_transactions: unmatched,
              })
              .eq('id', batch.id);
          }
        }
      }

      res.json({
        success: true,
        deleted: data?.length || 0,
        message: statusFilter === 'all'
          ? `Permanently deleted all transactions`
          : `Permanently deleted ${data?.length || 0} ${statusFilter} transactions`,
      });
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

      // Select correct columns based on provider
      // DKV uses: payment_value_eur, gross_value_eur
      // Eurowag uses: gross_amount_eur, net_amount_eur
      // Verag uses: gross_amount, net_amount (already in EUR, no _eur suffix)
      let valueColumns;
      if (provider === 'dkv') {
        valueColumns = 'status, payment_value_eur, gross_value_eur';
      } else if (provider === 'verag') {
        valueColumns = 'status, gross_amount, net_amount';
      } else {
        valueColumns = 'status, gross_amount_eur, net_amount_eur';
      }

      // Build transactions query
      let txQuery = supabase
        .from(tables.transactions)
        .select(valueColumns)
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
          // Use BRUTTO value for totals - different column names per provider
          // DKV: payment_value_eur or gross_value_eur
          // Eurowag: gross_amount_eur or net_amount_eur
          // Verag: gross_amount or net_amount (no _eur suffix)
          const valueEur = tx.payment_value_eur || tx.gross_value_eur || tx.gross_amount_eur || tx.gross_amount || tx.net_amount_eur || tx.net_amount || 0;
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

// ============================================
// TEMP STAGING ENDPOINTS
// These operate on temporary staging tables
// ============================================

/**
 * GET /api/v1/dkv/temp/batches
 * List batches from TEMP staging tables
 */
router.get(
  '/temp/batches',
  [
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      const { data, error } = await supabase
        .from(tables.batches)
        .select('*')
        .eq('company_id', req.companyId)
        .order('import_date', { ascending: false });

      if (error) throw error;

      res.json({ data: data || [] });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/temp/transactions
 * List transactions from TEMP staging tables
 */
router.get(
  '/temp/transactions',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
    query('status').optional().isIn(['pending', 'matched', 'unmatched']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const offset = (page - 1) * limit;

      let txQuery = supabase
        .from(tables.transactions)
        .select(`
          *,
          truck:truck_heads(id, registration_number, brand, model)
        `, { count: 'exact' })
        .eq('company_id', req.companyId);

      if (req.query.status) {
        txQuery = txQuery.eq('status', req.query.status);
      }

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
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dkv/temp/summary
 * Get summary from TEMP staging tables
 */
router.get(
  '/temp/summary',
  [
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // Select value columns based on provider
      let valueColumns;
      if (provider === 'dkv') {
        valueColumns = 'status, payment_value_eur, gross_value_eur';
      } else if (provider === 'verag') {
        valueColumns = 'status, gross_amount, net_amount';
      } else {
        valueColumns = 'status, gross_amount_eur, net_amount_eur';
      }

      const { data: transactions, error } = await supabase
        .from(tables.transactions)
        .select(valueColumns)
        .eq('company_id', req.companyId);

      if (error) throw error;

      const summary = {
        total_transactions: transactions?.length || 0,
        pending: 0,
        matched: 0,
        unmatched: 0,
        total_value: 0,
        pending_value: 0,
      };

      if (transactions) {
        transactions.forEach((tx) => {
          if (summary[tx.status] !== undefined) {
            summary[tx.status]++;
          }
          const valueEur = tx.payment_value_eur || tx.gross_value_eur || tx.gross_amount_eur || tx.gross_amount || tx.net_amount_eur || tx.net_amount || 0;
          if (valueEur) {
            summary.total_value += parseFloat(valueEur);
            summary.pending_value += parseFloat(valueEur);
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
 * PUT /api/v1/dkv/temp/transaction/:id/match
 * Match a transaction to a truck in TEMP staging
 */
router.put(
  '/temp/transaction/:id/match',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('truck_id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // Update transaction with truck
      const { data, error } = await supabase
        .from(tables.transactions)
        .update({
          truck_id: req.body.truck_id,
          status: 'matched',
        })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
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
 * DELETE /api/v1/dkv/temp/batch/:id
 * Delete a batch from TEMP staging
 */
router.delete(
  '/temp/batch/:id',
  authorize('admin', 'manager'),
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // Delete batch (transactions cascade)
      const { error } = await supabase
        .from(tables.batches)
        .delete()
        .eq('id', req.params.id)
        .eq('company_id', req.companyId);

      if (error) throw error;

      res.json({ message: 'Batch deleted from staging' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/dkv/temp/transaction/:id/ignore
 * Mark a transaction as ignored in TEMP staging (or delete it)
 */
router.patch(
  '/temp/transaction/:id/ignore',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // For temp staging, just delete the transaction instead of marking ignored
      const { error } = await supabase
        .from(tables.transactions)
        .delete()
        .eq('id', req.params.id)
        .eq('company_id', req.companyId);

      if (error) throw error;

      res.json({ message: 'Transaction removed from staging' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/temp/transactions/bulk-ignore
 * Bulk delete transactions from TEMP staging
 */
router.post(
  '/temp/transactions/bulk-ignore',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 500 }),
    body('transaction_ids.*').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // Delete transactions from temp staging
      const { data, error } = await supabase
        .from(tables.transactions)
        .delete()
        .in('id', req.body.transaction_ids)
        .eq('company_id', req.companyId)
        .select('id');

      if (error) throw error;

      res.json({
        success: true,
        deleted: data?.length || 0,
        total: req.body.transaction_ids.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/dkv/temp/transactions/bulk-delete
 * Permanently delete all transactions from TEMP staging
 */
router.delete(
  '/temp/transactions/bulk-delete',
  authorize('admin', 'manager', 'operator'),
  [
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tables = getTempTableNames(provider);

      // Delete all transactions from temp staging for this company
      const { data, error } = await supabase
        .from(tables.transactions)
        .delete()
        .eq('company_id', req.companyId)
        .select('id');

      if (error) throw error;

      // Also clean up empty batches
      const { data: batches } = await supabase
        .from(tables.batches)
        .select('id')
        .eq('company_id', req.companyId);

      if (batches) {
        for (const batch of batches) {
          const { count } = await supabase
            .from(tables.transactions)
            .select('id', { count: 'exact', head: true })
            .eq('batch_id', batch.id);

          if (count === 0) {
            await supabase
              .from(tables.batches)
              .delete()
              .eq('id', batch.id);
          }
        }
      }

      res.json({
        success: true,
        deleted: data?.length || 0,
        message: `Deleted ${data?.length || 0} transactions from staging`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/dkv/temp/approve
 * Approve transactions - move from TEMP to FINAL and create expenses
 */
router.post(
  '/temp/approve',
  authorize('admin', 'manager', 'operator'),
  [
    body('transaction_ids').isArray({ min: 1, max: 500 }),
    body('transaction_ids.*').isUUID(),
    query('provider').optional().isIn(['dkv', 'eurowag', 'verag']),
  ],
  async (req, res, next) => {
    try {
      const provider = req.query.provider || 'dkv';
      const tempTables = getTempTableNames(provider);
      const finalTables = getTableNames(provider);

      const results = { approved: [], failed: [] };

      for (const txId of req.body.transaction_ids) {
        try {
          // Get transaction from temp table
          const { data: tempTx, error: fetchError } = await supabase
            .from(tempTables.transactions)
            .select('*')
            .eq('id', txId)
            .eq('company_id', req.companyId)
            .single();

          if (fetchError || !tempTx) {
            results.failed.push({ id: txId, error: 'Not found in staging' });
            continue;
          }

          if (!tempTx.truck_id) {
            results.failed.push({ id: txId, error: 'No truck assigned' });
            continue;
          }

          // Determine expense category
          let category = 'combustibil';
          const serviceType = (tempTx.service_type || tempTx.cost_group || '').toLowerCase();
          const goodsType = (tempTx.goods_type || tempTx.product_type || '').toLowerCase();
          const productCategory = (tempTx.product_category || '').toLowerCase();

          if (goodsType.includes('adblue') || productCategory.includes('adblue')) {
            category = 'adblue';
          } else if (serviceType.includes('toll') || goodsType.includes('toll') || productCategory.includes('maut')) {
            category = 'taxe_drum';
          }

          const amountEur = tempTx.gross_amount_eur || tempTx.gross_amount || tempTx.payment_value_eur || tempTx.net_amount_eur || tempTx.net_amount || 0;
          const transactionDate = tempTx.transaction_time || tempTx.transaction_date;

          // Create expense in transactions table
          const { data: expense, error: expenseError } = await supabase
            .from('transactions')
            .insert({
              company_id: req.companyId,
              truck_id: tempTx.truck_id,
              type: 'expense',
              category: category,
              amount: amountEur,
              currency: 'EUR',
              date: transactionDate,
              description: `${provider.toUpperCase()} - ${tempTx.vehicle_registration || ''} - ${goodsType || serviceType || 'Fuel'}`,
              notes: `Import from ${provider.toUpperCase()} | ${tempTx.country || ''}`,
              created_by: req.user.id,
            })
            .select()
            .single();

          if (expenseError) {
            results.failed.push({ id: txId, error: expenseError.message });
            continue;
          }

          // Copy to final table with expense_id
          const finalData = { ...tempTx };
          delete finalData.id; // Let DB generate new ID
          finalData.status = 'created_expense';
          finalData.expense_id = expense.id;

          const { error: insertError } = await supabase
            .from(finalTables.transactions)
            .insert(finalData);

          if (insertError) {
            // Rollback expense
            await supabase.from('transactions').delete().eq('id', expense.id);
            results.failed.push({ id: txId, error: insertError.message });
            continue;
          }

          // Delete from temp table
          await supabase
            .from(tempTables.transactions)
            .delete()
            .eq('id', txId);

          results.approved.push({ id: txId, expense_id: expense.id });
        } catch (err) {
          results.failed.push({ id: txId, error: err.message });
        }
      }

      res.json({
        total: req.body.transaction_ids.length,
        approved: results.approved.length,
        failed: results.failed.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
