const mongoose = require('mongoose');

const videographySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A title is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'A video URL is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['YouTube', 'Shorts'],
    default: 'YouTube'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Videography', videographySchema);
