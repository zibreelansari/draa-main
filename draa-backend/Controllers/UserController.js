const userModel = require('../Models/UserModel');
const colors = require('colors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
// const { jwtSecret } = require('../Middlewares/student.auth.middleware.js'); // example import
const { OAuth2Client } = require("google-auth-library");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing in .env");
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const { noReplyTransporter: transporter } = require("../utils/mailConfig");

//  In-memory OTP store (use Redis in production)
const otpStore = new Map();

//  Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailTemplates = require('../utils/emailTemplates');
const { registerDeviceSession } = require("../utils/deviceHelper");

//  Send OTP Email
const sendOTPEmail = async (email, otp, name, type ="registration") => {
  try {
    let subject ="";
    let heading ="";
    let messageText ="";
    let validity = 10;

    switch (type) {
      case"registration":
        subject ="Email Verification Code - Draa";
        heading ="Account Verification";
        messageText =
"Thank you for registering with Draa. Please verify your email using the code below:";
        validity = 10;
        break;

      case"login":
        subject ="Login Verification Code - Draa";
        heading ="Secure Login Verification";
        messageText =
"We detected a login attempt. Please verify your identity using the code below:";
        validity = 10;
        break;

      case"forgot_password":
        subject ="Password Reset Code - Draa";
        heading ="Password Reset Request";
        messageText =
"We received a request to reset your password. Use the code below to continue:";
        validity = 15;
        break;

      default:
        subject ="Verification Code - Draa";
        heading ="Verification Required";
        messageText ="Use the verification code below:";
        validity = 10;
    }

    const htmlContent = emailTemplates.generateOTPEmail(name, heading, messageText, otp, validity);

    const mailOptions = {
      from:'"Draa Security" <no-reply@draa.in>',
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("OTP mail error:", error);
    throw new Error("Failed to send OTP email");
  }
};



// greet mail
const sendWelcomeRegistrationEmail = async (email, name, phn) => {
  try {
    const htmlContent = emailTemplates.generateWelcomeEmail(name, email, phn);

    const mailOptions = {
      from:'"Draa" <no-reply@draa.in>',
      to: email,
      subject:'Welcome to Draa  | Registration Successful',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Welcome mail error:", error);
    return false;
  }
};

// ==========================================
// EXISTING CONTROLLERS
// ==========================================
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:"Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel
      .findOne({ email: normalizedEmail })
      .select("+password +tokenVersion +authProvider");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:"Invalid email or password",
      });
    }

    //  Google account should not login via password
    if (user.authProvider ==="google") {
      return res.status(400).json({
        success: false,
        message:"This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message:"Invalid email or password",
      });
    }

    // ==========================
    //  GENERATE LOGIN OTP
    // ==========================

    const otp = generateOTP();

    await sendOTPEmail(normalizedEmail, otp, user.name);

    otpStore.set(`login_${normalizedEmail}`, {
      otp,
      userId: user._id,
      createdAt: Date.now(),
      attempts: 0,
    });

    // Auto expire after 10 minutes
    setTimeout(() => {
      otpStore.delete(`login_${normalizedEmail}`);
    }, 10 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message:"OTP sent to your registered email",
      step:"OTP_REQUIRED",
      userId: user._id,
      expiresIn: 600,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message:"Internal Server Error",
    });
  }
};


const verifyLoginOtpController = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message:"User ID and OTP are required",
      });
    }

    const user = await userModel.findById(userId).select("+tokenVersion");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:"User not found",
      });
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    const storedData = otpStore.get(`login_${normalizedEmail}`);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:"OTP expired. Please login again.",
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(`login_${normalizedEmail}`);
      return res.status(429).json({
        success: false,
        message:"Too many failed attempts. Please login again.",
      });
    }

    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.`,
      });
    }

    // ==========================
    //  ISSUE JWT
    // ==========================





    const deviceId = await registerDeviceSession(user, req);

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion || 0,
      deviceId: deviceId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn:"7d" });

    otpStore.delete(`login_${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message:"Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    return res.status(500).json({
      success: false,
      message:"OTP verification failed",
    });
  }
};





const resendLoginOtpController = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:"User ID is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:"User not found",
      });
    }

    const normalizedEmail = user.email.trim().toLowerCase();

    const storedData = otpStore.get(`login_${normalizedEmail}`);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:"Session expired. Please login again.",
      });
    }

    const otp = generateOTP();

    await sendOTPEmail(normalizedEmail, otp, user.name,"login");

    storedData.otp = otp;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    return res.status(200).json({
      success: true,
      message:"New OTP sent to your email",
    });

  } catch (error) {
    console.error("Resend Login OTP Error:", error);

    return res.status(500).json({
      success: false,
      message:"Failed to resend OTP",
    });
  }
};

// ==========================================
// OTP-BASED REGISTRATION CONTROLLERS
// ==========================================

