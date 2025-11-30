const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/ai/insights
 * Get AI-generated insights for the company
 */
router.get('/insights', async (req, res, next) => {
  try {
    const result = await aiService.generateInsights(req.companyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/ai/data-summary
 * Get company data summary for display
 */
router.get('/data-summary', async (req, res, next) => {
  try {
    const summary = await aiService.getCompanyDataSummary(req.companyId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/ai/chat
 * Chat with AI about company data
 */
router.post(
  '/chat',
  [
    body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }),
    body('conversationHistory').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, conversationHistory } = req.body;
      const result = await aiService.chatWithAI(req.companyId, message, conversationHistory);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/ai/predictions
 * Get AI predictions for revenue and expenses
 */
router.get('/predictions', async (req, res, next) => {
  try {
    const result = await aiService.generatePredictions(req.companyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/ai/recommendations
 * Get AI optimization recommendations
 */
router.get('/recommendations', async (req, res, next) => {
  try {
    const result = await aiService.getOptimizationRecommendations(req.companyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
