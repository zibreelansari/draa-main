const express = require('express');

const DeleteCourse= require('../Controllers/DeleteCourse');

const router = express.Router();

// Server.js mounts this at /api/v1/course/deleteCourse, so the route is just /:id.
// Frontend calls /api/v1/course/deleteCourse/:id.
router.delete('/:id', DeleteCourse);

module.exports = router;