const express=require('express');

const router=express.Router();
const {CourseDetailsController,GetCoursesByTeacherController}=require('../Controllers/CourseDetailsCtrl');


// course details
router.get('/courseDetails/:id',CourseDetailsController);
router.get('/courseDetails/teacher/:teacherId',GetCoursesByTeacherController);

module.exports=router;