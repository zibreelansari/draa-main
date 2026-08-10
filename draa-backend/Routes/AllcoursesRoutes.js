const express = require('express');
const {
    allApprovedCourses,
    coursesByCategory,
    featuredCourses,
    courseStats,
    searchCourses
} = require('../Controllers/AllCourseController');

const router = express.Router();

// 
//  PUBLIC ROUTES (No Authentication Required)
// 

//  PRIMARY: Get all approved courses (with filters, pagination, search)
// GET /api/courses
// GET /api/allCourses
router.get('/', allApprovedCourses);
router.get('/allCourses', allApprovedCourses);

//  SEARCH: Advanced fuzzy search
// GET /api/search?search=react&fuzzyMode=hybrid
router.get('/search', searchCourses);

//  CATEGORY: Get courses by specific category
// GET /api/courses/category/web-development
router.get('/category/:name', coursesByCategory);
router.get('/courses/category/:category', coursesByCategory);
router.get('/courses/category/:category/list', coursesByCategory); // Alternative

//  FEATURED: Get featured/popular courses
// GET /api/courses/featured?limit=8
router.get('/featured', featuredCourses);
router.get('/courses/featured', featuredCourses);

// 
//  ADMIN/PROTECTED ROUTES
// 

//  STATS: Course statistics (for admin dashboard)
// GET /api/courses/stats
router.get('/stats', courseStats);
router.get('/courses/stats', courseStats);

// 
//  EXPORT
// 

module.exports = router;
