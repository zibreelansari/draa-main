const TestSeriesReview = require('../Models/TestSeriesReview');
const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');
const Student = require('../Models/UserModel');

exports.getTestSeriesReviews = async (req, res) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await TestSeriesReview.find({
      examination_category_id: examId,
      isApproved: true
    })
      .populate('student_id','name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await TestSeriesReview.countDocuments({
      examination_category_id: examId,
      isApproved: true
    });

    const stats = await TestSeriesReview.calculateAverageRating(examId);

    res.json({
      success: true,
      reviews,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching test series reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { examId } = req.params;
    const { rating, title, comment } = req.body;
    const studentId = req.user.userId;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message:'Rating and comment are required' });
    }

    // Check if student already reviewed this test series
    const existingReview = await TestSeriesReview.findOne({
      examination_category_id: examId,
      student_id: studentId
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message:'You have already reviewed this test series' });
    }

    // Check if student purchased the test series (for verified badge)
    // It could be a category purchase or a subject purchase within the category
    const purchase = await TestSeriesEnrollment.findOne({
      student_id: studentId,
      examination_category_id: examId,
"payment.status":"paid"
    });

    const isVerified = !!purchase;

    const newReview = await TestSeriesReview.create({
      examination_category_id: examId,
      student_id: studentId,
      rating,
      title,
      comment,
      verified: isVerified
    });

    res.json({
      success: true,
      review: newReview,
      message:'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting test series review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
