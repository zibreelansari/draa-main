// models/TermsAndConditions.js
const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft','published','archived'],
    default:'draft'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  jurisdiction: {
    type: String,
    required: true
  },
  governingLaw: {
    type: String,
    required: true
  },
  minimumAge: {
    type: Number,
    required: true,
    min: 13,
    max: 21
  },
  acceptanceRequired: {
    type: Boolean,
    default: true
  },
  lastReviewDate: {
    type: Date,
    required: true
  },
  nextReviewDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one active terms at a time
termsAndConditionsSchema.pre('save', async function(next) {
  if (this.isActive && this.isNew) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('TermsAndConditions', termsAndConditionsSchema);
