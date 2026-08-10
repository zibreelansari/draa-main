const TeacherModel = require('../Models/TeacherModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");

require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Remove top-level JWT_SECRET to ensure it's always read from process.env at runtime


//  Setup Nodemailer
const { noReplyTransporter: transporter } = require("../utils/mailConfig");

//  In-memory OTP store
const otpStore = new Map();

// ===== MULTER CONFIGURATION =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname,'../uploads/teachers');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `teacher-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== HELPER FUNCTIONS =====

const generateToken = (teacher) => {
  const secret = process.env.JWT_SECRET ||"your-secret-key-change-in-production";
  return jwt.sign(
    {
      teacherId: teacher._id.toString(),
      temail: teacher.temail,
      tokenVersion: teacher.tokenVersion || 0,
      role:'teacher'
    },
    secret,
    { expiresIn:"7d" }
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailTemplates = require('../utils/emailTemplates');

const sendOTPEmail = async (email, otp, name, type ='registration') => {
  try {
    let subject ='';
    let heading ='';
    let purposeText ='';
    let validityMinutes = 10;

    switch (type) {
      case'registration':
        subject ='Email Verification Code - Draa Teacher Registration';
        heading ='Teacher Registration';
        purposeText ='Thank you for registering as a teacher with Draa. Please verify your email using the code below:';
        validityMinutes = 10;
        break;

      case'login':
        subject ='Login Verification Code - Draa';
        heading ='Secure Login Verification';
        purposeText ='We detected a login attempt on your account. Please verify your login using the code below:';
        validityMinutes = 10;
        break;

      case'forgot_password':
        subject ='Password Reset Code - Draa';
        heading ='Password Reset';
        purposeText ='We received a request to reset your password. Use the code below to reset your account password:';
        validityMinutes = 15;
        break;

      default:
        subject ='Verification Code - Draa';
        heading ='Verification Required';
        purposeText ='Use the verification code below:';
        validityMinutes = 10;
    }

    const htmlContent = emailTemplates.generateOTPEmail(name, heading, purposeText, otp, validityMinutes);

    const mailOptions = {
      from:'"Draa Security" <no-reply@draa.in>',
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// ==========================================
// EXISTING LOGIN CONTROLLER
// ==========================================

const teacherloginController = async (req, res) => {
  try {
    const { temail, tpassword } = req.body;

    if (!temail || !tpassword) {
      return res.status(400).json({
        success: false,
        message:"Email and password are required",
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();
    const teacher = await TeacherModel.findOne({ temail: normalizedEmail }).select("+tpassword");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:"Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(tpassword, teacher.tpassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:"Invalid credentials",
      });
    }

    //  GENERATE OTP
    const otp = generateOTP();

    sendOTPEmail(
      normalizedEmail,
      otp,
      teacher.tname,
      "login"
    ).catch(err => {
      console.error("Failed to send login OTP email in background:", err);
    });

    // Store OTP in memory
    otpStore.set(`login_${teacher._id}`, {
      otp,
      teacherId: teacher._id,
      normalizedEmail,
      createdAt: Date.now(),
      attempts: 0,
    });

    // Auto-expire OTP after 10 min
    setTimeout(() => {
      otpStore.delete(`login_${teacher._id}`);
    }, 10 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message:"OTP sent to registered email",
      step:"OTP_REQUIRED",
      teacherId: teacher._id,
    });
  } catch (error) {
    console.error("Teacher login error:", error);
    res.status(500).json({
      success: false,
      message:"Login failed. Please try again.",
    });
  }
};

const verifyTeacherLoginOtpController = async (req, res) => {
  try {
    const { teacherId, otp } = req.body;

    if (!teacherId || !otp) {
      return res.status(400).json({
        success: false,
        message:"Teacher ID and OTP are required",
      });
    }

    const key = `login_${teacherId}`;
    const storedData = otpStore.get(key);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:"OTP expired or session invalid. Please login again.",
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(key);
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

    // OTP valid  issue token
    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:"Teacher not found",
      });
    }

    const token = generateToken(teacher);

    otpStore.delete(key);

    res.status(200).json({
      success: true,
      message:"Login successful",
      data: {
        teacher: {
          id: teacher._id,
          tname: teacher.tname,
          temail: teacher.temail,
          tphn: teacher.tphn,
          tspecialization: teacher.tspecialization,
          Status: teacher.Status,
          isVerified: teacher.isVerified,
          tprofile: teacher.tprofile,
          permissions: teacher.permissions, // NEW FIELD
        },
        token,
      },
    });
  } catch (error) {
    console.error("Verify teacher OTP error:", error);
    res.status(500).json({
      success: false,
      message:"OTP verification failed",
    });
  }
};



const resendTeacherLoginOtpController = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message:"Teacher ID is required",
      });
    }

    const key = `login_${teacherId}`;
    const storedData = otpStore.get(key);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:"Session expired. Please login again.",
      });
    }

    const teacher = await TeacherModel.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:"Teacher not found",
      });
    }

    const otp = generateOTP();

    sendOTPEmail(
      teacher.temail,
      otp,
      teacher.tname,
      "login"
    ).catch(err => {
      console.error("Failed to resend login OTP email in background:", err);
    });

    storedData.otp = otp;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    res.status(200).json({
      success: true,
      message:"New OTP sent to your email",
    });

  } catch (error) {
    console.error("Resend login OTP error:", error);
    res.status(500).json({
      success: false,
      message:"Failed to resend OTP",
    });
  }
};



