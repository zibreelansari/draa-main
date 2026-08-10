const express = require('express');
const router = express.Router();

// Import the Test Attempt Controller functions
const {
  startTest,
  submitAnswer,
  submitTest,
  getTestResults
} = require('../Controllers/TestSeriesAttemptController');

const { authMiddleware } = require('../Middlewares/student.auth.middleware');



// =============================================================================
//  ADMIN: List all question issue reports  (MUST be before authMiddleware)
//  GET /api/v1/student/test-series/attempt/admin/question-issues
// =============================================================================
router.get('/admin/question-issues', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (decoded.role !== 'admin' && decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Admin or Teacher access required.' });
    }

    const QuestionIssueReport = require('../Models/QuestionIssueReport');
    const { status, testSeriesId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (testSeriesId) filter.testSeriesId = testSeriesId;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      QuestionIssueReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('reportedBy', 'name email')
        .populate('testSeriesId', 'title'),
      QuestionIssueReport.countDocuments(filter),
    ]);

    const [openCount, underReviewCount, resolvedCount, dismissedCount] = await Promise.all([
      QuestionIssueReport.countDocuments({ status: 'open' }),
      QuestionIssueReport.countDocuments({ status: 'under_review' }),
      QuestionIssueReport.countDocuments({ status: 'resolved' }),
      QuestionIssueReport.countDocuments({ status: 'dismissed' }),
    ]);

    return res.json({
      success: true,
      reports,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      stats: { open: openCount, under_review: underReviewCount, resolved: resolvedCount, dismissed: dismissedCount },
    });
  } catch (error) {
    console.error('Admin fetch question issues error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
//  ADMIN: Update status / note  (MUST be before authMiddleware)
//  PATCH /api/v1/student/test-series/attempt/admin/question-issues/:reportId
// =============================================================================
router.patch('/admin/question-issues/:reportId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (decoded.role !== 'admin' && decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Admin or Teacher access required.' });
    }

    const QuestionIssueReport = require('../Models/QuestionIssueReport');
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ['open', 'under_review', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const update = {};
    if (status) update.status = status;
    if (adminNote !== undefined) update.adminNote = adminNote;
    if (status === 'resolved') update.resolvedAt = new Date();

    const report = await QuestionIssueReport.findByIdAndUpdate(reportId, update, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    return res.json({ success: true, message: 'Report updated.', report });
  } catch (error) {
    console.error('Admin update question issue error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Student-only routes below (blocked for admin/teacher) ───────────────────
// routes protected by student auth
router.use(authMiddleware);





//  START TEST - Initialize new test attempt
// POST /api/v1/student/test-series/:testId/start
router.post('/:testId/start', startTest);

//  SUBMIT ANSWER - Save individual question answer  
// PUT /api/v1/student/test-series/attempt/:attemptId/answer
router.put('/:attemptId/answer', submitAnswer);

//  SUBMIT TEST - Finalize and submit complete test
// POST /api/v1/student/test-series/attempt/:attemptId/submit
router.post('/:attemptId/submit', submitTest);

//  GET TEST RESULTS - Retrieve detailed results
// GET /api/v1/student/test-series/attempt/:attemptId/results
router.get('/:attemptId/results', getTestResults);

// ============================================================
//  REPORT ISSUE - Student reports a problem with a question
// POST /api/v1/student/test-series/attempt/report-issue
// ============================================================
router.post('/report-issue', async (req, res) => {
  try {
    const {
      attemptId,
      questionId,
      questionNumber,
      questionText,
      testSeriesId,
      testSeriesTitle,
      issueType,
      description,
    } = req.body;

    const studentId = (req.user && (req.user._id || req.user.id));

    if (!attemptId || !questionId || !testSeriesId || !issueType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: attemptId, questionId, testSeriesId, issueType',
      });
    }

    const QuestionIssueReport = require('../Models/QuestionIssueReport');

    // Prevent exact duplicate (same student + attempt + question)
    const existing = await QuestionIssueReport.findOne({
      reportedBy: studentId,
      attemptId,
      questionId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reported an issue for this question in this attempt.',
      });
    }

    const report = new QuestionIssueReport({
      reportedBy: studentId,
      reporterName: req.user?.name || '',
      reporterEmail: req.user?.email || '',
      testSeriesId,
      testSeriesTitle: testSeriesTitle || '',
      attemptId,
      questionId,
      questionNumber: questionNumber || 0,
      questionText: questionText || '',
      issueType,
      description: description || '',
      status: 'open',
    });

    await report.save();

    // Notify admin
    try {
      const Notification = require('../Models/NotificationModel');
      await Notification.create({
        recipient: 'admin',
        recipientModel: 'Admin',
        sender: studentId,
        senderModel: 'User',
        senderName: req.user?.name || 'A Student',
        type: 'general',
        title: `[Question Issue] ${testSeriesTitle || 'Test Series'} – Q${questionNumber}`,
        message: `Student "${req.user?.name || 'Unknown'}" reported an issue (${issueType.replace(/_/g,' ')}) on Question ${questionNumber} of test "${testSeriesTitle}".`,
        referenceId: report._id,
      });
    } catch (notifErr) {
      console.error('Failed to send issue report notification:', notifErr.message);
    }

    return res.json({
      success: true,
      message: 'Issue reported successfully. Our team will review it soon.',
      reportId: report._id,
    });
  } catch (error) {
    console.error('Error submitting question issue report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit issue report.',
      error: error.message,
    });
  }
});

