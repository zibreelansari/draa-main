const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['mcq','msa','numerical','descriptive'],
    default:'mcq'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String, // For numerical questions
  explanation: String,
  marks: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0.25
  },
  difficulty: {
    type: String,
    enum: ['easy','medium','hard'],
    default:'medium'
  },
  tags: [String],
  subject: String,
  topic: String,
  subtopic: String,
  previousYearQuestion: {
    year: Number,
    exam: String
  }
});

const testSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // New hierarchical references
  examinationCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'ExaminationCategory',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Subject',
    // required: true
  },
  topicCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TopicCategory',
    // required: true
  },
  
  // Test series specific data
  seriesNumber: {
    type: Number,
    required: true
  }, // 1, 2, 3, 4, 5 (for 4-5 tests per topic)
  testType: {
    type: String,
    enum: ['practice','mock','previous_year','chapter_wise','full_syllabus'],
    default:'practice'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Teacher',
    required: true
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true
  },
  totalMarks: Number,
  totalQuestions: {
    type: Number,
    default: 0
  },
  instructions: [String],
  
  status: {
    type: String,
    enum: ['draft','pending','approved','rejected'],
    default:'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'admins'
  },
  approvalDate: Date,
  rejectionReason: String,
  
  isActive: {
    type: Boolean,
    default: false
  },
  startDate: Date,
  endDate: Date,
  maxAttempts: {
    type: Number,
    default: 3
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: Number,
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner','intermediate','advanced','mixed'],
    default:'intermediate'
  },
  
  // Analytics and metadata
  attemptCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
   isPartOfSet: {
    type: Boolean,
    default: false
  },
  setCode: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true,  // allows multiple null values
    index: true
  },
  setName: {
    type: String,
    trim: true
  },
  setPrice: {
    type: Number,
    min: 0
  },

}, {
  timestamps: true
});

// Compound indexes for efficient queries
testSeriesSchema.index({ 
  topicCategory: 1, 
  seriesNumber: 1 
}, { unique: true });

testSeriesSchema.index({ 
  examinationCategory: 1, 
  subject: 1, 
  status: 1 
});

testSeriesSchema.index({ isActive: 1, status: 1 });

// Calculate total marks and question count before saving
testSeriesSchema.pre('save', function(next) {
  if (this.questions) {
    this.totalQuestions = this.questions.length;
    if (this.questions.length > 0) {
      this.totalMarks = this.questions.reduce((total, question) => total + (question.marks || 0), 0);
    } else {
      this.totalMarks = 0;
    }
  }
  next();
});

module.exports = mongoose.model('TestSeries', testSeriesSchema);
