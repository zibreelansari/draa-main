const { transporter } = require("./mailConfig");

/**
 * Sends a responsive HTML verification email to a subscriber.
 */
const sendNewsletterVerificationMail = async (email, token) => {
  // Use protocol and host dynamically, fall back to localhost in dev, or prod domain
  const clientBaseUrl = process.env.NODE_ENV === "production" 
    ? "https://draa.in" 
    : "http://localhost:5173";

  const verificationUrl = `${clientBaseUrl}/verify-subscription?token=${token}`;
  const encodedEmail = encodeURIComponent(email);

  const mailOptions = {
    from: `"Draa Newsletter" <admin@draa.in>`,
    to: email,
    subject: "Action Required: Confirm your Draa Newsletter Subscription",
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm Your Subscription</title>
        <style type="text/css">
          /* Client-specific Resets */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f3f4f6; }

          /* Premium hover & transitions */
          .cta-button {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #3730a3 0%, #5b21b6 100%) !important;
            box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4) !important;
            transform: translateY(-2px) !important;
          }
          
          @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .grid-item { display: block !important; width: 100% !important; padding-right: 0 !important; }
            .content-padding { padding: 30px 20px !important; }
            .benefit-card { margin-bottom: 12px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 40px 10px 60px 10px;">
              <!-- Outer Container Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; overflow: hidden;">
                
                <!-- Premium Header Branding -->
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 28px 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <img src="https://draa.in/EduDocsNewLogo.png" alt="Logo" style="height: 44px; display: inline-block; border: 0; outline: none; text-decoration: none;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td class="content-padding" style="padding: 40px 48px; color: #1e293b;">
                    
                    <!-- Welcome Header & Visual Checkmark -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="background-color: #10b981; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; text-align: center; display: inline-block; color: #ffffff; font-size: 24px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                            ✓
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.5px; text-align: center; line-height: 1.25;">
                            Let's make it official!
                          </h2>
                          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 32px 0; text-align: center;">
                            Thank you for initiating your subscription with Draa. You're just one click away from unlocking expert academic strategies, verified materials, and course updates.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Value Proposition Cards Grid (Flipkart/Amazon style) -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 35px;">
                      <tr>
                        <td style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; padding-bottom: 12px;">
                          Inside Your Newsletter Package
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <!-- Benefit row 1 -->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <!-- Card 1 -->
                              <td class="grid-item" width="50%" valign="top" style="padding-right: 10px; padding-bottom: 16px;">
                                <div class="benefit-card" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; min-height: 105px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td width="36" valign="top">
                                        <div style="background-color: #eef2ff; border-radius: 6px; width: 28px; height: 28px; line-height: 28px; text-align: center; color: #4f46e5; font-weight: 700; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">01</div>
                                      </td>
                                      <td valign="top" style="padding-left: 4px;">
                                        <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">Instant Alert System</h4>
                                        <p style="font-size: 12px; line-height: 1.4; color: #64748b; margin: 0;">Be the first to learn of job declarations, key dates, and exam announcements.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                              <!-- Card 2 -->
                              <td class="grid-item" width="50%" valign="top" style="padding-bottom: 16px;">
                                <div class="benefit-card" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; min-height: 105px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td width="36" valign="top">
                                        <div style="background-color: #eef2ff; border-radius: 6px; width: 28px; height: 28px; line-height: 28px; text-align: center; color: #4f46e5; font-weight: 700; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">02</div>
                                      </td>
                                      <td valign="top" style="padding-left: 4px;">
                                        <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">Curated Resources</h4>
                                        <p style="font-size: 12px; line-height: 1.4; color: #64748b; margin: 0;">Unlock exclusive downloads, mock test templates, and expert syllabus insights.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <!-- Benefit row 2 -->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <!-- Card 3 -->
                              <td class="grid-item" width="50%" valign="top" style="padding-right: 10px;">
                                <div class="benefit-card" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; min-height: 105px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td width="36" valign="top">
                                        <div style="background-color: #eef2ff; border-radius: 6px; width: 28px; height: 28px; line-height: 28px; text-align: center; color: #4f46e5; font-weight: 700; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">03</div>
                                      </td>
                                      <td valign="top" style="padding-left: 4px;">
                                        <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">Academic Strategies</h4>
                                        <p style="font-size: 12px; line-height: 1.4; color: #64748b; margin: 0;">Receive time management advice and actionable blueprints from our top faculties.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                              <!-- Card 4 -->
                              <td class="grid-item" width="50%" valign="top">
                                <div class="benefit-card" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; min-height: 105px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                      <td width="36" valign="top">
                                        <div style="background-color: #eef2ff; border-radius: 6px; width: 28px; height: 28px; line-height: 28px; text-align: center; color: #4f46e5; font-weight: 700; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">04</div>
                                      </td>
                                      <td valign="top" style="padding-left: 4px;">
                                        <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">Member Offers</h4>
                                        <p style="font-size: 12px; line-height: 1.4; color: #64748b; margin: 0;">Gain access to direct discounts and bonus learning coins on premium courses.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Bold CTA Button Section -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eef2ff; border-radius: 16px; padding: 28px; text-align: center; border: 1.5px dashed #c7d2fe;">
                      <tr>
                        <td align="center">
                          <p style="font-size: 14px; color: #4338ca; font-weight: 600; margin: 0 0 16px 0;">
                            Verify within 24 hours to secure your newsletter access:
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <!-- CSS Button with shadow -->
                          <a href="${verificationUrl}" class="cta-button" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 50px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.28); letter-spacing: 0.3px;">
                            Confirm My Subscription
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 16px;">
                          <span style="font-size: 11px; color: #64748b;">
                            If the button fails, copy-paste this url in your web address bar:
                          </span>
                          <p style="font-size: 11px; word-break: break-all; color: #4f46e5; margin: 6px 0 0 0; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace;">
                            ${verificationUrl}
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Customer Support Helper Box -->
                <tr>
                  <td style="padding: 0 48px;">
                    <div style="border-top: 1px solid #f1f5f9; padding: 20px 0; text-align: center;">
                      <p style="font-size: 13px; color: #64748b; margin: 0;">
                        Have queries? Reach us at <a href="mailto:contact@draa.in" style="color: #4f46e5; text-decoration: none; font-weight: 600;">contact@draa.in</a> or WhatsApp at <a href="https://wa.me/918076003728" style="color: #4f46e5; text-decoration: none; font-weight: 600;">+91 80760 03728</a>.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Compliant Legal Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 48px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8;">
                    <p style="font-size: 11px; line-height: 1.6; margin: 0 0 16px 0;">
                      You are receiving this transaction email because you registered your address in our subscription database. Under CAN-SPAM and GDPR guidelines, you can opt out instantly without fees.
                    </p>
                    <p style="font-size: 12px; margin: 0 0 16px 0; font-weight: 600;">
                      <a href="${clientBaseUrl}/unsubscribe?email=${encodedEmail}" target="_blank" style="color: #ef4444; text-decoration: none; border-bottom: 1.5px dotted #fca5a5;">
                        Click here to Unsubscribe / Opt-Out Instantly
                      </a>
                    </p>
                    <p style="font-size: 11px; line-height: 1.5; margin: 0;">
                      © ${new Date().getFullYear()} Draa Edutech Private Limited.<br />
                      Building no 1, 3rd floor, opp. Sapna cinema, above Bikanervala Community centre,<br />
                      D Block, East of Kailash, New Delhi, Delhi 110065
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Newsletter Mail] Dispatched verification email: ${info.messageId} to ${email}`);
    return info;
  } catch (error) {
    console.error("[Newsletter Mail] Error sending email:", error);
    throw error;
  }
};

module.exports = { sendNewsletterVerificationMail };

