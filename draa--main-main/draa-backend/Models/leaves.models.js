// models/Leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: String,
      required: true,
      index: true,
    },
    teacher_name: {
      type: String,
      required: true,
    },
    start_date: {
      type: String,
      required: true,
    },
    end_date: {
      type: String,
      required: true,
    },
    leave_type: {
      type: String,
      enum: ["sick","casual","earned","maternity","paternity","unpaid"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending","approved","rejected"],
      default:"pending",
    },
    applied_date: {
      type: Date,
      default: Date.now,
    },
    approved_by: {
      type: String,
      default: null,
    },
    approval_date: {
      type: Date,
      default: null,
    },
    rejection_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leave", leaveSchema);
