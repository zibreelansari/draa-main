const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const UserModel = require("../Models/UserModel");


// MAIL TRANSPORT
const { transporter } = require("../utils/mailConfig");


// SEND STATUS EMAIL
const sendStudentStatusMail = async (student, status) => {

  let subject ="";
  let message ="";

  switch (status) {

    case"approved":
      subject =" Your Student Account Has Been Approved";
      message = `
Dear ${student.name},

Congratulations! Your student account on Draa has been approved.

You can now login and start accessing courses.

Login here:
https://draa.in/student-login

Best Regards,
Draa Admin
`;
      break;

    case"rejected":
      subject ="Student Account Application Update";
      message = `
Dear ${student.name},

We regret to inform you that your student account request has been rejected.

If you believe this is a mistake, please contact support.

Regards,
Draa Admin
`;
      break;

    case"pending":
      subject ="Student Account Status Pending";
      message = `
Dear ${student.name},

Your student account status has been updated to pending.

Our admin team will review your account shortly.

Regards,
Draa Admin
`;
      break;
  }

  await transporter.sendMail({
    from:'"Draa Admin" <admin@draa.in>',
    to: student.email,
    subject: subject,
    text: message
  });

};



const updateUserStatusController = async (req, res) => {

  try {

    const { id } = req.params;
    let { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:"User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:"Invalid user ID format",
      });
    }

    // Normalize status
    if (status) {
      status = status.toLowerCase();
    }

    const allowedStatuses = ["pending","approved","rejected"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(",")}`,
      });
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:"Student not found",
      });
    }

    const previousStatus = user.status;

    // Update status
    user.status = status;

    // Legacy compatibility
    if (user.Status !== undefined) {

      if (status ==="approved") user.Status ="Verified";
      else if (status ==="rejected") user.Status ="Rejected";
      else user.Status ="pending";

    }

    await user.save();

    console.log(" Student status updated:", {
      id: user._id,
      status: user.status,
    });


    // SEND EMAIL
    try {

      await sendStudentStatusMail(user, status);

      console.log(" Student status email sent");

    } catch (mailError) {

      console.error(" Email sending failed:", mailError.message);

    }

    // SEND IN-APP NOTIFICATION
    try {
      const Notification = require("../Models/NotificationModel");
      let notifTitle ="";
      let notifMessage ="";

      if (status ==="approved") {
        notifTitle ="Account Approved!";
        notifMessage = `Dear ${user.name}, your student account has been approved by the Admin. Welcome to Draa! You can now access all your courses.`;
      } else if (status ==="rejected") {
        notifTitle ="Account Application Update";
        notifMessage = `Dear ${user.name}, unfortunately your student account request has been rejected. Please contact support if you believe this is a mistake.`;
      } else if (status ==="pending") {
        notifTitle ="Account Status: Pending Review";
        notifMessage = `Dear ${user.name}, your student account is currently under review. Our admin team will process it shortly.`;
      }

      if (notifTitle) {
        await Notification.create({
          recipient: user._id.toString(),
          recipientModel:"User",
          sender: null,
          senderModel:"Admin",
          senderName:"EduDocs Team",
          type:"general",
          title: notifTitle,
          message: notifMessage,
          referenceId: user._id,
        });
        console.log(" Student status notification sent:", notifTitle);
      }
    } catch (notifError) {
      console.error(" Student status notification failed:", notifError.message);
    }


    return res.status(200).json({
      success: true,
      message: `Student status updated to"${status}" successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phn: user.phn,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      previousStatus: previousStatus,
      newStatus: status,
    });

  } catch (error) {

    console.error(" Update user status error:", error);

    return res.status(500).json({
      success: false,
      message:"Internal server error",
      error: error.message,
    });

  }
};

module.exports = updateUserStatusController;