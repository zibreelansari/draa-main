const express=require('express');
const teacherProfileController=require('../Controllers/TeacherProfile');

const router=express.Router();

// Define the route for getting teacher profile
router.get('/:id', teacherProfileController);

module.exports=router;
