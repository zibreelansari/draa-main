const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const {
  //  Updated functions with hierarchical support
  createTestSeries,
  getMyTestSeries,
  getTestSeriesById,
  updateTestSeries,
  deleteTestSeries,
  getPendingTestSeries,
  updateTestSeriesStatus,
  getActiveTestSeries,
  getTestSeriesByTeacher,

  //  New hierarchical functions
  getTestSeriesByTopicCategory,
  getExamFullHierarchy,
  getHierarchicalNavigation,
  getNextSeriesNumber,

  //  NEW: Hierarchical filtering functions
  getTestSeriesByExamination,
  getTestSeriesBySubject,
  getTestSeriesByTopic,

  //  Test functions
  startTest,
  submitAnswer,
  submitTest,

  //  NEW: Admin approval functions
  approveTestSeries,
  rejectTestSeries,
  getAllTestSeriesForAdmin,

  //  Backward compatibility
  getActiveTestSeriesByCategory,


  importQuestionFromImageOCR,
  importQuestionsFromPPT,
  exportQuestionPPTTemplate,
  importQuestionsFromLatex,
  exportLatexTemplate
} = require('../Controllers/TestSeriesController');

// Import separate hierarchical controllers
const {

  getAllExaminationCategories,
  getExaminationCategoryById,
  createExaminationCategory,
  updateExaminationCategory,
  deleteExaminationCategory,
  toggleExaminationCategoryStatus,
  getExaminationCategoriesByYear
} = require('../Controllers/examinationCategoryController');

const {
  getSubjectsByExaminationCategory,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus
} = require('../Controllers/subjectController');

const {
  getTopicCategoriesBySubject,
  getTopicCategoryById,
  createTopicCategory,
  updateTopicCategory,
  deleteTopicCategory,
  toggleTopicCategoryStatus,
  getTopicCategoriesForNavigation
} = require('../Controllers/TopicCegoryController');




// ===============================
// Multer config for OCR, PPT & LaTeX
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/testseries');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      // OCR images
      'image/png',
      'image/jpeg',
      'image/jpg',

      // PPT
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // LaTeX / text
      'text/plain',
      'application/x-tex',
      'application/x-latex',
      'application/octet-stream' // fallback (VERY IMPORTANT)
    ];

    const allowedExtensions = [
      '.png', '.jpg', '.jpeg',
      '.ppt', '.pptx',
      '.tex', '.txt'
    ];

    const fileExt = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(fileExt)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});




// =============================================================================
//  HIERARCHICAL NAVIGATION ROUTES (Public Access)
// =============================================================================

// Get all examination categories
router.get('/navigation/examinations', getAllExaminationCategories);
router.get('/navigation/examinations/create', createExaminationCategory);

// Get examination categories by year
router.get('/navigation/examinations/year/:year', getExaminationCategoriesByYear);

// Get single examination category
router.get('/navigation/examinations/:examId', getExaminationCategoryById);

// Get subjects under examination category
router.get('/navigation/examinations/:examId/subjects', getSubjectsByExaminationCategory);

// Get single subject
router.get('/navigation/subjects/:subjectId', getSubjectById);

// Get topic categories under subject
router.get('/navigation/subjects/:subjectId/topics', getTopicCategoriesBySubject);

// Get topic categories for navigation (simplified)
router.get('/navigation/subjects/:subjectId/topics/simple', getTopicCategoriesForNavigation);

// Get single topic category
router.get('/navigation/topics/:topicId', getTopicCategoryById);

// Get test series under topic category
router.get('/navigation/topics/:topicId/test-series', getTestSeriesByTopicCategory);

// Get complete hierarchical navigation (dynamic)
router.get('/navigation/hierarchy', getHierarchicalNavigation);

// =============================================================================
//  TEACHER ROUTES - Create and Manage Test Series (No Auth)
// =============================================================================

//  Legacy route (backward compatibility)
router.post('/create', createTestSeries);

//  NEW: Hierarchical test series creation  
router.post('/hierarchical/create', createTestSeries);

// Get helper data for test series creation
router.get('/helper/next-series-number/:topicId', getNextSeriesNumber);

// Teacher's own test series management
router.get('/my-tests', getMyTestSeries);
router.get('/:testId', getTestSeriesById);
router.put('/:testId', updateTestSeries);
router.delete('/:testId', deleteTestSeries);

