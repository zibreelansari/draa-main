const express = require('express');
const {
  teacherloginController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  resendRegistrationOTPController,
  updateProfileController,
  sendForgotPasswordOTPController,
  verifyForgotPasswordOTPController,
  resendForgotPasswordOTPController,
  upload,
  verifyTeacherLoginOtpController,
  resendTeacherLoginOtpController,
  googleAuthController
} = require('../Controllers/TeachersCtrl');
const teacherAuth = require('../Middlewares/teacher.auth.middleware');

const router = express.Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

router.post('/teacherLogin', teacherloginController);
router.post('/resend-login-otp', resendTeacherLoginOtpController);
router.post('/google-auth', googleAuthController);
router.get('/verify-session', teacherAuth, (req, res) => {
    res.status(200).json({ success: true, teacher: req.teacher });
});
// ============================================================================
// REGISTRATION ROUTES (OTP-BASED)
// ============================================================================
router.post('/verify-otp', verifyTeacherLoginOtpController);

router.post('/send-registration-otp', sendRegistrationOTPController);


router.post('/verify-registration-otp', upload, verifyRegistrationOTPController);


router.post('/resend-registration-otp', resendRegistrationOTPController);

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

router.put('/profile/:teacherId', upload, updateProfileController);

// ============================================================================
// FORGOT PASSWORD ROUTES (OTP-BASED)
// ============================================================================


router.post('/send-forgot-password-otp', sendForgotPasswordOTPController);


router.post('/verify-forgot-password-otp', verifyForgotPasswordOTPController);


router.post('/resend-forgot-password-otp', resendForgotPasswordOTPController);

module.exports = router;
