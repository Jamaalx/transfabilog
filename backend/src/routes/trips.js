const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize, requireAdminDb } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin database access
router.use(authenticate);
router.use(requireAdminDb);

/**
 * GET /api/v1/trips
 * List all trips with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['planificat', 'in_progress', 'finalizat', 'anulat']),
    query('driver_id').optional().isUUID(),
    query('truck_id').optional().isUUID(),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
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
        .from('trips')
        .select(`
          *,
          driver:drivers(id, first_name, last_name),
          truck:truck_heads(id, registration_number, brand),
          trailer:trailers(id, registration_number)
        `, { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('departure_date', { ascending: false });

      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }

      if (req.query.driver_id) {
        query = query.eq('driver_id', req.query.driver_id);
      }

      if (req.query.truck_id) {
        query = query.eq('truck_id', req.query.truck_id);
      }

      if (req.query.date_from) {
        query = query.gte('departure_date', req.query.date_from);
      }

      if (req.query.date_to) {
        query = query.lte('departure_date', req.query.date_to);
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
 * GET /api/v1/trips/:id
 * Get single trip with full details
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        driver:drivers(id, first_name, last_name, phone),
        truck:truck_heads(id, registration_number, brand, model),
        trailer:trailers(id, registration_number, type),
        stops:trip_stops(*),
        expenses:trip_expenses(*)
      `)
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Trip not found',
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
 * POST /api/v1/trips
 * Create new trip
 */
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  [
    // For draft mode, most fields are optional
    body('driver_id').optional().isUUID(),
    body('truck_id').optional().isUUID(),
    body('trailer_id').optional().isUUID(),
    body('client_id').optional().isUUID(),
    body('origin_country').optional().isString().trim(),
    body('origin_city').optional().isString().trim(),
    body('destination_country').optional().isString().trim(),
    body('destination_city').optional().isString().trim(),
    body('departure_date').optional().isISO8601(),
    body('estimated_arrival').optional().isISO8601(),
    body('cargo_type').optional().isString().trim(),
    body('cargo_weight').optional().isFloat({ min: 0 }),
    body('client_name').optional().isString().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('notes').optional().isString().trim(),
    body('status').optional().isIn(['draft', 'planificat', 'in_progress', 'finalizat', 'anulat']).default('draft'),
    // New fields for driver expenses
    body('diurna').optional().isFloat({ min: 0 }),
    body('diurna_currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('cash_expenses').optional().isFloat({ min: 0 }),
    body('cash_expenses_currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('expense_report_number').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const isDraft = req.body.status === 'draft' || !req.body.status;

      // Verify driver belongs to company (only if provided)
      if (req.body.driver_id) {
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', req.body.driver_id)
          .eq('company_id', req.companyId)
          .single();

        if (driverError || !driver) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid driver_id',
          });
        }
      }

      // Verify truck belongs to company (only if provided)
      if (req.body.truck_id) {
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
      }

      // For non-draft status, require essential fields
      if (!isDraft) {
        if (!req.body.driver_id || !req.body.truck_id || !req.body.origin_city || !req.body.destination_city || !req.body.departure_date) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Pentru statusul planificat, completează: șofer, camion, oraș plecare, oraș destinație, dată plecare',
          });
        }
      }

      const tripData = {
        company_id: req.companyId,
        driver_id: req.body.driver_id || null,
        truck_id: req.body.truck_id || null,
        trailer_id: req.body.trailer_id || null,
        client_id: req.body.client_id || null,
        origin_country: req.body.origin_country || null,
        origin_city: req.body.origin_city || null,
        destination_country: req.body.destination_country || null,
        destination_city: req.body.destination_city || null,
        departure_date: req.body.departure_date || null,
        estimated_arrival: req.body.estimated_arrival || null,
        cargo_type: req.body.cargo_type || null,
        cargo_weight: req.body.cargo_weight || null,
        client_name: req.body.client_name || null,
        price: req.body.price || null,
        currency: req.body.currency || 'EUR',
        notes: req.body.notes || null,
        status: req.body.status || 'draft',
        // Expense fields
        diurna: req.body.diurna || null,
        diurna_currency: req.body.diurna_currency || 'EUR',
        cash_expenses: req.body.cash_expenses || null,
        cash_expenses_currency: req.body.cash_expenses_currency || 'EUR',
        expense_report_number: req.body.expense_report_number || null,
        // Tracking
        created_by: req.user.id,
        last_modified_by: req.user.id,
        last_modified_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select(`
          *,
          driver:drivers(id, first_name, last_name),
          truck:truck_heads(id, registration_number)
        `)
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/trips/:id
 * Update trip
 */
router.put(
  '/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('driver_id').optional().isUUID(),
    body('truck_id').optional().isUUID(),
    body('trailer_id').optional().isUUID(),
    body('origin_country').optional().isString().trim(),
    body('origin_city').optional().isString().trim(),
    body('destination_country').optional().isString().trim(),
    body('destination_city').optional().isString().trim(),
    body('departure_date').optional().isISO8601(),
    body('estimated_arrival').optional().isISO8601(),
    body('actual_arrival').optional().isISO8601(),
    body('cargo_type').optional().isString().trim(),
    body('cargo_weight').optional().isFloat({ min: 0 }),
    body('client_name').optional().isString().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']),
    body('notes').optional().isString().trim(),
    body('status').optional().isIn(['draft', 'planificat', 'in_progress', 'finalizat', 'anulat']),
    body('client_id').optional().isUUID(),
    body('km_start').optional().isInt({ min: 0 }),
    body('km_end').optional().isInt({ min: 0 }),
    // New expense fields
    body('diurna').optional().isFloat({ min: 0 }),
    body('diurna_currency').optional().isIn(['EUR', 'RON', 'USD']),
    body('cash_expenses').optional().isFloat({ min: 0 }),
    body('cash_expenses_currency').optional().isIn(['EUR', 'RON', 'USD']),
    body('expense_report_number').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Calculate total_km if both km_start and km_end are provided
      const updateData = { ...req.body };
      if (updateData.km_start !== undefined && updateData.km_end !== undefined) {
        updateData.total_km = updateData.km_end - updateData.km_start;
      }
      updateData.updated_at = new Date().toISOString();
      updateData.last_modified_by = req.user.id;
      updateData.last_modified_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select(`
          *,
          driver:drivers(id, first_name, last_name),
          truck:truck_heads(id, registration_number)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Trip not found',
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
 * DELETE /api/v1/trips/:id
 * Cancel trip (soft delete)
 */
router.delete(
  '/:id',
  authorize('admin', 'manager'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('trips')
        .update({ status: 'anulat', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Trip not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Trip cancelled successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/trips/:id/expenses
 * Add expense to trip
 */
router.post(
  '/:id/expenses',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('category').isIn(['combustibil', 'taxa_drum', 'parcare', 'mancare', 'reparatii', 'altele']),
    body('amount').isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('description').optional().isString().trim(),
    body('receipt_number').optional().isString().trim(),
    body('date').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify trip belongs to company
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (tripError || !trip) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Trip not found',
        });
      }

      const expenseData = {
        trip_id: req.params.id,
        category: req.body.category,
        amount: req.body.amount,
        currency: req.body.currency || 'EUR',
        description: req.body.description,
        receipt_number: req.body.receipt_number,
        date: req.body.date || new Date().toISOString(),
        created_by: req.user.id,
      };

      const { data, error } = await supabase
        .from('trip_expenses')
        .insert(expenseData)
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
 * POST /api/v1/trips/:id/stops
 * Add stop to trip
 */
router.post(
  '/:id/stops',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('country').isString().trim().notEmpty(),
    body('city').isString().trim().notEmpty(),
    body('address').optional().isString().trim(),
    body('type').isIn(['incarcare', 'descarcare', 'tranzit', 'pauza']),
    body('planned_date').optional().isISO8601(),
    body('actual_date').optional().isISO8601(),
    body('notes').optional().isString().trim(),
    body('sequence').optional().isInt({ min: 1 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify trip belongs to company
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (tripError || !trip) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Trip not found',
        });
      }

      const stopData = {
        trip_id: req.params.id,
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
        type: req.body.type,
        planned_date: req.body.planned_date,
        actual_date: req.body.actual_date,
        notes: req.body.notes,
        sequence: req.body.sequence,
      };

      const { data, error } = await supabase
        .from('trip_stops')
        .insert(stopData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
