const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  startTime: { type: Date, required: true },
  zoomMeetingId: { type: String },
  duration:{type: Number, required: true},
  joinUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:"Teacher" },
  status: { type: String, enum: ["scheduled","started","ended"], default:"scheduled" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref:"Course", required: true },
});

module.exports = mongoose.model("Livesessions", meetingSchema);