// ==========================================
// REGISTRATION OTP CONTROLLERS
// ==========================================

const sendRegistrationOTPController = async (req, res) => {
  try {
    const {
      tname,
      temail,
      tphn,
      tpassword,
      tspecialization,
      texp,
      tcity,
      tstate,
      tdesc,
      tqualification,
      taddress,
      promocode
    } = req.body;

    const requiredFields = ['tname','temail','tphn','tpassword','tspecialization','texp','tcity','tstate','tdesc'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].toString().trim() ==='');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:"Missing required fields",
        missingFields: missingFields
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(temail)) {
      return res.status(400).json({
        success: false,
        message:"Please provide a valid email address"
      });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(tphn)) {
      return res.status(400).json({
        success: false,
        message:"Please provide a valid 10-digit phone number"
      });
    }

    if (tpassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:"Password must be at least 8 characters long"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();

    const existingTeacher = await TeacherModel.findOne({
      $or: [{ temail: normalizedEmail }, { tphn }]
    });

    if (existingTeacher) {
      const field = existingTeacher.temail === temail ?'email' :'phone number';
      return res.status(409).json({
        success: false,
        message: `Teacher with this ${field} already exists`
      });
    }

    const otp = generateOTP();
    sendOTPEmail(normalizedEmail, otp, tname, 'registration').catch(err => {
      console.error("Failed to send registration OTP email in background:", err);
    });

    otpStore.set(normalizedEmail, {
      otp,
      tname,
      tphn,
      tpassword,
      tspecialization,
      texp,
      tcity,
      tstate,
      tdesc,
      tqualification,
      taddress,
      promocode,
      createdAt: Date.now(),
      attempts: 0
    });

    setTimeout(() => {
      otpStore.delete(normalizedEmail);
    }, 10 * 60 * 1000);

    res.status(200).json({
      success: true,
      message:"OTP sent to your email",
      data: {
        expiresIn: 600
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message:"Failed to send OTP",
      error: error.message
    });
  }
};

