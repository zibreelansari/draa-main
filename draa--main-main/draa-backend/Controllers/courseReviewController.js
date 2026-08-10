const CourseReview = require("../Models/CourseReview");

exports.submitReview = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message:"Unauthorized" });
    }

    const { course_id, rating, comment } = req.body;

    await CourseReview.create({
      course_id,
      rating,
      comment,
      student_id: req.user.userId
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};



exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await CourseReview.find({ course_id: courseId })
      .populate("student_id","name")
      .sort({ createdAt: -1 });

    const avg =
      reviews.reduce((a, b) => a + b.rating, 0) / (reviews.length || 1);

    res.json({
      success: true,
      reviews,
      averageRating: avg.toFixed(1),
      total: reviews.length,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
