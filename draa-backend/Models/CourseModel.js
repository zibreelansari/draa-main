const mongoose = require('mongoose');


// ===== UPDATED CHAPTER SCHEMA =====
const chapterSchema = new mongoose.Schema({
  chapter_name: {
    type: String,
    required: true,
    trim: true
  },

  // 1 Study Material
  study_material: {
    type: String,
    required: true
  },

  // 2 YouTube Video for this chapter
  youtube_video: {
    type: String,
    match: /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^&\n?#]+/
  },

  // 3 Practice Set (PDF/PPT/DOC/PNG etc.)
  practice_set: {
    type: String,
    required: true
  },

  // 4 Other Materials (Multiple allowed)
  other_materials: [
    {
      type: String
    }
  ],

  order: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});



// Define SEO Schema (subdocument)
const seoSchema = new mongoose.Schema({
  seo_title: {
    type: String,
    required: true
  },
  meta_keywords: {
    type: String,
    required: true
  },
  meta_description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  og_title: {
    type: String
  },
  og_description: {
    type: String
  },
  og_image: {
    type: String
  },
  canonical_url: {
    type: String
  },
  robots: {
    type: String,
    default:'index, follow'
  },
  schema_markup: {
    type: String
  }
});


// YouTube Links Schema (subdocument)
const youtubeLinkSchema = new mongoose.Schema({
  url: {
    type: String,
    // required: true,
    match: /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^&\n?#]+/
  },
  title: {
    type: String,
    default:''
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String
  }
});


//  NEW: Course Details Schemas (subdocuments) 
const whoThisCourseIsForSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true,'Target audience text is required'],
    trim: true
  }
}, { _id: true });


const whatYouWillLearnSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true,'Learning outcome text is required'],
    trim: true
  }
}, { _id: true });


const courseFeaturesSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true,'Feature text is required'],
    trim: true
  }
}, { _id: true });


const courseFaqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });


//  COMPLETE COURSE SCHEMA WITH SYLLABUS + 3 NEW FIELDS
const courseSchema = new mongoose.Schema({
  // ===== CORE FIELDS =====
  title: {
    type: String,
    required: true,
    trim: true
  },
  short_desc: {
    type: String,
    required: true
  },
  long_desc: {
    type: String,
    required: true
  },

  // ===== PRICING FIELDS =====
  actual_price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discounted_price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  price: {  // Keep existing price field for backward compatibility
    type: Number,
    required: true,
    min: 0
  },

  // ===== COURSE METRICS =====
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  enrolled_count: {
    type: Number,
    default: 0,
    min: 0
  },

  // ===== RELATIONSHIPS =====
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Teacher",
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    enum: ['English','Hindi','Bengali','Tamil','Telugu','Marathi','Other']
  },
  skill_level: {
    type: String,
    enum: ['beginner','intermediate','advanced'],
    required: true
  },

  // ===== MEDIA & FILES =====
  coverphoto: {
    type: String,
    required: true
  },
  syllabus: {
    type: String,
    default:""
  }, //  SYLLABUS FILE PATH (optional)
  thumbnail: String,

  // ===== YOUTUBE VIDEOS =====
  youtube_links: [youtubeLinkSchema],
  youtube_link: String,  // Keep single link for backward compatibility

  // ===== CATEGORY SYSTEM =====
  course_category: {
    type: String,
    required: true,
    index: true
  },
  course_category_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'CourseCategory',
    index: true
  },

  //  NEW FIELDS - COURSE DETAILS 
  who_this_course_is_for: {
    type: [whoThisCourseIsForSchema],
    default: []
  },

  what_you_will_learn: {
    type: [whatYouWillLearnSchema],
    default: []
  },

  course_features: {
    type: [courseFeaturesSchema],
    default: []
  },

  course_faqs: {
    type: [courseFaqSchema],
    default: []
  },


  // ===== STATUS & APPROVAL =====
  status: {
    type: String,
    enum: ['draft','pending','published','archived','suspended'],
    default:'draft',
    index: true
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'admins'
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'admins'
  },
  rejectedAt: Date,
  rejectionReason: String,

  // ===== PERFORMANCE METRICS =====
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },

  // ===== LEGACY FIELDS =====
  category: String,
  subcategory: String,
  tags: [String],
  instructor: String,
  description: String,
  featured: {
    type: Boolean,
    default: false,
    index: true
  },

  // ===== MATERIALS =====
  materials: [{
    name: String,
    path: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // ===== SUBDOCUMENTS =====
  chapters: [chapterSchema],
  seo: seoSchema

}, {
  timestamps: true
});


