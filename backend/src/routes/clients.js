const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize, requireAdminDb } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin database access
router.use(authenticate);
router.use(requireAdminDb);

/**
 * GET /api/v1/clients
 * List all clients with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['activ', 'inactiv', 'blocat']),
    query('client_type').optional().isIn(['client', 'furnizor', 'partener']),
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
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('company_name', { ascending: true });

      if (req.query.status) {
        dbQuery = dbQuery.eq('status', req.query.status);
      }

      if (req.query.client_type) {
        dbQuery = dbQuery.eq('client_type', req.query.client_type);
      }

      if (req.query.search) {
        dbQuery = dbQuery.or(
          `company_name.ilike.%${req.query.search}%,cui.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,phone.ilike.%${req.query.search}%`
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
 * GET /api/v1/clients/:id
 * Get single client with details
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Client not found',
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
 * POST /api/v1/clients
 * Create new client
 */
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  [
    body('company_name').isString().trim().notEmpty(),
    body('cui').optional().isString().trim(),
    body('registration_number').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('county').optional().isString().trim(),
    body('country').optional().isString().trim(),
    body('postal_code').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('website').optional().isString().trim(),
    body('contact_person').optional().isString().trim(),
    body('contact_phone').optional().isString().trim(),
    body('client_type').optional().isIn(['client', 'furnizor', 'partener']).default('client'),
    body('payment_terms').optional().isInt({ min: 0 }),
    body('credit_limit').optional().isFloat({ min: 0 }),
    body('currency').optional().isString().trim(),
    body('bank_name').optional().isString().trim(),
    body('bank_account').optional().isString().trim(),
    body('status').optional().isIn(['activ', 'inactiv', 'blocat']).default('activ'),
    body('notes').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const clientData = {
        company_id: req.companyId,
        company_name: req.body.company_name,
        cui: req.body.cui,
        registration_number: req.body.registration_number,
        address: req.body.address,
        city: req.body.city,
        county: req.body.county,
        country: req.body.country || 'Romania',
        postal_code: req.body.postal_code,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        contact_person: req.body.contact_person,
        contact_phone: req.body.contact_phone,
        client_type: req.body.client_type || 'client',
        payment_terms: req.body.payment_terms || 30,
        credit_limit: req.body.credit_limit,
        currency: req.body.currency || 'EUR',
        bank_name: req.body.bank_name,
        bank_account: req.body.bank_account,
        status: req.body.status || 'activ',
        notes: req.body.notes,
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            error: 'Conflict',
            message: 'A client with this CUI already exists',
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
 * PUT /api/v1/clients/:id
 * Update client
 */
router.put(
  '/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('company_name').optional().isString().trim().notEmpty(),
    body('cui').optional().isString().trim(),
    body('registration_number').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('county').optional().isString().trim(),
    body('country').optional().isString().trim(),
    body('postal_code').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('website').optional().isString().trim(),
    body('contact_person').optional().isString().trim(),
    body('contact_phone').optional().isString().trim(),
    body('client_type').optional().isIn(['client', 'furnizor', 'partener']),
    body('payment_terms').optional().isInt({ min: 0 }),
    body('credit_limit').optional().isFloat({ min: 0 }),
    body('currency').optional().isString().trim(),
    body('bank_name').optional().isString().trim(),
    body('bank_account').optional().isString().trim(),
    body('status').optional().isIn(['activ', 'inactiv', 'blocat']),
    body('notes').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('clients')
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
            message: 'Client not found',
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
 * DELETE /api/v1/clients/:id
 * Delete client (soft delete via status)
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
        .from('clients')
        .update({ status: 'inactiv', updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Client not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Client deactivated successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
