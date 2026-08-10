const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCourseContent } = require('../Controllers/CourseContentCtrl');

const router = express.Router();

// Create uploads directory
const uploadDir ='uploads/course-content';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname +'-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,     // image size
        files: 6,

        fieldSize: 25 * 1024 * 1024   //  25 MB HTML content
    }
})


//  NEW: Handle both single schema_image and multiple featured_images
router.post('/createCourseContent',
    upload.fields([
        { name:'schema_image', maxCount: 1 },      // Single reference image
        { name:'featured_images', maxCount: 5 }    // Multiple gallery images
    ]),
    createCourseContent
);

// Error handling
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code ==='LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error:'File too large',
                details:'File size should be less than 5MB'
            });
        }
        if (error.code ==='LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error:'Too many files',
                details:'Maximum 6 files allowed (1 schema + 5 featured)'
            });
        }
        if (error.code ==='LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error:'Unexpected field',
                details: error.message
            });
        }
    }

    if (error.message ==='Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            error:'Invalid file type',
            details:'Only image files are allowed'
        });
    }

    next(error);
});

module.exports = router;
