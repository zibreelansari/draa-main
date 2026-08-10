const mongoose = require("mongoose");

const CurrentAffairCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CurrentAffairSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  type: {
    type: String,
    enum: ["DAILY","WEEKLY","MONTHLY","QUARTERLY","YEARLY"],
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"CurrentAffairCategory",
    required: true
  },

  shortDescription: String,
  content: String, // Rich HTML

  coverImage: String,
  pdfFile: String,
  pptFile: String,   // PPT/PPTX upload path

  publishDate: { type: Date, default: Date.now },

  tags: [String],

  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["ACTIVE","INACTIVE"],
    default:"ACTIVE"
  },

  views: { type: Number, default: 0 },
  rating: { type: Number, default: 3, min: 1, max: 5 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref:"Teacher" },

  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: String
  }

}, { timestamps: true });

const CurrentAffair = mongoose.model("CurrentAffair", CurrentAffairSchema);
const CurrentAffairCategory = mongoose.model("CurrentAffairCategory", CurrentAffairCategorySchema);

module.exports = {
  CurrentAffair,
  CurrentAffairCategory
};