// Get test series by specific teacher (for admin/public view)
router.get('/teacher/:teacherId', getTestSeriesByTeacher);

// =============================================================================
//  ADMIN ROUTES - Hierarchical Management & Approval (No Auth)
// =============================================================================

//  NEW: Enhanced Admin Test Series Management
// Get all test series for admin dashboard
router.get('/admin/all', getAllTestSeriesForAdmin);

// Test Series Approval Workflow
router.get('/admin/pending', getPendingTestSeries);
router.put('/admin/:testId/status', updateTestSeriesStatus);

//  NEW: Dedicated Approve/Reject Routes
router.put('/admin/:testId/approve', approveTestSeries);
router.put('/admin/:testId/reject', rejectTestSeries);

//  Additional status update routes for frontend compatibility
router.put('/update/:testId/status', updateTestSeriesStatus);  // For frontend handleApprove
router.put('/:testId/status', updateTestSeriesStatus);         // For frontend handleReject

//  Examination Category Management (Public)
const uploadBanner = require('../Middlewares/uploadBanner');
router.post('/admin/examinations/upload-banner', uploadBanner.single('bannerImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    bannerImage: `/uploads/banners/${req.file.filename}`
  });
});

router.post('/admin/examinations', createExaminationCategory);
router.put('/admin/examinations/:categoryId', updateExaminationCategory);
router.delete('/admin/examinations/:categoryId', deleteExaminationCategory);
router.patch('/admin/examinations/:categoryId/toggle', toggleExaminationCategoryStatus);

//  Subject Management (Public)
router.post('/admin/subjects', createSubject);
router.put('/admin/subjects/:subjectId', updateSubject);
router.delete('/admin/subjects/:subjectId', deleteSubject);
router.patch('/admin/subjects/:subjectId/toggle', toggleSubjectStatus);

//  Topic Category Management (Public)
router.post('/admin/topics', createTopicCategory);
router.put('/admin/topics/:topicId', updateTopicCategory);
router.delete('/admin/topics/:topicId', deleteTopicCategory);
router.patch('/admin/topics/:topicId/toggle', toggleTopicCategoryStatus);

// =============================================================================
//  STUDENT ROUTES - Browse and Take Tests (No Auth)
// =============================================================================

//  Enhanced: Get active test series with hierarchical filtering
router.get('/active/all', getActiveTestSeries);

//  NEW: Primary hierarchical filtering routes
router.get('/hierarchy/full/:examId', getExamFullHierarchy); // Bulk Tree Endpoint
router.get('/hierarchy/exam/:examId', getTestSeriesByExamination);
router.get('/hierarchy/subject/:subjectId', getTestSeriesBySubject);
router.get('/hierarchy/topic/:topicId', getTestSeriesByTopic);

//  NEW: Alternative hierarchical routes (for frontend flexibility)
router.get('/examination/:examId', getTestSeriesByExamination);
router.get('/subject/:subjectId', getTestSeriesBySubject);
router.get('/topic/:topicId', getTestSeriesByTopic);

//  Legacy: Category-wise filter (backward compatibility)
router.get('/active/category/:categoryName', getActiveTestSeriesByCategory);

//  Test Taking Routes (Public Access)
router.post('/:testId/start', startTest);
router.put('/attempt/:attemptId/answer', submitAnswer);
router.post('/attempt/:attemptId/submit', submitTest);

//  NEW: Enhanced test details with hierarchy context
router.get('/:testId/details', getTestSeriesById);

// =============================================================================
//  SEARCH & FILTER ROUTES (Public)
// =============================================================================

// Advanced search across hierarchy
router.get('/search/global', getActiveTestSeries);

//  UPDATED: Filter routes using new hierarchical controllers
// Filter by examination category
router.get('/filter/examination/:examId', getTestSeriesByExamination);

// Filter by subject
router.get('/filter/subject/:subjectId', getTestSeriesBySubject);

// Filter by topic category
router.get('/filter/topic/:topicId', getTestSeriesByTopic);

//  Legacy filter routes (backward compatibility)
router.get('/filter/examination/:examId/legacy', (req, res) => {
  req.query.examinationCategory = req.params.examId;
  return getActiveTestSeries(req, res);
});

