// models/Syllabus.model.js
const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  // Basic Information
  examName: {
    type: String,
    required: [true,'Exam name is required'],
    index: true
  },
  examCategory: {
    type: String,
    required: [true,'Exam category is required'],
    // enum: ['SSC','UPSC','Banking','Railway','State PSC','Teaching','Defense','Police','Insurance','Other']
  },
  
  // Syllabus Details
  title: {
    type: String,
    required: [true,'Title is required']
  },
  description: {
    type: String,
    default:''
  },
  
  // Subjects and Topics
  subjects: [{
    subjectName: {
      type: String,
      required: true
    },
    topics: [{
      type: String
    }],
    weightage: {
      type: String, // e.g.,"25%","30 marks"
      default:''
    }
  }],
  
  // Exam Pattern
  examPattern: {
    totalMarks: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    numberOfQuestions: {
      type: Number,
      default: 0
    },
    negativeMarking: {
      type: String,
      default:''
    },
    examMode: {
      type: String,
      enum: ['Online','Offline','Both'],
      default:'Online'
    }
  },
  
  // Important Information
  importantTopics: [{
    type: String
  }],
  
  recommendedBooks: [{
    bookName: String,
    author: String,
    link: String
  }],
  
  // Files
  syllabusPDF: {
    type: String,
    required: [true,'Syllabus PDF is required']
  },
  coverImage: {
    type: String,
    default: null
  },
  
  // Additional Resources
  videoUrl: {
    type: String,
    default:''
  },
  
  // Metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Teacher',
    // required: [true,'Uploaded by information is required']
  },
  uploadedByName: {
    type: String,
    // required: [true,'Uploader name is required']
  },
  
  // Approval Workflow
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  
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
  
  // Tags
  tags: {
    type: [String],
    default: []
  },
  
  // SEO
  seo: {
    seo_title: String,
    meta_keywords: String,
    meta_description: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
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
syllabusSchema.index({ examCategory: 1, examName: 1 });
syllabusSchema.index({ isApproved: 1 });
syllabusSchema.index({ uploadedBy: 1 });
syllabusSchema.index({'seo.slug': 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
