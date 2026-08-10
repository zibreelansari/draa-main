const mongoose = require('mongoose');

const questionIssueReportSchema = new mongoose.Schema({
  // Who reported
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reporterName: { type: String, default: '' },
  reporterEmail: { type: String, default: '' },

  // Which test / attempt / question
  testSeriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSeries',
    required: true,
  },
  testSeriesTitle: { type: String, default: '' },

  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestAttempt',
    required: true,
  },

  questionId: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, default: '' },

  // Issue details
  issueType: {
    type: String,
    enum: [
      'wrong_answer',
      'wrong_explanation',
      'typo_in_question',
      'typo_in_options',
      'image_not_loading',
      'other',
    ],
    required: true,
  },
  description: { type: String, default: '' },

  // Admin tracking
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'dismissed'],
    default: 'open',
  },
  adminNote: { type: String, default: '' },
  resolvedAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('QuestionIssueReport', questionIssueReportSchema);
