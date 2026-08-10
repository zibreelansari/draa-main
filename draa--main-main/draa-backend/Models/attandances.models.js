// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    teacher_name: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    check_in_time: {
      type: String,
      required: true,
    },
    check_out_time: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["present","absent","half-day","late","leave"],
      default:"present",
    },
    work_hours: {
      type: Number,
      default: null,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    check_in_photo: {
      type: String,
      default: null,
    },
    check_out_photo: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    approved_by: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
attendanceSchema.index({ teacher_id: 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
