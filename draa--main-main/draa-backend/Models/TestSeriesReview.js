const mongoose = require('mongoose');

const testSeriesReviewSchema = new mongoose.Schema({
  examination_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'ExaminationCategory',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
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
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
testSeriesReviewSchema.index({ examination_category_id: 1, student_id: 1 }, { unique: true });
testSeriesReviewSchema.index({ examination_category_id: 1, createdAt: -1 });

// Static method to calculate average rating and distribution
testSeriesReviewSchema.statics.calculateAverageRating = async function(examId) {
  const stats = await this.aggregate([
    {
      $match: { examination_category_id: examId, isApproved: true }
    },
    {
      $group: {
        _id:'$examination_category_id',
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

module.exports = mongoose.model('TestSeriesReview', testSeriesReviewSchema);
