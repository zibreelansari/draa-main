



const express = require('express');
const {
  adminLoginController,
  adminVerifyOtpController,
  adminRegisterController,
  adminUpdateProfileController,
  resendAdminLoginOtpController,
  adminVerifySessionController
} = require('../Controllers/AdminCtrl');
const adminAuth = require('../Middlewares/adminAuth.middleware');

const router = express.Router();

// AUTH
router.post('/adminLogin', adminLoginController);      // Step 1
router.post('/verify-otp', adminVerifyOtpController); // Step 2
router.post('/resend-login-otp', resendAdminLoginOtpController);
router.post('/adminRegister', adminRegisterController);
router.put('/update-profile', adminAuth, adminUpdateProfileController); //update profile
router.get('/verify-session', adminAuth, adminVerifySessionController); // Session check

module.exports = router;