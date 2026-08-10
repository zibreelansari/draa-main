const express=require('express');

const router =express.Router();
const UpdateCourseApproval=require('../Controllers/CourseApprovalUpdate');


router.put('/:id',UpdateCourseApproval);

module.exports=router;