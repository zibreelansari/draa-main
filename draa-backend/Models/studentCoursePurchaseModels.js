const mongoose = require('mongoose');

const studentCoursePurchaseSchema = new mongoose.Schema({
  // Student Information
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  student_details: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    profile_image: String
  },

  // Course Information (Full Course Details)
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Course',
    required: true
  },
  course_details: {
    title: {
      type: String,
      required: true
    },
    short_desc: String,
    long_desc: String,
    price: {
      type: Number,
      required: true
    },
    duration: Number,
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Teacher'
    },
    teacher_details: {
      tname: String,
      temail: String,
      tspecialization: String,
      tprofile: String
    },
    coverphoto: String,
    youtube_link: String,
    language: String,
    skill_level: String,
    chapters: [{
      _id: mongoose.Schema.Types.ObjectId,
      chapter_name: String,
      study_file: String,
      order: Number
    }],
    course_category: String,
    enrollmentCount: Number,
    rating: Number,
    ratingCount: Number
  },

  // Purchase Information
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
    expires_at: Date, // If course has expiration
    discount_applied: {
      type: Number,
      default: 0
    },
    coupon_code: String
  },

  // Razorpay Payment Details
  razorpay_details: {
    order_id: {
      type: String,
      required: true
    },
    payment_id: String,
    signature: String,
    receipt: String,
    status: String
  },

  // Progress Tracking
  progress: {
    completed_chapters: [{
      chapter_id: mongoose.Schema.Types.ObjectId,
      completed_at: Date,
      time_spent: Number // in minutes
    }],
    total_progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    last_accessed: Date,
    total_time_spent: {
      type: Number,
      default: 0 // in minutes
    }
  },

  // Additional Information
  enrollment_source: {
    type: String,
    enum: ['web','mobile','admin'],
    default:'web'
  },
  ip_address: String,
  user_agent: String,
  notes: String,
  
}, {
  timestamps: true
});

// Indexes
studentCoursePurchaseSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
studentCoursePurchaseSchema.index({'purchase_details.payment_status': 1 });
studentCoursePurchaseSchema.index({'razorpay_details.order_id': 1 });
studentCoursePurchaseSchema.index({'purchase_details.purchase_date': -1 });

const StudentCoursePurchase = mongoose.model('StudentCoursePurchase', studentCoursePurchaseSchema);
module.exports = StudentCoursePurchase;
