// models/PYQ.js
const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema({
  // Basic Information
  examName: {
    type: String,
    required: true,
    index: true
  },
  examCategory: {
    type: String,
    required: false,
    enum: ['SSC','UPSC','Banking','Railway','State PSC','Teaching','Defense','Police','Insurance','Other']
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear()
  },
  shift: {
    type: String,
    enum: ['Morning','Afternoon','Evening','Single','Not Applicable']
  },
  paper: {
    type: String, // e.g.,"Paper-I","Paper-II"
    required: false
  },
  examStage: {
    type: String,
    enum: ['Prelims','Mains','Interview','Final','General'],
    default:'Prelims'
  },

  // Question Paper Details
  title: {
    type: String,
    required: true
  },
  description: String,

  subjects: [{
    type: String,
    enum: ['Reasoning','Quantitative Aptitude','English','General Awareness','Computer Knowledge','Professional Knowledge','Other']
  }],

  totalQuestions: {
    type: Number,
    required: false
  },
  totalMarks: {
    type: Number,
    required: false
  },
  duration: {
    type: Number, // in minutes
    required: false
  },

  // File Uploads
  questionPaperPDF: {
    type: String,
    required: true
  },
  solutionPDF: String,
  coverImage: String,

  // Additional Resources
  memoryBasedPaper: {
    type: Boolean,
    default: false
  },
  videoSolutionUrl: String, // YouTube URL

  // Metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Teacher',
    // required: true
  },
  uploadedByName: String,

  // Approval Workflow
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Features
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },

  // Tags for better searchability
  tags: [String],

  // SEO
  seo: {
    seo_title: String,
    meta_keywords: String,
    meta_description: String,
    slug: {
      type: String,
      unique: true
    },
    og_title: String,
    og_description: String,
    canonical_url: String,
    robots: {
      type: String,
      default:'index, follow'
    },
    schema_markup: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
pyqSchema.index({ examCategory: 1, year: -1 });
pyqSchema.index({ isApproved: 1 });
pyqSchema.index({ uploadedBy: 1 });
pyqSchema.index({'seo.slug': 1 });

module.exports = mongoose.model('PYQ', pyqSchema);
