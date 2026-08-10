const express = require('express');
const SpecficCourseCtrl = require('../Controllers/SpecificCourseCtrl');
const router = express.Router();


// course details
router.get('/:id', SpecficCourseCtrl);

module.exports = router;