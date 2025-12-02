const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const bankStatementService = require('../services/bankStatementService');

/**
 * Process a bank statement and extract transactions
 * POST /api/bank-statements/:documentId/process
 */
router.post(
  '/:documentId/process',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  [param('documentId').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await bankStatementService.processBankStatement(
        req.params.documentId,
        req.companyId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error processing bank statement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process bank statement',
      });
    }
  }
);

/**
 * Get payments from a bank statement
 * GET /api/bank-statements/:documentId/payments
 */
router.get(
  '/:documentId/payments',
  authenticate,
  [param('documentId').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const payments = await bankStatementService.getBankStatementPayments(req.companyId, {
        bank_statement_id: req.params.documentId,
        status: req.query.status,
        type: req.query.type,
        category: req.query.category,
      });

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
      });
    }
  }
);

/**
 * Get all bank statement payments (for overview)
 * GET /api/bank-statements/payments
 */
router.get('/payments', authenticate, async (req, res) => {
  try {
    const payments = await bankStatementService.getBankStatementPayments(req.companyId, {
      status: req.query.status,
      type: req.query.type,
      category: req.query.category,
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
});

/**
 * Get statistics for a bank statement
 * GET /api/bank-statements/:documentId/stats
 */
router.get(
  '/:documentId/stats',
  authenticate,
  [param('documentId').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const stats = await bankStatementService.getBankStatementStats(
        req.companyId,
        req.params.documentId
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
      });
    }
  }
);

/**
 * Update a payment (category, matching, etc.)
 * PATCH /api/bank-statements/payments/:paymentId
 */
router.patch(
  '/payments/:paymentId',
  authenticate,
  authorize('admin', 'manager', 'operator'),
  [
    param('paymentId').isUUID(),
    body('expense_category').optional().isString(),
    body('matched_invoice_id').optional().isUUID(),
    body('truck_id').optional().isUUID(),
    body('trip_id').optional().isUUID(),
    body('status').optional().isIn(['pending', 'matched', 'confirmed', 'ignored']),
    body('notes').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const payment = await bankStatementService.updatePayment(
        req.params.paymentId,
        req.companyId,
        req.body,
        req.user.id
      );

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment',
      });
    }
  }
);

/**
 * Bulk confirm payments
 * POST /api/bank-statements/payments/confirm
 */
router.post(
  '/payments/confirm',
  authenticate,
  authorize('admin', 'manager'),
  [body('paymentIds').isArray()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const results = [];
      for (const paymentId of req.body.paymentIds) {
        try {
          const payment = await bankStatementService.updatePayment(
            paymentId,
            req.companyId,
            { status: 'confirmed' },
            req.user.id
          );
          results.push({ id: paymentId, success: true, data: payment });
        } catch (err) {
          results.push({ id: paymentId, success: false, error: err.message });
        }
      }

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error confirming payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm payments',
      });
    }
  }
);

module.exports = router;
