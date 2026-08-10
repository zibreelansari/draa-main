const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/StudentDashboardController');
const authMiddleware = require('../Middlewares/student.auth.middleware').authMiddleware; // Adjust path as needed

// Protect all routes below by auth middleware
router.use(authMiddleware);

// Main dashboard stats
router.get('/stats/:studentId', dashboardController.getDashboardStats);

// Activity and deadlines routes
router.get('/recent-activity/:studentId', dashboardController.getRecentActivity);
router.get('/deadlines/:studentId', dashboardController.getUpcomingDeadlines);

// Performance analytics
router.get('/performance/:studentId', dashboardController.getPerformanceTrends);

module.exports = router;
