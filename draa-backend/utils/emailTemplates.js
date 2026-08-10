/**
 * Premium Email Templates for Draa
 * Re-designed to match real-world, high-production level emails sent by top edtech and tech giants (like Amazon, AWS, Google, and Flipkart).
 * Features:
 * - Completely responsive design
 * - Premium branding with the official logo
 * - Modern SF Pro/Segoe UI typography
 * - Highly-styled copy-safe OTP display with glowing pill style
 * - Sleek card designs and rounded details tables
 * - Call-to-action buttons with modern button layouts
 * - High-end, reassuring security notices and professional footers
 */

const getLogoUrl = () =>"https://draa.in/EduDocsNewLogo.png";
const getPrimaryColor = () =>"#5B6CFF";
const getSecondaryColor = () =>"#7C3AED";

/**
 * Wraps content in a premium, responsive master layout with brand logo and professional footer.
 */
const wrapInMasterLayout = (title, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 15px !important;
          }
          .content-card {
            padding: 24px 16px !important;
          }
          .otp-code {
            font-size: 28px !important;
            letter-spacing: 4px !important;
            padding: 12px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto,'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1E293B;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="width: 600px;">
              <!-- LOGO HEADER -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <a href="https://draa.in" target="_blank" style="text-decoration: none;">
                    <img src="${getLogoUrl()}" alt="Draa" style="height: 48px; border: 0; display: block;" />
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
                      <td align="center" style="font-size: 13px; color: #64748B; line-height: 1.6; padding-bottom: 12px;">
                        Need help? Contact our premium support at 
                        <a href="mailto:support@draa.in" style="color: ${getPrimaryColor()}; text-decoration: none; font-weight: 600;">support@draa.in</a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size: 12px; color: #94A3B8; line-height: 1.5;">
                        This is an automated operational communication. Please do not reply directly to this email.<br>
                        © ${new Date().getFullYear()} Draa. All rights reserved.<br>
                        <span style="font-weight: 500;">Securing Education for the Future.</span>
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
};

/**
 * Generates a premium verification code (OTP) email template.
 */
exports.generateOTPEmail = (name, heading, purposeText, otp, validityMinutes) => {
  const content = `
    <!-- HEADER INTRO -->
    <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 22px; font-weight: 700; line-height: 1.3;">
      Hello ${name},
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      ${purposeText}
    </p>

    <!-- BOXED OTP PIN -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <div style="background-color: #EEF2FF; border: 2px dashed ${getPrimaryColor()}; border-radius: 12px; padding: 24px 40px; display: inline-block; min-width: 280px; box-sizing: border-box;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #4F46E5; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
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
        <td style="padding: 16px; font-size: 14px; color: #78350F; line-height: 1.5;">
          <strong style="font-weight: 700;"> Security Notice:</strong>
          This code is strictly confidential and will expire in <strong style="font-weight: 700;">${validityMinutes} minutes</strong>. Draa employees will never ask you for this code.
        </td>
      </tr>
    </table>

    <p style="margin: 32px 0 0 0; font-size: 14px; color: #94A3B8; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 20px;">
      If you did not make this request, you can safely ignore this email. Someone may have typed your email by mistake.
    </p>
  `;

  return wrapInMasterLayout(heading, content);
};

/**
 * Generates a premium welcome/registration success email.
 */
