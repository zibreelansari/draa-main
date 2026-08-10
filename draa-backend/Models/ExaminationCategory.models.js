const mongoose = require('mongoose');

const examinationCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, //"GATE 2026","JEE Advanced 2026","UPSC CSE 2026"
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  }, //"GATE2026","JEE2026","UPSC2026"
  description: String,
  year: {
    type: Number,
    required: true
  },
  examDate: Date,
  registrationStartDate: Date,
  registrationEndDate: Date,
  applicationFee: {
    general: Number,
    reserved: Number
  },
  totalSeats: Number,
  examPattern: {
    totalQuestions: Number,
    duration: Number, // in minutes
    totalMarks: Number,
    negativeMarking: Boolean
  },
  eligibilityCriteria: [String],
  syllabus: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isPaid: { type: Boolean, default: false },
price: { type: Number, default: 0 },
originalPrice: { type: Number, default: 0 },
discount: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'admins',
    required: true
  },
  priority: {
    type: Number,
    default: 0
  }, // For ordering
  bannerImage: String,
  brochurePdf: String
}, {
  timestamps: true
});

// Index for faster queries
examinationCategorySchema.index({ isActive: 1, year: -1 });
examinationCategorySchema.index({ code: 1 });

module.exports = mongoose.model('ExaminationCategory', examinationCategorySchema);
