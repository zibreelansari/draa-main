// Routes/contactRoutes.js
const express = require('express');
const {
    submitContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} = require('../Controllers/contactUsController');

// Middleware for rate limiting (optional)
const rateLimit = require('express-rate-limit');

const contactRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message:'Too many contact form submissions. Please try again in 5 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

// Public routes
router.post('/contact/submit', contactRateLimit, submitContact);

// Admin routes (add authentication middleware as needed)
router.get('/admin/contacts', getAllContacts);
router.get('/admin/contacts/stats', getContactStats);
router.get('/admin/contacts/:id', getContactById);
router.put('/admin/contacts/:id/status', updateContactStatus);
router.delete('/admin/contacts/:id', deleteContact);

module.exports = router;
