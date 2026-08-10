const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../Controllers/TeacherDashboardController');

//  Teacher Dashboard Routes
router.get('/stats/:teacherId', teacherDashboardController.getTeacherDashboardStats);
router.get('/students/:teacherId', teacherDashboardController.getTeacherStudents);
router.get('/activity/:teacherId', teacherDashboardController.getTeacherActivity);

module.exports = router;