exports.generateWelcomeEmail = (name, email, phn) => {
  const content = `
    <!-- WELCOME ILLUSTRATIVE HERO -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, ${getPrimaryColor()} 0%, ${getSecondaryColor()} 100%); border-radius: 12px; margin-bottom: 32px; color: #ffffff; text-align: center;">
      <tr>
        <td style="padding: 40px 24px;">
          <span style="font-size: 40px; display: block; margin-bottom: 8px;"></span>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Draa!</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">Your educational evolution starts here.</p>
        </td>
      </tr>
    </table>

    <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 20px; font-weight: 700;">
      Hello ${name}! 
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      Thank you for choosing <strong style="color: #0F172A;">Draa</strong>! We are absolutely thrilled to welcome you to our growing community.
      Your account registration was successful and is currently being processed by our admin team for verification.
    </p>

    <!-- HIGHLIGHT SECTION: DETAILS -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: ${getPrimaryColor()}; text-transform: uppercase; letter-spacing: 1px;">
        Account Summary
      </h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6;">
        <tr>
          <td style="padding: 6px 0; color: #64748B; width: 120px;"><strong>Name:</strong></td>
          <td style="padding: 6px 0; color: #1E293B; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Email:</strong></td>
          <td style="padding: 6px 0; color: #1E293B; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Mobile:</strong></td>
          <td style="padding: 6px 0; color: #1E293B; font-weight: 600;">${phn}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;"><strong>Status:</strong></td>
          <td style="padding: 6px 0;"><span style="background-color: #FEF3C7; color: #D97706; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700;">Pending Approval</span></td>
        </tr>
      </table>
    </div>

    <!-- VALUE PROP CHECKLIST -->
    <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #0F172A;">
      Once approved, you'll unlock full access to:
    </h4>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; font-size: 14px; color: #475569; line-height: 1.8;">
      <tr>
        <td style="vertical-align: top; padding-right: 8px; font-size: 16px;"></td>
        <td style="padding-bottom: 8px;"><strong style="color: #0F172A;">Curated Premium Books:</strong> High-quality syllabus material, standard text books and reference documents.</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding-right: 8px; font-size: 16px;"></td>
        <td style="padding-bottom: 8px;"><strong style="color: #0F172A;">Elite Test Series:</strong> Live exams and test preparation resources crafted by top-tier faculty.</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding-right: 8px; font-size: 16px;"></td>
        <td style="padding-bottom: 8px;"><strong style="color: #0F172A;">Interactive Video Courses:</strong> Structured learning pathways to speed up your academic growth.</td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 6px; margin: 24px 0;">
      <tr>
        <td style="padding: 16px; font-size: 14px; color: #1E3A8A; line-height: 1.5;">
           <strong>Estimated Approval:</strong> Account approvals usually complete in 1-2 business hours. You will receive an email as soon as your account is activated!
        </td>
      </tr>
    </table>
  `;

  return wrapInMasterLayout("Welcome to Draa", content);
};

/**
 * Generates a premium transactional receipt email (flipkart/amazon style).
 */
exports.generatePurchaseEmail = ({
  studentName,
  purchaseTypeTitle, // Course / Book / Test Series
  itemName,
  orderId,
  amount,
  detailsRows = [], // Array of { label, value }
  actionButtonUrl,
  actionButtonText ="Go To Dashboard",
  deliveryNotice =""
}) => {
  let tableHtml ="";
  detailsRows.forEach(row => {
    tableHtml += `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 12px 0; color: #64748B; font-weight: 500;">${row.label}</td>
        <td style="padding: 12px 0; color: #0F172A; font-weight: 600; text-align: right;">${row.value}</td>
      </tr>
    `;
  });

  const content = `
    <!-- CONFIRMATION ICON & HEADER -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; margin-bottom: 32px;">
      <tr>
        <td align="center">
          <div style="background-color: #ECFDF5; border-radius: 9999px; width: 64px; height: 64px; line-height: 64px; font-size: 32px; display: inline-block;">
            
          </div>
          <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #059669;">
            Payment Successful!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.5;">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </td>
      </tr>
    </table>

    <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 18px; font-weight: 700;">
      Hello ${studentName},
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
      Your payment has been successfully captured. Below is the confirmation details for your purchase of the <strong>${purchaseTypeTitle}</strong>.
    </p>

    <!-- RECEIPT CARD -->
    <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; background-color: #FFFFFF; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
      <h3 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px;">
        Order Details
      </h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 12px 0; color: #64748B; font-weight: 500;">Product / Item</td>
          <td style="padding: 12px 0; color: #0F172A; font-weight: 700; text-align: right;">${itemName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 12px 0; color: #64748B; font-weight: 500;">Order ID</td>
          <td style="padding: 12px 0; color: #0F172A; font-weight: 600; text-align: right; font-family: monospace;">${orderId}</td>
        </tr>
        ${tableHtml}
        <tr style="border-top: 2px solid #E2E8F0;">
          <td style="padding: 16px 0 0 0; color: #0F172A; font-size: 16px; font-weight: 800;">Amount Paid</td>
          <td style="padding: 16px 0 0 0; color: ${getPrimaryColor()}; font-size: 20px; font-weight: 800; text-align: right;">${amount}</td>
        </tr>
      </table>
    </div>

    <!-- OPTIONAL DELIVERY NOTICE -->
    ${deliveryNotice ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 6px; margin: 24px 0;">
        <tr>
          <td style="padding: 16px; font-size: 14px; color: #1E3A8A; line-height: 1.5;">
             <strong>Shipping Status:</strong> ${deliveryNotice}
          </td>
        </tr>
      </table>
    ` :""}

    <!-- CALL TO ACTION BUTTON -->
    ${actionButtonUrl ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0; text-align: center;">
        <tr>
          <td align="center">
            <a href="${actionButtonUrl}" target="_blank" style="background-color: ${getPrimaryColor()}; color: #ffffff; padding: 14px 30px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(91, 108, 255, 0.2); transition: background-color 0.2s;">
              ${actionButtonText}
            </a>
          </td>
        </tr>
      </table>
    ` :""}

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #94A3B8; text-align: center;">
      An official receipt and invoice have been attached/generated for your records. Please save this email for future reference.
    </p>
  `;

  return wrapInMasterLayout(`${purchaseTypeTitle} Purchase Confirmation`, content);
};

