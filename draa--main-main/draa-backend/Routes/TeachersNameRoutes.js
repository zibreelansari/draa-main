const express=require('express');

const router=express.Router();
const teachers=require('../Controllers/AllTeachers');

// router for all teachers

router.get('/allteachersName',teachers);


module.exports=router;