//  GET ATTEMPT STATUS - Check current attempt status
// GET /api/v1/student/test-series/attempt/:attemptId/status
router.get('/:attemptId/status', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const TestAttempt = require('../Models/TestSeriesAttempt');

    console.log(' Getting attempt status for:', attemptId);

    const attempt = await TestAttempt.findById(attemptId)
      .populate('testSeries','title duration totalMarks')
      .select('status startTime endTime totalScore percentage correctAnswers incorrectAnswers unanswered');

    if (!attempt) {
      console.log(' Attempt not found:', attemptId);
      return res.status(404).json({
        success: false,
        message:'Test attempt not found'
      });
    }

    console.log(' Attempt status retrieved:', attempt.status);

    res.json({
      success: true,
      attempt: {
        id: attempt._id,
        status: attempt.status,
        testTitle: attempt.testSeries?.title ||'Unknown Test',
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        currentScore: attempt.totalScore || 0,
        percentage: attempt.percentage || 0,
        correctAnswers: attempt.correctAnswers || 0,
        incorrectAnswers: attempt.incorrectAnswers || 0,
        unanswered: attempt.unanswered || 0
      }
    });
  } catch (error) {
    console.error(' Error getting attempt status:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get attempt status',
      error: error.message
    });
  }
});

//  GET USER ATTEMPTS - Get all attempts by a user for a test series
// GET /api/v1/student/test-series/user/:userId/test/:testId/attempts
router.get('/user/:userId/test/:testId/attempts', authMiddleware, async (req, res) => {
  try {
    const { userId, testId } = req.params;
    const { topicId } = req.query;

    const TestAttempt = require('../Models/TestSeriesAttempt');
    const TestSeriesPurchase = require('../Models/TestSeriesPurchaseModel');

    let startDateFilter = {};

    //  If topicId provided, count attempts only after purchase date
    if (topicId) {
      const purchase = await TestSeriesPurchase.findOne({
        student_id: userId,
        topic_id: topicId,
"purchase_details.access_granted": true
      }).select("purchase_details.purchase_date");

      if (purchase?.purchase_details?.purchase_date) {
        startDateFilter = { startTime: { $gte: new Date(purchase.purchase_details.purchase_date) } };
      }
    }

    const attempts = await TestAttempt.find({
      user: userId,
      testSeries: testId,
      ...startDateFilter
    })
      .select("status startTime endTime totalScore percentage rank")
      .sort({ startTime: -1 });

    res.json({
      success: true,
      attempts: attempts.map(a => ({
        id: a._id,
        status: a.status,
        startTime: a.startTime,
        endTime: a.endTime,
        score: a.totalScore || 0,
        percentage: a.percentage || 0,
        rank: a.rank || 0
      })),
      totalAttempts: attempts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:"Failed to load attempts",
      error: error.message
    });
  }
});


