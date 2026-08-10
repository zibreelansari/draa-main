const express = require('express'); 
const allCourse = require('../Controllers/AllCourseContent');
const { universalAuth } = require('../Middlewares/universalAuth');
const { toggleLike, addComment } = require('../Controllers/CourseInteractionCtrl');
const router = express.Router();

router.get('/allCourseContent', allCourse);
router.post('/content/:id/like', universalAuth, toggleLike);
router.post('/content/:id/comment', universalAuth, addComment);

module.exports = router;