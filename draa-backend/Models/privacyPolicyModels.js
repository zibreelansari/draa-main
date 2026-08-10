// models/PrivacyPolicy.js
const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
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
  sections: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  metadata: {
    language: {
      type: String,
      default:'en'
    },
    jurisdiction: {
      type: String,
      default:'India'
    },
    companyName: {
      type: String,
      // required: true
      default:'Draa Pvt Ltd.'
    },
    contactEmail: {
      type: String,
      required: true,
      default:"contact@draa.in"
    }
  },
  compliance: {
    gdprCompliant: {
      type: Boolean,
      default: false
    },
    ccpaCompliant: {
      type: Boolean,
      default: false
    },
    dataProcessingPurposes: [{
      type: String
    }]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    acceptances: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date
    }
  },
  createdBy: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  updatedBy: {
    name: String,
    email: String
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Creates createdAt and updatedAt
});

// Middleware to calculate word count before saving
privacyPolicySchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

// Ensure only one active policy at a time
privacyPolicySchema.pre('save', async function(next) {
  if (this.isActive && this.isNew) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('PrivacyPolicy', privacyPolicySchema);
