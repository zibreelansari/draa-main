const express = require("express");
const upload = require("../Middlewares/coursemulter");
const { createCourse, duplicateCourse } = require("../Controllers/CourseController");

const router = express.Router();

// Use upload.any() because chapter fields are dynamic
router.post(
"/create-course",
  upload.any(),
  createCourse
);

// Duplicate an existing course — server-side copy of all fields including
// file paths, so no re-upload is needed.
router.post("/duplicate/:id", duplicateCourse);

module.exports = router;
