const StudyIndiaProfile = require('../Models/StudyIndiaProfile');

const allowedFields = ['nationality', 'intendedLevel', 'fieldOfStudy', 'preferredIntake', 'annualBudgetUsd', 'currentStage', 'checklist', 'notes'];

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudyIndiaProfile.findOne({ user: req.user.userId }).lean();
    return res.status(200).json({
      success: true,
      data: profile || {
        nationality: '', intendedLevel: '', fieldOfStudy: '', preferredIntake: '',
        annualBudgetUsd: 0, currentStage: 'exploring', checklist: [], notes: '',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveMyProfile = async (req, res) => {
  try {
    const updates = Object.fromEntries(allowedFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]));
    const profile = await StudyIndiaProfile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: updates, $setOnInsert: { user: req.user.userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
