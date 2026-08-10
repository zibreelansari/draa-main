const crypto = require("crypto");
const NewsletterSubscription = require("../Models/NewsletterSubscription");
const { sendNewsletterVerificationMail } = require("../utils/newsletter.mailer");

// POST /api/v1/newsletter/subscribe
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const lowercaseEmail = email.toLowerCase().trim();
    let subscription = await NewsletterSubscription.findOne({ email: lowercaseEmail });

    if (subscription) {
      if (subscription.status === "active") {
        return res.status(400).json({ 
          success: false, 
          message: "This email address is already subscribed to our newsletter." 
        });
      }
      
      // If pending or unsubscribed, we regenerate token and resend verification email
      const token = crypto.randomBytes(32).toString("hex");
      subscription.status = "pending";
      subscription.verificationToken = token;
      subscription.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      subscription.ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
      await subscription.save();

      // Send email in the background to avoid blocking the HTTP response (improves API speed to <30ms)
      sendNewsletterVerificationMail(lowercaseEmail, token).catch((err) => {
        console.error("[Newsletter Mail] Background dispatch failed:", err);
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "A brand-new verification link has been sent to your email. Please check your inbox!" 
      });
    }

    // Generate token for new subscriber
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    subscription = new NewsletterSubscription({
      email: lowercaseEmail,
      status: "pending",
      verificationToken: token,
      tokenExpiresAt,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || ""
    });

    await subscription.save();
    
    // Send email in the background to avoid blocking the HTTP response
    sendNewsletterVerificationMail(lowercaseEmail, token).catch((err) => {
      console.error("[Newsletter Mail] Background dispatch failed:", err);
    });

    return res.status(201).json({
      success: true,
      message: "We've sent a verification link to your email address. Please click it to confirm your subscription."
    });
  } catch (error) {
    console.error("Newsletter Subscribe Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred. Please try again later." });
  }
};

// GET /api/v1/newsletter/verify
const verify = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is required." });
    }

    const subscription = await NewsletterSubscription.findOne({ verificationToken: token });

    if (!subscription) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid subscription token or your subscription is already verified." 
      });
    }

    // Check expiration
    if (new Date() > subscription.tokenExpiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: "Your verification link has expired. Please sign up again from the footer." 
      });
    }

    // Transition status to active
    subscription.status = "active";
    subscription.verificationToken = undefined;
    subscription.tokenExpiresAt = undefined;
    subscription.verifiedAt = new Date();
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Congratulations! Your email subscription has been successfully verified."
    });
  } catch (error) {
    console.error("Newsletter Verify Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred during verification." });
  }
};

// POST /api/v1/newsletter/unsubscribe
const unsubscribe = async (req, res) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required to unsubscribe." });
    }

    const lowercaseEmail = email.toLowerCase().trim();
    const subscription = await NewsletterSubscription.findOne({ email: lowercaseEmail });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "This email address is not in our subscription database." });
    }

    if (subscription.status === "unsubscribed") {
      return res.status(200).json({ success: true, message: "You are already unsubscribed from our newsletter." });
    }

    // Unsubscribe
    subscription.status = "unsubscribed";
    subscription.verificationToken = undefined;
    subscription.tokenExpiresAt = undefined;
    subscription.unsubscribedAt = new Date();
    if (reason) {
      subscription.unsubscribeReason = reason;
    }
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed. We're sad to see you go!"
    });
  } catch (error) {
    console.error("Newsletter Unsubscribe Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred during unsubscribing." });
  }
};

module.exports = {
  subscribe,
  verify,
  unsubscribe
};
