const express = require("express");
const router = express.Router();
const {
  submitReview,
  getCourseReviews,
} = require("../Controllers/courseReviewController");

const {authMiddleware}=require('../Middlewares/student.auth.middleware')

router.post("/submit", authMiddleware, submitReview);
router.get("/:courseId", getCourseReviews);

module.exports = router;
