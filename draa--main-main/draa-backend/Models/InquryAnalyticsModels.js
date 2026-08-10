const mongoose = require('mongoose');

const InquiryAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Daily Statistics
  totalInquiries: {
    type: Number,
    default: 0
  },
  verifiedInquiries: {
    type: Number,
    default: 0
  },
  convertedInquiries: {
    type: Number,
    default: 0
  },
  
  // Source Breakdown
  sourceBreakdown: {
    popup: { type: Number, default: 0 },
    contact_form: { type: Number, default: 0 },
    landing_page: { type: Number, default: 0 },
    direct: { type: Number, default: 0 }
  },
  
  // Status Breakdown
  statusBreakdown: {
    new: { type: Number, default: 0 },
    contacted: { type: Number, default: 0 },
    qualified: { type: Number, default: 0 },
    enrolled: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    closed: { type: Number, default: 0 }
  },
  
  // Performance Metrics
  verificationRate: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Popular Courses/Tags
  popularTags: [{
    tag: String,
    count: Number
  }]
  
}, {
  timestamps: true
});

// Compound index for date-based queries
InquiryAnalyticsSchema.index({ date: -1 });

// Static methods for analytics
InquiryAnalyticsSchema.statics.generateDailyReport = async function(date = new Date()) {
  const Inquiry = mongoose.model('Inquiry');
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  
  const dailyInquiries = await Inquiry.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });
  
  const report = {
    date: startOfDay,
    totalInquiries: dailyInquiries.length,
    verifiedInquiries: dailyInquiries.filter(i => i.isVerified).length,
    convertedInquiries: dailyInquiries.filter(i => i.isConverted).length,
    sourceBreakdown: {
      popup: dailyInquiries.filter(i => i.source ==='popup').length,
      contact_form: dailyInquiries.filter(i => i.source ==='contact_form').length,
      landing_page: dailyInquiries.filter(i => i.source ==='landing_page').length,
      direct: dailyInquiries.filter(i => i.source ==='direct').length
    },
    statusBreakdown: {
      new: dailyInquiries.filter(i => i.status ==='new').length,
      contacted: dailyInquiries.filter(i => i.status ==='contacted').length,
      qualified: dailyInquiries.filter(i => i.status ==='qualified').length,
      enrolled: dailyInquiries.filter(i => i.status ==='enrolled').length,
      rejected: dailyInquiries.filter(i => i.status ==='rejected').length,
      closed: dailyInquiries.filter(i => i.status ==='closed').length
    }
  };
  
  // Calculate rates
  report.verificationRate = report.totalInquiries > 0 
    ? (report.verifiedInquiries / report.totalInquiries) * 100 
    : 0;
  report.conversionRate = report.verifiedInquiries > 0 
    ? (report.convertedInquiries / report.verifiedInquiries) * 100 
    : 0;
  
  // Save or update the analytics record
  return this.findOneAndUpdate(
    { date: startOfDay },
    report,
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('InquiryAnalytics', InquiryAnalyticsSchema);
