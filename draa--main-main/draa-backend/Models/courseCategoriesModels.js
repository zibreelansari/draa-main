// backend/models/CourseCategoryModel.js
const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  icon: {
    type: String, // Icon class or image URL
    default:'bx bx-category'
  },
  color: {
    type: String, // Hex color code
    default:'#007bff'
  },
  image: {
    type: String // Category image path
  },
  //  NEW: Keywords field added
  keywords: {
    type: [String],
    default: [],
    validate: {
      validator: function (keywords) {
        return keywords.every(keyword => keyword.length <= 50);
      },
      message:'Each keyword must be 50 characters or less'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  courseCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Teacher'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Teacher'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
courseCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g,'')
      .replace(/[\s_-]+/g,'-')
      .replace(/^-+|-+$/g,'');
  }

  //  NEW: Clean and normalize keywords
  if (this.isModified('keywords')) {
    this.keywords = this.keywords
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length > 0);
    // Remove duplicates
    this.keywords = [...new Set(this.keywords)];
  }

  next();
});

// Index for better performance
courseCategorySchema.index({ name: 1 });
courseCategorySchema.index({ slug: 1 });
courseCategorySchema.index({ isActive: 1 });
courseCategorySchema.index({ order: 1 });
courseCategorySchema.index({ keywords: 1 }); //  NEW: Index for keyword searches

// Static methods
courseCategorySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

courseCategorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

//  NEW: Find by single keyword
courseCategorySchema.statics.findByKeyword = function (keyword) {
  return this.find({
    keywords: keyword.trim().toLowerCase(),
    isActive: true
  }).sort({ order: 1, name: 1 });
};

//  NEW: Find by multiple keywords (OR logic)
courseCategorySchema.statics.findByKeywords = function (keywordsArray) {
  const normalizedKeywords = keywordsArray.map(k => k.trim().toLowerCase());
  return this.find({
    keywords: { $in: normalizedKeywords },
    isActive: true
  }).sort({ order: 1, name: 1 });
};

//  NEW: Find by all keywords (AND logic)
courseCategorySchema.statics.findByAllKeywords = function (keywordsArray) {
  const normalizedKeywords = keywordsArray.map(k => k.trim().toLowerCase());
  return this.find({
    keywords: { $all: normalizedKeywords },
    isActive: true
  }).sort({ order: 1, name: 1 });
};

//  NEW: Search categories by keyword text (partial match)
courseCategorySchema.statics.searchByKeyword = function (searchTerm) {
  return this.find({
    keywords: { $regex: searchTerm.trim(), $options:'i' },
    isActive: true
  }).sort({ order: 1, name: 1 });
};

// Instance methods
courseCategorySchema.methods.updateCourseCount = async function () {
  const Course = mongoose.model('Course');
  this.courseCount = await Course.countDocuments({ course_category: this.name });
  return this.save();
};

//  NEW: Add keywords to existing category
courseCategorySchema.methods.addKeywords = function (newKeywords) {
  const normalizedNew = newKeywords
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);

  this.keywords = [...new Set([...this.keywords, ...normalizedNew])];
  return this.save();
};

//  NEW: Remove keywords from category
courseCategorySchema.methods.removeKeywords = function (keywordsToRemove) {
  const normalizedRemove = keywordsToRemove.map(k => k.trim().toLowerCase());
  this.keywords = this.keywords.filter(k => !normalizedRemove.includes(k));
  return this.save();
};

//  NEW: Check if category has specific keyword
courseCategorySchema.methods.hasKeyword = function (keyword) {
  return this.keywords.includes(keyword.trim().toLowerCase());
};

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);
module.exports = CourseCategory;
