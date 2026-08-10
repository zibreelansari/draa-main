const CourseContentModel = require('../Models/CourseConjtent');
const path = require('path');



const createCourseContent = async (req, res) => {
    try {
        console.log("Incoming Body:", req.body);
        console.log("Incoming Files:", req.files);

        const {
            content_subject,
            content_category,
            content,
            author,
            content_type,
            tags,
            youtube_url,
            instagram_url
        } = req.body;

        if (!content_subject || !content_category || !content) {
            return res.status(400).json({
                success: false,
                error:'Subject, Category, and Content are required.'
            });
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = [];
            }
        }

        //  NEW: Handle two types of images
        let schemaImagePath = req.body.schema_image || "";
        let featuredImagesPaths = [];

        if (req.files) {
            // Single schema/reference image
            if (req.files.schema_image && req.files.schema_image[0]) {
                schemaImagePath = req.files.schema_image[0].path.replace(/\\/g, '/');
            }

            // Multiple featured images
            if (req.files.featured_images && req.files.featured_images.length > 0) {
                featuredImagesPaths = req.files.featured_images.map(file => file.path.replace(/\\/g, '/'));
            }
        }

        if (schemaImagePath && schemaImagePath.startsWith('http')) {
            const { downloadExternalImage } = require('../utils/imageDownloader');
            const localPath = await downloadExternalImage(schemaImagePath);
            if (localPath) schemaImagePath = localPath;
        }

        // Save to DB
        const newContent = new CourseContentModel({
            content_subject,
            content_category,
            content,
            author: author ||"Anonymous",
            tags: parsedTags,
            schema_image: schemaImagePath,           //  Single image
            featured_images: featuredImagesPaths,    //  Array of images
            youtube_url: youtube_url ||"",
            instagram_url: instagram_url ||"",
            createdBy: req.body.createdBy || null,
            creatorRole: req.body.creatorRole ||"admin",
            approved: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedContent = await newContent.save();

        // Create notification for admin if created by a teacher
        try {
            if (req.body.creatorRole ==='teacher' || req.body.creatorRole ==='TEACHER') {
                const Notification = require("../Models/NotificationModel");
                const teacherName = req.body.author ||"A Teacher";
                await Notification.create({
                    recipient:'admin',
                    recipientModel:'Admin',
                    sender: req.body.createdBy || null,
                    senderModel:'Teacher',
                    senderName: teacherName,
                    type:'content_upload',
                    title:'New Course Content Uploaded',
                    message: `Teacher ${teacherName} uploaded a new course content:"${content_subject}"`,
                    referenceId: savedContent._id
                });
                console.log('Notification triggered for new course content');
            }
        } catch (notifErr) {
            console.error('Failed to trigger admin notification for course content:', notifErr);
        }

        res.status(201).json({
            success: true,
            message:'Content created successfully!',
            data: {
                id: savedContent._id,
                content_subject: savedContent.content_subject,
                schema_image: savedContent.schema_image,
                featured_images: savedContent.featured_images,
                youtube_url: savedContent.youtube_url,
                instagram_url: savedContent.instagram_url,
                createdAt: savedContent.createdAt
            }
        });

    } catch (error) {
        console.error('Create Error:', error);

        if (error.name ==='ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error:"Validation failed",
                details: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error:"Duplicate slug"
            });
        }

        res.status(500).json({
            success: false,
            error:'Server error',
            details: process.env.NODE_ENV ==='development' ? error.message :'Internal error'
        });
    }
};

module.exports = { createCourseContent };
