const { transporter } = require("./mailConfig");

const sendContactMail = async ({ name, email, phone, subject, message, reference, to ="admin@draa.in" }) => {
  const mailOptions = {
    from: `"Draa Lead" <admin@draa.in>`,
    to: to,
    replyTo: email,
    subject: ` New Contact Message  ${subject}`,
    text: `New Contact Form Submission\nReference ID: ${reference}\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>New Contact Form Submission</h2>
        <p><strong>Reference ID:</strong> ${reference}</p>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:10px;border-radius:5px">
          ${message}
        </p>
        <hr />
        <small>This email was sent from Draa Contact Page</small>
      </div>
    `,
  };

  console.log(` Sending email via nodemailer to: ${mailOptions.to}`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Email info:', info.messageId);
    return info;
  } catch (error) {
    console.error(' Nodemailer Error:', error);
    throw error;
  }
};

module.exports = { sendContactMail };