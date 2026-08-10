const mongoose = require('mongoose');

const CouponAssignmentSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null for offline students
  },
  email: {
    type: String,
    required: [true, 'Please provide student email'],
    lowercase: true,
    trim: true
  },
  assignedType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Ensure unique assignment per email per coupon
CouponAssignmentSchema.index({ coupon: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('CouponAssignment', CouponAssignmentSchema);
