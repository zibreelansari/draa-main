const mongoose = require('mongoose');

const testSeriesPurchaseSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Student',
    required: true
  },
  test_series_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TestSeries',
    required: true
  },
  
  // Student details (for quick access)
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
  
  // Test Series details snapshot (at time of purchase)
  test_series_details: {
    title: {
      type: String,
      required: true
    },
    description: String,
    // Hierarchical references
    examinationCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'ExaminationCategory'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Subject'
    },
    topicCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'TopicCategory'
    },
    seriesNumber: Number,
    testType: String,
    // Test details
    duration: {
      type: Number,
      required: true
    },
    totalMarks: Number,
    totalQuestions: Number,
    maxAttempts: {
      type: Number,
      default: 3
    },
    difficulty: {
      type: String,
      enum: ['beginner','intermediate','advanced'],
      default:'intermediate'
    },
    price: {
      type: Number,
      required: true
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Teacher'
    }
  },
  
  // Purchase details
  purchase_details: {
    amount_paid: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default:'INR'
    },
    payment_status: {
      type: String,
      enum: ['pending','completed','failed','refunded'],
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
    access_expires_at: Date, // For limited time access if needed
    validity_period: {
      type: Number,
      default: 365 // days
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
      enum: ['created','authorized','captured','refunded','failed'],
      default:'created'
    }
  },
  
  // Test attempt tracking
  attempt_details: {
    attempts_used: {
      type: Number,
      default: 0
    },
    best_score: {
      type: Number,
      default: 0
    },
    best_percentage: {
      type: Number,
      default: 0
    },
    last_attempt_date: Date,
    total_time_spent: {
      type: Number,
      default: 0 // in seconds
    },
    completion_status: {
      type: String,
      enum: ['not_started','in_progress','completed'],
      default:'not_started'
    }
  },
  
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

// Indexes for better query performance
testSeriesPurchaseSchema.index({ student_id: 1, test_series_id: 1 }, { unique: true });
testSeriesPurchaseSchema.index({ student_id: 1,'purchase_details.payment_status': 1 });
testSeriesPurchaseSchema.index({'razorpay_details.order_id': 1 });
testSeriesPurchaseSchema.index({'razorpay_details.payment_id': 1 });

// Pre-save middleware to calculate access expiry
testSeriesPurchaseSchema.pre('save', function(next) {
  if (this.isNew && this.purchase_details.access_granted && !this.purchase_details.access_expires_at) {
    const validityDays = this.purchase_details.validity_period || 365;
    this.purchase_details.access_expires_at = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Instance method to check if access is still valid
testSeriesPurchaseSchema.methods.isAccessValid = function() {
  if (!this.purchase_details.access_granted) return false;
  if (!this.purchase_details.access_expires_at) return true;
  return new Date() < this.purchase_details.access_expires_at;
};

// Instance method to check remaining attempts
testSeriesPurchaseSchema.methods.getRemainingAttempts = function() {
  return Math.max(0, this.test_series_details.maxAttempts - this.attempt_details.attempts_used);
};

module.exports = mongoose.model('TestSeriesPurchase', testSeriesPurchaseSchema);
