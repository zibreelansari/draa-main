const AdminSchema = require('../Models/AdminModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ================= EMAIL CONFIG =================
const { noReplyTransporter: transporter } = require("../utils/mailConfig");

const emailTemplates = require('../utils/emailTemplates');

// ================= SEND OTP =================
const sendOTP = async (email, otp) => {
    const htmlContent = emailTemplates.generateOTPEmail(
"Admin",
"Admin Login Verification",
"We detected an admin login attempt. Please verify your identity using the code below:",
        otp,
        10
    );

    await transporter.sendMail({
        from: `"Draa Security" <no-reply@draa.in>`,
        to: email,
        subject:"Admin Login OTP  Draa",
        html: htmlContent
    });
};

// ================= STEP 1: PASSWORD LOGIN =================
const adminLoginController = async (req, res) => {
    try {
        const { aemail, apassword } = req.body;

        const admin = await AdminSchema.findOne({ aemail });
        if (!admin) {
            return res.status(404).json({ message:"Admin not found" });
        }

        const isMatch = await bcrypt.compare(apassword, admin.apassword);
        if (!isMatch) {
            return res.status(401).json({ message:"Invalid credentials" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        admin.otp = otp; //  STRING
        admin.otpExpires = Date.now() + 10 * 60 * 1000;
        await admin.save();

        await sendOTP(admin.aemail, otp);

        res.status(200).json({
            message:"OTP sent to registered email",
            step:"OTP_REQUIRED",
            adminId: admin._id
        });

    } catch (error) {
        res.status(500).json({ message:"Login failed", error: error.message });
    }
};

// ================= STEP 2: OTP VERIFY =================
const adminVerifyOtpController = async (req, res) => {
    try {

        const { adminId, otp } = req.body;

        // Basic validation
        if (!adminId || !otp) {
            return res.status(400).json({ message:"Missing adminId or OTP" });
        }

        const admin = await AdminSchema.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message:"Admin not found" });
        }

        // OTP existence check
        if (!admin.otp || !admin.otpExpires) {
            return res.status(400).json({ message:"OTP not found or already used" });
        }

        // Expiry check FIRST
        if (admin.otpExpires < Date.now()) {
            return res.status(400).json({ message:"OTP expired" });
        }

        // OTP match check (STRING SAFE)
        if (String(admin.otp) !== String(otp)) {
            return res.status(400).json({ message:"Invalid OTP" });
        }

        // Clear OTP after successful verification
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        // Issue JWT
        const secret = process.env.JWT_SECRET ||"your-secret-key-change-in-production";
        const token = jwt.sign(
            {
                adminId: admin._id,
                aemail: admin.aemail,
                role:"admin",
            },
            secret,
            { expiresIn:"7d" }
        );

        res.status(200).json({
            message:"Login successful",
            token,
            admin: {
                id: admin._id,
                aname: admin.aname,
                aemail: admin.aemail,
            },
        });

    } catch (error) {
        console.error("OTP VERIFY ERROR:", error);
        res.status(500).json({
            message:"OTP verification failed",
            error: error.message,
        });
    }
};
const resendAdminLoginOtpController = async (req, res) => {

    try {

        const { adminId } = req.body;

        const admin = await AdminSchema.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message:"Admin not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        admin.otp = otp;
        admin.otpExpires = Date.now() + 10 * 60 * 1000;

        await admin.save();

        await sendOTP(admin.aemail, otp);

        res.status(200).json({
            success: true,
            message:"New OTP sent to your email"
        });

    } catch (error) {

        res.status(500).json({
            message:"Failed to resend OTP"
        });

    }

};
// ================= REGISTER =================
const adminRegisterController = async (req, res) => {
    try {
        const { aname, aemail, apassword, regSecret } = req.body;

        const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET || "DraaMasterAdminSecretKey2026#";
        if (regSecret !== expectedSecret) {
            return res.status(403).json({ message: "Forbidden: Unauthorized administrator registration attempt." });
        }

        const exists = await AdminSchema.findOne({ aemail });
        if (exists) {
            return res.status(400).json({ message:"Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(apassword, 10);

        const admin = await AdminSchema.create({
            aname,
            aemail,
            apassword: hashedPassword
        });

        res.status(201).json({
            message:"Admin registered successfully",
            admin: {
                id: admin._id,
                aname: admin.aname,
                aemail: admin.aemail
            }
        });

    } catch (error) {
        res.status(400).json({ message:"Registration failed", error: error.message });
    }
};


// ================= UPDATE ADMIN PROFILE =================
const adminUpdateProfileController = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const { aname, aemail, apassword } = req.body;

        const admin = await AdminSchema.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message:"Admin not found" });
        }

        // Email uniqueness check
        if (aemail && aemail !== admin.aemail) {
            const emailExists = await AdminSchema.findOne({ aemail });
            if (emailExists) {
                return res.status(400).json({ message:"Email already in use" });
            }
            admin.aemail = aemail;
        }

        if (aname) {
            admin.aname = aname;
        }

        // Optional password update
        if (apassword) {
            const hashedPassword = await bcrypt.hash(apassword, 10);
            admin.apassword = hashedPassword;
        }

        await admin.save();

        res.status(200).json({
            message:"Admin profile updated successfully",
            admin: {
                id: admin._id,
                aname: admin.aname,
                aemail: admin.aemail
            }
        });

    } catch (error) {
        res.status(500).json({
            message:"Profile update failed",
            error: error.message
        });
    }
};

/**
 * Verifies admin session
 */
const adminVerifySessionController = async (req, res) => {
    try {
        // req.admin is set by adminAuth middleware
        res.status(200).json({
            success: true,
            admin: req.admin
        });
    } catch (error) {
        res.status(401).json({ success: false, message:"Session invalid" });
    }
};


module.exports = {
    adminLoginController,
    adminVerifyOtpController,
    resendAdminLoginOtpController,
    adminRegisterController,
    adminUpdateProfileController,
    adminVerifySessionController
};