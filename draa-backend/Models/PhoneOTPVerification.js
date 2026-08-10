const mongoose = require('mongoose');

const PhoneOTPVerificationSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true,'Phone number is required'],
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: [true,'OTP is required'],
    length: 6,
  },
  name: {
    type: String,
    required: [true,'Name is required'],
    trim: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5,'Maximum 5 verification attempts allowed']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index - documents auto-delete at expiration
  }
}, {
  timestamps: true
});

// Static methods
PhoneOTPVerificationSchema.statics.findValidOTP = function(phone, otp) {
  return this.findOne({
    phone: phone.trim(),
    otp,
    isVerified: false,
    expiresAt: { $gt: new Date() }
  });
};

PhoneOTPVerificationSchema.statics.getActiveOTPByPhone = function(phone) {
  return this.findOne({
    phone: phone.trim(),
    isVerified: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('PhoneOTPVerification', PhoneOTPVerificationSchema);
