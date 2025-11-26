const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/documents
 * List all documents with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('entity_type').optional().isIn(['truck', 'trailer', 'driver', 'trip', 'company']),
    query('entity_id').optional().isUUID(),
    query('doc_type').optional().isString().trim(),
    query('expiring_soon').optional().isBoolean().toBoolean(),
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
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('created_at', { ascending: false });

      if (req.query.entity_type) {
        query = query.eq('entity_type', req.query.entity_type);
      }

      if (req.query.entity_id) {
        query = query.eq('entity_id', req.query.entity_id);
      }

      if (req.query.doc_type) {
        query = query.eq('doc_type', req.query.doc_type);
      }

      // Documents expiring in next 30 days
      if (req.query.expiring_soon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query
          .not('expiry_date', 'is', null)
          .lte('expiry_date', thirtyDaysFromNow.toISOString());
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
 * GET /api/v1/documents/expiring
 * Get documents expiring soon (alerts)
 */
router.get('/expiring', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', req.companyId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/documents/:id
 * Get single document
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Document not found',
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
 * POST /api/v1/documents
 * Create new document record
 */
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  [
    body('entity_type').isIn(['truck', 'trailer', 'driver', 'trip', 'company']),
    body('entity_id').isUUID(),
    body('doc_type').isString().trim().notEmpty(),
    body('doc_number').optional().isString().trim(),
    body('issue_date').optional().isISO8601(),
    body('expiry_date').optional().isISO8601(),
    body('file_url').optional().isURL(),
    body('file_name').optional().isString().trim(),
    body('notes').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const documentData = {
        company_id: req.companyId,
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        doc_type: req.body.doc_type,
        doc_number: req.body.doc_number,
        issue_date: req.body.issue_date,
        expiry_date: req.body.expiry_date,
        file_url: req.body.file_url,
        file_name: req.body.file_name,
        notes: req.body.notes,
        uploaded_by: req.user.id,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
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
 * PUT /api/v1/documents/:id
 * Update document
 */
router.put(
  '/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('doc_type').optional().isString().trim().notEmpty(),
    body('doc_number').optional().isString().trim(),
    body('issue_date').optional().isISO8601(),
    body('expiry_date').optional().isISO8601(),
    body('file_url').optional().isURL(),
    body('file_name').optional().isString().trim(),
    body('notes').optional().isString().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, error } = await supabase
        .from('documents')
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
            message: 'Document not found',
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
 * DELETE /api/v1/documents/:id
 * Delete document
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
        .from('documents')
        .delete()
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Document not found',
          });
        }
        throw error;
      }

      res.json({ message: 'Document deleted successfully', data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/documents/upload-url
 * Get signed URL for file upload
 */
router.post(
  '/upload-url',
  authorize('admin', 'manager', 'operator'),
  [
    body('file_name').isString().trim().notEmpty(),
    body('content_type').isString().trim().notEmpty(),
    body('entity_type').isIn(['truck', 'trailer', 'driver', 'trip', 'company']),
    body('entity_id').isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { file_name, content_type, entity_type, entity_id } = req.body;

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${req.companyId}/${entity_type}/${entity_id}/${timestamp}_${sanitizedFileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUploadUrl(filePath);

      if (error) throw error;

      res.json({
        upload_url: data.signedUrl,
        file_path: filePath,
        expires_in: 3600, // 1 hour
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
