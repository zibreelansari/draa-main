const express= require("express");
const router=express.Router();
const {TeacherOwnProfile,AdminOwnProfile}=require('../Controllers/AdminTeacherProfile')

// Route to get teacher's own profile
router.get('/:id', TeacherOwnProfile);

// Route to get admin's own profile
router.get('/:id', AdminOwnProfile);

module.exports=router;

