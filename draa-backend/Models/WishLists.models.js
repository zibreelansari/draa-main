const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    // =========================
    // USER REFERENCE
    // =========================
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: true,
      index: true
    },

    // =========================
    // ITEM INFO
    // =========================
    item_type: {
      type: String,
      enum: ['course','test_series','book','topic'],
      required: true,
      index: true
    },

    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    // =========================
    //  ENHANCED SNAPSHOT (UI READY)
    // =========================
    snapshot: {
      type: {
        type: String // course | book | test_series
      },

      title: String,
      subtitle: String, // author / teacher / short desc

      image: String,

      // Pricing
      price: Number,
      originalPrice: Number,
      discount: Number,

      // Meta
      category: String,
      language: String,

      // Engagement
      rating: Number,
      ratingCount: Number,
      views: Number,
      students: Number,

      // Course/Test specific
      chapters: Number,
      materials: Number,
      totalQuestions: Number,
      totalMarks: Number,

      // Flags
      isFeatured: Boolean,
      isPopular: Boolean,
      isPaid: Boolean,

      // SEO / navigation
      slug: String,

      //  Important: availability check
      isAvailable: {
        type: Boolean,
        default: true
      }
    },

    // =========================
    //  USER METADATA
    // =========================
    addedAt: {
      type: Date,
      default: Date.now
    },

    priority: {
      type: String,
      enum: ['low','medium','high'],
      default:'medium'
    },

    notes: {
      type: String,
      maxlength: 300
    },

    // =========================
    //  SOFT DELETE SUPPORT
    // =========================
    isRemoved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// =========================
//  UNIQUE INDEX (NO DUPLICATES)
// =========================
WishlistSchema.index(
  { user_id: 1, item_type: 1, item_id: 1 },
  { unique: true }
);

// =========================
//  PERFORMANCE INDEXES
// =========================
WishlistSchema.index({ user_id: 1, createdAt: -1 });
WishlistSchema.index({ item_type: 1, createdAt: -1 });
WishlistSchema.index({'snapshot.category': 1 });
WishlistSchema.index({'snapshot.price': 1 });

// =========================
//  VIRTUALS (FOR UI)
// =========================
WishlistSchema.virtual('discountedPrice').get(function () {
  if (!this.snapshot?.originalPrice) return this.snapshot?.price || 0;

  const discount = this.snapshot.discount || 0;
  return (
    this.snapshot.originalPrice -
    (this.snapshot.originalPrice * discount) / 100
  );
});

WishlistSchema.virtual('isDiscounted').get(function () {
  return (this.snapshot?.discount || 0) > 0;
});

// =========================
//  METHODS
// =========================
WishlistSchema.methods.markUnavailable = function () {
  this.snapshot.isAvailable = false;
  return this.save();
};

WishlistSchema.methods.restore = function () {
  this.isRemoved = false;
  return this.save();
};

WishlistSchema.methods.softDelete = function () {
  this.isRemoved = true;
  return this.save();
};

// =========================
//  STATIC METHODS
// =========================
WishlistSchema.statics.getUserWishlist = function (userId) {
  return this.find({
    user_id: userId,
    isRemoved: false
  })
    .sort({ createdAt: -1 })
    .lean();
};

WishlistSchema.statics.clearWishlist = function (userId) {
  return this.deleteMany({ user_id: userId });
};

WishlistSchema.statics.countWishlist = function (userId) {
  return this.countDocuments({
    user_id: userId,
    isRemoved: false
  });
};

// =========================
//  AUTO CLEAN SNAPSHOT (OPTIONAL)
// =========================
WishlistSchema.pre('save', function (next) {
  if (this.snapshot) {
    // Clean null values
    Object.keys(this.snapshot).forEach(key => {
      if (this.snapshot[key] === undefined) {
        delete this.snapshot[key];
      }
    });
  }
  next();
});

// =========================
// JSON CLEANUP
// =========================
WishlistSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);