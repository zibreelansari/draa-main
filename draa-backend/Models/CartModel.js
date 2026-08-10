const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookType: {
    type: String,
    enum: ['physical', 'pdftype', 'paperback', 'ebook'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  title: String,
  author: String,
  coverImage: String,
  basePrice: Number,
  discountPercentage: Number,
  finalPrice: Number,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  lastEmailSentAt: {
    type: Date,
    default: null
  },
  emailSentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
