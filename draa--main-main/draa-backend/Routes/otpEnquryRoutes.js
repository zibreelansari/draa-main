// routes/inquiry.js - Fully Updated with ElasticEmail and Enhanced Features
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import Models
const Inquiry = require('../Models/InquryModels');
const OTPVerification = require('../Models/otpVerificationModels');
const InquiryAnalytics = require('../Models/InquryAnalyticsModels');

// Import ElasticEmail Service
const emailService = require('../config/emailService');

//  RATE LIMITING CONFIGURATION
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OTP requests per windowMs
  message: {
    success: false,
    message:'Too many OTP requests. Please try again after 15 minutes.',
    code:'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message:'Too many verification attempts. Please try again after 15 minutes.',
    code:'VERIFY_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//  VALIDATION MIDDLEWARE
const validateSendOTP = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email address too long'),

  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),

  body('source')
    .optional()
    .isIn(['popup','contact_form','landing_page','direct'])
    .withMessage('Invalid source type')
];

const validateVerifyOTP = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('otp')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('OTP must be exactly 6 digits')
];

const validateResendOTP = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
];

//  HELPER FUNCTIONS
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
'127.0.0.1';
}

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message:'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      })),
      code:'VALIDATION_ERROR'
    });
  }
  next();
}

//  ASYNC ERROR HANDLER
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

