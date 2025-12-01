const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, isConfigured } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if Supabase is configured
const requireSupabase = (req, res, next) => {
  if (!isConfigured || !supabase) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
    });
  }
  next();
};

/**
 * POST /api/v1/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  requireSupabase,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
        });
      }

      res.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || 'operator',
          companyId: data.user.user_metadata?.company_id,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout current user
 */
router.post('/logout', requireSupabase, authenticate, async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({
        error: 'Logout failed',
        message: error.message,
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', requireSupabase, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(401).json({
        error: 'Token refresh failed',
        message: error.message,
      });
    }

    res.json({
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.userRole,
      companyId: req.companyId,
      firstName: req.user.user_metadata?.first_name,
      lastName: req.user.user_metadata?.last_name,
    },
  });
});

module.exports = router;
