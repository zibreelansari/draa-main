const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,'Topper name is required'],
    trim: true
  },
  rank: {
    type: String,
    required: [true,'Rank is required (e.g., AIR 1)'],
    trim: true
  },
  examName: {
    type: String,
    required: [true,'Exam name is required'],
    trim: true
  },
  year: {
    type: String,
    default: new Date().getFullYear().toString()
  },
  score: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default:''
  },
  quote: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Topper', topperSchema);
