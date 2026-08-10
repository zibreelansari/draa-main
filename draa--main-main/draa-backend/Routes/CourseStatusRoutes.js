const express = require('express');
const updateCourseStatus = require('../Controllers/CourseStatusController');
const router = express.Router();

router.put('/updateStatus/:id', updateCourseStatus);

module.exports = router;
