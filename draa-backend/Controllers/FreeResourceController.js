const FreeResourceLead = require('../Models/FreeResourceModel');
const PhoneOTPVerification = require('../Models/PhoneOTPVerification');
const { transporter } = require("../utils/mailConfig");
const crypto = require('crypto');
const smsHelper = require('../utils/smsHelper');

exports.saveLead = async (req, res) => {
    try {
        const { name, phone, resource_type, resource_title } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message:"Name and Phone number are required." });
        }

        const lead = await FreeResourceLead.create({
            name,
            phone,
            resource_type,
            resource_title
        });

        // Send Email Alert
        await transporter.sendMail({
            from: `"Draa Alerts" <admin@draa.in>`,
            to:"admin@draa.in",
            subject: ` New Lead: Downloaded ${resource_title}`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6">
                <h2>New Free Resource Download Alert</h2>
                <p>A user just downloaded a resource from the Job Details page.</p>
                <hr />
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Resource Type:</strong> ${resource_type}</p>
                <p><strong>Resource Title:</strong> ${resource_title}</p>
                <hr />
                <small>Generated automatically by Draa Platform</small>
              </div>
            `,
        });

        res.status(201).json({
            success: true,
            message:"Lead saved successfully",
            lead
        });
    } catch (error) {
        console.error('Error saving free resource lead:', error);
        res.status(500).json({ success: false, message:"Server Error", error: error.message });
    }
};

exports.sendOTP = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message:"Name and Phone number are required." });
    }

    if (phone.length < 10) {
      return res.status(400).json({ success: false, message:"Please enter a valid 10-digit phone number." });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

    // Find and delete any existing active OTP for this phone
    await PhoneOTPVerification.deleteMany({ phone, isVerified: false });

    // Save Phone OTP record
    await PhoneOTPVerification.create({
      phone,
      otp,
      name,
      expiresAt
    });

    // Dispatch OTP using the SMS Helper
    const smsResult = await smsHelper.sendSMS(phone, otp);

    res.status(200).json({
      success: smsResult.success,
      message: smsResult.message,
      provider: smsResult.provider
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ success: false, message:"Server Error", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { name, phone, otp, resource_type, resource_title } = req.body;

    if (!name || !phone || !otp) {
      return res.status(400).json({ success: false, message:"Name, phone and OTP are required." });
    }

    // Find valid OTP record
    const otpRecord = await PhoneOTPVerification.findOne({
      phone: phone.trim(),
      otp,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message:"Invalid or expired OTP." });
    }

    // Increment attempts check
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    if (otpRecord.attempts > 5) {
      await PhoneOTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message:"Too many failed attempts. Please request a new OTP." });
    }
    await otpRecord.save();

    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Save lead details
    const lead = await FreeResourceLead.create({
      name,
      phone,
      resource_type,
      resource_title
    });

    // Send Email Alert
    try {
      await transporter.sendMail({
        from: `"Draa Alerts" <admin@draa.in>`,
        to:"admin@draa.in",
        subject: ` Verified Lead: Downloaded ${resource_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6">
            <h2>New Verified Free Resource Download Alert</h2>
            <p>A user just verified their phone and downloaded a resource.</p>
            <hr />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone} (Verified via OTP)</p>
            <p><strong>Resource Type:</strong> ${resource_type}</p>
            <p><strong>Resource Title:</strong> ${resource_title}</p>
            <hr />
            <small>Generated automatically by Draa Platform</small>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send lead email alert:', emailError);
    }

    res.status(200).json({
      success: true,
      message:"Phone number verified successfully and lead saved.",
      lead
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message:"Server Error", error: error.message });
  }
};
