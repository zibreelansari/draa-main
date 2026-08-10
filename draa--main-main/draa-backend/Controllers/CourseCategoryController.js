// backend/controllers/CourseCategoryController.js
const CourseCategory = require('../Models/courseCategoriesModels');
const Course = require('../Models/CourseModel');
const mongoose = require('mongoose');
const { checkCoursePurchases } = require('../utils/purchaseCheck');

//  UPDATED: Get all course categories (with keyword filter support)
const getAllCategories = async (req, res) => {
  try {
    const { active ='true', includeCount ='false', keyword, keywords } = req.query;

    let query = {};
    if (active ==='true') {
      query.isActive = true;
    }

    //  NEW: Filter by single keyword
    if (keyword) {
      query.keywords = keyword.trim().toLowerCase();
    }

    //  NEW: Filter by multiple keywords (comma-separated)
    if (keywords) {
      const keywordsArray = keywords.split(',').map(k => k.trim().toLowerCase());
      query.keywords = { $in: keywordsArray };
    }

    let categories = await CourseCategory.find(query)
      .sort({ order: 1, name: 1 })
      .populate('createdBy','tname temail')
      .populate('updatedBy','tname temail');

    // Include course count if requested
    if (includeCount ==='true') {
      for (let category of categories) {
        await category.updateCourseCount();
      }
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching categories',
      error: error.message
    });
  }
};

//  UPDATED: Get categories by teacher ID (with keyword filter support)
const getCategoriesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { includeCount ='false', active, keyword, keywords } = req.query;

    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid teacher ID provided'
      });
    }

    let query = { createdBy: teacherId };
    if (active ==='true') {
      query.isActive = true;
    }

    //  NEW: Filter by keyword
    if (keyword) {
      query.keywords = keyword.trim().toLowerCase();
    }

    //  NEW: Filter by multiple keywords
    if (keywords) {
      const keywordsArray = keywords.split(',').map(k => k.trim().toLowerCase());
      query.keywords = { $in: keywordsArray };
    }

    const categories = await CourseCategory.find(query)
      .sort({ order: 1, name: 1 })
      .populate('createdBy','tname temail tprofile tspecialization')
      .populate('updatedBy','tname temail');

    if (includeCount ==='true') {
      for (let category of categories) {
        await category.updateCourseCount();
      }
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      teacherId: teacherId,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching categories by teacher:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching categories by teacher',
      error: error.message
    });
  }
};

//  NEW: Search categories by keywords
const searchCategoriesByKeywords = async (req, res) => {
  try {
    const { keywords, matchAll ='false' } = req.query;

    if (!keywords) {
      return res.status(400).json({
        success: false,
        message:'Keywords parameter is required'
      });
    }

    const keywordsArray = keywords.split(',').map(k => k.trim());

    let categories;
    if (matchAll ==='true') {
      // Find categories that have ALL specified keywords
      categories = await CourseCategory.findByAllKeywords(keywordsArray);
    } else {
      // Find categories that have ANY of the specified keywords
      categories = await CourseCategory.findByKeywords(keywordsArray);
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      searchedKeywords: keywordsArray,
      matchAll: matchAll ==='true',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error searching categories by keywords:', error);
    res.status(500).json({
      success: false,
      message:'Error searching categories by keywords',
      error: error.message
    });
  }
};

// Get single category by ID or slug
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let category;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await CourseCategory.findById(id)
        .populate('createdBy','tname temail')
        .populate('updatedBy','tname temail');
    } else {
      category = await CourseCategory.findBySlug(id);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    await category.updateCourseCount();

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching category',
      error: error.message
    });
  }
};

//  UPDATED: Create new category (with keywords support)
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      image,
      order,
      keywords, //  NEW: Added keywords
      createdBy
    } = req.body;

    const existingCategory = await CourseCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message:'Category with this name already exists'
      });
    }

    const category = new CourseCategory({
      name,
      description,
      icon,
      color,
      image,
      order,
      keywords: keywords || [], //  NEW: Initialize keywords
      createdBy
    });

    await category.save();

    res.status(201).json({
      success: true,
      message:'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error creating category',
      error: error.message
    });
  }
};

//  UPDATED: Update category (with keywords support)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      icon,
      color,
      image,
      order,
      isActive,
      keywords, //  NEW: Added keywords
      updatedBy
    } = req.body;

    const category = await CourseCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== category.name) {
      const existingCategory = await CourseCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message:'Category with this name already exists'
        });
      }
    }

    // Block deactivation if category has courses with purchases
    if (isActive === false && category.isActive === true) {
      // Get all courses in this category
      const coursesInCategory = await Course.find({ course_category: category.name }).select('_id');
      for (const course of coursesInCategory) {
        const { canDelete, message } = await checkCoursePurchases(course._id.toString());
        if (!canDelete) {
          return res.status(400).json({
            success: false,
            message: `Cannot deactivate: One or more courses in this category have purchases. Please handle those first.`
          });
        }
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (image) category.image = image;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;
    if (keywords !== undefined) category.keywords = keywords; //  NEW: Update keywords
    if (updatedBy) category.updatedBy = updatedBy;

    await category.save();

    res.status(200).json({
      success: true,
      message:'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating category',
      error: error.message
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    const courseCount = await Course.countDocuments({ course_category: category.name });
    if (courseCount > 0) {
      // Check if any courses have purchases
      const coursesInCategory = await Course.find({ course_category: category.name }).select('_id');
      for (const course of coursesInCategory) {
        const { canDelete, message } = await checkCoursePurchases(course._id.toString());
        if (!canDelete) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete category. ${message}`
          });
        }
      }
      // Courses exist but none have purchases - allow deletion
    }

    await CourseCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error deleting category',
      error: error.message
    });
  }
};

// Get courses by category
const getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    let category;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      category = await CourseCategory.findById(categoryId);
    } else {
      category = await CourseCategory.findBySlug(categoryId);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find({
      course_category: category.name,
      isApproved: true,
      status:'published'
    })
      .populate('teacher_id','tname temail tprofile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments({
      course_category: category.name,
      isApproved: true,
      status:'published'
    });

    res.status(200).json({
      success: true,
      data: {
        category,
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching courses by category',
      error: error.message
    });
  }
};

// Update category order
const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    const updatePromises = categories.map(async (cat) => {
      return CourseCategory.findByIdAndUpdate(
        cat.id,
        { order: cat.order, updatedBy: req.body.updatedBy },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message:'Category order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating category order',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoriesByTeacher,
  searchCategoriesByKeywords, //  NEW: Added to exports
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCoursesByCategory,
  updateCategoryOrder
};
