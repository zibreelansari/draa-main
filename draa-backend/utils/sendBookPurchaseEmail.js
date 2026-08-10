const { noReplyTransporter: transporter } = require("./mailConfig");

const purchaseTypeLabel = (type) => {
  if (type ==="pdftype") return"E-Book (PDF)";
  if (type ==="paperback") return"Paperback Book";
  if (type ==="both(ppt+pdf)") return"Combo (Paperback + PDF)";
  return type;
};

exports.sendBookPurchaseMail = async ({
  email,
  studentName,
  bookTitle,
  purchaseType,
  amount,
  orderId,
}) => {

  const typeLabel = purchaseTypeLabel(purchaseType);

const emailTemplates = require("./emailTemplates");

  /* ===============================
     STUDENT EMAIL TEMPLATE
  =============================== */

  const studentHtml = emailTemplates.generatePurchaseEmail({
    studentName,
    purchaseTypeTitle:"Book",
    itemName: bookTitle,
    orderId,
    amount,
    detailsRows: [
      { label:"Book Format", value: typeLabel },
      { label:"Payment Status", value:"Completed / Paid" }
    ],
    actionButtonUrl: purchaseType ==="paperback" ? null :"https://draa.in/student-dashboard",
    actionButtonText:"Access Digital Library",
    deliveryNotice: purchaseType ==="paperback"
      ?"Your physical paperback book will be prepared and shipped shortly. You will receive real-time tracking updates via email once dispatched."
      :"Your E-Book (PDF) has been instantly added to your dashboard account under Purchased Books."
  });


  /* ===============================
     ADMIN / ACCOUNT EMAIL TEMPLATE
  =============================== */

  const adminHtml = emailTemplates.generateAdminNotifyEmail("New Book Purchase", [
    { label:"Student Name", value: studentName },
    { label:"Student Email", value: email },
    { label:"Book Title", value: bookTitle },
    { label:"Format", value: typeLabel },
    { label:"Order ID", value: orderId },
    { label:"Amount Paid", value: `${amount}` },
    { label:"Fulfillment Required", value: (purchaseType ==="paperback" || purchaseType ==="both(ppt+pdf)") ?"YES (Shipping Details Required)" :"NO (Digital Delivery)" }
  ]);


  /* ===============================
     SEND STUDENT EMAIL
  =============================== */

  await transporter.sendMail({
    from:'"Draa" <no-reply@draa.in>',
    to: email,
    subject:"Your Book Purchase Confirmation | Draa",
    html: studentHtml,
  });


  /* ===============================
     SEND ADMIN EMAIL
  =============================== */

  await transporter.sendMail({
    from:'"Draa Payments" <no-reply@draa.in>',
    to:"account@draa.in",
    subject:"New Book Purchase Received",
    html: adminHtml,
  });

};