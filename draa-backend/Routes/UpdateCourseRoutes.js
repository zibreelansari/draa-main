const express = require('express');
const { updateCourse } = require('../Controllers/UpdateCourseController');
const upload = require("../Middlewares/coursemulter");

const router = express.Router();

// Server.js mounts this at /api/v1/course/updateCourse, so the route is just /:id.
// Frontend calls /api/v1/course/updateCourse/:id.
router.put('/:id', upload.any(), updateCourse);

module.exports = router;
