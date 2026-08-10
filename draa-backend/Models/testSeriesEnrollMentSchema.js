const mongoose = require("mongoose");

const testSeriesEnrollmentSchema = new mongoose.Schema({
  //  USER
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Student",
    required: true,
    index: true
  },

  //  WHAT USER BOUGHT
  purchase_type: {
    type: String,
    enum: ["category","subject"],
    required: true
  },

  //  REFERENCES
  examination_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"ExaminationCategory"
  },

  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Subject"
  },

  //  SNAPSHOT (IMPORTANT)
  item_snapshot: {
    name: String,
    code: String,
    description: String
  },

  //  PRICING (MATCH YOUR UPDATED STRUCTURE)
  pricing: {
    base_price: Number,
    discount_amount: Number,
    gst_amount: Number,
    coin_discount: Number,
    final_amount: Number,
    currency: {
      type: String,
      default:"INR"
    }
  },

  //  PAYMENT
  payment: {
    gateway: {
      type: String,
      enum: ["razorpay","free"],
      default:"razorpay"
    },
    order_id: String,
    payment_id: String,
    signature: String,
    status: {
      type: String,
      enum: ["created","paid","failed","refunded"],
      default:"created"
    }
  },

  //  ACCESS CONTROL
  access: {
    granted: {
      type: Boolean,
      default: false
    },
    granted_at: Date,
    expires_at: Date,
    validity_days: {
      type: Number,
      default: 365
    }
  },

  //  USAGE TRACKING (OPTIONAL BUT POWERFUL)
  usage: {
    total_tests_attempted: {
      type: Number,
      default: 0
    },
    total_time_spent: {
      type: Number,
      default: 0
    },
    last_accessed_at: Date
  }

}, { timestamps: true });

/**
 *  INDEXES (IMPORTANT)
 */
testSeriesEnrollmentSchema.index({
  student_id: 1,
  examination_category_id: 1
});

testSeriesEnrollmentSchema.index({
  student_id: 1,
  subject_id: 1
});

testSeriesEnrollmentSchema.index({
"payment.order_id": 1
});

/**
 *  PRE SAVE
 */
testSeriesEnrollmentSchema.pre("save", function (next) {
  if (this.access.granted && !this.access.expires_at) {
    this.access.expires_at = new Date(
      Date.now() + this.access.validity_days * 86400000
    );
  }
  next();
});

module.exports = mongoose.model(
"TestSeriesEnrollment",
  testSeriesEnrollmentSchema
);