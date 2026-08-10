const deleteCourseContent = require('../Controllers/DeleteCourseContent');

const express= require('express');

const router=express.Router();

router.delete('/:id',deleteCourseContent)

module.exports=router