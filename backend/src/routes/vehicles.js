const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize, requireAdminDb } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin database access
router.use(authenticate);
router.use(requireAdminDb);

/**
 * GET /api/v1/vehicles/trucks
 * List all trucks with pagination and filters
 */
router.get(
  '/trucks',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['activ', 'inactiv', 'service', 'avariat']),
    query('search').optional().isString().trim(),
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
        .from('truck_heads')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('created_at', { ascending: false });

      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }

      if (req.query.search) {
        query = query.or(
          `registration_number.ilike.%${req.query.search}%,brand.ilike.%${req.query.search}%,model.ilike.%${req.query.search}%`
        );
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
 * GET /api/v1/vehicles/trucks/:id
 * Get single truck with details
 */
router.get('/trucks/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('truck_heads')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Truck not found',
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
 * POST /api/v1/vehicles/trucks
 * Create new truck
 */
router.post(
  '/trucks',
  authorize('admin', 'manager', 'operator'),
  [
    body('registration_number')
      .isString()
      .trim()
      .notEmpty()
      .toUpperCase(),
    body('vin').optional().isString().trim(),
    body('brand').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('year').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('euro_standard').optional().isString().trim(),
    body('purchase_date').optional().isISO8601(),
    body('purchase_price').optional().isFloat({ min: 0 }),
    body('current_km').optional().isInt({ min: 0 }),
    body('status')
      .optional()
      .isIn(['activ', 'inactiv', 'service', 'avariat'])
      .default('activ'),
    body('gps_provider')
      .optional()
      .isIn(['wialon', 'arobs', 'volvo', 'ecomotive']),
    body('gps_device_id').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const truckData = {
        company_id: req.companyId,
        registration_number: req.body.registration_number,
        vin: req.body.vin,
        brand: req.body.brand,
        model: req.body.model,
        year: req.body.year,
        euro_standard: req.body.euro_standard,
        purchase_date: req.body.purchase_date,
        purchase_price: req.body.purchase_price,
        current_km: req.body.current_km || 0,
        status: req.body.status || 'activ',
        gps_provider: req.body.gps_provider,
        gps_device_id: req.body.gps_device_id,
      };

      const { data, error } = await supabase
        .from('truck_heads')
        .insert(truckData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            error: 'Conflict',
            message: 'A truck with this registration number already exists',
          });
        }
        throw error;
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/vehicles/trucks/:id
 * Update truck
 */
router.put(
  '/trucks/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('registration_number').optional().isString().trim().toUpperCase(),
    body('vin').optional().isString().trim(),
    body('brand').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('year').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('euro_standard').optional().isString().trim(),
    body('purchase_date').optional().isISO8601(),
    body('purchase_price').optional().isFloat({ min: 0 }),
    body('current_km').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['activ', 'inactiv', 'service', 'avariat']),
    body('gps_provider').optional().isIn(['wialon', 'arobs', 'volvo', 'ecomotive']),
    body('gps_device_id').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('truck_heads')
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
            message: 'Truck not found',
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
 * DELETE /api/v1/vehicles/trucks/:id
 * Delete truck (soft delete via status)
 */
router.delete(
  '/trucks/:id',
  authorize('admin'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Soft delete by setting status to 'inactiv'
      const { data, error } = await supabase
        .from('truck_heads')
        .update({ status: 'inactiv', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Truck not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Truck deactivated successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/vehicles/trailers
 * List all trailers with pagination and filters
 */
router.get(
  '/trailers',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['activ', 'inactiv']),
    query('search').optional().isString().trim(),
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

      let dbQuery = supabase
        .from('trailers')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('created_at', { ascending: false });

      if (req.query.status) {
        dbQuery = dbQuery.eq('status', req.query.status);
      }

      if (req.query.search) {
        dbQuery = dbQuery.or(
          `registration_number.ilike.%${req.query.search}%,brand.ilike.%${req.query.search}%,model.ilike.%${req.query.search}%`
        );
      }

      const { data, error, count } = await dbQuery.range(
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
 * POST /api/v1/vehicles/trailers
 * Create new trailer
 */
router.post(
  '/trailers',
  authorize('admin', 'manager', 'operator'),
  [
    body('registration_number').isString().trim().notEmpty().toUpperCase(),
    body('vin').optional().isString().trim(),
    body('brand').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('type').optional().isIn(['prelata', 'frigorific', 'cisterna', 'altele']),
    body('capacity_tons').optional().isFloat({ min: 0 }),
    body('volume_m3').optional().isFloat({ min: 0 }),
    body('purchase_date').optional().isISO8601(),
    body('purchase_price').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['activ', 'inactiv']).default('activ'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('trailers')
        .insert({
          company_id: req.companyId,
          ...req.body,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            error: 'Conflict',
            message: 'A trailer with this registration number already exists',
          });
        }
        throw error;
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/vehicles/trailers/:id
 * Update trailer
 */
router.put(
  '/trailers/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('registration_number').optional().isString().trim().toUpperCase(),
    body('vin').optional().isString().trim(),
    body('brand').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('type').optional().isIn(['prelata', 'frigorific', 'cisterna', 'altele']),
    body('capacity_tons').optional().isFloat({ min: 0 }),
    body('volume_m3').optional().isFloat({ min: 0 }),
    body('purchase_date').optional().isISO8601(),
    body('purchase_price').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['activ', 'inactiv']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('trailers')
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
            message: 'Trailer not found',
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
 * DELETE /api/v1/vehicles/trailers/:id
 * Delete trailer (soft delete via status)
 */
router.delete(
  '/trailers/:id',
  authorize('admin'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Soft delete by setting status to 'inactiv'
      const { data, error } = await supabase
        .from('trailers')
        .update({ status: 'inactiv', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Trailer not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Trailer deactivated successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