const sendRegistrationOTPController = async (req, res) => {
  try {
    const { name, email, phn, password } = req.body;

    if (!name || !email || !phn || !password) {
      return res.status(400).json({
        success: false,
        message:"All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:"Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:"Email already registered",
      });
    }

    const otp = generateOTP();
    await sendOTPEmail(normalizedEmail, otp, name,"registration");

    otpStore.set(normalizedEmail, {
      otp,
      name,
      phn,
      password,
      createdAt: Date.now(),
      attempts: 0,
    });

    setTimeout(() => {
      otpStore.delete(normalizedEmail);
    }, 10 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message:"OTP sent to your email",
      data: {
        expiresIn: 600,
      },
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message:"Failed to send OTP",
      error: error.message,
    });
  }
};


const verifyRegistrationOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:"Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:"OTP must be 6 digits",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const storedData = otpStore.get(normalizedEmail);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"OTP expired or invalid. Please register again.",
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(normalizedEmail);
      return res.status(429).json({
        success: false,
        message:"Too many failed attempts. Please register again.",
      });
    }

    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.`,
      });
    }

    const hashedPassword = await bcrypt.hash(storedData.password, 10);

    const savedUser = await userModel.create({
      name: storedData.name,
      email: normalizedEmail,
      phn: storedData.phn,
      password: hashedPassword,
      authProvider:"local",
      tokenVersion: 0,
      isEmailVerified: true,
      verifiedAt: new Date(),
    });

    await sendWelcomeRegistrationEmail(savedUser.email, savedUser.name, savedUser.phn);

    const deviceId = await registerDeviceSession(savedUser, req, true);

    const tokenPayload = {
      userId: savedUser._id.toString(),
      email: savedUser.email,
      tokenVersion: savedUser.tokenVersion || 0,
      deviceId: deviceId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn:"7d" });

    otpStore.delete(normalizedEmail);

    return res.status(201).json({
      success: true,
      message:"Registration Successful! Email verified.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phn: savedUser.phn,
        token,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message:"Error during registration",
      error: error.message,
    });
  }
};



const resendRegistrationOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:"Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const storedData = otpStore.get(normalizedEmail);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"No pending registration for this email",
      });
    }

    const otp = generateOTP();
    await sendOTPEmail(normalizedEmail, otp, storedData.name);

    storedData.otp = otp;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    return res.status(200).json({
      success: true,
      message:"New OTP sent to your email",
      data: {
        expiresIn: 600,
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message:"Failed to resend OTP",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE PROFILE CONTROLLER
// ==========================================
const updateProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phn, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:"User ID is required",
      });
    }

    //  Must include password + tokenVersion + authProvider
    const user = await userModel.findById(userId).select("+password +tokenVersion +authProvider +googleId");
    if (!user) {
      return res.status(404).json({
        success: false,
        message:"User not found",
      });
    }

    // =============================
    //  Block password change for Google-SSO accounts
    // =============================
    if (newPassword && user.authProvider ==="google") {
      return res.status(403).json({
        success: false,
        message:"You are signed in with Google, so your password is managed by Google and cannot be changed here.",
      });
    }

    const updateData = {};

    // =============================
    //  Basic details update
    // =============================

    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message:"Name must be at least 2 characters",
        });
      }
      updateData.name = name.trim();
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message:"Invalid email format",
        });
      }

      const existingUser = await userModel.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:"Email already in use",
        });
      }

      updateData.email = email.trim().toLowerCase();
    }

    if (phn) {
      const cleanedPhone = phn.replace(/\s/g,"");
      if (!/^\d{10}$/.test(cleanedPhone)) {
        return res.status(400).json({
          success: false,
          message:"Phone number must be 10 digits",
        });
      }

      // Optional: ensure unique phone too
      const existingPhone = await userModel.findOne({
        phn: cleanedPhone,
        _id: { $ne: userId },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message:"Phone number already in use",
        });
      }

      updateData.phn = cleanedPhone;
    }

    // =============================
    //  Password change
    // =============================

    let passwordChanged = false;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message:"Current password is required to set a new password",
        });
      }

      //  bcrypt compare safe because we selected password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message:"Current password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:"New password must be at least 6 characters",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;

      //  Very important: invalidate all old tokens
      updateData.tokenVersion = (user.tokenVersion || 0) + 1;
      updateData.lastPasswordChangedAt = new Date();

      passwordChanged = true;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message:"No data to update",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
      .select("-password");

    return res.status(200).json({
      success: true,
      message: passwordChanged
        ?"Password updated successfully. You have been logged out from all devices."
        :"Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phn: updatedUser.phn,
      },
      logoutAllDevices: passwordChanged, //  frontend can use this flag
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message:"Failed to update profile",
      error: error.message,
    });
  }
};

// ==========================================
// FORGOT PASSWORD CONTROLLER
// ==========================================

// Step 1: Send Reset Code
const sendForgotPasswordOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:"Email is required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:"Invalid email format"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:"If an account exists with this email, you will receive a reset code shortly"
      });
    }

    //  google accounts should reset using Google login
    if (user.authProvider ==="google") {
      return res.status(400).json({
        success: false,
        message:"This account uses Google login. Please continue with Google Sign-In."
      });
    }

    const resetCode = generateOTP();
    await sendOTPEmail(normalizedEmail, resetCode, user.name,"forgot_password");

    otpStore.set(`reset_${normalizedEmail}`, {
      resetCode,
      userId: user._id,
      email: normalizedEmail,
      createdAt: Date.now(),
      attempts: 0
    });

    setTimeout(() => {
      otpStore.delete(`reset_${normalizedEmail}`);
    }, 15 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message:"Reset code sent to your email",
      data: {
        expiresIn: 900
      }
    });
  } catch (error) {
    console.error('Send forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message:"Failed to send reset code",
      error: error.message
    });
  }
};


// Step 2: Verify Reset Code and Reset Password (SECURE VERSION)
const verifyForgotPasswordOTPController = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // ======================
    // 1 BASIC VALIDATION
    // ======================
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message:"Email, reset code, and new password are required"
      });
    }

    if (!/^\d{6}$/.test(resetCode)) {
      return res.status(400).json({
        success: false,
        message:"Reset code must be exactly 6 digits"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:"New password must be at least 6 characters"
      });
    }

    // ======================
    // 2 FETCH OTP DATA
    // ======================
    const normalizedEmail = email.trim().toLowerCase();
    const storedData = otpStore.get(`reset_${normalizedEmail}`);

    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"Reset code expired or invalid. Please request a new one."
      });
    }

    // ======================
    // 3 ATTEMPT LIMIT
    // ======================
    if (storedData.attempts >= 5) {
      otpStore.delete(`reset_${normalizedEmail}`);
      return res.status(429).json({
        success: false,
        message:"Too many failed attempts. Please request a new reset code."
      });
    }

    // ======================
    // 4 VERIFY RESET CODE
    // ======================
    if (storedData.resetCode !== resetCode.trim()) {
      storedData.attempts += 1;

      return res.status(400).json({
        success: false,
        message: `Invalid reset code. ${5 - storedData.attempts} attempts remaining.`,
        remainingAttempts: 5 - storedData.attempts
      });
    }

    // ======================
    // 5 RESET PASSWORD + GLOBAL LOGOUT
    // ======================
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await userModel.findById(storedData.userId).select('+password');
    if (!user) {
      otpStore.delete(`reset_${normalizedEmail}`);
      return res.status(404).json({
        success: false,
        message:"User not found"
      });
    }

    user.password = hashedPassword;

    //  CRITICAL SECURITY STEP
    user.tokenVersion += 1;                // invalidate all JWTs
    user.lastPasswordChangedAt = new Date();

    await user.save();

    // ======================
    // 6 CLEANUP OTP
    // ======================
    otpStore.delete(`reset_${normalizedEmail}`);

    // ======================
    // 7 RESPONSE
    // ======================
    return res.status(200).json({
      success: true,
      message:"Password reset successfully. All devices have been logged out."
    });

  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message:"Error resetting password"
    });
  }
};


// Step 3: Resend Reset Code
const resendForgotPasswordOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:"Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const storedData = otpStore.get(`reset_${normalizedEmail}`);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"No pending password reset for this email"
      });
    }

    const resetCode = generateOTP();
    const user = await userModel.findById(storedData.userId);

    if (user) {
      await sendOTPEmail(normalizedEmail, resetCode, user.name,"forgot_password");
    }

    storedData.resetCode = resetCode;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    return res.status(200).json({
      success: true,
      message:"New reset code sent to your email",
      data: {
        expiresIn: 900
      }
    });
  } catch (error) {
    console.error("Resend forgot password OTP error:", error);
    return res.status(500).json({
      success: false,
      message:"Failed to resend reset code",
      error: error.message
    });
  }
};


const googleAuthController = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:"Google credential token is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message:"GOOGLE_CLIENT_ID missing in .env",
      });
    }

    //  Verify google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        message:"Invalid Google token",
      });
    }

    const googleId = payload.sub;
    const email = payload.email?.trim().toLowerCase();
    const name = payload.name ||"Google User";
    const avatar = payload.picture || null;
    const emailVerified = payload.email_verified;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:"Google email not found",
      });
    }

    let user = await userModel.findOne({ email }).select("+tokenVersion");

    //  If exists local account  link google
    if (user && !user.googleId) {
      user.googleId = googleId;
      user.authProvider ="google";
      user.avatar = avatar;
      user.isEmailVerified = true;
      user.verifiedAt = new Date();
      await user.save();
    }

    //  If not exists create new user
    if (!user) {
      user = await userModel.create({
        name,
        email,
        googleId,
        authProvider:"google",
        avatar,
        tokenVersion: 0,
        isEmailVerified: emailVerified,
        verifiedAt: emailVerified ? new Date() : null,
        Status:"approved", // optional
      });
    }

    const deviceId = await registerDeviceSession(user, req);

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion || 0,
      deviceId: deviceId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn:"7d" });

    return res.status(200).json({
      success: true,
      message:"Google authentication successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
        createdAt: user.createdAt,
        authProvider: user.authProvider,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message:"Google authentication failed",
      error: error.message,
    });
  }
};



module.exports = {
  loginController,
  googleAuthController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  resendRegistrationOTPController,
  updateProfileController,
  verifyLoginOtpController,
  sendForgotPasswordOTPController,
  verifyForgotPasswordOTPController,
  resendForgotPasswordOTPController,
  resendLoginOtpController
};
