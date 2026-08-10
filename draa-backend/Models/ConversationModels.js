const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  sender: {
    type: String,
    enum: ['user','bot','agent'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  intent: String,
  confidence: Number,
  attachments: [String]
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  context: {
    currentTopic: String,
    entities: mongoose.Schema.Types.Mixed,
    previousIntents: [String],
    lastActivity: Date
  },
  status: {
    type: String,
    enum: ['active','resolved','escalated'],
    default:'active'
  },
  channel: {
    type: String,
    default:'web'
  },
  metadata: {
    resolved: {
      type: Boolean,
      default: false
    },
    rating: Number,
    escalated: Boolean,
    handoffTime: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ sessionId: 1 });
conversationSchema.index({'messages.timestamp': -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
