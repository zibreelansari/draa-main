const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'unsubscribed'],
    default: 'pending'
  },
  unsubscribeReason: {
    type: String,
    enum: ['frequency', 'relevance', 'mistake', 'other', ''],
    default: ''
  },
  verificationToken: {
    type: String,
    index: true
  },
  tokenExpiresAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index to optimize active email newsletters
newsletterSubscriptionSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
