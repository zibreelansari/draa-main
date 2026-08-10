const TopicCategory = require('../Models/Topic.models');
const Subject = require('../Models/Subject.models');
const TestSeries = require('../Models/TestSeriesModels');
const { checkTopicCategoryPurchases } = require('../utils/purchaseCheck');

// Create topic category (Admin/Teacher)
const createTopicCategory = async (req, res) => {
  try {
    const {
      name,
      code,
      subject,
      description,
      topicsCovered,
      difficulty,
      estimatedStudyTime,
      priority,
      icon,
      color,
      prerequisites,
      learningOutcomes,
      recommendedBooks
    } = req.body;

    // Verify subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    // Unique check
    const existingTopic = await TopicCategory.findOne({
      subject,
      code: code.toUpperCase()
    });

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message:'Topic category with this code already exists in this subject'
      });
    }

    const topicCategory = new TopicCategory({
      name,
      code: code.toUpperCase(),
      subject,
      description,
      topicsCovered,
      difficulty,
      estimatedStudyTime,
      priority,
      icon,
      color,
      prerequisites,
      learningOutcomes,
      recommendedBooks
    });

    await topicCategory.save();

    const populatedTopic = await TopicCategory.findById(topicCategory._id)
      .populate({
        path:'subject',
        select:'name code',
        populate: {
          path:'examinationCategory',
          select:'name code year'
        }
      });

    res.status(201).json({
      success: true,
      message:'Topic category created successfully',
      data: populatedTopic
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error creating topic category',
      error: error.message
    });
  }
};

// Get topic categories by subject
const getTopicCategoriesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const {
      page = 1,
      limit = 50,
      search,
      difficulty,
      isActive = true,
      sortBy ='priority',
      sortOrder ='asc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { subject: subjectId };

    if (isActive !== undefined) filter.isActive = isActive;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options:'i' } },
        { code: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { topicsCovered: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const topicCategories = await TopicCategory.find(filter)
      .populate({
        path:'subject',
        select:'name code',
        populate: {
          path:'examinationCategory',
          select:'name code year'
        }
      })
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await TopicCategory.countDocuments(filter);

    // Optimized: Fetch counts and series for ALL topics in single queries
    const topicIds = topicCategories.map(t => t._id);
    
    const testSeriesData = await TestSeries.find({
      topicCategory: { $in: topicIds },
      status:'approved',
      isActive: true
    }).select('topicCategory seriesNumber title').sort({ seriesNumber: 1 }).lean();

    // Group test series by topic
    const testSeriesMap = {};
    testSeriesData.forEach(ts => {
      const tid = ts.topicCategory.toString();
      if (!testSeriesMap[tid]) testSeriesMap[tid] = [];
      testSeriesMap[tid].push(ts);
    });

    const topicsWithStats = topicCategories.map(topic => ({
      ...topic,
      statistics: {
        totalTestSeries: testSeriesMap[topic._id.toString()]?.length || 0,
        availableSeries: testSeriesMap[topic._id.toString()] || [],
        completionRate: 0
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        topicCategories: topicsWithStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching topic categories',
      error: error.message
    });
  }
};

// Get single topic category by ID
const getTopicCategoryById = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topicCategory = await TopicCategory.findById(topicId)
      .populate({
        path:'subject',
        select:'name code description syllabus',
        populate: {
          path:'examinationCategory',
          select:'name code year description examDate'
        }
      });

    if (!topicCategory) {
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    //  Clean testSeries (NO pricing)
    const testSeries = await TestSeries.find({
      topicCategory: topicId,
      status:'approved',
      isActive: true
    })
      .populate('createdBy','name tname email')
      .sort({ seriesNumber: 1 })
      .select('title description seriesNumber duration totalMarks difficulty');

    //  Clean stats (NO paid/free logic)
    const stats = {
      totalTestSeries: testSeries.length,
      difficultyBreakdown: {
        beginner: testSeries.filter(t => t.difficulty ==='beginner').length,
        intermediate: testSeries.filter(t => t.difficulty ==='intermediate').length,
        advanced: testSeries.filter(t => t.difficulty ==='advanced').length,
        mixed: testSeries.filter(t => t.difficulty ==='mixed').length
      },
      totalQuestions: testSeries.reduce((total, t) => total + (t.questions?.length || 0), 0),
      totalDuration: testSeries.reduce((total, t) => total + t.duration, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        topicCategory,
        testSeries,
        statistics: stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching topic category',
      error: error.message
    });
  }
};

// Update topic category (Admin/Teacher)
const updateTopicCategory = async (req, res) => {
  try {
    const { topicId } = req.params;
    const updateData = { ...req.body };

    delete updateData.createdAt;
    delete updateData.updatedAt;

    delete updateData.isPaid;
    delete updateData.price;
    delete updateData.originalPrice;
    delete updateData.discount;

    const existingTopic = await TopicCategory.findById(topicId);
    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    // Reset to inactive on every edit
    updateData.isActive = false;

    const topicCategory = await TopicCategory.findByIdAndUpdate(
      topicId,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path:'subject',
      select:'name code',
      populate: {
        path:'examinationCategory',
        select:'name code year'
      }
    });

    res.status(200).json({
      success: true,
      message:'Topic category updated successfully',
      data: topicCategory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating topic category',
      error: error.message
    });
  }
};

