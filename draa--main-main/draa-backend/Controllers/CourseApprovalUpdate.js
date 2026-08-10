const express=require('express');

const CourseModel=require('../Models/CourseModel');

const UpdateCourseApproval=async(req,res)=>{
       
    try {
        const {id}=req.params;
        const UpdateCourseApproval=await CourseModel.findByIdAndUpdate(
            id,
            {isApproved:true},
            {new:true}
        )
        if(!UpdateCourseApproval){
            return res.status(404).json({message:'Course not found'});
        }

        // Create notification for the teacher and students
        try {
            const Notification = require("../Models/NotificationModel");
            // Notify teacher
            await Notification.create({
                recipient: UpdateCourseApproval.teacher_id.toString(),
                recipientModel: 'Teacher',
                sender: null,
                senderModel: 'Admin',
                senderName: 'EduDocs Team',
                type: 'course_upload',
                title: 'Course Approved!',
                message: `Congratulations! Your course "${UpdateCourseApproval.title}" has been approved by the Admin and is now live on the marketplace.`,
                referenceId: UpdateCourseApproval._id
            });
            console.log('Notification triggered for course approval (Teacher)');

            // Notify students
            await Notification.create({
                recipient: 'all_students',
                recipientModel: 'User',
                sender: null,
                senderModel: 'Admin',
                senderName: 'EduDocs Team',
                type: 'course_upload',
                title: 'New Course Published!',
                message: `New Course Available: "${UpdateCourseApproval.title}" is now live!`,
                referenceId: UpdateCourseApproval._id
            });
            console.log('Notification triggered for course approval (all_students)');
        } catch (notifErr) {
            console.error('Failed to trigger notification for course approval:', notifErr);
        }

        res.status(200).json({message:'Course status updated successfully',data:UpdateCourseApproval});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Internal server error'});
        
    }
}

module.exports=UpdateCourseApproval;