const Topper = require('../Models/Topper');


exports.getAllToppers = async (req, res) => {
  try {
    let toppers = await Topper.find({ isFeatured: true }).sort({ createdAt: -1 });

    // Seed data if empty for immediate visibility
    if (toppers.length === 0) {
      const defaultToppers = [
        {
          name:"Rahul Kumar",
          rank:"AIR 1",
          examName:"SSC CGL",
          year:"2025",
          score:"687/700",
          quote:"Draa test series was my secret weapon. The pattern was exactly like the real exam.",
          category:"SSC",
        },
        {
          name:"Priya Singh",
          rank:"AIR 3",
          examName:"IBPS PO",
          year:"2025",
          score:"578/600",
          quote:"The detailed solutions and video explanations helped me crack it in my first attempt!",
          category:"Banking",
        }
      ];
      toppers = await Topper.insertMany(defaultToppers);
    }

    res.status(200).json({
      success: true,
      count: toppers.length,
      data: toppers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message:'Server Error',
      error: err.message
    });
  }
};

/**
 * @desc    Create a new topper
 * @route   POST /api/v1/admin/toppers
 * @access  Private/Admin
 */
exports.createTopper = async (req, res) => {
  try {
    const topper = await Topper.create(req.body);
    res.status(201).json({
      success: true,
      data: topper
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message:'Validation Error',
      error: err.message
    });
  }
};
