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
} = require('../services/dkvParsingService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel files only
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/dkv/import
 * Upload and import DKV Excel report
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

      const result = await importDKVTransactions(
        req.file.buffer,
        req.companyId,
        req.user.id,
        null, // No linked document yet
        req.file.originalname,
        req.file.mimetype
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('DKV import error:', error);
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
 */
router.get(
  '/batches',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 20;

      const result = await getDKVBatches(req.companyId, page, limit);
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
 */
router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('batch_id').optional().isUUID(),
    query('truck_id').optional().isUUID(),
    query('status').optional().isIn(['pending', 'matched', 'unmatched', 'created_expense', 'ignored']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await getDKVTransactions(req.companyId, {
        batch_id: req.query.batch_id,
        truck_id: req.query.truck_id,
        status: req.query.status,
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
 */
router.get('/summary', async (req, res, next) => {
  try {
    // Get total counts by status
    const { data: transactions, error: txError } = await supabase
      .from('dkv_transactions')
      .select('status, net_purchase_value')
      .eq('company_id', req.companyId);

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
});

module.exports = router;
