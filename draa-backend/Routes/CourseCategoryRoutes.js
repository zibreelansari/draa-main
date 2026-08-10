// backend/routes/courseCategoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoriesByTeacher,
  searchCategoriesByKeywords, //  NEW: Added import
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCoursesByCategory,
  updateCategoryOrder
} = require('../Controllers/CourseCategoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/teacher/:teacherId', getCategoriesByTeacher);
router.get('/search/keywords', searchCategoriesByKeywords); //  NEW: Search by keywords
router.get('/:id', getCategoryById);
router.get('/:categoryId/courses', getCoursesByCategory);

// Admin/Teacher routes
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.put('/order/update', updateCategoryOrder);

module.exports = router;
