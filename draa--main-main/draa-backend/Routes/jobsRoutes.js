const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  //  EXISTING IMPORTS (UNCHANGED)
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,

  //  NEW IMPORTS (APPROVAL FUNCTIONALITY)
  getApprovedJobs,
  getPendingJobs,
  updateJobApproval,
  bulkApproveJobs,
  getJobStats,

  //  NEW CATEGORY-SPECIFIC IMPORTS
  getJobsByCategory,
  getJobsBySubcategory,
  getJobDetailsById,
  getFeaturedJobs
} = require('../Controllers/jobControllers');

const optionalAuth = require('../Middlewares/optionalAuth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/jobs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//  UPDATED: Configure multer storage with support for images and PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const sanitizedFieldName = file.fieldname.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = sanitizedFieldName + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

//  UPDATED: Enhanced file filter to accept PDFs and images
const fileFilter = (req, file, cb) => {
  console.log(' File upload attempt:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  // Accept images for cover_image field
  if (file.fieldname === 'cover_image') {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedImageTypes.includes(file.mimetype)) {
      console.log(' Image file accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log(' Invalid image type:', file.mimetype);
      cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed for cover image!'), false);
    }
  }
  // Accept PDFs for job_pdf_file and syllabus_file
  else if (file.fieldname === 'job_pdf_file' || file.fieldname === 'syllabus_file') {
    if (file.mimetype === 'application/pdf') {
      console.log(' PDF file accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log(' Invalid PDF type:', file.mimetype);
      cb(new Error('Only PDF files are allowed for job documents!'), false);
    }
  }
  // Reject unknown fields
  else {
    console.log(' Unknown field:', file.fieldname);
    cb(new Error('Invalid file field!'), false);
  }
};

//  UPDATED: Create multer instance with enhanced configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB limit for all files
    files: 3 // Maximum 3 files (cover_image + job_pdf + syllabus)
  }
});

//  UPDATED: Configure upload fields array for reusability
const uploadFields = [
  { name: 'cover_image', maxCount: 1 },      //  NEW: Cover image field
  { name: 'job_pdf_file', maxCount: 1 },     // Existing PDF field
  { name: 'syllabus_file', maxCount: 1 }     // Existing syllabus field
];

//  NEW CATEGORY-SPECIFIC ROUTES (Place these BEFORE parameterized routes)
router.get('/featured', getFeaturedJobs);
router.get('/approved/all', getApprovedJobs);         //  Move before /:id
router.get('/pending/all', getPendingJobs);           //  Move before /:id
router.get('/stats/overview', getJobStats);           //  Move before /:id
router.get('/category/:categoryId', getJobsByCategory);
router.get('/subcategory/:categoryId/:subcategory', getJobsBySubcategory);
router.get('/details/:id', getJobDetailsById);

//  UPDATED: Create job post with cover_image support
router.post('/create', upload.fields(uploadFields), createJobPost);

//  EXISTING ROUTES (UNCHANGED)
router.get('/', optionalAuth, getAllJobPosts);

//  UPDATED: Update job post with cover_image support
router.put('/update/:id', upload.fields(uploadFields), updateJobPost);

//  EXISTING ROUTES (UNCHANGED)
router.delete('/delete/:id', deleteJobPost);
router.put('/:id/approve', updateJobApproval);
router.post('/bulk-approve', bulkApproveJobs);

//  Place this at the end to avoid conflicts
router.get('/:id', getJobPostById);

//  UPDATED: Enhanced error handling middleware
router.use((error, req, res, next) => {
  console.error(' Upload error:', error);

  // Handle Multer-specific errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        details: 'File size should be less than 10MB',
        code: 'FILE_TOO_LARGE'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Maximum 3 files allowed (1 cover image + 2 PDFs)',
        code: 'TOO_MANY_FILES'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
        details: 'Invalid file field name',
        code: 'INVALID_FIELD'
      });
    }

    // Generic multer error
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      details: error.message,
      code: 'UPLOAD_ERROR'
    });
  }

  // Handle custom file filter errors
  if (error.message === 'Only PDF files are allowed for job documents!') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      details: 'Only PDF files are allowed for job notification and syllabus',
      code: 'INVALID_PDF_TYPE'
    });
  }

  if (error.message === 'Only image files (JPEG, PNG, WEBP, GIF) are allowed for cover image!') {
    return res.status(400).json({
      success: false,
      error: 'Invalid image type',
      details: 'Only JPEG, PNG, WEBP, and GIF images are allowed for cover image',
      code: 'INVALID_IMAGE_TYPE'
    });
  }

  if (error.message === 'Invalid file field!') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file field',
      details: 'Allowed fields are: cover_image, job_pdf_file, syllabus_file',
      code: 'INVALID_FIELD_NAME'
    });
  }

  // Pass other errors to the next error handler
  next(error);
});

//  NEW: Add a route to serve uploaded files (optional but recommended)
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', uploadDir, filename);

  // Check if file exists
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({
      success: false,
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
});

module.exports = router;
