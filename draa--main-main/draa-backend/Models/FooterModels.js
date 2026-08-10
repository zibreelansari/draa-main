const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  linkType: {
    type: String,
    enum: ['internal','external','topic'],
    default:'internal'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const footerSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  links: [footerLinkSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('FooterSection', footerSectionSchema);
