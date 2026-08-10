// backend/models/TestAttempt.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: Number,
  isCorrect: Boolean,
  marksObtained: Number,
  timeSpent: Number // in seconds
});

const testAttemptSchema = new mongoose.Schema({
  testSeries: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TestSeries',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  answers: [answerSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  totalScore: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  unanswered: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  rank: Number,
  status: {
    type: String,
    enum: ['ongoing','completed','submitted'],
    default:'ongoing'
  },
  timeSpent: Number, // total time in seconds
  isSubmitted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
