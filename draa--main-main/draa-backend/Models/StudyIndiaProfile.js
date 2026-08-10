const mongoose = require('mongoose');

const studyIndiaProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  nationality: { type: String, trim: true, maxlength: 100, default: '' },
  intendedLevel: { type: String, trim: true, maxlength: 80, default: '' },
  fieldOfStudy: { type: String, trim: true, maxlength: 160, default: '' },
  preferredIntake: { type: String, trim: true, maxlength: 80, default: '' },
  annualBudgetUsd: { type: Number, min: 0, max: 1000000, default: 0 },
  currentStage: {
    type: String,
    enum: ['exploring', 'shortlisting', 'preparing', 'applied', 'offer-received', 'visa-frro'],
    default: 'exploring',
  },
  checklist: [{ type: String, trim: true, maxlength: 120 }],
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StudyIndiaProfile', studyIndiaProfileSchema);
