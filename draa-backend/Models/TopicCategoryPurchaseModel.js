// Models/TopicCategoryPurchaseModel.js
const mongoose = require('mongoose');

const topicCategoryPurchaseSchema = new mongoose.Schema({
  // Student who purchased
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Student',
    required: true
  },

  // Topic purchased (all tests under this topic)
  topic_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TopicCategory',
    required: true
  },

  // Hierarchical context
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Subject',
    required: true
  },

  examination_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'ExaminationCategory',
    required: true
  },

  // Student details (snapshot)
  student_details: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String
  },

  // Topic details (snapshot at purchase time)
  topic_details: {
    name: {
      type: String,
      required: true
    },
    code: String,
    description: String,
    subject_name: String,
    examination_name: String,
    total_tests_at_purchase: {
      type: Number,
      default: 0
    }
  },

  // Purchase details
  purchase_details: {
    amount_paid: {
      type: Number,
      required: true
    },
    original_price: Number,
    discount_amount: {
      type: Number,
      default: 0
    },
    discount_percentage: Number,
    currency: {
      type: String,
      default:'INR'
    },
    payment_status: {
      type: String,
      enum: ['pending','completed','failed','refunded','free'],
      default:'pending'
    },
    purchase_date: {
      type: Date,
      default: Date.now
    },
    access_granted: {
      type: Boolean,
      default: false
    },
    access_granted_date: Date,
    access_expires_at: Date,
    validity_period: {
      type: Number,
      default: 365 // days (1 year)
    }
  },

  // Razorpay payment details
  razorpay_details: {
    order_id: {
      type: String,
      required: true
    },
    payment_id: String,
    signature: String,
    status: {
      type: String,
      enum: ['created','authorized','captured','refunded','failed','free'],
      default:'created'
    }
  },

  // Access tracking (for all tests under this topic)
  access_details: {
    total_tests_available: {
      type: Number,
      default: 0 // Will be updated dynamically
    },
    tests_attempted: {
      type: Number,
      default: 0
    },
    tests_completed: {
      type: Number,
      default: 0
    },
    total_time_spent: {
      type: Number,
      default: 0 // in seconds
    },
    best_overall_score: Number,
    best_overall_percentage: Number,
    last_access_date: Date
  },

  // Individual test attempt tracking
  test_attempts: [{
    test_series_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'TestSeries'
    },
    test_title: String,
    attempts_count: {
      type: Number,
      default: 0
    },
    best_score: Number,
    best_percentage: Number,
    last_attempt_date: Date,
    completion_status: {
      type: String,
      enum: ['not_started','in_progress','completed'],
      default:'not_started'
    }
  }],

  // Enrollment source
  enrollment_source: {
    type: String,
    enum: ['web','mobile','admin'],
    default:'web'
  },

  // Timestamps
  purchased_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: one student can only buy same topic once
topicCategoryPurchaseSchema.index({ 
  student_id: 1, 
  topic_category_id: 1 
}, { 
  unique: true 
});

// Other indexes
topicCategoryPurchaseSchema.index({ student_id: 1,'purchase_details.payment_status': 1 });
topicCategoryPurchaseSchema.index({'razorpay_details.order_id': 1 });
topicCategoryPurchaseSchema.index({ topic_category_id: 1 });
topicCategoryPurchaseSchema.index({ subject_id: 1 });
topicCategoryPurchaseSchema.index({ examination_category_id: 1 });

// Pre-save: Calculate access expiry
topicCategoryPurchaseSchema.pre('save', function(next) {
  if (this.isNew && this.purchase_details.access_granted && !this.purchase_details.access_expires_at) {
    const validityDays = this.purchase_details.validity_period || 365;
    this.purchase_details.access_expires_at = new Date(
      Date.now() + validityDays * 24 * 60 * 60 * 1000
    );
  }
  next();
});

// Instance method: Check if access is valid
topicCategoryPurchaseSchema.methods.isAccessValid = function() {
  if (!this.purchase_details.access_granted) return false;
  if (!this.purchase_details.access_expires_at) return true; // Lifetime access
  return new Date() < this.purchase_details.access_expires_at;
};

// Instance method: Get test attempt details
topicCategoryPurchaseSchema.methods.getTestAttempt = function(testSeriesId) {
  return this.test_attempts.find(
    attempt => attempt.test_series_id.toString() === testSeriesId.toString()
  );
};

// Instance method: Update test attempt
topicCategoryPurchaseSchema.methods.updateTestAttempt = async function(testSeriesId, attemptData) {
  const existingAttempt = this.test_attempts.find(
    attempt => attempt.test_series_id.toString() === testSeriesId.toString()
  );

  if (existingAttempt) {
    // Update existing
    existingAttempt.attempts_count += 1;
    existingAttempt.last_attempt_date = new Date();

    if (attemptData.score > (existingAttempt.best_score || 0)) {
      existingAttempt.best_score = attemptData.score;
    }

    if (attemptData.percentage > (existingAttempt.best_percentage || 0)) {
      existingAttempt.best_percentage = attemptData.percentage;
    }

    if (attemptData.completion_status) {
      existingAttempt.completion_status = attemptData.completion_status;
    }
  } else {
    // Create new
    this.test_attempts.push({
      test_series_id: testSeriesId,
      test_title: attemptData.test_title,
      attempts_count: 1,
      best_score: attemptData.score,
      best_percentage: attemptData.percentage,
      last_attempt_date: new Date(),
      completion_status: attemptData.completion_status ||'completed'
    });
  }

  // Update overall access details
  this.access_details.last_access_date = new Date();
  if (attemptData.time_spent) {
    this.access_details.total_time_spent += attemptData.time_spent;
  }

  await this.save();
};

module.exports = mongoose.model('TopicCategoryPurchase', topicCategoryPurchaseSchema);