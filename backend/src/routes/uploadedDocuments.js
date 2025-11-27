const express = require('express');
const multer = require('multer');
const { body, query, param, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');
const {
  processDocument,
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  createTransactionFromDocument,
} = require('../services/documentProcessingService');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 50, // Max 50 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tip fișier neacceptat: ${file.mimetype}`), false);
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/uploaded-documents/types
 * Get available document types and categories
 */
router.get('/types', (req, res) => {
  const types = [
    // Financial
    { value: 'factura_intrare', label: 'Facturi de Intrare', category: 'financial', icon: 'FileInput' },
    { value: 'factura_iesire', label: 'Facturi de Ieșire', category: 'financial', icon: 'FileOutput' },
    { value: 'extras_bancar', label: 'Extrase Bancare', category: 'financial', icon: 'Building' },
    { value: 'bon_fiscal', label: 'Bonuri Fiscale', category: 'financial', icon: 'Receipt' },

    // Fuel
    { value: 'raport_dkv', label: 'Rapoarte DKV', category: 'fuel', icon: 'Fuel' },
    { value: 'raport_eurowag', label: 'Rapoarte Eurowag', category: 'fuel', icon: 'Fuel' },
    { value: 'raport_verag', label: 'Rapoarte Verag', category: 'fuel', icon: 'Fuel' },
    { value: 'raport_shell', label: 'Rapoarte Shell', category: 'fuel', icon: 'Fuel' },
    { value: 'raport_omv', label: 'Rapoarte OMV', category: 'fuel', icon: 'Fuel' },

    // Transport
    { value: 'cmr', label: 'CMR-uri', category: 'transport', icon: 'FileText' },
    { value: 'aviz_expeditie', label: 'Avize de Expediție', category: 'transport', icon: 'Truck' },
    { value: 'contract_transport', label: 'Contracte Transport', category: 'transport', icon: 'FileSignature' },

    // Fleet
    { value: 'asigurare', label: 'Asigurări (RCA/CASCO)', category: 'fleet', icon: 'Shield' },
    { value: 'itp', label: 'ITP / Inspecție Tehnică', category: 'fleet', icon: 'ClipboardCheck' },
    { value: 'rovinieta', label: 'Roviniete', category: 'fleet', icon: 'Road' },
    { value: 'tahograf', label: 'Documente Tahograf', category: 'fleet', icon: 'Clock' },

    // HR
    { value: 'contract_munca', label: 'Contracte de Muncă', category: 'hr', icon: 'Users' },
    { value: 'permis_conducere', label: 'Permise de Conducere', category: 'hr', icon: 'CreditCard' },
    { value: 'atestat', label: 'Atestate Profesionale', category: 'hr', icon: 'Award' },

    // Other
    { value: 'altele', label: 'Alte Documente', category: 'other', icon: 'File' },
  ];

  const categories = [
    { value: 'financial', label: 'Financiare', color: 'green' },
    { value: 'fuel', label: 'Combustibil', color: 'orange' },
    { value: 'transport', label: 'Transport', color: 'blue' },
    { value: 'fleet', label: 'Flotă', color: 'purple' },
    { value: 'hr', label: 'Resurse Umane', color: 'pink' },
    { value: 'other', label: 'Altele', color: 'gray' },
  ];

  res.json({ types, categories });
});

/**
 * POST /api/v1/uploaded-documents/upload
 * Upload documents of a specific type
 */
router.post(
  '/upload',
  authorize('admin', 'manager', 'operator'),
  upload.array('files', 50),
  [
    body('document_type').isString().notEmpty(),
    body('document_category').isString().notEmpty(),
    body('period_start').optional().isISO8601(),
    body('period_end').optional().isISO8601(),
    body('notes').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nu au fost încărcate fișiere' });
      }

      const { document_type, document_category, period_start, period_end, notes } = req.body;
      const uploadedDocs = [];
      const uploadErrors = [];

      for (const file of req.files) {
        try {
          const fileId = uuidv4();
          const fileExt = path.extname(file.originalname);
          const fileName = `${fileId}${fileExt}`;
          const filePath = `${req.companyId}/${document_type}/${fileName}`;

          // Upload to Supabase Storage
          const { data: storageData, error: storageError } = await supabase.storage
            .from('uploaded-documents')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (storageError) {
            // If bucket doesn't exist, continue without storage
            console.warn('Storage upload failed:', storageError.message);
          }

          // Get public URL if uploaded
          let fileUrl = null;
          if (storageData) {
            const { data: urlData } = supabase.storage
              .from('uploaded-documents')
              .getPublicUrl(filePath);
            fileUrl = urlData?.publicUrl;
          }

          // Create document record
          const documentData = {
            company_id: req.companyId,
            file_name: fileName,
            original_name: file.originalname,
            file_path: filePath,
            file_url: fileUrl,
            file_size: file.size,
            mime_type: file.mimetype,
            file_extension: fileExt.replace('.', ''),
            document_type,
            document_category,
            status: 'uploaded',
            tags: period_start || period_end ? [`${period_start || ''}-${period_end || ''}`] : [],
            notes,
            uploaded_by: req.user.id,
          };

          const { data: docRecord, error: dbError } = await supabase
            .from('uploaded_documents')
            .insert(documentData)
            .select()
            .single();

          if (dbError) throw dbError;

          uploadedDocs.push({
            id: docRecord.id,
            original_name: file.originalname,
            size: file.size,
            status: 'uploaded',
          });
        } catch (fileError) {
          uploadErrors.push({
            file: file.originalname,
            error: fileError.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `${uploadedDocs.length} fișiere încărcate cu succes`,
        uploaded: uploadedDocs,
        errors: uploadErrors,
        totalUploaded: uploadedDocs.length,
        totalErrors: uploadErrors.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/uploaded-documents/:id/process
 * Process a single document with AI
 */
router.post(
  '/:id/process',
  authorize('admin', 'manager', 'operator'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get document
      const { data: doc, error: fetchError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('id', id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (doc.status === 'processing') {
        return res.status(400).json({ error: 'Document is already being processed' });
      }

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('uploaded-documents')
        .download(doc.file_path);

      if (downloadError) {
        // If can't download from storage, return error
        return res.status(400).json({
          error: 'Nu se poate descărca fișierul pentru procesare',
          details: downloadError.message
        });
      }

      const fileBuffer = Buffer.from(await fileData.arrayBuffer());

      // Process document
      const result = await processDocument(
        id,
        req.companyId,
        fileBuffer,
        doc.original_name,
        doc.mime_type
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/uploaded-documents/process-batch
 * Process multiple documents
 */
router.post(
  '/process-batch',
  authorize('admin', 'manager', 'operator'),
  [body('document_ids').isArray().notEmpty()],
  async (req, res, next) => {
    try {
      const { document_ids } = req.body;

      // Get documents
      const { data: docs, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .in('id', document_ids)
        .eq('company_id', req.companyId);

      if (error) throw error;

      const results = [];
      const errors = [];

      for (const doc of docs) {
        try {
          // Download file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('uploaded-documents')
            .download(doc.file_path);

          if (downloadError) {
            errors.push({ id: doc.id, error: 'Cannot download file' });
            continue;
          }

          const fileBuffer = Buffer.from(await fileData.arrayBuffer());

          // Process
          const result = await processDocument(
            doc.id,
            req.companyId,
            fileBuffer,
            doc.original_name,
            doc.mime_type
          );

          if (result.success) {
            results.push(result);
          } else {
            errors.push({ id: doc.id, error: result.error });
          }
        } catch (err) {
          errors.push({ id: doc.id, error: err.message });
        }
      }

      res.json({
        success: true,
        processed: results.length,
        failed: errors.length,
        results,
        errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/uploaded-documents
 * List uploaded documents with filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isString(),
    query('document_type').optional().isString(),
    query('document_category').optional().isString(),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('truck_id').optional().isUUID(),
    query('driver_id').optional().isUUID(),
    query('search').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('uploaded_documents')
        .select(`
          *,
          truck:truck_heads(id, registration_number, brand),
          driver:drivers(id, first_name, last_name),
          trip:trips(id, origin_city, destination_city)
        `, { count: 'exact' })
        .eq('company_id', req.companyId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }
      if (req.query.document_type) {
        query = query.eq('document_type', req.query.document_type);
      }
      if (req.query.document_category) {
        query = query.eq('document_category', req.query.document_category);
      }
      if (req.query.date_from) {
        query = query.gte('document_date', req.query.date_from);
      }
      if (req.query.date_to) {
        query = query.lte('document_date', req.query.date_to);
      }
      if (req.query.truck_id) {
        query = query.eq('truck_id', req.query.truck_id);
      }
      if (req.query.driver_id) {
        query = query.eq('driver_id', req.query.driver_id);
      }
      if (req.query.search) {
        query = query.or(`original_name.ilike.%${req.query.search}%,document_number.ilike.%${req.query.search}%`);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

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
 * GET /api/v1/uploaded-documents/stats
 * Get upload statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { data: docs, error } = await supabase
      .from('uploaded_documents')
      .select('status, document_type, document_category, amount, currency')
      .eq('company_id', req.companyId);

    if (error) throw error;

    const stats = {
      total: docs.length,
      byStatus: {},
      byType: {},
      byCategory: {},
      totalAmount: 0,
    };

    docs.forEach(doc => {
      // By status
      stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;

      // By type
      if (doc.document_type) {
        stats.byType[doc.document_type] = (stats.byType[doc.document_type] || 0) + 1;
      }

      // By category
      if (doc.document_category) {
        stats.byCategory[doc.document_category] = (stats.byCategory[doc.document_category] || 0) + 1;
      }

      // Total amount
      if (doc.amount) {
        stats.totalAmount += parseFloat(doc.amount);
      }
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/uploaded-documents/:id
 * Get single document with details
 */
router.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select(`
        *,
        truck:truck_heads(id, registration_number, brand, model),
        driver:drivers(id, first_name, last_name),
        trip:trips(id, origin_city, destination_city, departure_date)
      `)
      .eq('id', req.params.id)
      .eq('company_id', req.companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/uploaded-documents/:id
 * Update document metadata
 */
router.put(
  '/:id',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('document_type').optional().isString(),
    body('document_category').optional().isString(),
    body('document_date').optional().isISO8601(),
    body('document_number').optional().isString(),
    body('amount').optional().isNumeric(),
    body('currency').optional().isString(),
    body('truck_id').optional().isUUID(),
    body('driver_id').optional().isUUID(),
    body('trip_id').optional().isUUID(),
    body('status').optional().isIn(['uploaded', 'processing', 'processed', 'failed', 'needs_review', 'archived']),
    body('notes').optional().isString(),
    body('tags').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.company_id;

      if (req.body.status === 'needs_review' || req.body.status === 'processed') {
        updateData.reviewed_by = req.user.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('uploaded_documents')
        .update(updateData)
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Document not found' });
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
 * DELETE /api/v1/uploaded-documents/:id
 * Delete document
 */
router.delete(
  '/:id',
  authorize('admin', 'manager'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      // Get document first to get file path
      const { data: doc, error: fetchError } = await supabase
        .from('uploaded_documents')
        .select('file_path')
        .eq('id', req.params.id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Document not found' });
        }
        throw fetchError;
      }

      // Delete from storage
      if (doc.file_path) {
        await supabase.storage.from('uploaded-documents').remove([doc.file_path]);
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('uploaded_documents')
        .delete()
        .eq('id', req.params.id)
        .eq('company_id', req.companyId);

      if (deleteError) throw deleteError;

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/uploaded-documents/:id/create-transaction
 * Create transaction from processed document
 */
router.post(
  '/:id/create-transaction',
  authorize('admin', 'manager'),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const transaction = await createTransactionFromDocument(
        req.params.id,
        req.companyId,
        req.user.id
      );

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/uploaded-documents/:id/confirm
 * Confirm document validation AND create expense/transaction in one step
 */
router.post(
  '/:id/confirm',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('document_number').optional().isString(),
    body('document_date').optional().isISO8601(),
    body('amount').optional().isNumeric(),
    body('currency').optional().isString(),
    body('supplier_name').optional().isString(),
    body('supplier_cui').optional().isString(),
    body('expense_category').optional().isString(),
    body('trip_id').optional().isUUID(),
    body('create_expense').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        document_number,
        document_date,
        amount,
        currency,
        supplier_name,
        supplier_cui,
        expense_category,
        trip_id,
        create_expense = true,
      } = req.body;

      // Get document
      const { data: doc, error: fetchError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('id', id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Update document with validated data
      const updateData = {
        status: 'processed',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      };

      if (document_number) updateData.document_number = document_number;
      if (document_date) updateData.document_date = document_date;
      if (amount) updateData.amount = parseFloat(amount);
      if (currency) updateData.currency = currency;
      if (supplier_name) updateData.supplier_name = supplier_name;
      if (supplier_cui) updateData.supplier_cui = supplier_cui;
      if (trip_id) updateData.trip_id = trip_id;

      const { data: updatedDoc, error: updateError } = await supabase
        .from('uploaded_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      let createdExpense = null;

      // Create expense if requested and document has amount
      if (create_expense && (amount || doc.amount)) {
        const finalAmount = amount ? parseFloat(amount) : doc.amount;
        const finalDate = document_date || doc.document_date || new Date().toISOString().split('T')[0];
        const finalCurrency = currency || doc.currency || 'EUR';

        // Determine expense category
        const category = expense_category || getExpenseCategory(doc.document_type);

        // If trip_id is provided, create trip_expense
        if (trip_id) {
          const tripExpenseData = {
            trip_id,
            category: mapToTripExpenseCategory(category),
            amount: finalAmount,
            currency: finalCurrency,
            description: `${doc.document_type} - ${document_number || doc.document_number || doc.file_name}`,
            receipt_number: document_number || doc.document_number,
            date: finalDate,
            created_by: req.user.id,
          };

          const { data: tripExpense, error: expenseError } = await supabase
            .from('trip_expenses')
            .insert(tripExpenseData)
            .select()
            .single();

          if (expenseError) {
            console.error('Error creating trip expense:', expenseError);
          } else {
            createdExpense = { type: 'trip_expense', data: tripExpense };
          }
        } else {
          // Create general transaction
          const transactionData = {
            company_id: req.companyId,
            type: doc.document_type === 'factura_iesire' ? 'income' : 'expense',
            category,
            amount: finalAmount,
            currency: finalCurrency,
            date: finalDate,
            description: `${doc.document_type} - ${document_number || doc.document_number || doc.file_name}`,
            invoice_number: document_number || doc.document_number,
            truck_id: doc.truck_id,
            driver_id: doc.driver_id,
            external_ref: id,
            created_by: req.user.id,
          };

          const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

          if (txError) {
            console.error('Error creating transaction:', txError);
          } else {
            createdExpense = { type: 'transaction', data: transaction };
          }
        }
      }

      res.json({
        success: true,
        document: updatedDoc,
        expense: createdExpense,
        message: createdExpense
          ? `Document confirmat și ${createdExpense.type === 'trip_expense' ? 'cheltuială trip' : 'tranzacție'} creată`
          : 'Document confirmat',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/uploaded-documents/:id/create-trip-expenses
 * Create trip expenses from fuel document transactions
 */
router.post(
  '/:id/create-trip-expenses',
  authorize('admin', 'manager', 'operator'),
  [
    param('id').isUUID(),
    body('trip_id').isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { trip_id } = req.body;

      // Get document
      const { data: doc, error: fetchError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('id', id)
        .eq('company_id', req.companyId)
        .single();

      if (fetchError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Verify trip exists and belongs to company
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id')
        .eq('id', trip_id)
        .eq('company_id', req.companyId)
        .single();

      if (tripError || !trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      const createdExpenses = [];
      const extractedTransactions = doc.extracted_data?.structured?.transactions || [];

      if (extractedTransactions.length > 0) {
        // Create individual trip expenses from extracted transactions
        for (const tx of extractedTransactions) {
          const expenseData = {
            trip_id,
            category: mapFuelTypeToCategory(tx.type),
            amount: tx.amount || 0,
            currency: doc.currency || 'EUR',
            description: tx.location || `${tx.type} - ${tx.truck_registration || ''}`,
            date: tx.date || doc.document_date || new Date().toISOString().split('T')[0],
            created_by: req.user.id,
          };

          const { data: expense, error } = await supabase
            .from('trip_expenses')
            .insert(expenseData)
            .select()
            .single();

          if (!error && expense) {
            createdExpenses.push(expense);
          }
        }
      } else if (doc.amount) {
        // No individual transactions, create single expense from total
        const expenseData = {
          trip_id,
          category: mapToTripExpenseCategory(getExpenseCategory(doc.document_type)),
          amount: doc.amount,
          currency: doc.currency || 'EUR',
          description: `${doc.document_type} - ${doc.document_number || doc.file_name}`,
          receipt_number: doc.document_number,
          date: doc.document_date || new Date().toISOString().split('T')[0],
          created_by: req.user.id,
        };

        const { data: expense, error } = await supabase
          .from('trip_expenses')
          .insert(expenseData)
          .select()
          .single();

        if (!error && expense) {
          createdExpenses.push(expense);
        }
      }

      // Update document status and link to trip
      await supabase
        .from('uploaded_documents')
        .update({
          status: 'processed',
          trip_id,
          reviewed_by: req.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      res.json({
        success: true,
        created_count: createdExpenses.length,
        expenses: createdExpenses,
        message: `${createdExpenses.length} cheltuieli create pentru trip`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to get expense category from document type
function getExpenseCategory(documentType) {
  const categoryMap = {
    factura_intrare: 'furnizori',
    factura_iesire: 'transport',
    raport_dkv: 'combustibil',
    raport_eurowag: 'combustibil',
    raport_verag: 'combustibil',
    raport_shell: 'combustibil',
    raport_omv: 'combustibil',
    extras_bancar: 'bancar',
    bon_fiscal: 'diverse',
    asigurare: 'asigurare',
    itp: 'mentenanta',
    rovinieta: 'taxa_drum',
  };
  return categoryMap[documentType] || 'altele';
}

// Map general category to trip_expense category
function mapToTripExpenseCategory(category) {
  const tripCategoryMap = {
    combustibil: 'combustibil',
    furnizori: 'altele',
    transport: 'altele',
    bancar: 'altele',
    diverse: 'altele',
    asigurare: 'altele',
    mentenanta: 'reparatii',
    taxa_drum: 'taxa_drum',
  };
  return tripCategoryMap[category] || 'altele';
}

// Map fuel type to trip expense category
function mapFuelTypeToCategory(fuelType) {
  const typeMap = {
    diesel: 'combustibil',
    adblue: 'combustibil',
    taxa: 'taxa_drum',
    taxa_drum: 'taxa_drum',
    parcare: 'parcare',
    altele: 'altele',
  };
  return typeMap[fuelType] || 'combustibil';
}

module.exports = router;