const verifyRegistrationOTPController = async (req, res) => {
  try {
    const { temail, otp } = req.body;

    if (!temail || !otp) {
      return res.status(400).json({
        success: false,
        message:"Email and OTP are required"
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:"OTP must be 6 digits"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();

    const storedData = otpStore.get(normalizedEmail);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"OTP expired or invalid. Please register again."
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(normalizedEmail);
      return res.status(429).json({
        success: false,
        message:"Too many failed attempts. Please register again."
      });
    }

    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.`,
        remainingAttempts: 5 - storedData.attempts
      });
    }

    const hashedPassword = await bcrypt.hash(storedData.tpassword, 10);

    const teacherData = {
      tname: storedData.tname.trim(),
      temail: temail.toLowerCase().trim(),
      tphn: storedData.tphn.trim(),
      tpassword: hashedPassword,
      tspecialization: storedData.tspecialization.trim(),
      texp: parseInt(storedData.texp),
      tcity: storedData.tcity.trim(),
      tstate: storedData.tstate?.trim() ||'',
      tdesc: storedData.tdesc.trim(),
      tqualification: storedData.tqualification?.trim() ||'',
      taddress: storedData.taddress?.trim() ||'',
      promocode: storedData.promocode ? storedData.promocode.trim().toUpperCase() :'',
      Status:'pending',
      isVerified: true,
      isActive: true,
      verifiedAt: new Date()
    };

    if (req.file) {
      teacherData.tprofile = `/uploads/teachers/${req.file.filename}`;
    }

    const newTeacher = new TeacherModel(teacherData);
    const savedTeacher = await newTeacher.save();

    // Trigger notification to admin
    try {
      const Notification = require("../Models/NotificationModel");
      await Notification.create({
        recipient:'admin',
        recipientModel:'Admin',
        sender: savedTeacher._id,
        senderModel:'Teacher',
        senderName: savedTeacher.tname,
        type:'general',
        title:'New Teacher Onboarded',
        message: `New Teacher registered:"${savedTeacher.tname}" (${savedTeacher.temail}). Pending Admin approval.`,
        referenceId: savedTeacher._id
      });
      console.log('Notification triggered for new teacher onboarding');
    } catch (notifErr) {
      console.error('Failed to trigger teacher onboarding notification:', notifErr);
    }

    const token = generateToken(savedTeacher);

    otpStore.delete(normalizedEmail);

    res.status(201).json({
      success: true,
      message:"Teacher registered successfully. Your account is pending approval.",
      data: {
        teacher: {
          id: savedTeacher._id,
          tname: savedTeacher.tname,
          temail: savedTeacher.temail,
          tphn: savedTeacher.tphn,
          tspecialization: savedTeacher.tspecialization,
          texp: savedTeacher.texp,
          tcity: savedTeacher.tcity,
          tstate: savedTeacher.tstate,
          Status: savedTeacher.Status,
          tprofile: savedTeacher.tprofile,
          promocode: savedTeacher.promocode,
          permissions: savedTeacher.permissions, // NEW FIELD
          createdAt: savedTeacher.createdAt
        },
        token: token,
        expiresIn:"24h"
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);

    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field ==='temail' ?'email' : field ==='tphn' ?'phone number' : field;
      return res.status(409).json({
        success: false,
        message: `Teacher with this ${fieldName} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message:"Registration failed. Please try again.",
      error: process.env.NODE_ENV ==='development' ? error.message : undefined
    });
  }
};

