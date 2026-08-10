const express = require('express');
const router = express.Router();
const chatbotFAQController = require('../Controllers/ChatbotFAQController');

// Public route
router.get('/public', chatbotFAQController.getPublicFAQs);

// Admin CMS routes
router.get('/all', chatbotFAQController.getAllFAQsAdmin);
router.post('/create', chatbotFAQController.createFAQ);
router.put('/update/:id', chatbotFAQController.updateFAQ);
router.delete('/delete/:id', chatbotFAQController.deleteFAQ);
router.patch('/toggle/:id', chatbotFAQController.toggleFAQStatus);

module.exports = router;
