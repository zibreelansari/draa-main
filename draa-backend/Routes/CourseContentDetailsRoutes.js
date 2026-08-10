const courseContentDetails=require('../Controllers/CourseContentDetails');

const expreress=require('express');

const router=expreress.Router();

router.get('/:id',courseContentDetails);


module.exports=router;