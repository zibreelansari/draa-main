const ExaminationCategory = require('../Models/ExaminationCategory.models');
const Subject = require('../Models/Subject.models');
const TestSeries = require('../Models/TestSeriesModels');
const TestSeriesReview = require('../Models/TestSeriesReview');
const { checkExaminationCategoryPurchases } = require('../utils/purchaseCheck');

// Create examination category (Admin only)
const createExaminationCategory = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      year,
      examDate,
      registrationStartDate,
      registrationEndDate,
      applicationFee,
      totalSeats,
      examPattern,
      eligibilityCriteria,
      syllabus,
      priority,
      bannerImage,
      brochurePdf,
      createdBy,

      //  PRICING
      isPaid,
      price,
      originalPrice
    } = req.body;

    //  Validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required"
      });
    }

    //  Unique code check
    const existingCategory = await ExaminationCategory.findOne({
      code: code.toUpperCase()
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Examination category with this code already exists"
      });
    }

    //  Price validation
    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0 for paid category"
      });
    }

    //  Discount calculation
    let discount = 0;
    if (originalPrice && price && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const examinationCategory = new ExaminationCategory({
      name,
      code: code.toUpperCase(),
      description,
      year,
      examDate,
      registrationStartDate,
      registrationEndDate,
      applicationFee,
      totalSeats,
      examPattern,
      eligibilityCriteria,
      syllabus,
      priority,
      bannerImage,
      brochurePdf,
      createdBy,

      //  PRICING
      isPaid: isPaid ?? false,
      price: isPaid ? price : 0,
      originalPrice: originalPrice ?? 0,
      discount
    });

    await examinationCategory.save();

    res.status(201).json({
      success: true,
      message: "Examination category created successfully",
      data: examinationCategory
    });

  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating examination category",
      error: error.message
    });
  }
};

// Get all examination categories
const getAllExaminationCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      year,
      isActive = true,
      sortBy = 'priority',
      sortOrder = 'asc'
    } = req.query;

    const parsedLimit = parseInt(limit);
    const skip = parsedLimit === 0 ? 0 : (page - 1) * parsedLimit;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive;
    if (year) filter.year = year;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let queryObj = ExaminationCategory.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortObj);

    if (parsedLimit > 0) {
      queryObj = queryObj.skip(skip).limit(parsedLimit);
    }
    const examinationCategories = await queryObj;

    const total = await ExaminationCategory.countDocuments(filter);

    // Optimized: Fetch counts for ALL fetched categories in a single query
    const categoryIds = examinationCategories.map(c => c._id);

    const [subjectStats, testSeriesStats, reviewStats] = await Promise.all([
      Subject.aggregate([
        { $match: { examinationCategory: { $in: categoryIds }, isActive: true } },
        { $group: { _id: "$examinationCategory", count: { $sum: 1 } } }
      ]),
      TestSeries.aggregate([
        { $match: { examinationCategory: { $in: categoryIds }, status: 'approved', isActive: true } },
        { $group: { _id: "$examinationCategory", count: { $sum: 1 } } }
      ]),
      TestSeriesReview.aggregate([
        { $match: { examination_category_id: { $in: categoryIds }, isApproved: true } },
        { $group: { _id: "$examination_category_id", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
      ])
    ]);

    // Map stats for easy lookup
    const subjectCountMap = Object.fromEntries(subjectStats.map(s => [s._id.toString(), s.count]));
    const testSeriesCountMap = Object.fromEntries(testSeriesStats.map(s => [s._id.toString(), s.count]));
    const reviewStatsMap = Object.fromEntries(reviewStats.map(r => [
      r._id.toString(),
      { averageRating: Math.round(r.averageRating * 10) / 10, totalReviews: r.count }
    ]));

    const categoriesWithStats = examinationCategories.map(category => ({
      ...category.toObject(),
      statistics: {
        totalSubjects: subjectCountMap[category._id.toString()] || 0,
        totalTestSeries: testSeriesCountMap[category._id.toString()] || 0,
        averageRating: reviewStatsMap[category._id.toString()]?.averageRating || 0,
        totalReviews: reviewStatsMap[category._id.toString()]?.totalReviews || 0
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        examinationCategories: categoriesWithStats,
        pagination: {
          current: parseInt(page),
          pages: parsedLimit === 0 ? 1 : Math.ceil(total / parsedLimit),
          total,
          hasNext: parsedLimit === 0 ? false : page < Math.ceil(total / parsedLimit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching examination categories',
      error: error.message
    });
  }
};

// Get single examination category by ID
const getExaminationCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const examinationCategory = await ExaminationCategory.findById(categoryId)
      .populate('createdBy', 'name email');

    if (!examinationCategory) {
      return res.status(404).json({
        success: false,
        message: 'Examination category not found'
      });
    }

    // Get subjects under this category
    const subjects = await Subject.find({
      examinationCategory: categoryId,
      isActive: true
    }).sort({ priority: 1, name: 1 });

    // Get category statistics
    const reviewStats = await TestSeriesReview.calculateAverageRating(categoryId);
    const stats = {
      totalSubjects: subjects.length,
      totalTestSeries: await TestSeries.countDocuments({
        examinationCategory: categoryId,
        status: 'approved',
        isActive: true
      }),
      totalStudents: 0, // You can add student enrollment logic here
      upcomingExams: await TestSeries.countDocuments({
        examinationCategory: categoryId,
        status: 'approved',
        isActive: true,
        startDate: { $gte: new Date() }
      }),
      averageRating: reviewStats.averageRating || 0,
      totalReviews: reviewStats.totalReviews || 0
    };

    res.status(200).json({
      success: true,
      data: {
        examinationCategory,
        subjects,
        statistics: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching examination category',
      error: error.message
    });
  }
};

// Update examination category (Admin only)
const updateExaminationCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = { ...req.body };

    //  Remove restricted fields
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    //  Check category exists
    const existingCategory = await ExaminationCategory.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Examination category not found"
      });
    }

    //  Pricing logic
    const isPaid = updateData.isPaid ?? existingCategory.isPaid;
    const price = updateData.price ?? existingCategory.price;
    const originalPrice = updateData.originalPrice ?? existingCategory.originalPrice;

    //  Validation
    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0 for paid category"
      });
    }

    //  Discount recalculation
    let discount = 0;
    if (originalPrice && price && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    updateData.discount = discount;

    // If free  reset price
    if (!isPaid) {
      updateData.price = 0;
      updateData.originalPrice = 0;
      updateData.discount = 0;
    }

    // Reset to inactive on every edit
    updateData.isActive = false;

    const updatedCategory = await ExaminationCategory.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Examination category updated successfully",
      data: updatedCategory
    });

  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating examination category",
      error: error.message
    });
  }
};