const resendRegistrationOTPController = async (req, res) => {
  try {
    const { temail } = req.body;

    if (!temail) {
      return res.status(400).json({
        success: false,
        message:"Email is required"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();
    const storedData = otpStore.get(normalizedEmail);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"No pending registration for this email"
      });
    }

    const otp = generateOTP();
    sendOTPEmail(normalizedEmail, otp, storedData.tname, 'registration').catch(err => {
      console.error("Failed to resend registration OTP email in background:", err);
    });

    storedData.otp = otp;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    res.status(200).json({
      success: true,
      message:"New OTP sent to your email",
      data: {
        expiresIn: 600
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message:"Failed to resend OTP",
      error: error.message
    });
  }
};

// ==========================================
// UPDATE PROFILE CONTROLLER
// ==========================================

const updateProfileController = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { tname, temail, tphn, currentPassword, newPassword, tspecialization, texp, tcity, tstate, tdesc, tqualification, taddress, github, linkedin, twitter } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message:"Teacher ID is required"
      });
    }

    const teacher = await TeacherModel.findById(teacherId).select('+tpassword +authProvider +googleId');
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:"Teacher not found"
      });
    }

    // Block password change for Google-SSO teachers
    if (newPassword && teacher.authProvider === "google") {
      return res.status(403).json({
        success: false,
        message: "You are signed in with Google, so your password is managed by Google and cannot be changed here.",
      });
    }

    const updateData = {};

    if (tname) {
      if (tname.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message:"Name must be at least 2 characters"
        });
      }
      updateData.tname = tname.trim();
    }

    if (temail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(temail)) {
        return res.status(400).json({
          success: false,
          message:"Invalid email format"
        });
      }

      const existingTeacher = await TeacherModel.findOne({
        temail: temail.trim().toLowerCase(),
        _id: { $ne: teacherId }
      });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message:"Email already in use"
        });
      }
      updateData.temail = temail.trim().toLowerCase();
    }

    if (tphn) {
      if (!/^\d{10}$/.test(tphn.replace(/\s/g,''))) {
        return res.status(400).json({
          success: false,
          message:"Phone number must be 10 digits"
        });
      }
      updateData.tphn = tphn.replace(/\s/g,'');
    }

    if (tspecialization) updateData.tspecialization = tspecialization.trim();
    if (texp !== undefined) updateData.texp = parseInt(texp);
    if (tcity) updateData.tcity = tcity.trim();
    if (tstate) updateData.tstate = tstate.trim();
    if (tdesc) updateData.tdesc = tdesc.trim();
    if (tqualification) updateData.tqualification = tqualification.trim();
    if (taddress) updateData.taddress = taddress.trim();

    // Social links — allow clearing by sending empty string
    if (github !== undefined) {
      const ghVal = github.trim();
      if (ghVal && !/^https?:\/\/(www\.)?github\.com\/.+/.test(ghVal)) {
        return res.status(400).json({ success: false, message: 'Invalid GitHub URL. Use format: https://github.com/username' });
      }
      updateData['socialLinks.github'] = ghVal;
    }
    if (linkedin !== undefined) {
      const liVal = linkedin.trim();
      if (liVal && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(liVal)) {
        return res.status(400).json({ success: false, message: 'Invalid LinkedIn URL. Use format: https://linkedin.com/in/username' });
      }
      updateData['socialLinks.linkedin'] = liVal;
    }
    if (twitter !== undefined) {
      const twVal = twitter.trim();
      if (twVal && !/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(twVal)) {
        return res.status(400).json({ success: false, message: 'Invalid Twitter/X URL. Use format: https://twitter.com/username' });
      }
      updateData['socialLinks.twitter'] = twVal;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message:"Current password is required to set a new password"
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, teacher.tpassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message:"Current password is incorrect"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message:"New password must be at least 8 characters"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.tpassword = hashedPassword;
    }

    if (req.file) {
      updateData.tprofile = `/uploads/teachers/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message:"No data to update"
      });
    }

    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true, runValidators: true }
    ).select('-tpassword');

    res.status(200).json({
      success: true,
      message:"Profile updated successfully",
      data: {
        teacher: {
          id: updatedTeacher._id,
          tname: updatedTeacher.tname,
          temail: updatedTeacher.temail,
          tphn: updatedTeacher.tphn,
          tprofile: updatedTeacher.tprofile,
          tspecialization: updatedTeacher.tspecialization,
          texp: updatedTeacher.texp,
          tcity: updatedTeacher.tcity,
          tstate: updatedTeacher.tstate,
          tdesc: updatedTeacher.tdesc,
          tqualification: updatedTeacher.tqualification,
          taddress: updatedTeacher.taddress,
          socialLinks: updatedTeacher.socialLinks || {}
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message:"Failed to update profile",
      error: error.message
    });
  }
};

// ==========================================
// FORGOT PASSWORD CONTROLLER
// ==========================================

const sendForgotPasswordOTPController = async (req, res) => {
  try {
    const { temail } = req.body;

    if (!temail) {
      return res.status(400).json({
        success: false,
        message:"Email is required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(temail)) {
      return res.status(400).json({
        success: false,
        message:"Invalid email format"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();
    const teacher = await TeacherModel.findOne({ temail: normalizedEmail });
    if (!teacher) {
      return res.status(200).json({
        success: true,
        message:"If an account exists with this email, you will receive a reset code shortly"
      });
    }

    const resetCode = generateOTP();
    sendOTPEmail(normalizedEmail, resetCode, teacher.tname, 'forgot_password').catch(err => {
      console.error("Failed to send forgot password OTP email in background:", err);
    });

    otpStore.set(`reset_${normalizedEmail}`, {
      resetCode,
      teacherId: teacher._id,
      temail: normalizedEmail,
      createdAt: Date.now(),
      attempts: 0
    });

    setTimeout(() => {
      otpStore.delete(`reset_${normalizedEmail}`);
    }, 15 * 60 * 1000);

    res.status(200).json({
      success: true,
      message:"Reset code sent to your email",
      data: {
        expiresIn: 900
      }
    });
  } catch (error) {
    console.error('Send forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message:"Failed to send reset code",
      error: error.message
    });
  }
};

const verifyForgotPasswordOTPController = async (req, res) => {
  try {
    const { temail, resetCode, newPassword } = req.body;

    if (!temail || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message:"Email, reset code, and new password are required"
      });
    }

    if (resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
      return res.status(400).json({
        success: false,
        message:"Reset code must be 6 digits"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:"New password must be at least 8 characters"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();
    const storedData = otpStore.get(`reset_${normalizedEmail}`);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"Reset code expired or invalid. Please request a new one."
      });
    }

    if (storedData.attempts >= 5) {
      otpStore.delete(`reset_${normalizedEmail}`);
      return res.status(429).json({
        success: false,
        message:"Too many failed attempts. Please request a new reset code."
      });
    }

    if (storedData.resetCode !== resetCode.trim()) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid reset code. ${5 - storedData.attempts} attempts remaining.`,
        remainingAttempts: 5 - storedData.attempts
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      storedData.teacherId,
      { tpassword: hashedPassword },
      { new: true }
    ).select('-tpassword');

    otpStore.delete(`reset_${normalizedEmail}`);

    res.status(200).json({
      success: true,
      message:"Password reset successfully",
      data: {
        teacher: {
          id: updatedTeacher._id,
          tname: updatedTeacher.tname,
          temail: updatedTeacher.temail
        }
      }
    });
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message:"Error resetting password",
      error: error.message
    });
  }
};

