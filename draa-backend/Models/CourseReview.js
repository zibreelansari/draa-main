const mongoose = require("mongoose");

const courseReviewSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Course",
      required: true,
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// One review per student per course
courseReviewSchema.index({ course_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model("CourseReview", courseReviewSchema);