/**
 * Internal Admin Notification Template (Clean, highly structured, data-driven).
 */
exports.generateAdminNotifyEmail = (title, detailsRows = []) => {
  let tableHtml ="";
  detailsRows.forEach(row => {
    tableHtml += `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 12px 10px; color: #475569; font-weight: 600; background-color: #F8FAFC; width: 180px;">${row.label}</td>
        <td style="padding: 12px 10px; color: #0F172A; font-weight: 500;">${row.value}</td>
      </tr>
    `;
  });

  const content = `
    <h2 style="margin: 0 0 8px 0; color: #0F172A; font-size: 20px; font-weight: 800;">
       Admin Alert: ${title}
    </h2>
    <p style="margin: 0 0 24px 0; color: #64748B; font-size: 14px;">
      A new transaction or system event has occurred on Draa. See details below:
    </p>

    <!-- ADMIN DETAILS DATA GRID -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; font-size: 13px; line-height: 1.5; border-collapse: collapse;">
      ${tableHtml}
      <tr>
        <td style="padding: 12px 10px; color: #475569; font-weight: 600; background-color: #F8FAFC;">System Timestamp</td>
        <td style="padding: 12px 10px; color: #0F172A; font-weight: 500;">${new Date().toLocaleString()}</td>
      </tr>
    </table>

    <div style="margin-top: 32px; text-align: center;">
      <a href="https://draa.in/admin-dashboard" target="_blank" style="background-color: #0F172A; color: #ffffff; padding: 10px 20px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
        Open Admin Portal
      </a>
    </div>
  `;

  return wrapInMasterLayout(`System Alert: ${title}`, content);
};

/**
 * Generates a premium security alert email for new device login (Flipkart styled).
 */
