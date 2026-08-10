const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  code: {
    type: String,
    required: true,
    uppercase: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Subject',
    required: true
  },

  description: String,
  topicsCovered: [String],

  difficulty: {
    type: String,
    enum: ['beginner','intermediate','advanced','mixed'],
    default:'mixed'
  },

  estimatedStudyTime: Number,

  //  REMOVED PRICING COMPLETELY

  isActive: {
    type: Boolean,
    default: true
  },

  priority: {
    type: Number,
    default: 0
  },

  icon: String,
  color: String,

  prerequisites: [String],
  learningOutcomes: [String],

  recommendedBooks: [{
    title: String,
    author: String,
    isbn: String,
    link: String
  }]

}, {
  timestamps: true
});

//  Unique topic per subject
topicCategorySchema.index(
  { subject: 1, code: 1 },
  { unique: true }
);

//  Performance index
topicCategorySchema.index({ isActive: 1, priority: 1 });

module.exports = mongoose.model('TopicCategory', topicCategorySchema);