router.get('/filter/subject/:subjectId/legacy', (req, res) => {
  req.query.subject = req.params.subjectId;
  return getActiveTestSeries(req, res);
});

router.get('/filter/topic/:topicId/legacy', (req, res) => {
  req.query.topicCategory = req.params.topicId;
  return getTestSeriesByTopicCategory(req, res);
});

// =============================================================================
//  BULK OPERATIONS (Public)
// =============================================================================

// Bulk create test series
router.post('/bulk/create', (req, res) => {
  // You can implement bulk creation logic here
  res.status(200).json({
    success: true,
    message: 'Bulk create endpoint - implement as needed'
  });
});

// Bulk update test series status
router.put('/bulk/status', (req, res) => {
  // You can implement bulk status update logic here
  res.status(200).json({
    success: true,
    message: 'Bulk status update endpoint - implement as needed'
  });
});

//  NEW: Bulk approve multiple test series
router.put('/bulk/approve', (req, res) => {
  // You can implement bulk approval logic here
  res.status(200).json({
    success: true,
    message: 'Bulk approve endpoint - implement as needed'
  });
});

//  NEW: Bulk reject multiple test series
router.put('/bulk/reject', (req, res) => {
  // You can implement bulk rejection logic here
  res.status(200).json({
    success: true,
    message: 'Bulk reject endpoint - implement as needed'
  });
});

// =============================================================================
//  ANALYTICS ROUTES (Public)
// =============================================================================

// Get test series statistics
router.get('/analytics/overview', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Analytics overview endpoint - implement as needed'
  });
});

// Get hierarchy statistics
router.get('/analytics/hierarchy', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hierarchy analytics endpoint - implement as needed'
  });
});

//  NEW: Admin dashboard analytics
router.get('/analytics/admin-dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard analytics endpoint - implement as needed',
    data: {
      statusBreakdown: {},
      categoryBreakdown: {},
      teacherActivity: {},
      monthlyTrends: {}
    }
  });
});

//  NEW: Hierarchical analytics routes
router.get('/analytics/examination/:examId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Examination analytics endpoint',
    examId: req.params.examId
  });
});

router.get('/analytics/subject/:subjectId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Subject analytics endpoint',
    subjectId: req.params.subjectId
  });
});

router.get('/analytics/topic/:topicId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Topic analytics endpoint',
    topicId: req.params.topicId
  });
});


router.post('/question-import/image-ocr', upload.single('image'), importQuestionFromImageOCR);
router.post('/question-import/ppt', upload.single('ppt'), importQuestionsFromPPT);
// Routes/TestSeriesRoutes.js
router.get("/question-export/ppt-template", exportQuestionPPTTemplate);




router.post(
  "/question-import/latex",
  upload.single("latex"),
  importQuestionsFromLatex
);



router.get(
  "/question-export/latex-template",
  exportLatexTemplate
);


// =============================================================================
//  DEBUG ROUTES (Development Only)
// =============================================================================

//  NEW: Debug route for testing
router.get('/debug/:type/:id', (req, res) => {
  const { type, id } = req.params;
  console.log(' Debug route called:', { type, id, query: req.query });

  res.json({
    success: true,
    debug: {
      type,
      id,
      query: req.query,
      timestamp: new Date().toISOString(),
      message: `Debug route for ${type} with ID ${id}`
    }
  });
});

//  NEW: Test connectivity route
router.get('/test/connectivity', (req, res) => {
  res.json({
    success: true,
    message: 'Test Series API connectivity is working',
    timestamp: new Date().toISOString(),
    routes: {
      hierarchical: [
        'GET /hierarchy/exam/:examId',
        'GET /hierarchy/subject/:subjectId',
        'GET /hierarchy/topic/:topicId'
      ],
      alternative: [
        'GET /examination/:examId',
        'GET /subject/:subjectId',
        'GET /topic/:topicId'
      ]
    }
  });
});

// =============================================================================
//  API DOCUMENTATION ROUTE
// =============================================================================

