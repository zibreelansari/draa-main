const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  intentName: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['greeting','course','enrollment','technical','academic','navigation','feedback']
  },
  patterns: [{
    type: String,
    required: true
  }],
  responses: [{
    type: String,
    required: true
  }],
  requiredEntities: [String],
  context: String,
  priority: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  accuracy: Number
}, {
  timestamps: true
});

intentSchema.index({ intentName: 1 });
intentSchema.index({ category: 1 });

module.exports = mongoose.model('Intent', intentSchema);
