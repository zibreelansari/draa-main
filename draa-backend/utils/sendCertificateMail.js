const { noReplyTransporter: transporter } = require("./mailConfig");

exports.sendCertificateMail = async ({ studentName, email, courseTitle, certificateBuffer }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px;">Congratulations! </h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">You've completed your course!</p>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <h2 style="margin-top: 0;">Dear ${studentName},</h2>
          <p>We are thrilled to announce that you have successfully completed the course <strong>"${courseTitle}"</strong> on Draa Academy.</p>
          <p>This is a significant milestone in your learning journey, and we hope the knowledge you've gained will help you reach new heights in your career.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #6366f1;">Your Official Certificate is Attached!</p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">You can also download it anytime from your dashboard.</p>
          </div>
          <p>Keep learning and keep growing!</p>
          <p>Best Regards,<br><strong>Team Draa</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          © ${new Date().getFullYear()} Draa Academy. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:'"Draa Academy" <no-reply@draa.in>',
    to: email,
    subject: `Congratulations! Your Certificate for ${courseTitle} | Draa`,
    html: html,
    attachments: [
      {
        filename: `Certificate-${courseTitle.replace(/\s+/g,'-')}.pdf`,
        content: certificateBuffer
      }
    ]
  });
};