// Delete topic category (Admin only)
const deleteTopicCategory = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Check if topic has test series
    const hasTestSeries = await TestSeries.countDocuments({
      topicCategory: topicId
    });

    if (hasTestSeries > 0) {
      return res.status(400).json({
        success: false,
        message:'Cannot delete topic category that has test series. Please delete all test series first.'
      });
    }

    // Check for purchases before deletion
    const { canDelete, message } = await checkTopicCategoryPurchases(topicId);
    if (!canDelete) {
      return res.status(400).json({
        success: false,
        message: message
      });
    }

    const topicCategory = await TopicCategory.findByIdAndDelete(topicId);

    if (!topicCategory) {
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    res.status(200).json({
      success: true,
      message:'Topic category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error deleting topic category',
      error: error.message
    });
  }
};

// Toggle topic category status (Admin only)
const toggleTopicCategoryStatus = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topicCategory = await TopicCategory.findById(topicId);

    if (!topicCategory) {
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    // Block deactivation if topic has purchases
    const isDeactivating = topicCategory.isActive === true; // currently active, will become inactive
    if (isDeactivating) {
      const { canDelete, message } = await checkTopicCategoryPurchases(topicId);
      if (!canDelete) {
        return res.status(400).json({
          success: false,
          message: message
        });
      }
    }

    topicCategory.isActive = !topicCategory.isActive;
    await topicCategory.save();

    res.status(200).json({
      success: true,
      message: `Topic category ${topicCategory.isActive ?'activated' :'deactivated'} successfully`,
      data: topicCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating topic category status',
      error: error.message
    });
  }
};

// Get topic categories with test series count for breadcrumb navigation
const getTopicCategoriesForNavigation = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const topicCategories = await TopicCategory.find({
      subject: subjectId,
      isActive: true
    })
      .select('name code description difficulty estimatedStudyTime icon color')
      .sort({ priority: 1, name: 1 })
      .lean();

    // Optimized: Batch fetch counts
    const topicIds = topicCategories.map(t => t._id);
    const testSeriesStats = await TestSeries.aggregate([
      { $match: { topicCategory: { $in: topicIds }, status:'approved', isActive: true } },
      { $group: { _id:"$topicCategory", count: { $sum: 1 } } }
    ]);

    const countMap = Object.fromEntries(testSeriesStats.map(s => [s._id.toString(), s.count]));

    const topicsWithCounts = topicCategories.map(topic => ({
      ...topic,
      testSeriesCount: countMap[topic._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      data: topicsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching topic categories for navigation',
      error: error.message
    });
  }
};

module.exports = {
  createTopicCategory,
  getTopicCategoriesBySubject,
  getTopicCategoryById,
  updateTopicCategory,
  deleteTopicCategory,
  toggleTopicCategoryStatus,
  getTopicCategoriesForNavigation
};
