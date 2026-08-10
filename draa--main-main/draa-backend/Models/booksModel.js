const mongoose = require('mongoose');


// SEO Schema for Books
const seoSchema = new mongoose.Schema({
  seo_title: { type: String, required: true, maxlength: 60 },
  meta_keywords: { type: String, required: true },
  meta_description: { type: String, required: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true },
  og_title: { type: String, maxlength: 60 },
  og_description: { type: String, maxlength: 160 },
  canonical_url: { type: String },
  robots: { type: String, default:'index, follow' },
  schema_markup: { type: String }
});


const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  features: [
    {
      type: String,
      trim: true
    }
  ],
  category: { type: String, ref:'BookCategory' },
  coverImage: String,

  // Multiple additional images for product gallery
  addOnImages: [{ type: String }],

  pdfUrl: String,
  youtubeUrl: String,

  physicalPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  digitalPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  physicalDiscountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  digitalDiscountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },



  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },

  // Admin Approval Field
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'admins',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },

  // SEO fields
  seo: seoSchema,

  // Additional fields
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }],
  pages: Number,

  //  NEW: Publication Information Fields
  publicationName: {
    type: String,
    trim: true,
    default:''
  },
  publicationYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear() + 1,
    validate: {
      validator: function (v) {
        return !v || (v >= 1000 && v <= new Date().getFullYear() + 1);
      },
      message: props => `${props.value} is not a valid publication year!`
    }
  },
  isbn: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        // ISBN-10 or ISBN-13 format validation (optional)
        if (!v) return true; // Allow empty
        const isbn = v.replace(/[-\s]/g,''); // Remove hyphens and spaces
        return /^(?:\d{10}|\d{13})$/.test(isbn);
      },
      message: props => `${props.value} is not a valid ISBN format! Use ISBN-10 (10 digits) or ISBN-13 (13 digits)`
    }
  },

  // Language field
  language: {
    type: String,
    trim: true,
    default:'English'
  },



  bookType: {
    type: String,
    enum: ['paperback','pdftype','both(ppt+pdf)'],
    default:'pdftype'
  },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref:'Teacher' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});


// Add indexes
bookSchema.index({'seo.slug': 1 });
bookSchema.index({ category: 1, isFeatured: 1 });
bookSchema.index(
  { title:'text', author:'text', description:'text' },
  {
    default_language:'none',
    language_override:'__lang'
  }
);

bookSchema.index({ createdAt: -1 });
bookSchema.index({ isApproved: 1, createdAt: -1 });
bookSchema.index({ language: 1 });
bookSchema.index({ isbn: 1 }); //  NEW: Index for ISBN
bookSchema.index({ publicationYear: -1 }); //  NEW: Index for publication year


bookSchema.pre('save', function (next) {
  if (this.language) {
    // Convert to simple ASCII label
    this.language = this.language
      .toString()
      .trim()
      .replace(/\s+/g,'');
  }
  next();
});


// Pre-save middleware to set approval timestamps
bookSchema.pre('save', function (next) {
  if (this.isModified('isApproved') && this.isApproved && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});


// Instance methods
bookSchema.methods.approve = function (adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};


bookSchema.methods.unapprove = function () {
  this.isApproved = false;
  this.approvedBy = null;
  this.approvedAt = null;
  return this.save();
};


// Static methods
bookSchema.statics.getApprovedBooks = function () {
  return this.find({ isApproved: true })
    .populate('category','name')
    .sort({ createdAt: -1 });
};


bookSchema.statics.getPendingBooks = function () {
  return this.find({ isApproved: false })
    .populate('category','name')
    .sort({ createdAt: -1 });
};


module.exports = mongoose.model('Book', bookSchema);
