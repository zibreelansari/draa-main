const express = require('express');
const {
  loginController,
  googleAuthController, //  ADD THIS

  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  resendRegistrationOTPController,

  updateProfileController,

  sendForgotPasswordOTPController,
  verifyForgotPasswordOTPController,
  resendForgotPasswordOTPController,
  verifyLoginOtpController,
  resendLoginOtpController
} = require('../Controllers/UserController');

const router = express.Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST || Login
router.post('/login', loginController);

router.post('/verify-otp', verifyLoginOtpController);

//  POST || Google Sign-In / Sign-Up
// Body: { credential }
router.post('/google-auth', googleAuthController);

router.post('/resend-login-otp', resendLoginOtpController);
// ============================================================================
// REGISTRATION ROUTES (OTP-BASED)
// ============================================================================

router.post('/send-registration-otp', sendRegistrationOTPController);

// Step 2: Verify OTP and complete registration
// POST /api/users/verify-registration-otp
// Body: { email, otp }
router.post('/verify-registration-otp', verifyRegistrationOTPController);

// Step 3: Resend OTP if needed
// POST /api/users/resend-registration-otp
// Body: { email }
router.post('/resend-registration-otp', resendRegistrationOTPController);

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

// Update user profile
// PUT /api/users/profile/:userId
router.put('/profile/:userId', updateProfileController);

// ============================================================================
// FORGOT PASSWORD ROUTES (OTP-BASED)
// ============================================================================

// Step 1: Send reset code
router.post('/send-forgot-password-otp', sendForgotPasswordOTPController);

// Step 2: Verify reset code and reset password
// Body: { email, resetCode, newPassword }
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTPController);

// Step 3: Resend reset code
router.post('/resend-forgot-password-otp', resendForgotPasswordOTPController);

module.exports = router;
