// Models/AboutUsModels.js
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const aboutUsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: false
  },

  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  tagline: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number,
    required: [true, 'Founded year is required'],
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    type: String,
    required: [true, 'Headquarters is required'],
    trim: true
  },
  website: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    default: ''
  },

  overview: {
    type: String,
    default: function () {
      return `${this.companyName} is a leading company committed to excellence and innovation.`;
    }
  },
  mission: {
    type: String,
    default: 'To provide exceptional services and value to our customers.'
  },
  vision: {
    type: String,
    default: 'To be a leader in our industry and make a positive impact.'
  },
  values: {
    type: [String],
    default: []
  },
  story: {
    type: String,
    default: function () {
      return `${this.companyName} was founded with a vision to make a difference.`;
    }
  },

  teamMembers: [teamMemberSchema],

  statistics: {
    studentsServed: { type: Number, default: 0, min: 0 },
    coursesOffered: { type: Number, default: 0, min: 0 },
    yearsExperience: { type: Number, default: 1, min: 0 },
    successRate: { type: Number, default: 95, min: 0, max: 100 }
  },

  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },

  metaTitle: {
    type: String,
    default: function () {
      return `About ${this.companyName}`;
    }
  },
  metaDescription: {
    type: String,
    default: function () {
      return `Learn more about ${this.companyName} and our mission.`;
    }
  },
  keywords: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Pre-save middleware to set defaults
aboutUsSchema.pre('save', function (next) {
  if (this.isNew) {
    if (!this.overview) {
      this.overview = `${this.companyName} is a leading company committed to excellence and innovation.`;
    }
    if (!this.story) {
      this.story = `${this.companyName} was founded with a vision to make a difference.`;
    }
    if (!this.metaTitle) {
      this.metaTitle = `About ${this.companyName}`;
    }
    if (!this.metaDescription) {
      this.metaDescription = `Learn more about ${this.companyName} and our mission.`;
    }
    if (this.keywords.length === 0) {
      this.keywords = [this.companyName.toLowerCase(), 'about us', 'company'];
    }
  }
  next();
});

// Ensure only one active about page at a time
aboutUsSchema.pre('save', async function (next) {
  if (this.isActive && this.isNew) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);
