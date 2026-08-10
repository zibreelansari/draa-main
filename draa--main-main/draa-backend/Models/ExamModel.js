const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq','short','paragraph'],
    required: true
  },
  questionText: { type: String, required: true },
  options: [String], // Only for MCQ
  correctAnswer: { type: String },
  explanation: { type: String }, //  Added new'explanation' field
  marks: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  instructions: { type: String },
  totalMarks: { type: Number },
  durationMinutes: { type: Number, required: true },
  scheduledAt: { type: Date },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref:'Course' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  seo: { //  Added new SEO object
    title: { type: String },
    keywords: [String],
    description: { type: String }
  },
  mappedResources: {
    syllabus: [{ type: mongoose.Schema.Types.ObjectId, ref:'Syllabus' }],
    pyqs: [{ type: mongoose.Schema.Types.ObjectId, ref:'PYQ' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref:'JobPost' }],
    currentAffairs: [{ type: mongoose.Schema.Types.ObjectId, ref:'CurrentAffair' }]
  }
});

module.exports = mongoose.model("Exam", examSchema);