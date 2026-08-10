const express=require('express');

const {UserCount,TeacherCount,ResourceCount}=require('../Controllers/CountCtrl');

const router=express.Router();


//Fetch Students
router.get('/getAllStudents',UserCount);

//Fetch Teachers
router.get('/getAllTeachers',TeacherCount);

//Fetch Resource Counts
router.get('/getResources',ResourceCount);

module.exports=router;