// ===== COMPOUND INDEXES FOR PERFORMANCE =====
// Note: Single-field indexes for `status`, `isApproved`, `teacher_id`, `course_category`,
// `course_category_ref`, `featured`, and `seo.slug` are already declared on the schema
// fields above via `index: true`. Do NOT re-declare them here or Mongoose will warn
// about duplicate indexes at startup.
courseSchema.index(
  { title:'text', short_desc:'text', long_desc:'text' },
  { language_override:'none' }
);
courseSchema.index({ skill_level: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ enrolled_count: -1 });
courseSchema.index({ views: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ actual_price: 1 });
courseSchema.index({ discounted_price: 1 });
courseSchema.index({ discount_percentage: 1 });

// COMPOUND INDEXES
courseSchema.index({ isApproved: 1, status: 1 });
courseSchema.index({ teacher_id: 1, status: 1 });
courseSchema.index({ course_category: 1, isApproved: 1, status: 1 });
courseSchema.index({ course_category_ref: 1, isApproved: 1, status: 1 });


// ===== VIRTUAL FIELDS =====
courseSchema.virtual('fullDescription').get(function () {
  return this.description || this.long_desc || this.short_desc;
});

courseSchema.virtual('isActive').get(function () {
  return this.status ==='published' && this.isApproved;
});

courseSchema.virtual('chapterCount').get(function () {
  return this.chapters ? this.chapters.length : 0;
});

