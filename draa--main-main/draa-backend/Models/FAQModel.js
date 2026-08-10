// Models/FAQModel.js
const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true,'Question is required'],
    trim: true,
    maxlength: [500,'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true,'Answer is required'],
    trim: true,
    maxlength: [2000,'Answer cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true,'Category is required'],
    enum: [
'General',
'Account',
'Courses',
'Payment',
'Technical',
'Certificates',
'Refunds',
'Support',
'Mobile App',
'Instructors'
    ],
    default:'General'
  },
  status: {
    type: String,
    enum: ['draft','published','archived'],
    default:'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  lastUpdatedBy: {
    type: String,
    default:'Admin'
  },
  searchKeywords: [{
    type: String,
    trim: true
  }],
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'FAQ'
  }],
  // SEO fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better search performance
faqSchema.index({ question:'text', answer:'text', tags:'text' });
faqSchema.index({ category: 1, status: 1 });
faqSchema.index({ priority: -1, createdAt: -1 });

// Pre-save middleware to generate search keywords
faqSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('question') || this.isModified('answer')) {
    // Extract keywords from question and answer
    const questionWords = this.question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const answerWords = this.answer.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    this.searchKeywords = [...new Set([...questionWords, ...answerWords])];
  }
  
  // Auto-generate meta fields if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.question.length > 60 ? 
      this.question.substring(0, 57) +'...' : 
      this.question;
  }
  
  if (!this.metaDescription) {
    this.metaDescription = this.answer.length > 160 ? 
      this.answer.substring(0, 157) +'...' : 
      this.answer;
  }
  
  next();
});

module.exports = mongoose.model('FAQ', faqSchema);
