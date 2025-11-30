const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/transactions
 * List all financial transactions with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn(['income', 'expense']),
    query('category').optional().isString().trim(),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('trip_id').optional().isUUID(),
    query('driver_id').optional().isUUID(),
    query('truck_id').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('date', { ascending: false });

      if (req.query.type) {
        query = query.eq('type', req.query.type);
      }

      if (req.query.category) {
        query = query.eq('category', req.query.category);
      }

      if (req.query.date_from) {
        query = query.gte('date', req.query.date_from);
      }

      if (req.query.date_to) {
        query = query.lte('date', req.query.date_to);
      }

      if (req.query.trip_id) {
        query = query.eq('trip_id', req.query.trip_id);
      }

      if (req.query.driver_id) {
        query = query.eq('driver_id', req.query.driver_id);
      }

      if (req.query.truck_id) {
        query = query.eq('truck_id', req.query.truck_id);
      }

      const { data, error, count } = await query.range(
        offset,
        offset + limit - 1
      );

      if (error) throw error;

      res.json({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/transactions/summary
 * Get financial summary (totals by period)
 */
router.get('/summary', async (req, res, next) => {
  try {
    const period = req.query.period || 'month'; // day, week, month, year
    const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const dateTo = req.query.date_to || new Date().toISOString();

    // Get income total
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount, currency')
      .eq('company_id', req.companyId)
      .eq('type', 'income')
      .gte('date', dateFrom)
      .lte('date', dateTo);

    if (incomeError) throw incomeError;

    // Get expense total
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount, currency')
      .eq('company_id', req.companyId)
      .eq('type', 'expense')
      .gte('date', dateFrom)
      .lte('date', dateTo);

    if (expenseError) throw expenseError;

    // Calculate totals (assuming EUR for simplicity)
    const totalIncome = incomeData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalExpense = expenseData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    res.json({
      period: {
        from: dateFrom,
        to: dateTo,
      },
      income: {
        total: totalIncome,
        count: incomeData.length,
      },
      expenses: {
        total: totalExpense,
        count: expenseData.length,
      },
      balance: totalIncome - totalExpense,
      currency: 'EUR',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/transactions/by-category
 * Get expenses grouped by category
 */
router.get('/by-category', async (req, res, next) => {
  try {
    const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const dateTo = req.query.date_to || new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('company_id', req.companyId)
      .eq('type', 'expense')
      .gte('date', dateFrom)
      .lte('date', dateTo);

    if (error) throw error;

    // Group by category
    const byCategory = data.reduce((acc, t) => {
      const cat = t.category || 'other';
      if (!acc[cat]) {
        acc[cat] = { total: 0, count: 0 };
      }
      acc[cat].total += parseFloat(t.amount || 0);
      acc[cat].count += 1;
      return acc;
    }, {});

    res.json({
      period: { from: dateFrom, to: dateTo },
      categories: byCategory,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/transactions/:id
 * Get single transaction
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
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
});

/**
 * POST /api/v1/transactions
 * Create new transaction
 */
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  [
    body('type').isIn(['income', 'expense']),
    body('category').isString().trim().notEmpty(),
    body('amount').isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('date').isISO8601(),
    body('description').optional().isString().trim(),
    body('trip_id').optional().isUUID(),
    body('driver_id').optional().isUUID(),
    body('truck_id').optional().isUUID(),
    body('invoice_number').optional().isString().trim(),
    body('payment_method').optional().isIn(['cash', 'card', 'transfer', 'dkv', 'eurowag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transactionData = {
        company_id: req.companyId,
        type: req.body.type,
        category: req.body.category,
        amount: req.body.amount,
        currency: req.body.currency || 'EUR',
        date: req.body.date,
        description: req.body.description,
        trip_id: req.body.trip_id,
        driver_id: req.body.driver_id,
        truck_id: req.body.truck_id,
        invoice_number: req.body.invoice_number,
        payment_method: req.body.payment_method,
        created_by: req.user.id,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/transactions/:id
 * Update transaction
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isUUID(),
    body('type').optional().isIn(['income', 'expense']),
    body('category').optional().isString().trim().notEmpty(),
    body('amount').optional().isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']),
    body('date').optional().isISO8601(),
    body('description').optional().isString().trim(),
    body('trip_id').optional().isUUID(),
    body('driver_id').optional().isUUID(),
    body('truck_id').optional().isUUID(),
    body('invoice_number').optional().isString().trim(),
    body('payment_method').optional().isIn(['cash', 'card', 'transfer', 'dkv', 'eurowag']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
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
 * DELETE /api/v1/transactions/:id
 * Delete transaction
 */
router.delete(
  '/:id',
  authorize('admin'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('transactions')
        .delete()
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

      res.json({ message: 'Transaction deleted successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
