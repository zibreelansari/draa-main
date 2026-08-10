const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Book',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  review: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false // True if student actually purchased the book
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Student'
  }],
  notHelpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Student'
  }],
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for purchased books
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  response: {
    text: String,
    respondedBy: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ book: 1, student: 1 });
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId, isApproved: true }
    },
    {
      $group: {
        _id:'$book',
        averageRating: { $avg:'$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push:'$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const distribution = stats[0].ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution: {
        5: distribution[5] || 0,
        4: distribution[4] || 0,
        3: distribution[3] || 0,
        2: distribution[2] || 0,
        1: distribution[1] || 0
      }
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
};

module.exports = mongoose.model('BookReview', reviewSchema);
