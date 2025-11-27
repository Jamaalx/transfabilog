const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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
    body('driver_id').isUUID(),
    body('truck_id').isUUID(),
    body('trailer_id').optional().isUUID(),
    body('origin_country').isString().trim().notEmpty(),
    body('origin_city').isString().trim().notEmpty(),
    body('destination_country').isString().trim().notEmpty(),
    body('destination_city').isString().trim().notEmpty(),
    body('departure_date').isISO8601(),
    body('estimated_arrival').optional().isISO8601(),
    body('cargo_type').optional().isString().trim(),
    body('cargo_weight').optional().isFloat({ min: 0 }),
    body('client_name').optional().isString().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'RON', 'USD']).default('EUR'),
    body('notes').optional().isString().trim(),
    body('status').optional().isIn(['planificat', 'in_progress', 'finalizat', 'anulat']).default('planificat'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify driver belongs to company
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

      const tripData = {
        company_id: req.companyId,
        driver_id: req.body.driver_id,
        truck_id: req.body.truck_id,
        trailer_id: req.body.trailer_id,
        origin_country: req.body.origin_country,
        origin_city: req.body.origin_city,
        destination_country: req.body.destination_country,
        destination_city: req.body.destination_city,
        departure_date: req.body.departure_date,
        estimated_arrival: req.body.estimated_arrival,
        cargo_type: req.body.cargo_type,
        cargo_weight: req.body.cargo_weight,
        client_name: req.body.client_name,
        price: req.body.price,
        currency: req.body.currency || 'EUR',
        notes: req.body.notes,
        status: req.body.status || 'planificat',
        created_by: req.user.id,
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
    body('status').optional().isIn(['planificat', 'in_progress', 'finalizat', 'anulat']),
    body('km_start').optional().isInt({ min: 0 }),
    body('km_end').optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('trips')
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
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
