const mongoose = require('mongoose');

const OTPVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true,'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/,'Please provide a valid email address'],
    index: true
  },
  otp: {
    type: String,
    required: [true,'OTP is required'],
    length: 6,
    match: [/^[0-9]{6}$/,'OTP must be 6 digits']
  },
  
  // User Information (temporary storage)
  userData: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      default:'popup'
    },
    userAgent: String,
    ipAddress: String
  },
  
  // OTP Management
  attempts: {
    type: Number,
    default: 0,
    max: [5,'Maximum 5 verification attempts allowed']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index - documents auto-delete at expiration
  },
  
  // Tracking
  sentCount: {
    type: Number,
    default: 1
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  
  // Security
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
  
}, {
  timestamps: true
});

// Indexes
OTPVerificationSchema.index({ email: 1, isUsed: 1 });
OTPVerificationSchema.index({ createdAt: -1 });

// Pre-save middleware
OTPVerificationSchema.pre('save', function(next) {
  // Set usedAt when isUsed changes to true
  if (this.isModified('isUsed') && this.isUsed && !this.usedAt) {
    this.usedAt = new Date();
  }
  next();
});

// Static methods
OTPVerificationSchema.statics.findValidOTP = function(email, otp) {
  return this.findOne({
    email: email.toLowerCase().trim(),
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

OTPVerificationSchema.statics.deleteExpiredOTPs = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

OTPVerificationSchema.statics.getActiveOTPByEmail = function(email) {
  return this.findOne({
    email: email.toLowerCase().trim(),
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Instance methods
OTPVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

OTPVerificationSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  return this.save();
};

OTPVerificationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

OTPVerificationSchema.methods.canResend = function() {
  const timeSinceLastSent = new Date() - this.lastSentAt;
  const minResendInterval = 60 * 1000; // 1 minute
  return timeSinceLastSent >= minResendInterval && this.sentCount < 5;
};

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);