exports.generateNewDeviceLoginEmail = (name, email, dateTime, deviceType, secureAccountUrl, ipAddress = '', location = '') => {
  const content = `
    <!-- HEADER INTRO -->
    <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 20px; font-weight: 700; line-height: 1.3;">
      Hey ${name},
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      We noticed a new login for your account <strong style="color: #0F172A;">${email}</strong>
    </p>

    <!-- BOXED LOGIN DETAILS -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-collapse: separate; overflow: hidden;">
      <tr>
        <td style="padding: 20px; font-size: 14px; color: #1E293B; line-height: 1.8;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width: 120px; color: #64748B; font-weight: 600; padding: 6px 0;">Date & Time:</td>
              <td style="font-weight: 600; color: #0F172A; padding: 6px 0;">${dateTime}</td>
            </tr>
            <tr>
              <td style="color: #64748B; font-weight: 600; padding: 6px 0;">Device:</td>
              <td style="font-weight: 600; color: #0F172A; padding: 6px 0;">${deviceType}</td>
            </tr>
            ${ipAddress ? `
            <tr>
              <td style="color: #64748B; font-weight: 600; padding: 6px 0;">IP Address:</td>
              <td style="font-weight: 600; color: #0F172A; padding: 6px 0;">${ipAddress}</td>
            </tr>
            ` : ''}
            ${location ? `
            <tr>
              <td style="color: #64748B; font-weight: 600; padding: 6px 0;">Location:</td>
              <td style="font-weight: 600; color: #0F172A; padding: 6px 0;">${location}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
      If this was you, you can safely ignore this message.<br>
      If this wasn't you, please visit <strong style="color: #0F172A;">My Account &rarr; Manage Devices</strong> immediately to log out of the suspicious session and secure your account.
    </p>

    <!-- CALL TO ACTION BUTTON -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0; text-align: center;">
      <tr>
        <td align="center">
          <a href="${secureAccountUrl}" target="_blank" style="background-color: #1A56DB; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);">
            Secure my account
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #94A3B8; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 20px;">
      Not working? Click: <a href="${secureAccountUrl}" target="_blank" style="color: #1A56DB; text-decoration: underline;">${secureAccountUrl}</a>
    </p>
  `;

  return wrapInMasterLayout("Security Alert: New login detected", content);
};

/**
 * Generates a premium abandoned cart email template.
 */
exports.generateAbandonedCartEmail = (name, items) => {
  let itemsHtml = '';
  for (const item of items) {
    const coverImageSrc = item.coverImage 
      ? (item.coverImage.startsWith('http') ? item.coverImage : `https://api.draa.in/${item.coverImage}`)
      : 'https://draa.in/assets/img/default-book.png';
      
    itemsHtml += `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 16px 0; width: 80px; vertical-align: top;">
          <img src="${coverImageSrc}" alt="${item.title}" style="width: 70px; border-radius: 8px; border: 1px solid #E2E8F0; display: block;" />
        </td>
        <td style="padding: 16px 12px; vertical-align: middle;">
          <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">${item.title}</div>
          <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">By ${item.author || 'Unknown Author'}</div>
          <span style="display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background-color: #F1F5F9; color: #475569;">
            ${item.bookType === 'pdftype' ? 'Digital PDF' : 'Physical Book'}
          </span>
        </td>
        <td style="padding: 16px 0; text-align: right; vertical-align: middle; font-weight: 700; color: #0F172A; font-size: 16px; white-space: nowrap;">
          ₹${item.finalPrice}
          ${item.quantity > 1 ? `<div style="font-size: 11px; color: #64748B; font-weight: normal; margin-top: 4px;">Qty: ${item.quantity}</div>` : ''}
        </td>
      </tr>
    `;
  }

  const content = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">Did you leave something behind?</h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
      Hello ${name},<br>
      We noticed that you added some premium study materials to your cart, but haven't completed your checkout. Don't let your studies wait! Here are the items waiting for you:
    </p>

    <!-- ITEMS TABLE -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid #E2E8F0;">
          <th align="left" style="padding-bottom: 12px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Book</th>
          <th align="left" style="padding-bottom: 12px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; padding-left: 12px;">Details</th>
          <th align="right" style="padding-bottom: 12px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 32px; text-align: center;">
      <div style="font-size: 14px; color: #475569; margin-bottom: 12px;">Ready to secure your learning guides?</div>
      
      <!-- CALL TO ACTION BUTTON -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
        <tr>
          <td align="center">
            <a href="https://draa.in/cart" target="_blank" style="background-color: #5B6CFF; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(91, 108, 255, 0.25);">
              Complete Checkout Now
            </a>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #94A3B8; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 20px;">
      Not working? Copy and paste this link in your browser: <a href="https://draa.in/cart" target="_blank" style="color: #5B6CFF; text-decoration: underline;">https://draa.in/cart</a>
    </p>
  `;

  return wrapInMasterLayout("Finish checking out your books - Draa", content);
};
