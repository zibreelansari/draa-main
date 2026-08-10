const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createBook,
  getAllBooks,
  deleteBook,
  updateBook,
  getBookById,
  // Category-wise controller
  getBooksByCategory,
  // Approval controllers
  updateBookApproval,
  getApprovedBooks,
  getPendingBooks,
  bulkApproveBooks,
  // Category controllers
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  searchBooks,
  getCategoryByName
} = require('../Controllers/bookcontrollers.js');

const checkAuth = require('../Middlewares/checkAuth');

const router = express.Router();

// ===========================
// UPLOAD DIRECTORY SETUP
// ===========================
const uploadDir ='uploads/books';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(' Created upload directory:', uploadDir);
}

// ===========================
// MULTER STORAGE CONFIGURATION
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension)
      .replace(/[^a-zA-Z0-9]/g,'_')
      .substring(0, 30);
    const fileName = `${file.fieldname}-${baseName}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// ===========================
// FILE FILTER WITH VALIDATION
// ===========================
const fileFilter = (req, file, cb) => {
  console.log(' Processing file:', {
    fieldname: file.fieldname,
    mimetype: file.mimetype,
    originalname: file.originalname,
    size: file.size
  });

  // Define allowed types for each field
  const allowedImageTypes = [
'image/jpeg',
'image/jpg',
'image/png',
'image/gif',
'image/webp',
'image/svg+xml'
  ];

  const allowedPdfTypes = [
'application/pdf'
  ];

  //  Handle coverImage (single main image)
  if (file.fieldname ==='coverImage') {
    if (allowedImageTypes.includes(file.mimetype)) {
      console.log(' Cover image accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log(' Invalid cover image type:', file.mimetype);
      cb(new Error(`Invalid cover image type. Allowed: ${allowedImageTypes.join(',')}`), false);
    }
  }

  //  Handle addOnImages (multiple additional images)
  else if (file.fieldname ==='addOnImages') {
    if (allowedImageTypes.includes(file.mimetype)) {
      console.log(' Additional image accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log(' Invalid additional image type:', file.mimetype);
      cb(new Error(`Invalid additional image type. Allowed: ${allowedImageTypes.join(',')}`), false);
    }
  }

  //  Handle PDF
  else if (file.fieldname ==='pdf') {
    if (allowedPdfTypes.includes(file.mimetype)) {
      console.log(' PDF accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log(' Invalid PDF type:', file.mimetype);
      cb(new Error('Invalid PDF file type. Only PDF files are allowed.'), false);
    }
  }

  //  Reject unexpected fields
  else {
    console.log(' Unexpected field name:', file.fieldname);
    cb(new Error(`Unexpected field: ${file.fieldname}. Allowed fields: coverImage, addOnImages, pdf`), false);
  }
};

// ===========================
// MULTER CONFIGURATION
// ===========================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 10, // Maximum 10 files (1 cover + 5 additional + 1 PDF + buffer)
    fieldSize: 10 * 1024 * 1024 // 10MB for non-file fields
  }
});

// ===========================
// UPLOAD FIELDS CONFIGURATION
// ===========================
const uploadFields = upload.fields([
  { name:'coverImage', maxCount: 1 },      // Single cover image
  { name:'addOnImages', maxCount: 5 },     // Up to 5 additional images
  { name:'pdf', maxCount: 1 }              // Single PDF file
]);

// ===========================
// ERROR HANDLING MIDDLEWARE
// ===========================
const handleMulterError = (error, req, res, next) => {
  console.error(' Upload Error:', error);

  if (error instanceof multer.MulterError) {
    // Multer-specific errors
    if (error.code ==='LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error:'File too large. Maximum file size is 100MB per file.'
      });
    }

    if (error.code ==='LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error:'Too many files. Maximum allowed: 1 cover image + 5 additional images + 1 PDF = 7 files total.'
      });
    }

    if (error.code ==='LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: `Unexpected file field:"${error.field}". Only"coverImage","addOnImages", and"pdf" are allowed.`,
        field: error.field
      });
    }

    if (error.code ==='LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        success: false,
        error:'Too many form fields.'
      });
    }

    if (error.code ==='LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        error:'Too many parts in the multipart form.'
      });
    }

    // Generic Multer error
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`,
      code: error.code
    });
  }

  // Custom file filter errors
  if (error.message && (
    error.message.includes('Invalid') ||
    error.message.includes('Unexpected field') ||
    error.message.includes('Allowed')
  )) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Generic errors
  if (error) {
    return res.status(500).json({
      success: false,
      error:'File upload failed',
      details: error.message
    });
  }

  next();
};

