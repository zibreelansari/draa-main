const express = require('express');
const router = express.Router();
const testSeriesReviewController = require('../Controllers/testSeriesReviewController');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');

// Public route to get reviews
router.get('/:examId', testSeriesReviewController.getTestSeriesReviews);

// Protected route to submit a review
router.post('/:examId/submit', authMiddleware, testSeriesReviewController.submitReview);

module.exports = router;
