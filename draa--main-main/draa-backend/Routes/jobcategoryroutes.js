const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/jobsCategoriesController');

// Create
router.post('/create', categoryController.createCategory);

// Read all
router.get('/fetch', categoryController.getAllCategories);

// Read single
router.get('/:id', categoryController.getCategoryById);

// Update
router.put('/:id', categoryController.updateCategory);

// Delete
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
