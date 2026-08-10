const { noReplyTransporter: transporter } = require("./mailConfig");

exports.sendTopicPurchaseMail = async ({
  studentName,
  email,
  topicName,
  totalTests,
  amount,
  orderId
}) => {

const emailTemplates = require("./emailTemplates");

  /* ==========================
     STUDENT EMAIL TEMPLATE
  ========================== */

  const studentHtml = emailTemplates.generatePurchaseEmail({
    studentName,
    purchaseTypeTitle:"Topic Test Bundle",
    itemName: topicName,
    orderId,
    amount,
    detailsRows: [
      { label:"Purchase Type", value:"Topic Test Series Bundle" },
      { label:"Total Tests Included", value: String(totalTests) },
      { label:"Status", value:"Completed / Activated" }
    ],
    actionButtonUrl:"https://draa.in/student-dashboard",
    actionButtonText:"Attempt Tests Now"
  });


  /* ==========================
     ADMIN EMAIL TEMPLATE
  ========================== */

  const adminHtml = emailTemplates.generateAdminNotifyEmail("New Topic Bundle Purchase", [
    { label:"Student Name", value: studentName },
    { label:"Student Email", value: email },
    { label:"Topic Bundle Name", value: topicName },
    { label:"Total Tests", value: String(totalTests) },
    { label:"Order ID", value: orderId },
    { label:"Amount Paid", value: `${amount}` }
  ]);


  /* ==========================
     SEND STUDENT MAIL
  ========================== */

  await transporter.sendMail({
    from:'"Draa" <no-reply@draa.in>',
    to: email,
    subject:"Your Topic Test Bundle Purchase | EduDocs",
    html: studentHtml
  });


  /* ==========================
     SEND ADMIN MAIL
  ========================== */

  await transporter.sendMail({
    from:'"Draa Payments" <no-reply@draa.in>',
    to:"account@draa.in",
    subject:"New Topic Bundle Purchase Received",
    html: adminHtml
  });

};