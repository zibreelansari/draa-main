const express = require('express'); 

const updateStaus = require('../Controllers/UpdateCourseContent');
const router = express.Router();

router.put('/:id',updateStaus)

module.exports = router;