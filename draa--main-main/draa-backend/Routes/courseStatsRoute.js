const express = require('express');
const getCourseStats = require('../Controllers/CourseStatsController');
const router = express.Router();

router.get('/stats/overview', getCourseStats);

module.exports = router;
