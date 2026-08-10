// models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  marks:{type:Number,required:true},
  passmarks:{type:Number,required:true},
  dueDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:"Teacher", required: true },
  fileUrl: [
  {
    filename: String,
    path: String,
    uploadedAt: Date,
  }
],
 // will be updated after upload
  live_Status: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Assignment", assignmentSchema);
