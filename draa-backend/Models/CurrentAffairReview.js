const mongoose = require("mongoose");

const currentAffairReviewSchema = new mongoose.Schema(
  {
    current_affair_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAffair",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// One review per student per current affair
currentAffairReviewSchema.index({ current_affair_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model("CurrentAffairReview", currentAffairReviewSchema);
