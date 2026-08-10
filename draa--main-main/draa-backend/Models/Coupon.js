const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: [true, 'Please provide discount type (percentage or flat)']
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value']
  },
  description: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide expiry date']
  },
  maxUses: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  usesCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
