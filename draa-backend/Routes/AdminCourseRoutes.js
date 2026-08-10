// routes/adminCourseRoutes.js
// Mounted at /api/v1/admin/courses and /api/v1/course/admin/courses in Server.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../Middlewares/adminAuth.middleware');
const {
    getAllCoursesAdmin,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
    getCourseStats,
    deleteCourse,
    bulkApproveCourses,
    bulkRejectCourses,
    bulkUpdateStatus,
    bulkDeleteCourses,
    exportCourses
} = require('../Controllers/AdminCourseController');

// All admin course routes require an admin JWT — protects against unauthenticated
// access to approve/reject/delete/export endpoints.
router.use(adminAuth);

// Get all courses for admin
router.get('/', getAllCoursesAdmin);

// Get course statistics
router.get('/stats', getCourseStats);

// Export courses to CSV (admin)
router.get('/export', exportCourses);

// Bulk operations
router.put('/bulk/approve', bulkApproveCourses);
router.put('/bulk/reject', bulkRejectCourses);
router.put('/bulk/status', bulkUpdateStatus);
router.delete('/bulk/delete', bulkDeleteCourses);

// Approve course
router.put('/:id/approve', approveCourse);

// Reject course
router.put('/:id/reject', rejectCourse);

// Update course status
router.put('/:id/status', updateCourseStatus);

// Delete course
router.delete('/:id', deleteCourse);

module.exports = router;
