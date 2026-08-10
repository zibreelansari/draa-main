const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  icon: { type: String, trim: true, maxlength: 50, default: 'sparkles' },
  link: { type: String, trim: true, maxlength: 500, default: '' },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true, maxlength: 80 },
  eyebrow: { type: String, trim: true, maxlength: 100, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 220 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  layout: {
    type: String,
    enum: ['feature-grid', 'journey', 'statement'],
    default: 'feature-grid',
  },
  items: { type: [contentItemSchema], default: [] },
  callToAction: {
    label: { type: String, trim: true, maxlength: 100, default: '' },
    href: { type: String, trim: true, maxlength: 500, default: '' },
  },
}, { _id: false });

const corporatePageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug may contain only lowercase letters, numbers and hyphens'],
  },
  navigationLabel: { type: String, required: true, trim: true, maxlength: 80 },
  order: { type: Number, default: 0 },
  eyebrow: { type: String, trim: true, maxlength: 100, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 240 },
  summary: { type: String, required: true, trim: true, maxlength: 2000 },
  sections: { type: [sectionSchema], default: [] },
  seo: {
    title: { type: String, trim: true, maxlength: 100, default: '' },
    description: { type: String, trim: true, maxlength: 300, default: '' },
  },
  isPublished: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

corporatePageSchema.index({ isPublished: 1, order: 1 });

module.exports = mongoose.model('CorporatePage', corporatePageSchema);