// Delete examination category (Admin only)
const deleteExaminationCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check for purchases/content before deletion
    const { canDelete, message } = await checkExaminationCategoryPurchases(categoryId);
    if (!canDelete) {
      return res.status(400).json({
        success: false,
        message: message
      });
    }

    // Also check if category has subjects (additional safety)
    const hasSubjects = await Subject.countDocuments({
      examinationCategory: categoryId
    });

    if (hasSubjects > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete examination category that has subjects. Please delete all subjects first.'
      });
    }

    const examinationCategory = await ExaminationCategory.findByIdAndDelete(categoryId);

    if (!examinationCategory) {
      return res.status(404).json({
        success: false,
        message: 'Examination category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting examination category',
      error: error.message
    });
  }
};

// Toggle active status (Admin only)
const toggleExaminationCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const examinationCategory = await ExaminationCategory.findById(categoryId);

    if (!examinationCategory) {
      return res.status(404).json({
        success: false,
        message: 'Examination category not found'
      });
    }

    // Block deactivation if exam category has purchases
    const isDeactivating = examinationCategory.isActive === true;
    if (isDeactivating) {
      const { canDelete, message } = await checkExaminationCategoryPurchases(categoryId);
      if (!canDelete) {
        return res.status(400).json({
          success: false,
          message: message
        });
      }
    }

    examinationCategory.isActive = !examinationCategory.isActive;
    await examinationCategory.save();

    res.status(200).json({
      success: true,
      message: `Examination category ${examinationCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      data: examinationCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating examination category status',
      error: error.message
    });
  }
};

// Get examination categories by year
const getExaminationCategoriesByYear = async (req, res) => {
  try {
    const { year } = req.params;

    const categories = await ExaminationCategory.find({
      year: parseInt(year),
      isActive: true
    })
      .sort({ priority: 1, name: 1 })
      .select('name code description examDate registrationEndDate bannerImage');

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching examination categories by year',
      error: error.message
    });
  }
};

module.exports = {
  createExaminationCategory,
  getAllExaminationCategories,
  getExaminationCategoryById,
  updateExaminationCategory,
  deleteExaminationCategory,
  toggleExaminationCategoryStatus,
  getExaminationCategoriesByYear
};
