// config/emailService.js
const { noReplyTransporter } = require('../utils/mailConfig');

class EmailService {
  constructor() {
    this.smtpTransporter = noReplyTransporter;
    this.fromEmail = 'no-reply@draa.in';
    this.fromName = 'Draa';
  }

  // Master layout wrapping method featuring the original brand logo and professional footer
  wrapInMasterLayout(title, contentHtml) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          /* Inline overrides for responsive layouts and mobile viewports */
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              padding: 15px !important;
            }
            .content-card {
              padding: 28px 16px !important;
            }
            .otp-code {
              font-size: 28px !important;
              letter-spacing: 4px !important;
              padding: 12px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1E293B;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="width: 600px; max-width: 600px;">
                <!-- LOGO HEADER -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="https://draa.in" target="_blank" style="text-decoration: none; border: none;">
                      <img src="https://draa.in/EduDocsNewLogo.png" alt="Draa Logo" style="height: 48px; border: 0; display: block; max-height: 48px;" />
                    </a>
                  </td>
                </tr>
                
                <!-- MAIN CARD CONTENT -->
                <tr>
                  <td class="content-card" style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);">
                    ${contentHtml}
                  </td>
                </tr>
                
                <!-- FOOTER -->
                <tr>
                  <td style="padding-top: 32px; text-align: center;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="font-size: 13px; color: #64748B; line-height: 1.6; padding-bottom: 12px; font-family: sans-serif;">
                          Need help? Contact our support team at 
                          <a href="mailto:support@draa.in" style="color: #5B6CFF; text-decoration: none; font-weight: 600;">support@draa.in</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size: 12px; color: #94A3B8; line-height: 1.5; font-family: sans-serif;">
                          This is an automated operational communication. Please do not reply directly to this email.<br>
                          © ${new Date().getFullYear()} Draa. All rights reserved.<br>
                          <span style="font-weight: 500;">Your Partner in Learning Excellence.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Send Email via cPanel SMTP no-reply
  async sendEmail(emailData) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html || '',
        attachments: emailData.attachments || []
      };

      const result = await this.smtpTransporter.sendMail(mailOptions);
      console.log(' Email sent via cPanel no-reply SMTP:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error(' cPanel SMTP send error:', error);
      throw error;
    }
  }

  // Send OTP Email Template
  async sendOTPEmail(to, otp, userData) {
    const emailData = {
      to: to,
      subject: ' Verify Your Email - Draa Inquiry',
      html: this.generateOTPEmailHTML(otp, userData)
    };

    return await this.sendEmail(emailData);
  }

  // Send Confirmation Email Template
  async sendConfirmationEmail(to, userData) {
    const emailData = {
      to: to,
      subject: ' Inquiry Received - Draa',
      html: this.generateConfirmationEmailHTML(userData)
    };

    return await this.sendEmail(emailData);
  }

  // Send Resend OTP Email Template
  async sendResendOTPEmail(to, otp, userData) {
    const emailData = {
      to: to,
      subject: ' New OTP - Draa Inquiry',
      html: this.generateResendOTPEmailHTML(otp, userData)
    };

    return await this.sendEmail(emailData);
  }

  // OTP Email HTML Template
  generateOTPEmailHTML(otp, userData) {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 22px; font-weight: 700; line-height: 1.3; font-family: sans-serif;">
        Hello ${userData.name},
      </h2>
      <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
        Thank you for your interest in Draa! To complete your inquiry submission, please verify your email address using the verification code below:
      </p>

      <!-- BOXED OTP PIN -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <div style="background-color: #EEF2FF; border: 2px dashed #5B6CFF; border-radius: 12px; padding: 24px 40px; display: inline-block; min-width: 280px; box-sizing: border-box;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #4F46E5; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">
                Verification Code
              </p>
              <div class="otp-code" style="font-family:'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #1E1B4B; letter-spacing: 8px; line-height: 1; padding: 4px 0;">
                ${otp}
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- SECURITY ADVISORY PILL -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; margin: 24px 0;">
        <tr>
          <td style="padding: 16px; font-size: 14px; color: #78350F; line-height: 1.5; font-family: sans-serif;">
            <strong style="font-weight: 700;"> Security Notice:</strong>
            This code is strictly confidential and will expire in <strong style="font-weight: 700;">10 minutes</strong>. Draa employees will never ask you for this code.
          </td>
        </tr>
      </table>

      <p style="margin: 32px 0 0 0; font-size: 14px; color: #94A3B8; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 20px; font-family: sans-serif;">
        If you did not make this request, you can safely ignore this email. Someone may have typed your email by mistake.
      </p>
    `;
    return this.wrapInMasterLayout('Email Verification - Draa', content);
  }

  // Confirmation Email HTML Template
  generateConfirmationEmailHTML(userData) {
    const content = `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; margin-bottom: 32px;">
        <tr>
          <td align="center">
            <div style="background-color: #ECFDF5; border-radius: 9999px; width: 64px; height: 64px; line-height: 64px; font-size: 32px; display: inline-block;">
              ✅
            </div>
            <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #059669; font-family: sans-serif;">
              Inquiry Received!
            </h1>
            <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.5; font-family: sans-serif;">
              Thank you for choosing Draa. We have received your inquiry.
            </p>
          </td>
        </tr>
      </table>

      <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 18px; font-weight: 700; font-family: sans-serif;">
        Hello ${userData.name},
      </h2>
      <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
        Great news! We have successfully received and verified your inquiry. Our team is excited to help you achieve your learning objectives.
      </p>

      <!-- TIMELINE CARD -->
      <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; background-color: #FFFFFF; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; font-family: sans-serif;">
          What happens next?
        </h3>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6; font-family: sans-serif;">
          <tr>
            <td style="padding: 8px 0; color: #475569;"><strong style="color: #0F172A;">1. Personal Consultation:</strong> Our counselor will contact you within 24 hours.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;"><strong style="color: #0F172A;">2. Goal Assessment:</strong> We'll discuss your learning goals.</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;"><strong style="color: #0F172A;">3. Recommendations:</strong> Get customized course recommendations.</td>
          </tr>
        </table>
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0; text-align: center;">
        <tr>
          <td align="center">
            <a href="https://draa.in" target="_blank" style="background-color: #5B6CFF; color: #ffffff; padding: 14px 30px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; font-family: sans-serif;">
              Explore Our Courses
            </a>
          </td>
        </tr>
      </table>
    `;
    return this.wrapInMasterLayout('Inquiry Received - Draa', content);
  }

  // Resend OTP Email HTML Template
  generateResendOTPEmailHTML(otp, userData) {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 22px; font-weight: 700; line-height: 1.3; font-family: sans-serif;">
        Hello ${userData.name},
      </h2>
      <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
        As requested, here is your new verification code to complete your Draa inquiry:
      </p>

      <!-- BOXED OTP PIN -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <div style="background-color: #EEF2FF; border: 2px dashed #5B6CFF; border-radius: 12px; padding: 24px 40px; display: inline-block; min-width: 280px; box-sizing: border-box;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #4F46E5; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: sans-serif;">
                New Verification Code
              </p>
              <div class="otp-code" style="font-family:'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #1E1B4B; letter-spacing: 8px; line-height: 1; padding: 4px 0;">
                ${otp}
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- SECURITY ADVISORY PILL -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEE2E2; border-left: 4px solid #EF4444; border-radius: 6px; margin: 24px 0;">
        <tr>
          <td style="padding: 16px; font-size: 14px; color: #991B1B; line-height: 1.5; font-family: sans-serif;">
            <strong style="font-weight: 700;"> Important Note:</strong>
            This is a new code. The previous code has been invalidated for security.
          </td>
        </tr>
      </table>
    `;
    return this.wrapInMasterLayout('New Verification Code - Draa', content);
  }

  // Send Coupon Code Email Template
  async sendCouponEmail(to, couponCode, discountInfo, description, expiryDate) {
    const emailData = {
      to: to,
      subject: '🎉 Special Gift: Your Draa Discount Coupon Inside!',
      html: this.generateCouponEmailHTML(couponCode, discountInfo, description, expiryDate)
    };

    return await this.sendEmail(emailData);
  }

  // Coupon Email HTML Template (Optimized for Dark Mode and Visual Excellence)
  generateCouponEmailHTML(couponCode, discountInfo, description, expiryDate) {
    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const contentHtml = `
      <!-- Header Illustrative Badge -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; margin-bottom: 24px;">
        <tr>
          <td align="center">
            <div style="background-color: #EEF2FF; border-radius: 9999px; width: 64px; height: 64px; line-height: 64px; font-size: 32px; display: inline-block;">
              🎁
            </div>
            <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #1E1B4B; font-family: sans-serif;">
              A Special Gift For You!
            </h1>
            <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.5; font-family: sans-serif;">
              We've created a custom discount coupon code just for you. Use it to get an exclusive discount on our premium courses, books, and test series.
            </p>
          </td>
        </tr>
      </table>

      <!-- Premium Coupon Box (Explicit white background for high contrast in dark mode) -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFBFD !important; border: 2px dashed #5B6CFF; border-radius: 16px; margin: 24px 0; padding: 32px 24px; text-align: center;">
        <tr>
          <td>
            <span style="font-size: 12px; font-weight: 700; color: #5B6CFF; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px; font-family: sans-serif;">Exclusive Offer</span>
            <div style="font-size: 40px; font-weight: 800; color: #1E1B4B !important; margin-bottom: 4px; font-family: sans-serif;">
              ${discountInfo}
            </div>
            <div style="font-size: 14px; color: #475569 !important; margin-bottom: 24px; font-weight: 500; font-family: sans-serif;">
              ${description || 'Applicable across all resources'}
            </div>
            
            <!-- Code Badge -->
            <div style="display: inline-block; background-color: #FFFFFF !important; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <code style="font-size: 24px; font-weight: 800; color: #5B6CFF !important; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace;">${couponCode}</code>
            </div>
            
            <p style="font-size: 13px; color: #64748B !important; margin: 18px 0 0 0; font-weight: 500; font-family: sans-serif;">
              Expires on: <strong style="color: #1E293B !important;">${formattedDate}</strong>
            </p>
          </td>
        </tr>
      </table>

      <!-- Next Steps / Instructions -->
      <div style="background-color: #F8FAFC !important; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: left;">
        <h3 style="color: #1E1B4B; margin: 0 0 12px 0; font-size: 15px; font-weight: 700; font-family: sans-serif;">How to claim your coupon:</h3>
        <ol style="color: #475569; margin: 0; padding-left: 20px; line-height: 1.7; font-size: 14px; font-family: sans-serif;">
          <li style="margin-bottom: 8px;">Go to <a href="https://draa.in" target="_blank" style="color: #5B6CFF; font-weight: 600; text-decoration: none;">draa.in</a> and login or register.</li>
          <li style="margin-bottom: 8px;">Select your desired Course, Test Series, or Book.</li>
          <li style="margin-bottom: 8px;">At the payment or checkout screen, enter your coupon code <strong style="color: #5B6CFF;">${couponCode}</strong>.</li>
          <li>The discount will be applied immediately! Start preparing with our premium resources.</li>
        </ol>
      </div>

      <!-- CTA Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0; text-align: center;">
        <tr>
          <td align="center">
            <a href="https://draa.in" target="_blank" style="background-color: #5B6CFF; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(91, 108, 255, 0.2); transition: background-color 0.2s; font-family: sans-serif;">
              Claim Discount Now
            </a>
          </td>
        </tr>
      </table>
    `;

    return this.wrapInMasterLayout('Your Exclusive Coupon - Draa', contentHtml);
  }
}

module.exports = new EmailService();
