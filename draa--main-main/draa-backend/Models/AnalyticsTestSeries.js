// backend/models/TestAnalytics.js
const mongoose = require('mongoose');

const testAnalyticsSchema = new mongoose.Schema({
  testSeries: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'TestSeries',
    required: true
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  highestScore: {
    type: Number,
    default: 0
  },
  lowestScore: {
    type: Number,
    default: 0
  },
  questionAnalytics: [{
    questionId: mongoose.Schema.Types.ObjectId,
    correctAttempts: Number,
    incorrectAttempts: Number,
    accuracyRate: Number
  }],
  difficultyDistribution: {
    easy: Number,
    medium: Number,
    hard: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestAnalytics', testAnalyticsSchema);
