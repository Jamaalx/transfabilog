require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const documentRoutes = require('./routes/documents');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const uploadedDocumentsRoutes = require('./routes/uploadedDocuments');
const dkvRoutes = require('./routes/dkv');
const clientRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3001;

// Determine if we're serving the frontend
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const serveFrontend = fs.existsSync(frontendDistPath);

// Security middleware - disable CSP when serving frontend to avoid blocking Supabase
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP - Supabase requires dynamic connections
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later' },
});
app.use('/api/v1/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'floteris-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'floteris-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public configuration endpoint for frontend
// Returns only public (safe to expose) configuration values
app.get('/api/v1/config', (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({
      error: 'Configuration unavailable',
      message: 'Supabase configuration not set on server',
    });
  }

  res.json({
    supabaseUrl,
    supabaseAnonKey,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/uploaded-documents', uploadedDocumentsRoutes);
app.use('/api/v1/dkv', dkvRoutes);
app.use('/api/v1/clients', clientRoutes);

// Serve frontend static files in production
if (serveFrontend) {
  logger.info(`Serving frontend from ${frontendDistPath}`);

  // Serve static files
  app.use(express.static(frontendDistPath, {
    maxAge: '1d',
    etag: true,
  }));

  // SPA catch-all route - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return next();
    }

    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
} else {
  logger.info('Frontend dist not found, serving API only');
}

// Error handling (only for API routes when frontend is served)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
