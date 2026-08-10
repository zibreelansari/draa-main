const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true,'A banner title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true,'An image URL is required']
  },
  mobileImageUrl: {
    type: String
  },
  link: {
    type: String, // Where the banner redirects on click
    default:'#'
  },
  btnText: {
    type: String,
    default:'Learn More'
  },
  type: {
    type: String,
    enum: ['hero','offer','popup','sidebar'],
    default:'hero'
  },
  deviceType: {
    type: String,
    enum: ['web','mobile','both'],
    default:'both'
  },
  mobileResizeMode: {
    type: String,
    enum: ['padded', 'crop', 'stretch'],
    default: 'padded'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  themeColor: {
    type: String, // Hex code for text or background accents
    default:'#ffffff'
  },
  textPosition: {
    type: String,
    enum: ['left','center','right'],
    default:'left'
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);