const mongoose = require("mongoose");

/* ============================================================
   SECTION SCHEMA
============================================================ */
const SectionSchema = new mongoose.Schema({
  name: String,
  questions: Number,
  marks: Number,
  topics: [String]
}, { _id: false });

/* ============================================================
   PHASE SCHEMA
============================================================ */
const PhaseSchema = new mongoose.Schema({
  name: String,                 // Prelims, Mains
  duration: Number,             // minutes
  totalQuestions: Number,
  totalMarks: Number,
  negativeMarking: Number,
  isQualifying: Boolean,
  sections: [SectionSchema]
}, { _id: false });

/* ============================================================
   CUTOFF SCHEMA
============================================================ */
const CutoffSchema = new mongoose.Schema({
  year: Number,
  phase: String,
  category: String,             // GEN / OBC / SC / ST / EWS
  state: String,
  cutoffMarks: Number
}, { _id: false });

/* ============================================================
   VACANCY SCHEMA
============================================================ */
const VacancySchema = new mongoose.Schema({
  year: Number,
  total: Number,
  postWise: Object
}, { _id: false });

/* ============================================================
   MAIN EXAM SCHEMA
============================================================ */
const ExamSchema = new mongoose.Schema({

  /* ---------- BASIC ---------- */
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"ExamCategory",
    required: true,
    index: true
  },

  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },

  shortDescription: String,
  description: String,

  examImage: String,

  conductingBody: String,

  examLevel: {
    type: String,
    enum: ["National","State","Regional"]
  },

  mode: {
    type: String,
    enum: ["Online","Offline"]
  },

  frequency: String,

  /* ---------- ELIGIBILITY ---------- */
  eligibility: {
    ageMin: Number,
    ageMax: Number,
    education: String,
    experience: String
  },

  /* ---------- STRUCTURE ---------- */
  phases: [PhaseSchema],
  cutoffs: [CutoffSchema],
  vacancies: [VacancySchema],

  /* ---------- DATES ---------- */
  importantDates: {
    notificationDate: Date,
    applicationStart: Date,
    applicationEnd: Date,
    examDate: Date,
    resultDate: Date
  },

  /* ============================================================
      MAPPING SECTION (VERY IMPORTANT)
  ============================================================ */

  /* ---------- COURSES ---------- */
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Course",
      index: true
    }
  ],

  /* ---------- COURSE CONTENT ---------- */
  courseContents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"CourseContent",
      index: true
    }
  ],

  /* ---------- BOOKS ---------- */
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Book",
      index: true
    }
  ],

  testSeries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"TestSeries"
    }
  ],
  mappedResources: {
    syllabus: [{ type: mongoose.Schema.Types.ObjectId, ref:'Syllabus' }],
    pyqs: [{ type: mongoose.Schema.Types.ObjectId, ref:'PYQ' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref:'JobPost' }],
    currentAffairs: [{ type: mongoose.Schema.Types.ObjectId, ref:'CurrentAffair' }]
  },

  /* ============================================================
     ANALYTICS
  ============================================================ */

  views: {
    type: Number,
    default: 0
  },

  totalEnrollments: {
    type: Number,
    default: 0
  },

  totalBooksLinked: {
    type: Number,
    default: 0
  },

  totalCoursesLinked: {
    type: Number,
    default: 0
  },

  /* ============================================================
     SEO
  ============================================================ */

  seo: {
    seo_title: String,
    meta_description: String,
    meta_keywords: String,
    canonical_url: String
  },

  /* ============================================================
     STATUS
  ============================================================ */

  status: {
    type: String,
    enum: ["ACTIVE","INACTIVE"],
    default:"ACTIVE",
    index: true
  },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref:"Teacher" }

}, { timestamps: true });

module.exports = mongoose.model("ExamSections", ExamSchema);
