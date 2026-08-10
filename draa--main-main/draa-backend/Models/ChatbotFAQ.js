const mongoose = require('mongoose');

const chatbotFAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'A question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'An answer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'A category is required'],
    default: 'General',
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

module.exports = mongoose.model('ChatbotFAQ', chatbotFAQSchema);
