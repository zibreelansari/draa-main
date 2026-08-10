const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Exam",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  },
  answers: {
    type: Object,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },

  //  Enhanced scoring
  score: {
    total: { type: Number, default: 0 },
    maxPossible: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default:'F' },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 }
  },

  //  Timing info
  timing: {
    timeSpent: { type: Number, default: 0 }, // seconds
    examStartTime: Date,
    durationMinutes: Number
  },

  //  Violations
  violations: {
    count: { type: Number, default: 0 },
    details: [String]
  },

  //  Submission metadata
  submission: {
    isAutoSubmit: { type: Boolean, default: false },
    autoSubmitReason: String,
    userAgent: String,
    metadata: Object
  },

  //  Results
  results: {
    questionResults: [{
      questionIndex: Number,
      questionId: mongoose.Schema.Types.ObjectId,
      studentAnswer: String,
      isCorrect: Boolean,
      score: Number,
      maxScore: Number
    }],
    completionRate: { type: Number, default: 0 }
  }
});

//  Prevent duplicate submissions
submissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