//  GET ALL USER ATTEMPTS - Get all attempts by a user (across all tests)
// GET /api/v1/student/test-series/user/:userId/attempts
router.get('/user/:userId/attempts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const TestAttempt = require('../Models/TestSeriesAttempt');

    console.log(' Getting all user attempts for:', userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await TestAttempt.find({ user: userId })
      .populate('testSeries','title duration totalMarks')
      .select('status startTime endTime totalScore percentage rank')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAttempts = await TestAttempt.countDocuments({ user: userId });

    console.log(' Found user attempts:', attempts.length);

    res.json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        testTitle: attempt.testSeries?.title ||'Unknown Test',
        testId: attempt.testSeries?._id,
        status: attempt.status,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        score: attempt.totalScore || 0,
        percentage: attempt.percentage || 0,
        rank: attempt.rank || 0
      })),
      totalAttempts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalAttempts / parseInt(limit))
    });
  } catch (error) {
    console.error(' Error getting all user attempts:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get user attempts',
      error: error.message
    });
  }
});

//  DELETE ATTEMPT - Cancel/Delete ongoing attempt (if needed)
// DELETE /api/v1/student/test-series/attempt/:attemptId
router.delete('/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const TestAttempt = require('../Models/TestSeriesAttempt');

    console.log(' Attempting to delete attempt:', attemptId);

    const attempt = await TestAttempt.findById(attemptId);

    if (!attempt) {
      console.log(' Attempt not found for deletion:', attemptId);
      return res.status(404).json({
        success: false,
        message:'Test attempt not found'
      });
    }

    // Only allow deletion of ongoing attempts
    if (attempt.status !=='ongoing') {
      console.log(' Cannot delete completed attempt:', attempt.status);
      return res.status(400).json({
        success: false,
        message:'Cannot delete completed test attempt',
        currentStatus: attempt.status
      });
    }

    await TestAttempt.findByIdAndDelete(attemptId);
    console.log(' Attempt deleted successfully:', attemptId);

    res.json({
      success: true,
      message:'Test attempt cancelled successfully'
    });
  } catch (error) {
    console.error(' Error deleting attempt:', error);
    res.status(500).json({
      success: false,
      message:'Failed to cancel attempt',
      error: error.message
    });
  }
});

//  RESUME TEST - Get ongoing test attempt to resume
// GET /api/v1/student/test-series/:testId/resume/:userId
router.get('/:testId/resume/:userId', async (req, res) => {
  try {
    const { testId, userId } = req.params;
    const TestAttempt = require('../Models/TestSeriesAttempt');
    const TestSeries = require('../Models/TestSeriesModels');

    console.log(' Looking for ongoing attempt to resume:', { testId, userId });

    // Find ongoing attempt
    const ongoingAttempt = await TestAttempt.findOne({
      testSeries: testId,
      user: userId,
      status:'ongoing'
    });

    if (!ongoingAttempt) {
      return res.status(404).json({
        success: false,
        message:'No ongoing test attempt found'
      });
    }

    // Get test series details
    const testSeries = await TestSeries.findById(testId);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Calculate time remaining
    const timeElapsed = Math.floor((new Date() - ongoingAttempt.startTime) / 1000);
    const timeRemaining = Math.max(0, testSeries.duration * 60 - timeElapsed);

    if (timeRemaining <= 0) {
      // Auto-submit if time expired
      ongoingAttempt.status ='completed';
      ongoingAttempt.endTime = new Date();
      ongoingAttempt.timeSpent = testSeries.duration * 60;
      await ongoingAttempt.save();

      return res.status(400).json({
        success: false,
        message:'Test time has expired. Test has been auto-submitted.'
      });
    }

    console.log(' Found ongoing attempt to resume:', ongoingAttempt._id);

    res.json({
      success: true,
      message:'Ongoing test attempt found',
      attempt: {
        attemptId: ongoingAttempt._id,
        testSeries: {
          id: testSeries._id,
          title: testSeries.title,
          duration: testSeries.duration,
          totalMarks: testSeries.totalMarks
        },
        startTime: ongoingAttempt.startTime,
        timeRemaining,
        currentScore: ongoingAttempt.totalScore || 0,
        answersCount: ongoingAttempt.answers?.length || 0,
        savedAnswers: ongoingAttempt.answers?.reduce((acc, answer) => {
          acc[answer.questionId.toString()] = answer.selectedOption;
          return acc;
        }, {}) || {}
      }
    });
  } catch (error) {
    console.error(' Error resuming test:', error);
    res.status(500).json({
      success: false,
      message:'Failed to resume test',
      error: error.message
    });
  }
});

