const express = require('express');
const userProfileController = require('../Controllers/UserProfileController');

const router = express.Router();


//get user by id 

router.get('/:id', userProfileController);

module.exports = router;