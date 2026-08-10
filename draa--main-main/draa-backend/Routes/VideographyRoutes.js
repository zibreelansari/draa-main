const express = require('express');
const router = express.Router();
const videographyController = require('../Controllers/VideographyController');

// Public route
router.get('/public', videographyController.getPublicVideos);

// Admin CMS routes
router.get('/all', videographyController.getAllVideosAdmin);
router.post('/create', videographyController.createVideo);
router.put('/update/:id', videographyController.updateVideo);
router.delete('/delete/:id', videographyController.deleteVideo);
router.patch('/toggle/:id', videographyController.toggleVideoStatus);

module.exports = router;
