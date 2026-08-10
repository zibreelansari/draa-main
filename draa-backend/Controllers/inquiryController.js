const Inquiry = require('../Models/InquryModels');
const nodemailer = require('nodemailer');

//  Configure Nodemailer for webmail
const { inquiryTransporter: transporter } = require("../utils/mailConfig");

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error(' Email service error:', error);
  } else {
    console.log(' Email service connected - draa.in');
  }
});

class InquiryController {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get client IP address
  getClientIP(req) {
    return req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
'127.0.0.1';
  }

  // ==================== PUBLIC METHODS ====================

  // Check if inquiry already exists
  async checkExistingInquiry(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:'Email is required',
          code:'MISSING_EMAIL'
        });
      }

      const existingInquiry = await Inquiry.findOne({
        email: email.toLowerCase().trim(),
        isVerified: true
      });

      return res.json({
        success: true,
        exists: !!existingInquiry,
        data: existingInquiry ? {
          submittedAt: existingInquiry.verifiedAt || existingInquiry.createdAt,
          status: existingInquiry.status
        } : null
      });
    } catch (error) {
      console.error('Check existing error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Send OTP for new inquiry
  async sendOTP(req, res) {
    try {
      const { name, email, phone, source ='popup' } = req.body;
      const ipAddress = this.getClientIP(req);
      const userAgent = req.get('User-Agent');

      //  Validation
      const errors = [];
      if (!name || name.trim().length < 2 || name.trim().length > 50) {
        errors.push({ field:'name', message:'Name must be between 2 and 50 characters' });
      }
      if (!/^[a-zA-Z\s]+$/.test(name?.trim())) {
        errors.push({ field:'name', message:'Name can only contain letters and spaces' });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push({ field:'email', message:'Please enter a valid email address' });
      }
      if (!phone || !/^[0-9]{10}$/.test(phone.replace(/\s/g,''))) {
        errors.push({ field:'phone', message:'Please enter a valid 10-digit phone number' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message:'Validation failed',
          code:'VALIDATION_ERROR',
          errors
        });
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check if already verified
      const existingVerified = await Inquiry.findOne({
        email: cleanEmail,
        isVerified: true
      });

      if (existingVerified) {
        return res.status(409).json({
          success: false,
          message:'An inquiry with this email already exists and is verified',
          code:'EMAIL_ALREADY_EXISTS'
        });
      }

      // Find or create inquiry
      let inquiry = await Inquiry.findOne({
        email: cleanEmail,
        isVerified: false
      });

      if (inquiry) {
        // Check cooldown period
        if (inquiry.lastOtpSentAt) {
          const timeDiff = (new Date() - inquiry.lastOtpSentAt) / 1000;
          if (timeDiff < 60) {
            const remainingTime = Math.ceil(60 - timeDiff);
            return res.status(429).json({
              success: false,
              message: `Please wait ${remainingTime} seconds before requesting a new OTP`,
              code:'OTP_COOLDOWN_ACTIVE',
              waitTime: remainingTime
            });
          }
        }

        // Check resend limit
        if (inquiry.resendCount >= 5) {
          return res.status(429).json({
            success: false,
            message:'Maximum OTP resend limit reached. Please try again later.',
            code:'RESEND_LIMIT_EXCEEDED'
          });
        }

        // Update existing inquiry
        inquiry.name = name.trim();
        inquiry.phone = phone.replace(/\s/g,'');
        inquiry.source = source;
        inquiry.ipAddress = ipAddress;
        inquiry.userAgent = userAgent;
        inquiry.resendCount = (inquiry.resendCount || 0) + 1;
      } else {
        // Create new inquiry
        inquiry = new Inquiry({
          name: name.trim(),
          email: cleanEmail,
          phone: phone.replace(/\s/g,''),
          source,
          ipAddress,
          userAgent,
          resendCount: 1
        });
      }

      // Generate and set OTP
      const otp = this.generateOTP();
      inquiry.otp = otp;
      inquiry.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      inquiry.otpAttempts = 0;
      inquiry.lastOtpSentAt = new Date();

      await inquiry.save();

      // Send OTP email
      try {
        await this.sendOtpEmail(cleanEmail, inquiry.name, otp);

        return res.json({
          success: true,
          message:'OTP sent successfully to your email address',
          data: {
            canResendAfter: 60,
            expiresIn: 600,
            remainingAttempts: 5
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);

        // Reset OTP if email fails
        inquiry.otp = undefined;
        inquiry.otpExpiry = undefined;
        inquiry.lastOtpSentAt = undefined;
        await inquiry.save();

        return res.status(500).json({
          success: false,
          message:'Failed to send OTP email. Please try again.',
          code:'EMAIL_SEND_FAILED'
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred. Please try again.',
        code:'SERVER_ERROR'
      });
    }
  }

  // Resend OTP
  async resendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:'Email is required',
          code:'MISSING_EMAIL'
        });
      }

      const inquiry = await Inquiry.findOne({
        email: email.toLowerCase().trim(),
        isVerified: false
      });

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:'No pending inquiry found for this email',
          code:'INQUIRY_NOT_FOUND'
        });
      }

      // Check cooldown
      if (inquiry.lastOtpSentAt) {
        const timeDiff = (new Date() - inquiry.lastOtpSentAt) / 1000;
        if (timeDiff < 60) {
          const remainingTime = Math.ceil(60 - timeDiff);
          return res.status(429).json({
            success: false,
            message: `Please wait ${remainingTime} seconds before requesting a new OTP`,
            code:'RESEND_COOLDOWN_ACTIVE',
            waitTime: remainingTime
          });
        }
      }

      // Check resend limit
      if (inquiry.resendCount >= 5) {
        return res.status(429).json({
          success: false,
          message:'Maximum resend limit reached for today',
          code:'RESEND_LIMIT_EXCEEDED'
        });
      }

      // Generate new OTP
      const otp = this.generateOTP();
      inquiry.otp = otp;
      inquiry.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      inquiry.otpAttempts = 0;
      inquiry.lastOtpSentAt = new Date();
      inquiry.resendCount += 1;

      await inquiry.save();

      // Send OTP email
      try {
        await this.sendOtpEmail(inquiry.email, inquiry.name, otp);

        return res.json({
          success: true,
          message:'New OTP sent successfully',
          data: {
            canResendAfter: 60,
            expiresIn: 600,
            resendCount: inquiry.resendCount
          }
        });
      } catch (emailError) {
        console.error('Resend email failed:', emailError);
        return res.status(500).json({
          success: false,
          message:'Failed to send OTP email',
          code:'EMAIL_SEND_FAILED'
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Verify OTP and complete inquiry
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:'Email and OTP are required',
          code:'MISSING_FIELDS'
        });
      }

      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message:'OTP must be exactly 6 digits',
          code:'INVALID_OTP_FORMAT'
        });
      }

      const inquiry = await Inquiry.findOne({
        email: email.toLowerCase().trim(),
        isVerified: false
      });

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:'No pending inquiry found for this email',
          code:'INQUIRY_NOT_FOUND'
        });
      }

      // Check if OTP is expired
      if (inquiry.otpExpiry && new Date() > inquiry.otpExpiry) {
        return res.status(410).json({
          success: false,
          message:'OTP has expired. Please request a new one.',
          code:'OTP_EXPIRED'
        });
      }

      // Check attempt limit
      if (inquiry.otpAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message:'Too many failed attempts. Please request a new OTP.',
          code:'MAX_ATTEMPTS_EXCEEDED'
        });
      }

      // Verify OTP
      if (inquiry.otp !== otp.trim()) {
        inquiry.otpAttempts += 1;
        inquiry.lastOtpAttemptAt = new Date();
        await inquiry.save();

        return res.status(400).json({
          success: false,
          message:'Invalid OTP',
          code:'OTP_MISMATCH',
          remainingAttempts: 5 - inquiry.otpAttempts
        });
      }

      // OTP is valid - mark as verified
      inquiry.isVerified = true;
      inquiry.verifiedAt = new Date();
      inquiry.status ='verified';
      inquiry.otp = undefined;
      inquiry.otpExpiry = undefined;
      inquiry.otpAttempts = 0;

      await inquiry.save();

      // Send welcome email
      try {
        await this.sendWelcomeEmail(inquiry.email, inquiry.name);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }

      // Send admin notification
      try {
        await this.sendAdminNotification({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          source: inquiry.source,
          verifiedAt: inquiry.verifiedAt,
        });
      } catch (emailError) {
        console.error('Admin notification failed:', emailError);
      }

      return res.json({
        success: true,
        message:'Email verified successfully! Thank you for your inquiry.',
        data: {
          inquiryId: inquiry._id,
          name: inquiry.name,
          email: inquiry.email,
          verifiedAt: inquiry.verifiedAt,
          status: inquiry.status
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Get all inquiries (Admin)
  async getAllInquiries(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        isVerified,
        search,
        startDate,
        endDate,
        sortBy ='createdAt',
        sortOrder ='desc'
      } = req.query;

      const query = {};

      if (status) query.status = status;
      if (isVerified !== undefined) query.isVerified = isVerified ==='true';
      if (search) {
        query.$or = [
          { name: { $regex: search, $options:'i' } },
          { email: { $regex: search, $options:'i' } },
          { phone: { $regex: search, $options:'i' } }
        ];
      }
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const sort = {};
      sort[sortBy] = sortOrder ==='desc' ? -1 : 1;

      const totalCount = await Inquiry.countDocuments(query);
      const inquiries = await Inquiry.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('assignedTo','name email');

      return res.json({
        success: true,
        data: inquiries,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get all inquiries error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Get inquiry by ID
  async getInquiryById(req, res) {
    try {
      const { id } = req.params;

      const inquiry = await Inquiry.findById(id)
        .populate('assignedTo','name email');

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:'Inquiry not found',
          code:'INQUIRY_NOT_FOUND'
        });
      }

      return res.json({
        success: true,
        data: inquiry
      });
    } catch (error) {
      console.error('Get inquiry by ID error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Update inquiry status
  async updateInquiryStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, assignedTo, followUpDate, priority } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (notes) updateData.notes = notes;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (followUpDate) updateData.followUpDate = new Date(followUpDate);
      if (priority) updateData.priority = priority;

      const inquiry = await Inquiry.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo','name email');

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:'Inquiry not found',
          code:'INQUIRY_NOT_FOUND'
        });
      }

      return res.json({
        success: true,
        message:'Inquiry updated successfully',
        data: inquiry
      });
    } catch (error) {
      console.error('Update inquiry error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // Get inquiry statistics
  async getInquiryStats(req, res) {
    try {
      const stats = await Inquiry.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status','pending'] }, 1, 0] } },
            contacted: { $sum: { $cond: [{ $eq: ['$status','contacted'] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $eq: ['$status','closed'] }, 1, 0] } }
          }
        }
      ]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayStats = await Inquiry.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart }
          }
        },
        {
          $group: {
            _id: null,
            todayTotal: { $sum: 1 },
            todayVerified: { $sum: { $cond: ['$isVerified', 1, 0] } }
          }
        }
      ]);

      return res.json({
        success: true,
        data: {
          ...(stats[0] || { total: 0, verified: 0, pending: 0, contacted: 0, closed: 0 }),
          ...(todayStats[0] || { todayTotal: 0, todayVerified: 0 })
        }
      });
    } catch (error) {
      console.error('Get inquiry stats error:', error);
      return res.status(500).json({
        success: false,
        message:'Server error occurred',
        code:'SERVER_ERROR'
      });
    }
  }

  // ==================== EMAIL METHODS ====================

  // Send OTP Email
  async sendOtpEmail(email, name, otp) {
    const mailOptions = {
      from:'"Draa" <inquiry@draa.in>',
      to: email,
      subject:'Verify Your Email - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7f9fc; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Draa</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Education Document Solutions</p>
          </div>

          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${name}! </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Please verify your email address using the OTP below:
            </p>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0;">
              <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <div style="background: white; color: #667eea; font-size: 36px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 8px; font-family:'Courier New', monospace;">
                ${otp}
              </div>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong> Important:</strong> Valid for <strong>10 minutes</strong> only. Do not share this code.
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Draa. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }

  // Send Welcome Email
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from:'"Draa Team" <inquiry@draa.in>',
      to: email,
      subject:'Welcome to Draa - Inquiry Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7f9fc; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 32px;"> Welcome!</h1>
          </div>

          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Thank You, ${name}! </h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
              Your inquiry has been <strong>successfully verified</strong>. Our team will review and contact you within 24-48 hours.
            </p>

            <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 5px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;"> What Happens Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                <li>Our team will review within <strong>24-48 hours</strong></li>
                <li>You'll receive a personalized response</li>
                <li>We'll guide you through next steps</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Draa.</p>
          </div>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }

  // Send Admin Notification
  async sendAdminNotification(inquiryData) {
    const mailOptions = {
      from:'"Draa System" <inquiry@draa.in>',
      to:'admin@draa.in',
      subject: ` New Inquiry: ${inquiryData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;"> New Verified Inquiry</h2>
          </div>

          <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #ecf0f1;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${inquiryData.name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${inquiryData.email}</td>
              </tr>
              <tr style="background: #ecf0f1;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Phone:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${inquiryData.phone}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }
}

// Create instance and bind methods
const inquiryController = new InquiryController();

module.exports = {
  checkExistingInquiry: inquiryController.checkExistingInquiry.bind(inquiryController),
  sendOTP: inquiryController.sendOTP.bind(inquiryController),
  resendOTP: inquiryController.resendOTP.bind(inquiryController),
  verifyOTP: inquiryController.verifyOTP.bind(inquiryController),
  getAllInquiries: inquiryController.getAllInquiries.bind(inquiryController),
  getInquiryById: inquiryController.getInquiryById.bind(inquiryController),
  updateInquiryStatus: inquiryController.updateInquiryStatus.bind(inquiryController),
  getInquiryStats: inquiryController.getInquiryStats.bind(inquiryController)
};