router.get('/api-info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hierarchical Test Series API Routes',
    version: '2.1.0',
    accessLevel: 'Public - No Authentication Required',
    structure: {
      hierarchy: 'ExaminationCategory  Subject  TopicCategory  TestSeries',
      example: 'GATE 2026  Aerospace Engineering  Reasoning and Comprehension  Test Series 1-5'
    },
    routes: {
      navigation: {
        examinations: 'GET /navigation/examinations',
        subjects: 'GET /navigation/examinations/:examId/subjects',
        topics: 'GET /navigation/subjects/:subjectId/topics',
        testSeries: 'GET /navigation/topics/:topicId/test-series',
        dynamic: 'GET /navigation/hierarchy?examCategoryId=&subjectId=&topicCategoryId='
      },
      creation: {
        hierarchical: 'POST /hierarchical/create',
        legacy: 'POST /create (still supported)',
        helper: 'GET /helper/next-series-number/:topicId'
      },
      management: {
        examinations: 'POST/PUT/DELETE /admin/examinations',
        subjects: 'POST/PUT/DELETE /admin/subjects',
        topics: 'POST/PUT/DELETE /admin/topics',
        testSeries: 'GET/PUT/DELETE /:testId'
      },
      //  NEW: Admin approval routes
      adminApproval: {
        getAll: 'GET /admin/all',
        pending: 'GET /admin/pending',
        approve: 'PUT /admin/:testId/approve',
        reject: 'PUT /admin/:testId/reject',
        updateStatus: 'PUT /admin/:testId/status',
        legacyApprove: 'PUT /update/:testId/status',
        legacyReject: 'PUT /:testId/status'
      },
      //  UPDATED: Enhanced filtering with new controllers
      filtering: {
        byExam: 'GET /hierarchy/exam/:examId',
        bySubject: 'GET /hierarchy/subject/:subjectId',
        byTopic: 'GET /hierarchy/topic/:topicId',
        alternative: {
          byExam: 'GET /examination/:examId',
          bySubject: 'GET /subject/:subjectId',
          byTopic: 'GET /topic/:topicId'
        },
        legacy: 'GET /active/all?examinationCategory=&subject=&topicCategory='
      },
      testing: {
        start: 'POST /:testId/start',
        answer: 'PUT /attempt/:attemptId/answer',
        submit: 'POST /attempt/:attemptId/submit'
      },
      //  NEW: Bulk operations
      bulk: {
        create: 'POST /bulk/create',
        updateStatus: 'PUT /bulk/status',
        approve: 'PUT /bulk/approve',
        reject: 'PUT /bulk/reject'
      },
      //  NEW: Analytics routes
      analytics: {
        overview: 'GET /analytics/overview',
        hierarchy: 'GET /analytics/hierarchy',
        adminDashboard: 'GET /analytics/admin-dashboard',
        byExamination: 'GET /analytics/examination/:examId',
        bySubject: 'GET /analytics/subject/:subjectId',
        byTopic: 'GET /analytics/topic/:topicId'
      },
      //  NEW: Debug routes (development)
      debug: {
        test: 'GET /debug/:type/:id',
        connectivity: 'GET /test/connectivity'
      },
      legacy: {
        category: 'GET /active/category/:categoryName (backward compatible)'
      }
    },
    features: [
      'Public access - No authentication required',
      'Backward compatibility with existing routes',
      'Hierarchical navigation and filtering',
      'Series number management',
      'Enhanced search capabilities',
      'Admin management for all hierarchy levels',
      'Dedicated approve/reject endpoints',
      'Bulk operations support',
      'Analytics endpoints',
      'Multiple route compatibility for frontend',
      'Debug and testing utilities'
    ],
    note: 'All routes are publicly accessible. Implement your own auth layer if needed.'
  });
});

// =============================================================================
//  HEALTH CHECK
// =============================================================================

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test Series API is healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    hierarchySupport: true,
    authRequired: false,
    adminFeaturesEnabled: true,
    hierarchicalControllersEnabled: true,
    totalRoutes: router.stack.length,
    newFeatures: [
      'Hierarchical filtering controllers',
      'Enhanced analytics routes',
      'Debug utilities',
      'Multiple route patterns'
    ]
  });
});

// =============================================================================
//  ERROR HANDLING MIDDLEWARE
// =============================================================================

// Handle 404 for unmatched routes - REMOVED TO PREVENT CONFLICTS WITH OTHER ROUTERS
// router.use('*', (req, res) => { ... });

module.exports = router;
