const mongoose = require("mongoose");

const AppLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },
    userEmail: {
      type: String,
      default: null,
      trim: true,
    },
    userName: {
      type: String,
      default: null,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ["student", "teacher", "admin", "guest"],
      default: "guest",
    },
    actionType: {
      type: String,
      enum: ["page_visit", "purchase", "upload", "auth", "api_hit", "system_event", "other"],
      default: "other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying
AppLogSchema.index({ timestamp: -1 });
AppLogSchema.index({ userRole: 1 });
AppLogSchema.index({ actionType: 1 });
AppLogSchema.index({ status: 1 });
AppLogSchema.index({ userId: 1 });
AppLogSchema.index({ userEmail: 1 });

// Text index for search functionality
AppLogSchema.index(
  {
    userName: "text",
    userEmail: "text",
    description: "text",
  },
  {
    name: "AppLogTextIndex",
  }
);

const AppLog = mongoose.models.AppLog || mongoose.model("AppLog", AppLogSchema);
module.exports = AppLog;
