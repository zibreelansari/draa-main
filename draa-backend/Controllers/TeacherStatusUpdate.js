const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const TeacherModel = require('../Models/TeacherModel');


// MAIL TRANSPORT
const { transporter } = require("../utils/mailConfig");


// SEND STATUS EMAIL
const sendTeacherStatusMail = async (teacher, status, reason) => {

    let subject ="";
    let message ="";

    switch (status) {

        case"approved":
            subject =" Your Teacher Account Has Been Approved";
            message = `
Dear ${teacher.tname},

Congratulations! Your teacher account on Draa has been approved.

You can now login and start creating courses.

Your account is subject to our terms of service and community guidelines. We encourage you to create high-quality content and engage positively with students.

Please note that for safety and data intregrity you have to login again to access your dashboard and start creating courses.

Login here:
https://draa.in/teacher-login

Best Regards,
Draa Admin
`;
            break;

        case"rejected":
            subject ="Teacher Application Update";
            message = `
Dear ${teacher.tname},

Your teacher application has been rejected.

Reason:
${reason ||"Not specified"}

You may reapply or contact support.

Regards,
Draa Admin
`;
            break;

        case"suspended":
            subject ="Teacher Account Suspended";
            message = `
Dear ${teacher.tname},

Your teacher account has been suspended.

Reason:
${reason ||"Policy violation"}

Please contact support for assistance.

Regards,
Draa Admin
`;
            break;

        case"pending":
            subject ="Teacher Status Updated";
            message = `
Dear ${teacher.tname},

Your teacher account status has been set to pending for further review.

Regards,
Draa Admin
`;
            break;
    }

    await transporter.sendMail({
        from:'"Draa Admin" <admin@draa.in>',
        to: teacher.temail,
        subject: subject,
        text: message
    });

};



const updateTeacherStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const adminId = req.admin?.id || req.user?.id || req.adminId || null;

        console.log(`Updating teacher ${id} status to ${status}`);

        const validStatuses = ['pending','approved','rejected','suspended'];

        if (!status) {
            return res.status(400).json({
                success: false,
                message:'Status is required'
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:'Invalid teacher ID'
            });
        }

        const teacher = await TeacherModel.findById(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message:'Teacher not found'
            });
        }

        const previousStatus = teacher.Status;
        const updateData = { 
            Status: status,
            tokenVersion: (teacher.tokenVersion || 0) + 1 // Force logout on status change
        };

        switch (status) {

            case'approved':
                updateData.approvedBy = adminId;
                updateData.approvedAt = new Date();
                updateData.isVerified = true;
                updateData.isActive = true;

                updateData.rejectedBy = null;
                updateData.rejectedAt = null;
                updateData.rejectionReason ='';
                break;

            case'rejected':
                updateData.rejectedBy = adminId;
                updateData.rejectedAt = new Date();
                updateData.rejectionReason = rejectionReason ||'No reason provided';
                updateData.isVerified = false;
                updateData.isActive = false;

                updateData.approvedBy = null;
                updateData.approvedAt = null;
                break;

            case'suspended':
                updateData.rejectedBy = adminId;
                updateData.rejectedAt = new Date();
                updateData.rejectionReason = rejectionReason ||'Account suspended';
                updateData.isActive = false;
                updateData.isVerified = false;
                break;

            case'pending':
                updateData.approvedBy = null;
                updateData.approvedAt = null;
                updateData.rejectedBy = null;
                updateData.rejectedAt = null;
                updateData.rejectionReason ='';
                updateData.isVerified = false;
                updateData.isActive = true;
                break;
        }

        const updatedTeacher = await TeacherModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({
                success: false,
                message:'Teacher not found during update'
            });
        }

        console.log(` Status updated for teacher ${updatedTeacher.tname}`);

        // SEND EMAIL
        try {

            await sendTeacherStatusMail(
                updatedTeacher,
                status,
                rejectionReason
            );

            console.log(" Status email sent successfully");

        } catch (mailError) {

            console.error(" Email sending failed:", mailError.message);

        }

        // Create notification for the teacher
        try {
            const Notification = require("../Models/NotificationModel");
            let notifTitle ="";
            let notifMessage ="";

            if (status ==='approved') {
                notifTitle ="Account Approved!";
                notifMessage = `Congratulations ${updatedTeacher.tname}! Your teacher account on Draa has been approved. You can now login, create courses, upload books, and build your curriculum.`;
            } else if (status ==='rejected') {
                notifTitle ="Account Application Status";
                notifMessage = `Dear ${updatedTeacher.tname}, your teacher application has been rejected. Reason: ${rejectionReason ||"No reason provided."}`;
            } else if (status ==='suspended') {
                notifTitle ="Account Suspended";
                notifMessage = `Dear ${updatedTeacher.tname}, your teacher account has been suspended. Reason: ${rejectionReason ||"Violation of community guidelines."}`;
            }

            if (notifTitle) {
                await Notification.create({
                    recipient: updatedTeacher._id.toString(),
                    recipientModel:'Teacher',
                    sender: null,
                    senderModel:'Admin',
                    senderName:'EduDocs Team',
                    type:'general',
                    title: notifTitle,
                    message: notifMessage
                });
                console.log('Notification triggered for teacher status update');
            }
        } catch (notifErr) {
            console.error('Failed to trigger notification for teacher status:', notifErr);
        }

        res.status(200).json({
            success: true,
            message: `Teacher"${updatedTeacher.tname}" status updated to ${status}`,
            data: {
                teacher: {
                    id: updatedTeacher._id,
                    tname: updatedTeacher.tname,
                    temail: updatedTeacher.temail,
                    Status: updatedTeacher.Status,
                    isVerified: updatedTeacher.isVerified,
                    isActive: updatedTeacher.isActive
                },
                previousStatus,
                newStatus: status,
                updatedBy: adminId
            }
        });

    } catch (error) {

        console.error(" Error updating teacher status:", error);

        res.status(500).json({
            success: false,
            message:"Internal server error"
        });

    }
};

module.exports = updateTeacherStatus;