// ===========================
// DEBUG MIDDLEWARE
// ===========================
router.use((req, res, next) => {
  console.log(`\n ${req.method} ${req.path}`);
  console.log(` Content-Type: ${req.headers['content-type']}`);
  if (req.method ==='POST' || req.method ==='PUT') {
    console.log(` Body keys: ${Object.keys(req.body).join(',')}`);
  }
  next();
});

// ===========================
// BOOK CRUD ROUTES
// ===========================

// Create book with file uploads
router.post(
'/create',
  checkAuth,
  uploadFields,
  (req, res, next) => {
    console.log(' Files received:', req.files ? Object.keys(req.files) :'No files');
    if (req.files) {
      console.log(' Cover images:', req.files.coverImage?.length || 0);
      console.log(' Additional images:', req.files.addOnImages?.length || 0);
      console.log(' PDF files:', req.files.pdf?.length || 0);
    }
    console.log(' Form data keys:', Object.keys(req.body));
    next();
  },
  handleMulterError,
  createBook
);

// Update book with file uploads
router.put(
'/:id',
  checkAuth,
  uploadFields,
  (req, res, next) => {
    console.log(' Update - Files received:', req.files ? Object.keys(req.files) :'No files');
    next();
  },
  handleMulterError,
  updateBook
);

// Get all books (with optional filters)
router.get('/all', checkAuth, getAllBooks);

// Get only approved books (for public display)
router.get('/approved', getApprovedBooks);

// Get pending books (for admin review or teacher workspace)
router.get('/pending', checkAuth, async (req, res) => {
  try {
    const Book = require('../Models/booksModel.js');
    let filter = { isApproved: false };

    if (req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy','tname email');

    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search books
router.get('/search/query', searchBooks);

// Get book statistics
router.get('/stats/overview', checkAuth, async (req, res) => {
  try {
    const Book = require('../Models/booksModel.js');
    let filter = {};
    if (req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const [
      totalBooks,
      approvedBooks,
      pendingBooks,
      featuredBooks,
      popularBooks
    ] = await Promise.all([
      Book.countDocuments(filter),
      Book.countDocuments({ ...filter, isApproved: true }),
      Book.countDocuments({ ...filter, isApproved: false }),
      Book.countDocuments({ ...filter, isFeatured: true }),
      Book.countDocuments({ ...filter, isPopular: true })
    ]);

    // Recent books (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBooks = await Book.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Top categories
    const topCategories = await Book.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id:'$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          name:'$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalBooks,
        approved: approvedBooks,
        pending: pendingBooks,
        featured: featuredBooks,
        popular: popularBooks,
        recent: recentBooks,
        approval_rate: totalBooks > 0 ? ((approvedBooks / totalBooks) * 100).toFixed(1) :'0.0'
      },
      top_categories: topCategories
    });
  } catch (error) {
    console.error(' Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get books by category slug OR ObjectId - BEFORE /:id route
// Accepts either a slug (e.g. "class-6") or a Mongo ObjectId (24-hex).
// If an ID is supplied, look up the category's name first and forward to the slug-based handler.
router.get('/category/:categorySlug', async (req, res, next) => {
  const { categorySlug } = req.params;

  // Heuristic: a 24-hex Mongo ObjectId
  const isObjectId = /^[a-f0-9]{24}$/i.test(categorySlug);

  if (isObjectId) {
    try {
      const Category = require('../Models/Category');
      const category = await Category.findById(categorySlug).select('name').lean();
      if (category && category.name) {
        // Rewrite the slug to the resolved category name and continue
        req.params.categorySlug = category.name;
        return getBooksByCategory(req, res, next);
      }
      // Not found by ID — fall through to slug handler, which will return a proper 404
    } catch (err) {
      return next(err);
    }
  }
  return getBooksByCategory(req, res, next);
});

// Get single book by ID
router.get('/:id', getBookById);

// Delete book
router.delete('/:id', checkAuth, deleteBook);

// ===========================
// APPROVAL ROUTES
// ===========================
router.get('/:name', getCategoryByName);
// Approve/Unapprove single book
router.put('/:id/approve', updateBookApproval);

// Bulk approve/unapprove books
router.post('/bulk-approve', bulkApproveBooks);

// ===========================
// CATEGORY ROUTES
// ===========================

// Create category
router.post('/categories/create', createCategory);

// Get all categories
router.get('/categories/all', getAllCategories);

// Update category
router.put('/categories/:id', updateCategory);

// Delete category
router.delete('/categories/:id', deleteCategory);

// ===========================
// GLOBAL ERROR HANDLER
// ===========================
router.use((error, req, res, next) => {
  // This catches any errors not handled by route-specific error handlers
  console.error(' Global Error Handler:', error);

  res.status(error.status || 500).json({
    success: false,
    error: error.message ||'Internal server error',
    ...(process.env.NODE_ENV ==='development' && { stack: error.stack })
  });
});

module.exports = router;
