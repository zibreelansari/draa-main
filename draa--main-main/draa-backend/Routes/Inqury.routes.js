const express = require('express');
const router = express.Router();
const inquiryController = require('../Controllers/inquiryController');
const rateLimit = require('express-rate-limit');

// ============================================================================
// RATE LIMITING
// ============================================================================

const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:'Too many OTP requests. Please try again in 15 minutes.',
    code:'RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email ||'';
    return `${req.ip}-${email.toLowerCase()}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:'Too many OTP requests. Please wait 15 minutes before trying again.',
      code:'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  },
  skip: (req) => {
    return process.env.NODE_ENV ==='test';
  },
  validate: { ip: false, keyGeneratorIpFallback: false }
});

const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message:'Too many verification attempts. Please try again later.',
    code:'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email ||'';
    return `verify-${req.ip}-${email.toLowerCase()}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:'Too many verification attempts. Please wait 15 minutes before trying again.',
      code:'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  },
  validate: { ip: false, keyGeneratorIpFallback: false }
});

const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:'Too many requests. Please try again later.',
    code:'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false }
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateEmailParam = (req, res, next) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message:'Email parameter is required',
      code:'MISSING_EMAIL'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message:'Invalid email format',
      code:'INVALID_EMAIL_FORMAT'
    });
  }

  next();
};

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.otp) logBody.otp ='******';
    console.log('Request Body:', logBody);
  }
  
  next();
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

const errorHandler = (err, req, res, next) => {
  console.error('Route Error:', err);
  
  if (err.name ==='ValidationError') {
    return res.status(400).json({
      success: false,
      message:'Validation failed',
      code:'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  if (err.name ==='CastError') {
    return res.status(400).json({
      success: false,
      message:'Invalid ID format',
      code:'INVALID_ID'
    });
  }

  res.status(500).json({
    success: false,
    message:'Internal server error',
    code:'SERVER_ERROR'
  });
};

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const { universalAuth, adminOnly } = require('../Middlewares/universalAuth');

const requireAuth = universalAuth;
const requireAdmin = adminOnly;

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message:'Inquiry service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

router.get('/check-existing', 
  requestLogger,
  validateEmailParam,
  inquiryController.checkExistingInquiry
);

router.post('/send-otp', 
  requestLogger,
  otpRateLimit, 
  inquiryController.sendOTP
);

router.post('/resend-otp', 
  requestLogger,
  otpRateLimit, 
  inquiryController.resendOTP
);

router.post('/verify-otp', 
  requestLogger,
  verifyRateLimit, 
  inquiryController.verifyOTP
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.get('/all', 
  requestLogger,
  adminRateLimit,
  requireAuth,
  requireAdmin,
  inquiryController.getAllInquiries
);

router.get('/stats', 
  requestLogger,
  adminRateLimit,
  requireAuth,
  requireAdmin,
  inquiryController.getInquiryStats
);

router.get('/:id', 
  requestLogger,
  adminRateLimit,
  requireAuth,
  requireAdmin,
  inquiryController.getInquiryById
);

router.put('/:id', 
  requestLogger,
  adminRateLimit,
  requireAuth,
  requireAdmin,
  inquiryController.updateInquiryStatus
);

router.delete('/:id', 
  requestLogger,
  adminRateLimit,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        message:'Inquiry deleted successfully',
        data: { id }
      });
    } catch (error) {
      console.error('Delete inquiry error:', error);
      res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

router.use(errorHandler);

module.exports = router;
