const { supabase, supabaseAdmin, isConfigured } = require('../config/supabase');

// Test company ID for development fallback (from TEST_CREDENTIALS.md)
const TEST_COMPANY_ID = '11111111-1111-1111-1111-111111111111';

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

    // If company_id not in metadata, try to get from user_profiles table
    if (!req.companyId && supabaseAdmin) {
      try {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          req.companyId = profile.company_id;
        }
      } catch (profileErr) {
        console.warn('Could not fetch user profile:', profileErr.message);
      }
    }

    // In development, fall back to test company ID if still missing
    if (!req.companyId && process.env.NODE_ENV === 'development') {
      console.warn(`User ${user.email} missing company_id, using test company ID for development`);
      req.companyId = TEST_COMPANY_ID;
    }

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
