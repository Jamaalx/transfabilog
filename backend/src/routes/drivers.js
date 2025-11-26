const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/drivers
 * List all drivers with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['activ', 'inactiv', 'concediu']),
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
        .from('drivers')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('last_name', { ascending: true });

      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }

      if (req.query.search) {
        query = query.or(
          `first_name.ilike.%${req.query.search}%,last_name.ilike.%${req.query.search}%,phone.ilike.%${req.query.search}%`
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
 * GET /api/v1/drivers/:id
 * Get single driver with details
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Driver not found',
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
 * POST /api/v1/drivers
 * Create new driver
 */
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  [
    body('first_name').isString().trim().notEmpty(),
    body('last_name').isString().trim().notEmpty(),
    body('cnp').optional().isString().trim().isLength({ min: 13, max: 13 }),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().isString().trim(),
    body('license_number').optional().isString().trim(),
    body('license_categories').optional().isArray(),
    body('license_expiry').optional().isISO8601(),
    body('medical_expiry').optional().isISO8601(),
    body('hire_date').optional().isISO8601(),
    body('salary_base').optional().isFloat({ min: 0 }),
    body('diurna_rate').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['activ', 'inactiv', 'concediu']).default('activ'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const driverData = {
        company_id: req.companyId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        cnp: req.body.cnp,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        license_number: req.body.license_number,
        license_categories: req.body.license_categories,
        license_expiry: req.body.license_expiry,
        medical_expiry: req.body.medical_expiry,
        hire_date: req.body.hire_date,
        salary_base: req.body.salary_base,
        diurna_rate: req.body.diurna_rate,
        status: req.body.status || 'activ',
      };

      const { data, error } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            error: 'Conflict',
            message: 'A driver with this CNP already exists',
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
 * PUT /api/v1/drivers/:id
 * Update driver
 */
router.put(
  '/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('first_name').optional().isString().trim().notEmpty(),
    body('last_name').optional().isString().trim().notEmpty(),
    body('cnp').optional().isString().trim().isLength({ min: 13, max: 13 }),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().isString().trim(),
    body('license_number').optional().isString().trim(),
    body('license_categories').optional().isArray(),
    body('license_expiry').optional().isISO8601(),
    body('medical_expiry').optional().isISO8601(),
    body('hire_date').optional().isISO8601(),
    body('salary_base').optional().isFloat({ min: 0 }),
    body('diurna_rate').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['activ', 'inactiv', 'concediu']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('drivers')
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
            message: 'Driver not found',
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
 * DELETE /api/v1/drivers/:id
 * Delete driver (soft delete via status)
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

      // Soft delete by setting status to 'inactiv'
      const { data, error } = await supabase
        .from('drivers')
        .update({ status: 'inactiv', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Driver not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Driver deactivated successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/drivers/:id/documents
 * Get driver documents (license, medical, etc.)
 */
router.get('/:id/documents', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // First verify driver belongs to company
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (driverError || !driver) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Driver not found',
      });
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'driver')
      .eq('entity_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