//  SEND OTP ENDPOINT - Fully Updated with ElasticEmail
router.post('/send-otp',
  otpRateLimit,
  validateSendOTP,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, phone, source ='popup' } = req.body;

    try {
      // Check if user already exists and is verified
      const existingInquiry = await Inquiry.findByEmail(email);
      if (existingInquiry && existingInquiry.isVerified) {
        return res.status(409).json({
          success: false,
          message:'An inquiry with this email already exists and is verified',
          code:'EMAIL_ALREADY_EXISTS'
        });
      }

      // Check for existing active OTP
      const existingOTP = await OTPVerification.getActiveOTPByEmail(email);
      if (existingOTP && !existingOTP.canResend()) {
        const waitTime = Math.ceil((60000 - (new Date() - existingOTP.lastSentAt)) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP`,
          code:'OTP_COOLDOWN_ACTIVE',
          waitTime
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Get client info
      const ipAddress = getClientIP(req);
      const userAgent = req.headers['user-agent'] ||'Unknown';

      const userData = {
        name: name.trim(),
        phone: phone.trim(),
        source,
        userAgent,
        ipAddress
      };

      // Create or update OTP record
      const otpData = {
        email: email.toLowerCase().trim(),
        otp,
        userData,
        expiresAt,
        ipAddress,
        userAgent
      };

      let otpRecord;
      if (existingOTP) {
        // Update existing OTP
        Object.assign(existingOTP, otpData);
        existingOTP.sentCount += 1;
        existingOTP.lastSentAt = new Date();
        existingOTP.attempts = 0; // Reset attempts
        otpRecord = await existingOTP.save();
      } else {
        // Create new OTP record
        otpRecord = await OTPVerification.create(otpData);
      }

      //  Send OTP email using ElasticEmail
      try {
        const emailResult = await emailService.sendOTPEmail(
          email.toLowerCase().trim(),
          otp,
          userData
        );

        console.log(' OTP email sent successfully:', {
          email: email.toLowerCase().trim(),
          messageId: emailResult.messageId || emailResult.transactionId,
          timestamp: new Date().toISOString()
        });

        // Log successful OTP generation for analytics
        console.log(' OTP Generated:', {
          email: email.toLowerCase().trim(),
          source,
          ipAddress,
          userAgent: userAgent.substring(0, 50),
          otpId: otpRecord._id
        });

        res.status(200).json({
          success: true,
          message:'OTP sent successfully to your email address',
          data: {
            email: email.toLowerCase().trim(),
            expiresIn: 600, // 10 minutes in seconds
            canResendAfter: 60 // 60 seconds
          },
          code:'OTP_SENT_SUCCESS'
        });

      } catch (emailError) {
        console.error(' Failed to send OTP email:', {
          error: emailError.message,
          email: email.toLowerCase().trim(),
          stack: emailError.stack
        });

        // Clean up OTP record if email failed and it's a new record
        if (!existingOTP) {
          await OTPVerification.deleteOne({ _id: otpRecord._id });
        }

        return res.status(503).json({
          success: false,
          message:'Failed to send OTP email. Please check your email address and try again.',
          code:'EMAIL_DELIVERY_FAILED'
        });
      }

    } catch (error) {
      console.error(' Send OTP endpoint error:', {
        error: error.message,
        stack: error.stack,
        email: email?.toLowerCase().trim(),
        timestamp: new Date().toISOString()
      });

      // Handle specific MongoDB errors
      if (error.name ==='ValidationError') {
        return res.status(400).json({
          success: false,
          message:'Data validation failed',
          errors: Object.values(error.errors).map(err => err.message),
          code:'MONGODB_VALIDATION_ERROR'
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:'Duplicate entry detected',
          code:'DUPLICATE_ENTRY_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message:'Server error occurred while processing your request. Please try again later.',
        code:'INTERNAL_SERVER_ERROR'
      });
    }
  })
);

//  VERIFY OTP ENDPOINT - Fully Updated with ElasticEmail
router.post('/verify-otp',
  verifyRateLimit,
  validateVerifyOTP,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    try {
      // Find valid OTP
      const otpRecord = await OTPVerification.findValidOTP(email, otp);

      if (!otpRecord) {
        // Check if there's any OTP record for this email
        const anyOTP = await OTPVerification.findOne({
          email: email.toLowerCase().trim()
        }).sort({ createdAt: -1 });

        let errorMessage ='Invalid or expired OTP';
        let errorCode ='OTP_INVALID';

        if (!anyOTP) {
          errorMessage ='No OTP found for this email. Please request a new OTP.';
          errorCode ='OTP_NOT_FOUND';
        } else if (anyOTP.isUsed) {
          errorMessage ='This OTP has already been used. Please request a new OTP.';
          errorCode ='OTP_ALREADY_USED';
        } else if (anyOTP.expiresAt < new Date()) {
          errorMessage ='OTP has expired. Please request a new OTP.';
          errorCode ='OTP_EXPIRED';
        }

        return res.status(400).json({
          success: false,
          message: errorMessage,
          code: errorCode
        });
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        await otpRecord.deleteOne();
        return res.status(429).json({
          success: false,
          message:'Too many failed attempts. Please request a new OTP.',
          code:'MAX_ATTEMPTS_EXCEEDED'
        });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        await otpRecord.incrementAttempts();
        const remainingAttempts = 5 - otpRecord.attempts;

        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          code:'OTP_MISMATCH',
          remainingAttempts
        });
      }

      // Check if inquiry already exists
      let inquiry = await Inquiry.findByEmail(email);

      if (inquiry) {
        // Update existing inquiry
        inquiry.name = otpRecord.userData.name;
        inquiry.phone = otpRecord.userData.phone;
        inquiry.isVerified = true;
        inquiry.verifiedAt = new Date();
        inquiry.source = otpRecord.userData.source;
        inquiry.userAgent = otpRecord.userData.userAgent;
        inquiry.ipAddress = otpRecord.userData.ipAddress;

        // Update status if it was previously unverified
        if (inquiry.status ==='new' && !inquiry.isVerified) {
          inquiry.status ='new';
        }
      } else {
        // Create new inquiry
        inquiry = new Inquiry({
          name: otpRecord.userData.name,
          email: email.toLowerCase().trim(),
          phone: otpRecord.userData.phone,
          isVerified: true,
          verifiedAt: new Date(),
          source: otpRecord.userData.source,
          userAgent: otpRecord.userData.userAgent,
          ipAddress: otpRecord.userData.ipAddress,
          status:'new',
          priority:'medium'
        });
      }

      await inquiry.save();

      // Mark OTP as used
      await otpRecord.markAsUsed();

      // Generate daily analytics asynchronously
      setImmediate(async () => {
        try {
          await InquiryAnalytics.generateDailyReport();
        } catch (analyticsError) {
          console.error(' Analytics generation failed:', analyticsError.message);
        }
      });

      console.log(' New verified inquiry:', {
        id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        source: inquiry.source,
        timestamp: new Date().toISOString()
      });

      //  Send confirmation email using ElasticEmail
      setImmediate(async () => {
        try {
          const emailResult = await emailService.sendConfirmationEmail(
            email.toLowerCase().trim(),
            {
              name: inquiry.name,
              inquiryId: inquiry._id
            }
          );

          console.log(' Confirmation email sent successfully:', {
            email: email.toLowerCase().trim(),
            messageId: emailResult.messageId || emailResult.transactionId
          });
        } catch (emailError) {
          console.error(' Failed to send confirmation email:', {
            error: emailError.message,
            email: email.toLowerCase().trim()
          });
          // Don't fail the request if confirmation email fails
        }
      });

      res.status(200).json({
        success: true,
        message:'Email verified successfully! Your inquiry has been submitted. We will contact you soon.',
        data: {
          inquiryId: inquiry._id,
          name: inquiry.name,
          email: inquiry.email,
          verifiedAt: inquiry.verifiedAt,
          status: inquiry.status
        },
        code:'VERIFICATION_SUCCESS'
      });

    } catch (error) {
      console.error(' Verify OTP endpoint error:', {
        error: error.message,
        stack: error.stack,
        email: email?.toLowerCase().trim(),
        timestamp: new Date().toISOString()
      });

      // Handle specific MongoDB errors
      if (error.name ==='ValidationError') {
        return res.status(400).json({
          success: false,
          message:'Data validation failed',
          errors: Object.values(error.errors).map(err => err.message),
          code:'MONGODB_VALIDATION_ERROR'
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:'Duplicate inquiry detected',
          code:'DUPLICATE_INQUIRY_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message:'Server error occurred while verifying OTP. Please try again later.',
        code:'INTERNAL_SERVER_ERROR'
      });
    }
  })
);

//  RESEND OTP ENDPOINT - Fully Updated with ElasticEmail
router.post('/resend-otp',
  otpRateLimit,
  validateResendOTP,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
      const otpRecord = await OTPVerification.getActiveOTPByEmail(email);

      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          message:'No active OTP session found. Please start over by requesting a new OTP.',
          code:'OTP_SESSION_NOT_FOUND'
        });
      }

      if (!otpRecord.canResend()) {
        const timeSinceLastSent = new Date() - otpRecord.lastSentAt;
        const waitTime = Math.ceil((60000 - timeSinceLastSent) / 1000);

        if (otpRecord.sentCount >= 5) {
          return res.status(429).json({
            success: false,
            message:'Maximum resend limit reached. Please start over by requesting a new OTP.',
            code:'MAX_RESEND_LIMIT_EXCEEDED'
          });
        }

        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP`,
          code:'RESEND_COOLDOWN_ACTIVE',
          waitTime
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      otpRecord.otp = otp;
      otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      otpRecord.attempts = 0;
      otpRecord.sentCount += 1;
      otpRecord.lastSentAt = new Date();

      await otpRecord.save();

      //  Send resend OTP email using ElasticEmail
      try {
        const emailResult = await emailService.sendResendOTPEmail(
          email.toLowerCase().trim(),
          otp,
          otpRecord.userData
        );

        console.log(' Resend OTP email sent successfully:', {
          email: email.toLowerCase().trim(),
          messageId: emailResult.messageId || emailResult.transactionId,
          sentCount: otpRecord.sentCount,
          timestamp: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message:'New OTP sent successfully to your email address',
          data: {
            email: email.toLowerCase().trim(),
            expiresIn: 600, // 10 minutes in seconds
            canResendAfter: 60, // 60 seconds
            resendCount: otpRecord.sentCount,
            maxResends: 5
          },
          code:'OTP_RESENT_SUCCESS'
        });

      } catch (emailError) {
        console.error(' Failed to send resend OTP email:', {
          error: emailError.message,
          email: email.toLowerCase().trim(),
          stack: emailError.stack
        });

        return res.status(503).json({
          success: false,
          message:'Failed to send new OTP email. Please try again.',
          code:'EMAIL_DELIVERY_FAILED'
        });
      }

    } catch (error) {
      console.error(' Resend OTP endpoint error:', {
        error: error.message,
        stack: error.stack,
        email: email?.toLowerCase().trim(),
        timestamp: new Date().toISOString()
      });

      res.status(500).json({
        success: false,
        message:'Server error occurred while resending OTP. Please try again later.',
        code:'INTERNAL_SERVER_ERROR'
      });
    }
  })
);

