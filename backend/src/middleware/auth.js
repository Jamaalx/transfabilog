const { supabase, isConfigured } = require('../config/supabase');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Check if Supabase is configured
    if (!isConfigured || !supabase) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env',
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error?.message || 'No user returned');
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired token',
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.companyId = user.user_metadata?.company_id;
    req.userRole = user.user_metadata?.role || 'operator';

    // Validate company_id exists
    if (!req.companyId) {
      console.error('User missing company_id in metadata:', user.email);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User not associated with a company. Contact administrator.',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed: ' + (error.message || 'Unknown error'),
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
