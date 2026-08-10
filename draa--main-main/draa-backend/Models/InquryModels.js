// models/Inquiry.js
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message:'Name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message:'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v.replace(/\s/g,''));
      },
      message:'Please enter a valid 10-digit phone number'
    }
  },
  otp: {
    type: String,
    required: false
  },
  otpExpiry: {
    type: Date,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['popup','website','mobile'],
    default:'popup'
  },
  status: {
    type: String,
    enum: ['pending','verified','contacted','closed'],
    default:'pending'
  },
  otpAttempts: {
    type: Number,
    default: 0,
    max: 5
  },
  resendCount: {
    type: Number,
    default: 0,
    max: 5
  },
  lastOtpSentAt: {
    type: Date
  },
  lastOtpAttemptAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  followUpDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low','medium','high','urgent'],
    default:'medium'
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.otp;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
inquirySchema.index({ email: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ isVerified: 1 });

// Check if OTP is expired
inquirySchema.methods.isOtpExpired = function() {
  return !this.otpExpiry || new Date() > this.otpExpiry;
};

// Check if can resend OTP (cooldown period)
inquirySchema.methods.canResendOtp = function() {
  if (!this.lastOtpSentAt) return true;
  const cooldownPeriod = 60 * 1000; // 60 seconds
  return (new Date() - this.lastOtpSentAt) > cooldownPeriod;
};

// Get remaining time for OTP resend
inquirySchema.methods.getRemainingCooldownTime = function() {
  if (!this.lastOtpSentAt) return 0;
  const cooldownPeriod = 60 * 1000; // 60 seconds
  const elapsed = new Date() - this.lastOtpSentAt;
  return Math.max(0, Math.ceil((cooldownPeriod - elapsed) / 1000));
};

module.exports = mongoose.model('Inquiry', inquirySchema);
