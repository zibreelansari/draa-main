const express = require('express');
const router = express.Router();
const { getAllToppers, createTopper } = require('../Controllers/TopperController');

// Public routes
router.get('/all', getAllToppers);

// Admin routes (placeholder for auth middleware if any)
router.post('/', createTopper);

module.exports = router;
