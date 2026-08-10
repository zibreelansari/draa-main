const CourseContentModel = require('../Models/CourseConjtent');

//  same helpers as createCourseContent 



//  controller 

const UpdateCourseContent = async (req, res) => {
    try {
        const id = req.params.id;

        console.log("Update Body:", req.body);
        console.log("Update Files:", req.files);

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

        //  Slug: keep existing unless subject changed 
        const existingDoc = await CourseContentModel.findById(id);
        if (!existingDoc) {
            return res.status(404).json({ success: false, error:'Content not found' });
        }

        //  Parse tags 
        let parsedTags = [];
        if (tags) {
            try { parsedTags = JSON.parse(tags); } catch { parsedTags = []; }
        }

        //  Images: only replace if new files are uploaded 
        let schemaImagePath = req.body.schema_image || existingDoc.schema_image || "";
        let featuredImagesPaths = existingDoc.featured_images || [];

        if (req.files) {
            if (req.files.schema_image && req.files.schema_image[0]) {
                schemaImagePath = req.files.schema_image[0].path.replace(/\\/g, '/');
            }
            if (req.files.featured_images && req.files.featured_images.length > 0) {
                featuredImagesPaths = req.files.featured_images.map(file => file.path.replace(/\\/g, '/'));
            }
        }

        if (schemaImagePath && schemaImagePath.startsWith('http') && schemaImagePath !== existingDoc.schema_image) {
            const { downloadExternalImage } = require('../utils/imageDownloader');
            const localPath = await downloadExternalImage(schemaImagePath);
            if (localPath) schemaImagePath = localPath;
        }

        //  Build update payload 
        const updatePayload = {
            content_subject,
            content_category,
            content,
            author:           author           || existingDoc.author ||"Anonymous",
            tags:             parsedTags,
            schema_image:     schemaImagePath,
            featured_images:  featuredImagesPaths,
            youtube_url:      youtube_url      ||"",
            instagram_url:    instagram_url    ||"",
            updatedAt:        new Date(),
            // Reset to pending after edit
            approved: false
        };

        const updated = await CourseContentModel.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message:'Content updated successfully!',
            data: {
                id:               updated._id,
                content_subject:  updated.content_subject,
                schema_image:     updated.schema_image,
                featured_images:  updated.featured_images,
                youtube_url:      updated.youtube_url,
                instagram_url:    updated.instagram_url,
                updatedAt:        updated.updatedAt
            }
        });

    } catch (error) {
        console.error('Update Error:', error);

        if (error.name ==='ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ success: false, error:"Validation failed", details: errors });
        }

        if (error.code === 11000) {
            return res.status(400).json({ success: false, error:"Duplicate slug" });
        }

        res.status(500).json({
            success: false,
            error:'Server error',
            details: process.env.NODE_ENV ==='development' ? error.message :'Internal error'
        });
    }
};

module.exports = UpdateCourseContent;