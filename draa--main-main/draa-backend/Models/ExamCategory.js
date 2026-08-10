const mongoose = require("mongoose");

const ExamCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  description: String,
  icon: String,

  isActive: { type: Boolean, default: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Teacher"
  }
}, { timestamps: true });

module.exports = mongoose.model("ExamCategory", ExamCategorySchema);