//  GET INQUIRIES - Enhanced Admin endpoint
router.get('/inquiries', asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      search,
      sortBy ='createdAt',
      sortOrder ='desc',
      isVerified,
      priority
    } = req.query;

    const query = {};

    // Build query filters
    if (status && status !=='all') {
      query.status = status;
    }

    if (source && source !=='all') {
      query.source = source;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified ==='true';
    }

    if (priority && priority !=='all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options:'i' } },
        { email: { $regex: search, $options:'i' } },
        { phone: { $regex: search, $options:'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('assignedTo','name email')
        .sort(sort)
        .limit(limitNumber)
        .skip(skip)
        .lean(),
      Inquiry.countDocuments(query)
    ]);

    // Get status breakdown for current filters (excluding status filter)
    const statusQuery = { ...query };
    delete statusQuery.status;

    const statusBreakdown = await Inquiry.aggregate([
      { $match: statusQuery },
      { $group: { _id:'$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        inquiries,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalRecords: total,
          recordsPerPage: limitNumber,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPreviousPage: pageNumber > 1
        },
        filters: {
          status,
          source,
          search,
          isVerified,
          priority
        },
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      code:'INQUIRIES_RETRIEVED_SUCCESS'
    });

  } catch (error) {
    console.error(' Get inquiries error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      message:'Failed to retrieve inquiries',
      code:'INQUIRIES_RETRIEVAL_ERROR'
    });
  }
}));