courseSchema.virtual('averageRating').get(function () {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

courseSchema.virtual('totalDuration').get(function () {
  if (!this.chapters || this.chapters.length === 0) return this.duration;
  return this.chapters.reduce((total, chapter) => total + (chapter.duration || 0), 0) || this.duration;
});

courseSchema.virtual('displayPrice').get(function () {
  return this.discounted_price > 0 ? this.discounted_price : this.actual_price;
});

courseSchema.virtual('hasDiscount').get(function () {
  return this.discount_percentage > 0;
});

courseSchema.virtual('hasSyllabus').get(function () {
  return !!this.syllabus && this.syllabus.trim() !=='';
});

//  NEW VIRTUALS FOR THE NEW FIELDS
courseSchema.virtual('hasTargetAudience').get(function () {
  return this.who_this_course_is_for && this.who_this_course_is_for.length > 0;
});

courseSchema.virtual('hasLearningOutcomes').get(function () {
  return this.what_you_will_learn && this.what_you_will_learn.length > 0;
});

courseSchema.virtual('hasCourseFeatures').get(function () {
  return this.course_features && this.course_features.length > 0;
});

courseSchema.virtual('isComplete').get(function () {
  return this.hasTargetAudience && this.hasLearningOutcomes && this.hasCourseFeatures;
});


// ===== INSTANCE METHODS =====
courseSchema.methods.approve = function (adminId) {
  this.isApproved = true;
  this.status ='published';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectedBy = null;
  this.rejectedAt = null;
  this.rejectionReason = null;
  return this.save();
};

courseSchema.methods.reject = function (adminId, reason) {
  this.isApproved = false;
  this.status ='draft';
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.approvedBy = null;
  this.approvedAt = null;
  return this.save();
};

courseSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

courseSchema.methods.incrementEnrollment = function () {
  this.enrolled_count = (this.enrolled_count || 0) + 1;
  return this.save();
};

courseSchema.methods.updateRating = function (newRating) {
  const currentTotal = this.rating * this.ratingCount;
  this.ratingCount = (this.ratingCount || 0) + 1;
  this.rating = (currentTotal + newRating) / this.ratingCount;
  return this.save();
};

courseSchema.methods.addChapter = function (chapterData) {
  this.chapters.push(chapterData);
  return this.save();
};

courseSchema.methods.syncCategoryReference = async function () {
  if (this.course_category && !this.course_category_ref) {
    const CourseCategory = mongoose.model('CourseCategory');
    const category = await CourseCategory.findOne({ name: this.course_category });
    if (category) {
      this.course_category_ref = category._id;
      await this.save();
    }
  }
  return this;
};

//  NEW METHODS FOR COURSE DETAILS
courseSchema.methods.addTargetAudience = function (text) {
  this.who_this_course_is_for.push({ text });
  return this.save();
};

courseSchema.methods.addLearningOutcome = function (text) {
  this.what_you_will_learn.push({ text });
  return this.save();
};

courseSchema.methods.addCourseFeature = function (text) {
  this.course_features.push({ text });
  return this.save();
};


// ===== STATIC METHODS =====
courseSchema.statics.findApproved = function () {
  return this.find({ isApproved: true, status:'published' });
};

courseSchema.statics.findPending = function () {
  return this.find({ isApproved: false, status: { $in: ['draft','pending'] } });
};

courseSchema.statics.findBySkillLevel = function (level) {
  return this.find({ skill_level: level, isApproved: true, status:'published' });
};

courseSchema.statics.findByCourseCategory = function (courseCategory) {
  const query = {
    isApproved: true,
    status:'published'
  };

  if (mongoose.Types.ObjectId.isValid(courseCategory)) {
    query.course_category_ref = courseCategory;
  } else {
    query.course_category = courseCategory;
  }

  return this.find(query);
};

courseSchema.statics.findWithCategoryDetails = function (filters = {}) {
  const query = {
    isApproved: true,
    status:'published',
    ...filters
  };

  return this.find(query)
    .populate('teacher_id','tname temail tprofile tspecialization')
    .populate('course_category_ref','name icon color description slug isActive')
    .populate('approvedBy','name email')
    .sort({ createdAt: -1 });
};

//  NEW: Find complete courses (with all new fields)
courseSchema.statics.findCompleteCourses = function () {
  return this.find({
    isApproved: true,
    status:'published',
'who_this_course_is_for.0': { $exists: true },
'what_you_will_learn.0': { $exists: true },
'course_features.0': { $exists: true }
  });
};


// ===== MIDDLEWARE =====
courseSchema.pre('save', async function (next) {
  // Auto-sync category reference
  if (this.isModified('course_category') && this.course_category && !this.course_category_ref) {
    try {
      const CourseCategory = mongoose.model('CourseCategory');
      const category = await CourseCategory.findOne({ name: this.course_category });
      if (category) {
        this.course_category_ref = category._id;
      }
    } catch (error) {
      console.log('Error syncing category reference:', error.message);
    }
  }

  // Auto-calculate discount percentage
  if (this.isModified('actual_price') || this.isModified('discounted_price')) {
    if (this.actual_price > 0 && this.discounted_price < this.actual_price) {
      this.discount_percentage = Math.round(((this.actual_price - this.discounted_price) / this.actual_price) * 100);
    }
  }

  // Keep price synced with discounted_price
  if (this.isModified('discounted_price')) {
    this.price = this.discounted_price;
  }

  //  NEW: Trim and clean new fields
  if (this.isModified('who_this_course_is_for')) {
    this.who_this_course_is_for = this.who_this_course_is_for.filter(item => item.text && item.text.trim());
  }

  if (this.isModified('what_you_will_learn')) {
    this.what_you_will_learn = this.what_you_will_learn.filter(item => item.text && item.text.trim());
  }

  if (this.isModified('course_features')) {
    this.course_features = this.course_features.filter(item => item.text && item.text.trim());
  }

  next();
});

// Auto-populate references
courseSchema.pre(['find','findOne','findOneAndUpdate'], function () {
  this.populate('teacher_id','tname temail tprofile tspecialization');
  this.populate('course_category_ref','name icon color description slug isActive order');
  this.populate('approvedBy','name email aname');
  this.populate('rejectedBy','name email aname');
});

// Update category course count
courseSchema.post('save', async function (doc) {
  if (doc.course_category_ref && doc.isApproved && doc.status ==='published') {
    try {
      const CourseCategory = mongoose.model('CourseCategory');
      await CourseCategory.findByIdAndUpdate(
        doc.course_category_ref,
        { $inc: { courseCount: 1 } }
      );
    } catch (error) {
      console.log('Error updating category course count:', error.message);
    }
  }
});

// JSON output settings
courseSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

// Export model
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
module.exports = Course;