const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UpdateCourseContent = require('../Controllers/UpdateCourseContentCtrl');

const router = express.Router();

//  Upload directory 
const uploadDir ='uploads/course-content';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

//  Storage config 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname +'-' + uniqueSuffix + fileExtension);
    }
});

//  File filter 
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
        fileSize:  5  * 1024 * 1024,   // 5 MB per image
        files:     6,                  // 1 schema + 5 featured
        fieldSize: 25 * 1024 * 1024    // 25 MB for large HTML content
    }
});

//  Route 
router.put(
'/:id',
    upload.fields([
        { name:'schema_image',    maxCount: 1 },   // single reference image
        { name:'featured_images', maxCount: 5 }    // gallery images
    ]),
    UpdateCourseContent
);

//  Multer error handler 
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