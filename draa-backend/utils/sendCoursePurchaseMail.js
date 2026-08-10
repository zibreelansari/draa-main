const { noReplyTransporter: transporter } = require("./mailConfig");
const { generateInvoicePDF } = require("./generateInvoicePDF");
const emailTemplates = require("./emailTemplates");

exports.sendCoursePurchaseMail = async ({
  studentName,
  email,
  courseTitle,
  amount,
  orderId
}) => {

  // Generate Invoice PDF Buffer
  const invoiceBuffer = await generateInvoicePDF({
    studentName,
    email,
    courseTitle,
    amount,
    orderId
  });

  /* ==========================
     STUDENT EMAIL TEMPLATE
  ========================== */

  const studentHtml = emailTemplates.generatePurchaseEmail({
    studentName,
    purchaseTypeTitle:"Course",
    itemName: courseTitle,
    orderId,
    amount,
    detailsRows: [
      { label:"Purchase Type", value:"Premium Online Course" },
      { label:"Status", value:"Completed / Activated" }
    ],
    actionButtonUrl:"https://draa.in/student-dashboard",
    actionButtonText:"Start Learning Now"
  });


  /* ==========================
     ADMIN / ACCOUNT EMAIL
  ========================== */

  const adminHtml = emailTemplates.generateAdminNotifyEmail("New Course Purchase", [
    { label:"Student Name", value: studentName },
    { label:"Student Email", value: email },
    { label:"Course Title", value: courseTitle },
    { label:"Order ID", value: orderId },
    { label:"Amount Paid", value: `${amount}` }
  ]);


  /* ==========================
     SEND STUDENT MAIL
  ========================== */

  await transporter.sendMail({
    from:'"Draa" <no-reply@draa.in>',
    to: email,
    subject:"Your Course Purchase Confirmation | Draa",
    html: studentHtml,
    attachments: [
      {
        filename: `Invoice-${orderId.slice(-6).toUpperCase()}.pdf`,
        content: invoiceBuffer
      }
    ]
  });


  /* ==========================
     SEND ADMIN MAIL
  ========================== */

  await transporter.sendMail({
    from:'"Draa Payments" <no-reply@draa.in>',
    to:"account@draa.in",
    subject:"New Course Purchase - Payment Received",
    html: adminHtml,
    attachments: [
        {
          filename: `Invoice-${orderId.slice(-6).toUpperCase()}.pdf`,
          content: invoiceBuffer
        }
    ]
  });

};