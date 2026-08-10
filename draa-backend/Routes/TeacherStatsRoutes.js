    const express = require('express');
    const {
        getTeacherStatsOverview,
        getDetailedAnalytics,
        getPerformanceMetrics
    } = require('../Controllers/TeacherStatsController');

    const router = express.Router();

    // Middleware for admin authentication (optional - adjust based on your auth setup)
    const requireAdminAuth = (req, res, next) => {
        // Add your admin authentication logic here
        // For now, we'll skip it and assume authentication is handled elsewhere
        next();
    };

    // ===== TEACHER STATISTICS ROUTES =====

    // GET /teacher/stats/overview - Get basic teacher statistics
    router.get('/overview', requireAdminAuth, getTeacherStatsOverview);

    // GET /teacher/stats/analytics?period=30d - Get detailed analytics with time period
    router.get('/analytics', requireAdminAuth, getDetailedAnalytics);

    // GET /teacher/stats/performance - Get performance metrics and top teachers
    router.get('/performance', requireAdminAuth, getPerformanceMetrics);

    module.exports = router;