const resendForgotPasswordOTPController = async (req, res) => {
  try {
    const { temail } = req.body;

    if (!temail) {
      return res.status(400).json({
        success: false,
        message:"Email is required"
      });
    }

    const normalizedEmail = temail.trim().toLowerCase();
    const storedData = otpStore.get(`reset_${normalizedEmail}`);
    if (!storedData) {
      return res.status(404).json({
        success: false,
        message:"No pending password reset for this email"
      });
    }

    const resetCode = generateOTP();
    const teacher = await TeacherModel.findById(storedData.teacherId);

    if (teacher) {
      sendOTPEmail(normalizedEmail, resetCode, teacher.tname, 'forgot_password').catch(err => {
        console.error("Failed to resend forgot password OTP email in background:", err);
      });
    }

    storedData.resetCode = resetCode;
    storedData.attempts = 0;
    storedData.createdAt = Date.now();

    res.status(200).json({
      success: true,
      message:"New reset code sent to your email",
      data: {
        expiresIn: 900
      }
    });
  } catch (error) {
    console.error('Resend forgot password OTP error:', error);
    res.status(500).json({
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

    // Verify google ID token
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

    let teacher = await TeacherModel.findOne({ temail: email }).select("+tokenVersion");

    // If exists local account  link google
    if (teacher && !teacher.googleId) {
      teacher.googleId = googleId;
      teacher.authProvider ="google";
      teacher.avatar = avatar;
      teacher.isVerified = true;
      teacher.verifiedAt = new Date();
      await teacher.save();
    }

    // If not exists create new teacher
    if (!teacher) {
      teacher = await TeacherModel.create({
        tname: name,
        temail: email,
        googleId,
        authProvider:"google",
        avatar,
        tokenVersion: 0,
        isVerified: emailVerified,
        verifiedAt: emailVerified ? new Date() : null,
        Status:"pending", // Teachers always need approval
        tspecialization:"Not Specified",
        tdesc:"Teacher registered through Google authentication.",
      });
    }

    const token = generateToken(teacher);

    return res.status(200).json({
      success: true,
      message:"Google authentication successful",
      data: {
        teacher: {
          id: teacher._id,
          tname: teacher.tname,
          temail: teacher.temail,
          tphn: teacher.tphn,
          tspecialization: teacher.tspecialization,
          Status: teacher.Status,
          isVerified: teacher.isVerified,
          tprofile: teacher.tprofile || teacher.avatar,
          permissions: teacher.permissions, // NEW FIELD
          authProvider: teacher.authProvider,
          googleId: teacher.googleId,
        },
        token,
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
  teacherloginController,
  sendRegistrationOTPController,
  verifyRegistrationOTPController,
  resendRegistrationOTPController,
  updateProfileController,
  sendForgotPasswordOTPController,
  verifyForgotPasswordOTPController,
  resendForgotPasswordOTPController,
  verifyTeacherLoginOtpController,
  resendTeacherLoginOtpController,
  googleAuthController,
  upload: upload.single("tprofile")
};