// =============================================================================
//  API INFO & DEBUG ROUTES
// =============================================================================

//  API INFO ROUTE - Updated paths
router.get('/api-info', (req, res) => {
  res.json({
    success: true,
    message:'Test Attempt API Routes',
    version:'1.0.0',
    basePath:'/api/v1/student/test-series/',
    routes: {
      startTest:'POST /:testId/start',
      submitAnswer:'PUT /attempt/:attemptId/answer',
      submitTest:'POST /attempt/:attemptId/submit',
      getResults:'GET /attempt/:attemptId/results',
      getStatus:'GET /attempt/:attemptId/status',
      getUserAttempts:'GET /user/:userId/test/:testId/attempts',
      getAllUserAttempts:'GET /user/:userId/attempts',
      resumeTest:'GET /:testId/resume/:userId',
      cancelAttempt:'DELETE /attempt/:attemptId'
    },
    examples: {
      startTest:'POST /api/v1/student/test-series/67123456789abcdef0123456/start',
      submitAnswer:'PUT /api/v1/student/test-series/attempt/68d6c98b0a1b3aa71032d2d5/answer',
      submitTest:'POST /api/v1/student/test-series/attempt/68d6c98b0a1b3aa71032d2d5/submit',
      getResults:'GET /api/v1/student/test-series/attempt/68d6c98b0a1b3aa71032d2d5/results'
    },
    features: [
'Start new test attempts',
'Real-time answer saving',
'Complete test submission',
'Detailed results with analysis',
'Attempt status tracking',
'Resume ongoing tests',
'Multiple attempts support'
    ]
  });
});

//  HEALTH CHECK
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message:'Test Attempt API is healthy',
    timestamp: new Date().toISOString(),
    version:'1.0.0',
    basePath:'/api/v1/student/test-series/',
    status:'active'
  });
});

//  DEBUG ROUTE - Test connectivity
router.get('/debug/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const TestAttempt = require('../Models/TestSeriesAttempt');

    console.log(' Debug route called for attempt:', attemptId);

    const attempt = await TestAttempt.findById(attemptId);

    res.json({
      success: true,
      debug: {
        attemptId,
        found: !!attempt,
        status: attempt?.status ||'not_found',
        startTime: attempt?.startTime,
        answersCount: attempt?.answers?.length || 0,
        requestPath: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      success: false,
      debug: {
        attemptId: req.params.attemptId,
        error: error.message,
        requestPath: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Handle 404 for unmatched routes - Updated message
router.use('*', (req, res) => {
  console.log(' 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message:'Test Attempt API endpoint not found',
    requestedPath: req.originalUrl,
    basePath:'/api/v1/student/test-series/',
    availableRoutes: {
      apiInfo:'GET /api/v1/student/test-series/api-info',
      health:'GET /api/v1/student/test-series/health',
      debug:'GET /api/v1/student/test-series/debug/:attemptId'
    },
    suggestion:'Check the API info endpoint for available routes',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
