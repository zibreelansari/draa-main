const express = require('express');
const router = express.Router();
const { saveLead, sendOTP, verifyOTP } = require('../Controllers/FreeResourceController');

router.post('/submit', saveLead);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
