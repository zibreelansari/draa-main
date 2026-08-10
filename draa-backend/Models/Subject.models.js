const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  code: {
    type: String,
    required: true,
    uppercase: true
  },

  examinationCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'ExaminationCategory',
    required: true
  },

  description: String,
  syllabus: [String],

  totalMarks: Number,
  duration: Number,

  questionPattern: {
    mcq: Number,
    msa: Number,
    numerical: Number
  },

  weightage: Number,

  isActive: {
    type: Boolean,
    default: true
  },

  priority: {
    type: Number,
    default: 0
  },

  icon: String,
  color: String,

  prerequisites: [String],
  careerOpportunities: [String],

  isPaid: {
    type: Boolean,
    default: false
  },

  price: {
    type: Number,
    default: 0
  },

  originalPrice: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

subjectSchema.index(
  { examinationCategory: 1, code: 1 },
  { unique: true }
);

subjectSchema.index({ isActive: 1, priority: 1 });

module.exports = mongoose.model('Subject', subjectSchema);