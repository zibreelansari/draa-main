const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Helper to dynamically create NodeMailer SMTP transporters.
 * Prioritizes environment variables from .env with cleartext credentials as standard default fallbacks.
 */
const createTransporter = (userEnv, passEnv, defaultUser, defaultPass, port = 587, secure = false) => {
  const host = process.env.SMTP_HOST || 'mail.draa.in';
  const smtpPort = parseInt(process.env.SMTP_PORT || port);
  
  // Auto-resolve secure connection based on port:
  // Port 465 uses direct SSL (secure: true). Port 587 uses STARTTLS (secure: false).
  let isSecure = smtpPort === 465 ? true : false;
  if (process.env.SMTP_SECURE === 'false') {
    isSecure = false;
  } else if (process.env.SMTP_SECURE === 'true') {
    isSecure = true;
  }

  const user = process.env[userEnv] || defaultUser;
  const pass = process.env[passEnv] || defaultPass;

  return nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Centralized transporters mapped to existing accounts:
const transporter = createTransporter('SMTP_USER', 'SMTP_PASS', 'admin@draa.in', 'Admin@Myedudocs@123#', 587, false);
const inquiryTransporter = createTransporter('INQUIRY_SMTP_USER', 'INQUIRY_SMTP_PASS', 'inquiry@draa.in', 'Edudocs@#321', 587, false);
const noReplyTransporter = createTransporter('NOREPLY_SMTP_USER', 'NOREPLY_SMTP_PASS', 'no-reply@draa.in', '5N474fjiIDR]g', 587, false);
const accountTransporter = createTransporter('ACCOUNT_SMTP_USER', 'ACCOUNT_SMTP_PASS', 'account@draa.in', 'Draa@#321', 587, false);
const supportTransporter = createTransporter('SUPPORT_SMTP_USER', 'SUPPORT_SMTP_PASS', 'support@draa.in', '9N474fjiIDR]g', 587, false);

module.exports = {
  transporter,
  inquiryTransporter,
  noReplyTransporter,
  accountTransporter,
  supportTransporter
};
