const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize, requireAdminDb } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin database access
router.use(authenticate);
router.use(requireAdminDb);

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
    body('employee_type').optional().isIn(['sofer', 'mecanic', 'portar', 'femeie_serviciu', 'asistent_manager', 'coordonator_transport', 'altele']),
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
        employee_type: req.body.employee_type || 'sofer',
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
    body('employee_type').optional().isIn(['sofer', 'mecanic', 'portar', 'femeie_serviciu', 'asistent_manager', 'coordonator_transport', 'altele']),
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

/**
 * GET /api/v1/drivers/:id/document-status
 * Get comprehensive document status for a driver with alerts and missing documents
 */
router.get('/:id/document-status', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      DRIVER_DOCUMENT_TYPES,
      getDriverDocumentStatus,
      getDocumentTypesByCategory,
    } = require('../config/driverDocumentTypes');

    // Get driver with profile flags
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (driverError || !driver) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Driver not found',
      });
    }

    // Get driver documents
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'driver')
      .eq('entity_id', req.params.id)
      .order('created_at', { ascending: false });

    if (docError) throw docError;

    // Build driver profile for conditional requirements
    const driverProfile = {
      hasInternationalRoutes: driver.has_international_routes || false,
      hasADR: driver.has_adr || false,
      hasFrigo: driver.has_frigo || false,
    };

    // Get document status with alerts
    const status = getDriverDocumentStatus(documents || [], driverProfile);

    // Return in the format expected by frontend
    res.json({
      driver: {
        id: driver.id,
        first_name: driver.first_name,
        last_name: driver.last_name,
        phone: driver.phone,
        email: driver.email,
        has_international_routes: driver.has_international_routes,
        has_adr: driver.has_adr,
        has_frigo: driver.has_frigo,
        photo_url: driver.photo_url,
      },
      status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/drivers/document-types
 * Get all available driver document types with configuration
 */
router.get('/document-types/list', async (req, res, next) => {
  try {
    const {
      getDocumentTypesForSelect,
      getDocumentTypesByCategory,
    } = require('../config/driverDocumentTypes');

    res.json({
      types: getDocumentTypesForSelect(),
      categories: getDocumentTypesByCategory(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/drivers/alerts
 * Get document alerts for all drivers in the company
 */
router.get('/alerts/all', async (req, res, next) => {
  try {
    const {
      DRIVER_DOCUMENT_TYPES,
      calculateDaysUntilExpiry,
      getAlertStatus,
    } = require('../config/driverDocumentTypes');

    // Get all drivers
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, first_name, last_name, status, has_international_routes, has_adr, has_frigo, photo_url')
      .eq('company_id', req.companyId)
      .eq('status', 'activ');

    if (driversError) throw driversError;

    // Get all documents for active drivers
    const driverIds = drivers.map(d => d.id);

    const { data: allDocuments, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'driver')
      .in('entity_id', driverIds);

    if (docError) throw docError;

    // Build flat alerts list for dashboard
    const alerts = [];
    const driversWithIssues = new Set();
    const summary = {
      totalDrivers: drivers.length,
      driversWithIssues: 0,
      expired: 0,
      critical: 0,
      urgent: 0,
      warning: 0,
      ok: 0,
    };

    // Count OK documents
    let okCount = 0;

    for (const driver of drivers) {
      const driverDocs = (allDocuments || []).filter(d => d.entity_id === driver.id);
      let driverHasIssue = false;

      for (const doc of driverDocs) {
        const config = DRIVER_DOCUMENT_TYPES[doc.doc_type];
        if (!config) continue;

        const daysUntilExpiry = calculateDaysUntilExpiry(doc.expiry_date);
        const alertStatus = getAlertStatus(daysUntilExpiry, config);

        if (alertStatus.priority > 0) {
          driverHasIssue = true;
          alerts.push({
            driverId: driver.id,
            driverName: `${driver.first_name} ${driver.last_name}`,
            documentId: doc.id,
            documentType: doc.doc_type,
            documentName: config.name,
            expiryDate: doc.expiry_date,
            daysUntilExpiry,
            ...alertStatus,
          });

          // Update summary
          if (alertStatus.status === 'expired') summary.expired++;
          else if (alertStatus.status === 'critical') summary.critical++;
          else if (alertStatus.status === 'urgent') summary.urgent++;
          else if (alertStatus.status === 'warning') summary.warning++;
        } else {
          okCount++;
        }
      }

      if (driverHasIssue) {
        driversWithIssues.add(driver.id);
      }
    }

    summary.driversWithIssues = driversWithIssues.size;
    summary.ok = okCount;

    // Sort alerts by priority (highest first), then by days until expiry
    alerts.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999);
    });

    res.json({
      summary,
      alerts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