//  ANALYTICS ENDPOINT - Enhanced
router.get('/analytics', asyncHandler(async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNumber = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNumber);
    startDate.setHours(0, 0, 0, 0);

    // Get analytics data
    const analytics = await InquiryAnalytics.find({
      date: { $gte: startDate }
    }).sort({ date: -1 }).lean();

    // Get summary stats with parallel queries
    const [
      totalInquiries,
      verifiedInquiries,
      convertedInquiries,
      pendingFollowUps,
      sourceBreakdown,
      statusBreakdown,
      recentInquiries
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ isVerified: true }),
      Inquiry.countDocuments({ isConverted: true }),
      Inquiry.find({
        nextFollowUpAt: { $lte: new Date() },
        status: { $in: ['new','contacted','qualified'] }
      }).countDocuments(),
      Inquiry.aggregate([
        { $group: { _id:'$source', count: { $sum: 1 } } }
      ]),
      Inquiry.aggregate([
        { $group: { _id:'$status', count: { $sum: 1 } } }
      ]),
      Inquiry.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email status createdAt source')
        .lean()
    ]);

    // Calculate conversion rates
    const verificationRate = totalInquiries > 0 ? (verifiedInquiries / totalInquiries) * 100 : 0;
    const conversionRate = verifiedInquiries > 0 ? (convertedInquiries / verifiedInquiries) * 100 : 0;

    // Format source and status breakdowns
    const formattedSourceBreakdown = sourceBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const formattedStatusBreakdown = statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        dailyAnalytics: analytics,
        summary: {
          totalInquiries,
          verifiedInquiries,
          convertedInquiries,
          pendingFollowUps,
          verificationRate: parseFloat(verificationRate.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2))
        },
        breakdowns: {
          source: formattedSourceBreakdown,
          status: formattedStatusBreakdown
        },
        recentInquiries,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days: daysNumber
        }
      },
      code:'ANALYTICS_RETRIEVED_SUCCESS'
    });

  } catch (error) {
    console.error(' Analytics error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      message:'Failed to retrieve analytics data',
      code:'ANALYTICS_RETRIEVAL_ERROR'
    });
  }
}));

//  UPDATE INQUIRY STATUS - New endpoint for admin management
router.put('/inquiries/:id/status',
  body('status').isIn(['new','contacted','qualified','enrolled','rejected','closed']),
  body('notes').optional().isLength({ max: 1000 }),
  body('assignedTo').optional().isMongoId(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, assignedTo } = req.body;

      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:'Inquiry not found',
          code:'INQUIRY_NOT_FOUND'
        });
      }

      // Update inquiry status
      await inquiry.updateStatus(status, assignedTo);

      // Add note if provided
      if (notes) {
        await inquiry.addNote(notes, assignedTo || null,'note');
      }

      res.status(200).json({
        success: true,
        message:'Inquiry status updated successfully',
        data: {
          inquiryId: inquiry._id,
          oldStatus: inquiry.status,
          newStatus: status,
          updatedAt: new Date()
        },
        code:'STATUS_UPDATE_SUCCESS'
      });

    } catch (error) {
      console.error(' Update inquiry status error:', {
        error: error.message,
        inquiryId: req.params.id,
        timestamp: new Date().toISOString()
      });

      res.status(500).json({
        success: false,
        message:'Failed to update inquiry status',
        code:'STATUS_UPDATE_ERROR'
      });
    }
  })
);

//  GLOBAL ERROR HANDLER MIDDLEWARE
router.use((error, req, res, next) => {
  console.error(' Inquiry route error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: getClientIP(req),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name ==='ValidationError') {
    return res.status(400).json({
      success: false,
      message:'Data validation failed',
      errors: Object.values(error.errors).map(err => err.message),
      code:'VALIDATION_ERROR'
    });
  }

  if (error.name ==='CastError') {
    return res.status(400).json({
      success: false,
      message:'Invalid ID format',
      code:'INVALID_ID_FORMAT'
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message:'Duplicate entry detected',
      code:'DUPLICATE_ENTRY_ERROR'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message:'An unexpected error occurred. Please try again later.',
    code:'INTERNAL_SERVER_ERROR'
  });
});

module.exports = router;
