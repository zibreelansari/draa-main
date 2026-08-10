const mongoose = require('mongoose');


// SEO Schema for Job Posts
const seoSchema = new mongoose.Schema({
    seo_title: { type: String, maxlength: 1060 },
    meta_keywords: { type: String },
    meta_description: { type: String, maxlength: 1000 },
    slug: { type: String, required: true, unique: true },
    og_title: { type: String, maxlength: 1060 },
    og_description: { type: String, maxlength: 1000 },
    canonical_url: { type: String },
    robots: { type: String, default: 'index, follow' },
    schema_markup: { type: String }
});


// === JobCategory Model ===
const JobCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    subcategories: [{ type: String }],
});


// === JobPost Model with Admin Approval ===
const JobPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    job_type: { type: String, enum: ['Government', 'Private'], required: true },
    organization_name: { type: String, required: true },

    advertisement_number: { type: String },
    job_category: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory', required: false },
    subcategory: { type: String },

    location: { type: String, required: true },

    qualifications_required: [{ type: String }],
    experience_required: { type: String },

    salary_min: { type: Number },
    salary_max: { type: Number },
    salary_range: { type: String },
    salary_type: { type: String, enum: ['Monthly', 'Annual'], default: 'Monthly' },

    age_limit_min: { type: Number },
    age_limit_max: { type: Number },
    age_relaxation: { type: String },

    total_vacancies: { type: Number, required: false },

    reservation_details: {
        general: { type: Number },
        obc: { type: Number },
        sc: { type: Number },
        st: { type: Number },
        ews: { type: Number },
        pwd: { type: Number },
    },

    selection_process: [{ type: String }],
    selection_mode: { type: String },
    exam_mode: { type: String },
    application_mode: { type: String },

    // Flat Application Fee fields (no nested object)
    application_fee_general: { type: Number },
    application_fee_obc: { type: Number },
    application_fee_ews: { type: Number },
    application_fee_sc: { type: Number },
    application_fee_st: { type: Number },
    application_fee_pwd: { type: Number },
    application_fee_female: { type: Number },

    // Flat Important Date fields (no nested object)
    start_date: { type: Date },
    last_date: { type: Date },
    fee_last_date: { type: Date },
    exam_date: { type: Date },
    admit_card_release: { type: Date },
    result_date: { type: Date },

    // Job Description Field
    job_description: {
        type: String,
        required: false,
        maxlength: 1000000
    },

    //  NEW: Cover Image Field
    cover_image: {
        type: String,  // Stores file path or URL
        required: false,
        default: null
    },

    application_link: { type: String },
    job_pdf_url: { type: String },
    official_website: { type: String },

    admit_card_url: { type: String },
    result_url: { type: String },
    syllabus_url: { type: String },

    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    posted_on: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },

    // Admin Approval Fields
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },

    // SEO fields
    seo: seoSchema,

    // Additional fields for better job management
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }]
}, {
    timestamps: true
});


// Pre-save middleware to set approval timestamps
JobPostSchema.pre('save', function (next) {
    if (this.isModified('isApproved') && this.isApproved && !this.approvedAt) {
        this.approvedAt = new Date();
        this.rejectedBy = null;
        this.rejectedAt = null;
        this.rejectionReason = null;
    }

    if (this.isModified('isApproved') && !this.isApproved && this.rejectedBy && !this.rejectedAt) {
        this.rejectedAt = new Date();
        this.approvedBy = null;
        this.approvedAt = null;
    }

    next();
});


// Instance methods for approval management
JobPostSchema.methods.approve = function (adminId) {
    this.isApproved = true;
    this.approvedBy = adminId;
    this.approvedAt = new Date();
    this.rejectedBy = null;
    this.rejectedAt = null;
    this.rejectionReason = null;
    return this.save();
};

JobPostSchema.methods.reject = function (adminId, reason = null) {
    this.isApproved = false;
    this.rejectedBy = adminId;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
    this.approvedBy = null;
    this.approvedAt = null;
    return this.save();
};

JobPostSchema.methods.unapprove = function () {
    this.isApproved = false;
    this.approvedBy = null;
    this.approvedAt = null;
    return this.save();
};


// Static methods for filtered queries
JobPostSchema.statics.getApprovedJobs = function () {
    return this.find({ isApproved: true })
        .populate('job_category', 'name')
        .populate('approvedBy', 'aname aemail')
        .sort({ posted_on: -1 });
};

JobPostSchema.statics.getPendingJobs = function () {
    return this.find({ isApproved: false, rejectedBy: null })
        .populate('job_category', 'name')
        .sort({ posted_on: -1 });
};

JobPostSchema.statics.getRejectedJobs = function () {
    return this.find({ isApproved: false, rejectedBy: { $ne: null } })
        .populate('job_category', 'name')
        .populate('rejectedBy', 'aname aemail')
        .sort({ rejectedAt: -1 });
};


// Add indexes for better performance
JobPostSchema.index({ created_by: 1 }); // Missing index for teacher_id filter
JobPostSchema.index({ 'seo.slug': 1 });
JobPostSchema.index({ job_category: 1, status: 1 });
JobPostSchema.index({ location: 1, job_type: 1 });
JobPostSchema.index({ posted_on: -1 });
JobPostSchema.index({ isApproved: 1, posted_on: -1 });
JobPostSchema.index({ isApproved: 1, status: 1 });
JobPostSchema.index({ approvedAt: -1 });
JobPostSchema.index({ rejectedAt: -1 });
JobPostSchema.index({ status: 1, isApproved: 1, posted_on: -1 }); // Combined index for public listing


module.exports = {
    JobCategory: mongoose.model('JobCategory', JobCategorySchema),
    JobPost: mongoose.model('JobPost', JobPostSchema),
};
