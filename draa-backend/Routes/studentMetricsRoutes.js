const express = require('express');
const router = express.Router();
const StudentMetricsController = require('../Controllers/StudentMetricsController');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');

// Protect all routes with auth middleware
router.use(authMiddleware);

// Get main metrics
router.get('/metrics/:studentId', StudentMetricsController.getMetrics);

// Get detailed analytics
router.get('/analytics/:studentId', StudentMetricsController.getDetailedAnalytics);

// Get lightweight dashboard data
router.get('/dashboard/:studentId', StudentMetricsController.getDashboardData);

// Refresh all metrics
router.post('/refresh/:studentId', StudentMetricsController.refreshMetrics);

// Update specific metric section
router.put('/update/:studentId', StudentMetricsController.updateMetricsSection);

// Add activity
router.post('/activity/:studentId', StudentMetricsController.addActivity);

// Get performance trends
router.get('/trends/:studentId', StudentMetricsController.getPerformanceTrends);

// Get leaderboard
router.get('/leaderboard', StudentMetricsController.getLeaderboard);

// Get student rank
router.get('/rank/:studentId', StudentMetricsController.getStudentRank);

// Get achievements and badges
router.get('/achievements/:studentId', StudentMetricsController.getAchievements);

// Get study insights
router.get('/insights/:studentId', StudentMetricsController.getStudyInsights);

module.exports = router;