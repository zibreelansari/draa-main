const Subject = require('../Models/Subject.models');
const ExaminationCategory = require('../Models/ExaminationCategory.models');
const TopicCategory = require('../Models/Topic.models');
const TestSeries = require('../Models/TestSeriesModels');
const TopicCategoryPurchase = require('../Models/TopicCategoryPurchaseModel');

// Create subject (Admin only)
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      examinationCategory,
      description,
      syllabus,
      totalMarks,
      duration,
      questionPattern,
      weightage,
      priority,
      icon,
      color,
      prerequisites,
      careerOpportunities,

      //  NEW PRICING
      isPaid,
      price,
      originalPrice
    } = req.body;

    //  Validate category
    const examCategory = await ExaminationCategory.findById(examinationCategory);
    if (!examCategory) {
      return res.status(404).json({
        success: false,
        message:'Examination category not found'
      });
    }

    //  Unique check
    const existingSubject = await Subject.findOne({
      examinationCategory,
      code: code.toUpperCase()
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message:'Subject with this code already exists in this examination category'
      });
    }

    //  Price validation
    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message:"Price must be greater than 0 for paid subject"
      });
    }

    //  Discount calculation
    let discount = 0;
    if (originalPrice && price && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const subject = new Subject({
      name,
      code: code.toUpperCase(),
      examinationCategory,
      description,
      syllabus,
      totalMarks,
      duration,
      questionPattern,
      weightage,
      priority,
      icon,
      color,
      prerequisites,
      careerOpportunities,

      //  PRICING
      isPaid: isPaid ?? false,
      price: isPaid ? price : 0,
      originalPrice: originalPrice ?? 0,
      discount
    });

    await subject.save();

    const populatedSubject = await Subject.findById(subject._id)
      .populate('examinationCategory','name code year');

    res.status(201).json({
      success: true,
      message:'Subject created successfully',
      data: populatedSubject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error creating subject',
      error: error.message
    });
  }
};

// Get subjects by examination category
// Get subjects by examination category
const getSubjectsByExaminationCategory = async (req, res) => {
  try {
    const { examId } = req.params; //  FIXED: Changed from categoryId to examId
    const {
      page = 1,
      limit = 50,
      search,
      isActive = true,
      sortBy ='priority',
      sortOrder ='asc'
    } = req.query;

    console.log(' Backend: Fetching subjects for exam ID:', examId); //  Added logging

    const skip = (page - 1) * limit;
    const filter = { examinationCategory: examId }; //  Using examId instead of categoryId

    if (isActive !== undefined && isActive !=='undefined') {
      filter.isActive = isActive ==='true' || isActive === true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options:'i' } },
        { code: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } }
      ];
    }

    console.log(' Backend: Using filter:', filter);

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const subjects = await Subject.find(filter)
      .populate('examinationCategory','name code year')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Subject.countDocuments(filter);

    // Optimized: Fetch counts for ALL subjects in single queries
    const subjectIds = subjects.map(s => s._id);
    
    const [topicStats, testSeriesStats] = await Promise.all([
      TopicCategory.aggregate([
        { $match: { subject: { $in: subjectIds }, isActive: true } },
        { $group: { _id:"$subject", count: { $sum: 1 } } }
      ]),
      TestSeries.aggregate([
        { $match: { subject: { $in: subjectIds }, status:'approved', isActive: true } },
        { $group: { _id:"$subject", count: { $sum: 1 } } }
      ])
    ]);

    const topicCountMap = Object.fromEntries(topicStats.map(s => [s._id.toString(), s.count]));
    const testSeriesCountMap = Object.fromEntries(testSeriesStats.map(s => [s._id.toString(), s.count]));

    const subjectsWithStats = subjects.map(subject => ({
      ...subject,
      statistics: {
        totalTopics: topicCountMap[subject._id.toString()] || 0,
        totalTestSeries: testSeriesCountMap[subject._id.toString()] || 0
      }
    }));

    console.log(' Backend: Sending subjects response with count:', subjectsWithStats.length);

    res.status(200).json({
      success: true,
      data: {
        subjects: subjectsWithStats,
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
    console.error(' Backend error in getSubjectsByExaminationCategory:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching subjects',
      error: error.message
    });
  }
};


// Get single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId)
      .populate('examinationCategory','name code year description');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    // Get topic categories under this subject
    const topicCategories = await TopicCategory.find({
      subject: subjectId,
      isActive: true
    }).sort({ priority: 1, name: 1 });

    // Get subject statistics
    const stats = {
      totalTopics: topicCategories.length,
      totalTestSeries: await TestSeries.countDocuments({
        subject: subjectId,
        status:'approved',
        isActive: true
      }),
      totalQuestions: 0, // You can calculate total questions across all test series
      averageDifficulty:'intermediate' // You can calculate based on test series
    };

    res.status(200).json({
      success: true,
      data: {
        subject,
        topicCategories,
        statistics: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching subject',
      error: error.message
    });
  }
};

// Update subject (Admin only)
const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updateData = { ...req.body };

    delete updateData.createdAt;
    delete updateData.updatedAt;

    //  Check exists
    const existingSubject = await Subject.findById(subjectId);
    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    //  Pricing logic
    const isPaid = updateData.isPaid ?? existingSubject.isPaid;
    const price = updateData.price ?? existingSubject.price;
    const originalPrice = updateData.originalPrice ?? existingSubject.originalPrice;

    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message:"Price must be greater than 0 for paid subject"
      });
    }

    //  Discount
    let discount = 0;
    if (originalPrice && price && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    updateData.discount = discount;

    // Reset to inactive on every edit
    updateData.isActive = false;

    //  If free  reset pricing
    if (!isPaid) {
      updateData.price = 0;
      updateData.originalPrice = 0;
      updateData.discount = 0;
    }

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      updateData,
      { new: true, runValidators: true }
    ).populate('examinationCategory','name code year');

    res.status(200).json({
      success: true,
      message:'Subject updated successfully',
      data: subject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating subject',
      error: error.message
    });
  }
};

// Delete subject (Admin only)
const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Check if subject has topic categories
    const hasTopics = await TopicCategory.countDocuments({
      subject: subjectId
    });

    if (hasTopics > 0) {
      return res.status(400).json({
        success: false,
        message:'Cannot delete subject that has topic categories. Please delete all topic categories first.'
      });
    }

    const subject = await Subject.findByIdAndDelete(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message:'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error deleting subject',
      error: error.message
    });
  }
};

// Toggle subject status (Admin only)
const toggleSubjectStatus = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    const isDeactivating = subject.isActive === true;

    // Block deactivation if subject has purchases
    if (isDeactivating) {
      const purchaseCount = await TopicCategoryPurchase.countDocuments({
        subject_id: subjectId,
        status:'completed'
      });

      if (purchaseCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate subject: ${purchaseCount} purchase(s) exist for this subject. Remove or transfer purchases first.`
        });
      }
    }

    subject.isActive = !subject.isActive;
    await subject.save();

    res.status(200).json({
      success: true,
      message: `Subject ${subject.isActive ?'activated' :'deactivated'} successfully`,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error updating subject status',
      error: error.message
    });
  }
};

module.exports = {
  createSubject,
  getSubjectsByExaminationCategory,
  getSubjectById,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus
};
