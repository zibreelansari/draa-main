const TestSeries = require('../Models/TestSeriesModels');
const TestAttempt = require('../Models/TestSeriesAttempt');
const TestAnalytics = require('../Models/AnalyticsTestSeries');
const ExaminationCategory = require('../Models/ExaminationCategory.models');
const Subject = require('../Models/Subject.models');
const TopicCategory = require('../Models/Topic.models');
const fs = require("fs");
const { checkTestSeriesPurchases } = require('../utils/purchaseCheck');

const triggerTestSeriesNotification = async (type, testSeries, rejectionReason ='') => {
  try {
    const Notification = require("../Models/NotificationModel");
    const creatorId = testSeries.createdBy?._id || testSeries.createdBy;
    const teacherName = testSeries.createdBy?.tname || testSeries.createdBy?.name ||"A Teacher";

    if (type ==='create') {
      await Notification.create({
        recipient:'admin',
        recipientModel:'Admin',
        sender: creatorId || null,
        senderModel:'Teacher',
        senderName: teacherName,
        type:'course_upload',
        title:'New Test Series Uploaded',
        message: `Teacher"${teacherName}" uploaded a new Test Series:"${testSeries.title}" for approval.`,
        referenceId: testSeries._id
      });
      console.log('Notification triggered: Test Series created.');
    } else if (type ==='approved') {
      // Notify Teacher
      if (creatorId) {
        await Notification.create({
          recipient: creatorId.toString(),
          recipientModel:'Teacher',
          sender: null,
          senderModel:'Admin',
          senderName:'EduDocs Team',
          type:'course_upload',
          title:'Test Series Approved!',
          message: `Congratulations! Your Test Series"${testSeries.title}" has been approved by the Admin and is now live.`,
          referenceId: testSeries._id
        });
      }
      // Notify Students
      await Notification.create({
        recipient:'all_students',
        recipientModel:'User',
        sender: null,
        senderModel:'Admin',
        senderName:'EduDocs Team',
        type:'course_upload',
        title:'New Test Series Available!',
        message: `New Test Series Published:"${testSeries.title}" is now active and ready for practice!`,
        referenceId: testSeries._id
      });
      console.log('Notification triggered: Test Series approved.');
    } else if (type ==='rejected') {
      if (creatorId) {
        await Notification.create({
          recipient: creatorId.toString(),
          recipientModel:'Teacher',
          sender: null,
          senderModel:'Admin',
          senderName:'EduDocs Team',
          type:'course_upload',
          title:'Test Series Rejected',
          message: `Dear Instructor, your Test Series"${testSeries.title}" was rejected. Reason: ${rejectionReason ||"No details provided."}`,
          referenceId: testSeries._id
        });
      }
      console.log('Notification triggered: Test Series rejected.');
    }
  } catch (err) {
    console.error('Failed to trigger Test Series notification:', err);
  }
};




//  UPDATED: Create test series with hierarchical support
const createTestSeries = async (req, res) => {
  try {
    const {
      title,
      description,
      // Legacy fields (for backward compatibility)
      category,
      subCategory,
      // New hierarchical fields
      examinationCategory,
      subject,
      topicCategory,
      seriesNumber,
      testType,
      // Common fields
      createdBy,
      questions,
      duration,
      instructions,
      startDate,
      endDate,
      maxAttempts,
      isPaid,
      price,
      tags,
      difficulty,
      isPartOfSet,
      setCode,
      setName,
      setPrice
    } = req.body;

    //  NEW: Hierarchical validation
    if (examinationCategory && subject && topicCategory) {
      // Validate hierarchical structure
      const isValidHierarchy = await validateHierarchy(examinationCategory, subject, topicCategory);
      if (!isValidHierarchy.valid) {
        return res.status(400).json({
          success: false,
          message: isValidHierarchy.message
        });
      }

      // Check if series number already exists
      // if (seriesNumber) {
      //   const existingSeries = await TestSeries.findOne({
      //     topicCategory: topicCategory,
      //     seriesNumber: seriesNumber
      //   });

      //   if (existingSeries) {
      //     return res.status(400).json({
      //       success: false,
      //       message: `Test series ${seriesNumber} already exists for this topic category`
      //     });
      //   }
      // }
    }

    //  Create test series with both legacy and hierarchical support
    const testSeriesData = {
      title,
      description,
      createdBy,
      questions,
      duration,
      instructions,
      startDate,
      endDate,
      maxAttempts,
      isPaid,
      price,
      tags,
      difficulty,
      status:'pending'
    };

    // Add hierarchical fields if provided
    if (examinationCategory) testSeriesData.examinationCategory = examinationCategory;
    if (subject) testSeriesData.subject = subject;
    if (topicCategory) testSeriesData.topicCategory = topicCategory;
    if (seriesNumber) testSeriesData.seriesNumber = seriesNumber;
    if (testType) testSeriesData.testType = testType;
    if (isPartOfSet) testSeriesData.isPartOfSet = isPartOfSet;
    if (setCode) testSeriesData.setCode = setCode;
    if (setName) testSeriesData.setName = setName;
    if (setPrice) testSeriesData.setPrice = setPrice;
    // Add legacy fields if hierarchical not provided (backward compatibility)
    if (!examinationCategory && category) testSeriesData.category = category;
    if (!subject && subCategory) testSeriesData.subCategory = subCategory;

    const testSeries = new TestSeries(testSeriesData);
    await testSeries.save();

    // Create analytics document
    await TestAnalytics.create({
      testSeries: testSeries._id,
      difficultyDistribution: {
        easy: questions.filter(q => q.difficulty ==='easy').length,
        medium: questions.filter(q => q.difficulty ==='medium').length,
        hard: questions.filter(q => q.difficulty ==='hard').length
      }
    });

    //  Populate hierarchical data in response
    const populatedTestSeries = await TestSeries.findById(testSeries._id)
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .populate('createdBy','name email tname');

    // Trigger notification to admin
    await triggerTestSeriesNotification('create', populatedTestSeries);

    res.status(201).json({
      success: true,
      message:'Test series created successfully and sent for approval',
      data: populatedTestSeries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error creating test series',
      error: error.message
    });
    console.log('Error creating test series:', error);
  }
};

//  UPDATED: Get test series created by teacher with hierarchical grouping
const getMyTestSeries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      examinationCategory,
      subject,
      topicCategory,
      search
    } = req.query;
    const skip = (page - 1) * limit;
    const teacherId = req.user.id;

    // Build filter for teacher's test series
    const filter = { createdBy: teacherId };

    if (status) filter.status = status;

    // Hierarchical filters
    if (examinationCategory) filter.examinationCategory = examinationCategory;
    if (subject) filter.subject = subject;
    if (topicCategory) filter.topicCategory = topicCategory;

    // Legacy filter (backward compatibility)
    if (category && !examinationCategory) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .populate('approvedBy','name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get analytics for each test series
    const testSeriesWithAnalytics = await Promise.all(
      testSeries.map(async (test) => {
        const analytics = await TestAnalytics.findOne({ testSeries: test._id });
        const totalAttempts = await TestAttempt.countDocuments({
          testSeries: test._id,
          status:'completed'
        });

        return {
          ...test.toObject(),
          analytics: {
            totalAttempts: analytics?.totalAttempts || 0,
            averageScore: analytics?.averageScore || 0,
            highestScore: analytics?.highestScore || 0,
            lowestScore: analytics?.lowestScore || 0
          }
        };
      })
    );

    //  NEW: Group by hierarchy for better organization
    const hierarchicalGrouping = {};
    testSeriesWithAnalytics.forEach(test => {
      const examKey = test.examinationCategory?.name ||'Legacy';
      const subjectKey = test.subject?.name || test.category ||'Uncategorized';
      const topicKey = test.topicCategory?.name || test.subCategory ||'General';

      if (!hierarchicalGrouping[examKey]) hierarchicalGrouping[examKey] = {};
      if (!hierarchicalGrouping[examKey][subjectKey]) hierarchicalGrouping[examKey][subjectKey] = {};
      if (!hierarchicalGrouping[examKey][subjectKey][topicKey]) hierarchicalGrouping[examKey][subjectKey][topicKey] = [];

      hierarchicalGrouping[examKey][subjectKey][topicKey].push(test);
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithAnalytics,
        hierarchicalGrouping,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        summary: {
          total: total,
          draft: await TestSeries.countDocuments({ createdBy: teacherId, status:'draft' }),
          pending: await TestSeries.countDocuments({ createdBy: teacherId, status:'pending' }),
          approved: await TestSeries.countDocuments({ createdBy: teacherId, status:'approved' }),
          rejected: await TestSeries.countDocuments({ createdBy: teacherId, status:'rejected' })
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching your test series',
      error: error.message
    });
  }
};

//  UPDATED: Get single test series by ID with hierarchical context
const getTestSeriesById = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const testSeries = await TestSeries.findById(testId)
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year description')
      .populate('subject','name code description')
      .populate('topicCategory','name code description')
      .populate('approvedBy','name');

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Check permissions: only creator (teacher) or admin can view full details
    if (userId && userRole !=='admin' && testSeries.createdBy._id.toString() !== userId) {
      // If it's a student and test is approved, return limited info
      if (userRole ==='student' && testSeries.status ==='approved') {
        return res.status(200).json({
          success: true,
          data: {
            ...testSeries.toObject(),
            questions: testSeries.questions.map(q => ({
              _id: q._id,
              questionText: q.questionText,
              options: q.options.map(opt => ({ text: opt.text })) // Don't send correct answers
            }))
          }
        });
      } else if (userRole) {
        return res.status(403).json({
          success: false,
          message:'Access denied'
        });
      }
    }

    // Get analytics if available
    const analytics = await TestAnalytics.findOne({ testSeries: testId });
    const totalAttempts = await TestAttempt.countDocuments({
      testSeries: testId,
      status:'completed'
    });

    //  NEW: Get related test series in same topic category
    let relatedTestSeries = [];
    if (testSeries.topicCategory) {
      relatedTestSeries = await TestSeries.find({
        topicCategory: testSeries.topicCategory,
        _id: { $ne: testId },
        status:'approved',
        isActive: true
      })
        .select('title seriesNumber testType difficulty duration isPaid price')
        .sort({ seriesNumber: 1 })
        .limit(5);
    }

    res.status(200).json({
      success: true,
      data: {
        ...testSeries.toObject(),
        relatedTestSeries,
        analytics: {
          totalAttempts: analytics?.totalAttempts || 0,
          averageScore: analytics?.averageScore || 0,
          highestScore: analytics?.highestScore || 0,
          lowestScore: analytics?.lowestScore || 0
        },
        breadcrumb: {
          examination: testSeries.examinationCategory,
          subject: testSeries.subject,
          topic: testSeries.topicCategory
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching test series',
      error: error.message
    });
  }
};

//  FIXED: Update test series
const updateTestSeries = async (req, res) => {
  try {
    const { testId } = req.params;
    const {
      title,
      description,
      category,
      subCategory,
      examinationCategory,
      subject,
      topicCategory,
      seriesNumber,
      testType,
      uniqueIdentifier,
      questions,
      duration,
      instructions,
      startDate,
      endDate,
      maxAttempts,
      isPaid,
      price,
      tags,
      difficulty
    } = req.body;

    console.log(' Updating test series:', testId);

    // Validate testId
    if (!testId) {
      return res.status(400).json({
        success: false,
        message:'Test series ID is required'
      });
    }

    const testSeries = await TestSeries.findById(testId);

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Hierarchical validation if provided
    if (examinationCategory && subject && topicCategory) {
      try {
        const isValidHierarchy = await validateHierarchy(examinationCategory, subject, topicCategory);
        if (!isValidHierarchy.valid) {
          return res.status(400).json({
            success: false,
            message: isValidHierarchy.message
          });
        }
      } catch (validationError) {
        console.warn(' Hierarchy validation failed:', validationError.message);
        // Continue with update even if validation fails
      }
    }

    // Build update data with safe defaults
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(questions && { questions }),
      ...(duration && { duration }),
      ...(instructions && { instructions }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(maxAttempts && { maxAttempts }),
      ...(isPaid !== undefined && { isPaid }),
      ...(price !== undefined && { price }),
      ...(tags && { tags }),
      ...(difficulty && { difficulty }),
      ...(uniqueIdentifier && { uniqueIdentifier }),
      // Reset to pending after edit
      status:"pending",
      isActive: false,

      updatedAt: new Date()
    };

    // Add hierarchical fields if provided
    if (examinationCategory) updateData.examinationCategory = examinationCategory;
    if (subject) updateData.subject = subject;
    if (topicCategory) updateData.topicCategory = topicCategory;
    if (seriesNumber) updateData.seriesNumber = seriesNumber;
    if (testType) updateData.testType = testType;

    // Add legacy fields if hierarchical not provided
    if (!examinationCategory && category) updateData.category = category;
    if (!subject && subCategory) updateData.subCategory = subCategory;

    console.log(' Update data:', {
      testId,
      fieldsToUpdate: Object.keys(updateData),
      hasQuestions: questions?.length || 0
    });

    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      testId,
      updateData,
      {
        new: true,
        runValidators: true,
        context:'query' // Important for mongoose validators
      }
    )
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .populate('createdBy','name email tname')
      .catch(error => {
        console.error(' Database update error:', error);
        throw error;
      });

    // Update analytics safely (don't fail the main operation)
    if (questions && questions.length > 0) {
      try {
        if (TestAnalytics) {
          await TestAnalytics.findOneAndUpdate(
            { testSeries: testId },
            {
              difficultyDistribution: {
                easy: questions.filter(q => q.difficulty ==='easy').length,
                medium: questions.filter(q => q.difficulty ==='medium').length,
                hard: questions.filter(q => q.difficulty ==='hard').length
              },
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
          console.log(' Analytics updated for:', testId);
        }
      } catch (analyticsError) {
        console.warn(' Analytics update failed:', analyticsError.message);
        // Don't fail the main operation
      }
    }

    console.log(' Test series updated successfully:', testId);

    res.status(200).json({
      success: true,
      message:'Test series updated successfully',
      data: updatedTestSeries
    });

  } catch (error) {
    console.error(' Error updating test series:', error);

    // Handle specific mongoose errors
    if (error.name ==='ValidationError') {
      return res.status(400).json({
        success: false,
        message:'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:'Duplicate entry detected'
      });
    }

    res.status(500).json({
      success: false,
      message:'Error updating test series',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
};


//  FIXED: Delete test series
const deleteTestSeries = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(' Deleting test series:', testId);

    // Validate testId
    if (!testId) {
      return res.status(400).json({
        success: false,
        message:'Test series ID is required'
      });
    }

    const testSeries = await TestSeries.findById(testId);

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Check for purchases/enrollments before deletion
    const { canDelete, message } = await checkTestSeriesPurchases(testId);
    if (!canDelete) {
      return res.status(400).json({
        success: false,
        message: message
      });
    }

    // Delete related data in parallel for better performance
    const cleanupPromises = [];

    // Delete test attempts if TestAttempt model exists
    try {
      if (TestAttempt) {
        cleanupPromises.push(
          TestAttempt.deleteMany({ testSeries: testId })
            .then(() => console.log(' Deleted test attempts for:', testId))
            .catch(err => console.warn(' Failed to delete attempts:', err.message))
        );
      }
    } catch (error) {
      console.warn(' TestAttempt model not available');
    }

    // Delete analytics if TestAnalytics model exists
    try {
      if (TestAnalytics) {
        cleanupPromises.push(
          TestAnalytics.deleteOne({ testSeries: testId })
            .then(() => console.log(' Deleted analytics for:', testId))
            .catch(err => console.warn(' Failed to delete analytics:', err.message))
        );
      }
    } catch (error) {
      console.warn(' TestAnalytics model not available');
    }

    // Wait for cleanup operations (but don't fail if they error)
    try {
      await Promise.allSettled(cleanupPromises);
    } catch (cleanupError) {
      console.warn(' Some cleanup operations failed:', cleanupError.message);
    }

    // Delete the main test series
    await TestSeries.findByIdAndDelete(testId);

    console.log(' Test series deleted successfully:', testId);

    res.status(200).json({
      success: true,
      message:'Test series deleted successfully',
      deletedId: testId
    });

  } catch (error) {
    console.error(' Error deleting test series:', error);
    res.status(500).json({
      success: false,
      message:'Error deleting test series',
      error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
    });
  }
};


//  Keep existing admin functions (no changes needed)
const getPendingTestSeries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const testSeries = await TestSeries.find({ status:'pending' })
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments({ status:'pending' });

    res.status(200).json({
      success: true,
      data: {
        testSeries,
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
      message:'Error fetching pending test series',
      error: error.message
    });
  }
};



//  UPDATED: Get active test series with hierarchical filtering
const getActiveTestSeries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      // Legacy filters
      category,
      difficulty,
      isPaid,
      search,
      // New hierarchical filters
      examinationCategory,
      subject,
      topicCategory,
      testType,
      sortBy ='createdAt',
      sortOrder ='desc'
    } = req.query;

    const skip = (page - 1) * limit;

    const filter = {
      status:'approved',
      isActive: true
    };

    // Hierarchical filters (priority)
    if (examinationCategory) filter.examinationCategory = examinationCategory;
    if (subject) filter.subject = subject;
    if (topicCategory) filter.topicCategory = topicCategory;
    if (testType) filter.testType = testType;

    // Legacy filters (for backward compatibility)
    if (category && !examinationCategory) filter.category = category;

    // Common filters
    if (difficulty) filter.difficulty = difficulty;
    if (isPaid !== undefined) filter.isPaid = isPaid ==='true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name tname email tspecialization tprofile')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .select('-questions.options.isCorrect') // Hide correct answers but keep question structure
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    const testSeriesWithCounts = testSeries.map(test => {
      const testObj = test.toObject();
      return {
        ...testObj,
        totalQuestions: test.questions ? test.questions.length : 0,
        questions: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithCounts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        filters: {
          availableExaminations: await ExaminationCategory.find({ isActive: true }).select('name code year').limit(20).lean(),
          availableSubjects: !examinationCategory ? [] : await Subject.find({
            examinationCategory: examinationCategory,
            isActive: true
          }).select('name code').limit(50).lean(),
          availableTopics: !subject ? [] : await TopicCategory.find({
            subject: subject,
            isActive: true
          }).select('name code').limit(50).lean()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching test series:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series',
      error: error.message
    });
  }
};

//  Get test series by topic category (replaces getActiveTestSeriesByCategory)
const getTestSeriesByTopicCategory = async (req, res) => {
  try {
    const { topicId } = req.params;  //  Changed from topicCategoryId
    const {
      page = 1,
      limit = 100,
      testType,
      difficulty,
      isPaid,
      sortBy ='seriesNumber',
      sortOrder ='asc'
    } = req.query;

    console.log(' Backend: Fetching test series for topic:', topicId);

    const skip = (page - 1) * limit;
    const filter = {
      topicCategory: topicId,  //  Using topicId now
      status:'approved',
      isActive: true
    };

    if (testType) filter.testType = testType;
    if (difficulty) filter.difficulty = difficulty;
    if (isPaid !== undefined) filter.isPaid = isPaid ==='true';

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    console.log(' Filter:', filter);

    //  OPTIMIZATION 1: Exclude the massive'questions' array for listing
    // We only need the metadata, not the actual 100+ questions
    const testSeries = await TestSeries.find(filter)
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code description')
      .populate('createdBy','name tname email tspecialization')
      .select('-questions') // COMPLETELY exclude the heavy array
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await TestSeries.countDocuments(filter);

    //  OPTIMIZATION 2: Parallelize ALL metadata in one go
    const [topicCategory, availableTypes, availableDifficulties] = await Promise.all([
      TopicCategory.findById(topicId)
        .populate({
          path:'subject',
          populate: {
            path:'examinationCategory',
            select:'name code year'
          }
        }).lean(),
      TestSeries.distinct('testType', { topicCategory: topicId, status:'approved', isActive: true }),
      TestSeries.distinct('difficulty', { topicCategory: topicId, status:'approved', isActive: true })
    ]);

    if (!topicCategory) {
      console.log(' Topic category not found');
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    console.log(' Topic category:', topicCategory.name);

    // Since we excluded questions, we'll return the test series as is.
    // The frontend should rely on a separate'totalQuestions' field if we add it to the schema,
    // or we can calculate it once during test creation/update.
    // For now, we'll just return the tests quickly without the heavy payload.

    res.status(200).json({
      success: true,
      data: {
        testSeries,
        topicCategory,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters: {
          availableTypes,
          availableDifficulties
        }
      }
    });
  } catch (error) {
    console.error(' Backend: Error fetching test series:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series by topic category',
      error: error.message
    });
  }
};

//  NEW: Get full exam hierarchy (Exam -> Subjects -> Topics -> TestSeries) in ONE call
const getExamFullHierarchy = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId } = req.query;

    if (!examId) {
      return res.status(400).json({ success: false, message:'Exam ID is required' });
    }

    // 1. Fetch Exam Info
    const exam = await ExaminationCategory.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({ success: false, message:'Exam not found' });
    }

    // Load review statistics dynamically
    try {
      const TestSeriesReview = require('../Models/TestSeriesReview');
      const reviewStats = await TestSeriesReview.calculateAverageRating(examId);
      exam.statistics = {
        averageRating: reviewStats?.averageRating || 0,
        totalReviews: reviewStats?.totalReviews || 0
      };
    } catch (err) {
      console.warn("Failed to fetch review statistics for hierarchy:", err.message);
      exam.statistics = { averageRating: 0, totalReviews: 0 };
    }

    // 2. Fetch all subjects for this exam
    const subjects = await Subject.find({ examinationCategory: examId, isActive: true })
      .sort({ priority: 1, name: 1 })
      .lean();

    const subjectIds = subjects.map(s => s._id);

    // 3. Fetch all topics for these subjects
    const topics = await TopicCategory.find({ subject: { $in: subjectIds }, isActive: true })
      .sort({ priority: 1, name: 1 })
      .lean();

    const topicIds = topics.map(t => t._id);

    // 4. Fetch all test series for these topics
    const testSeries = await TestSeries.find({ 
      topicCategory: { $in: topicIds }, 
      status:'approved', 
      isActive: true 
    })
      .select('title seriesNumber topicCategory testType difficulty duration totalMarks totalQuestions isPaid price')
      .sort({ seriesNumber: 1 })
      .lean();

    // 5. Build the tree
    const topicMap = {};
    topics.forEach(t => {
      topicMap[t._id.toString()] = { ...t, testSeries: [], testSeriesCount: 0 };
    });

    testSeries.forEach(ts => {
      const tid = ts.topicCategory.toString();
      if (topicMap[tid]) {
        topicMap[tid].testSeries.push(ts);
        topicMap[tid].testSeriesCount++;
      }
    });

    const subjectMap = {};
    subjects.forEach(s => {
      subjectMap[s._id.toString()] = { ...s, topics: [] };
    });

    Object.values(topicMap).forEach(t => {
      const sid = t.subject.toString();
      if (subjectMap[sid]) {
        subjectMap[sid].topics.push(t);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        exam,
        subjects: Object.values(subjectMap)
      }
    });

  } catch (error) {
    console.error(' Hierarchy error:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching full hierarchy',
      error: error.message
    });
  }
};

//  NEW: Get hierarchical navigation data
const getHierarchicalNavigation = async (req, res) => {
  try {
    const { examCategoryId, subjectId, topicCategoryId } = req.query;

    const navigationData = {};

    // Get examination categories
    if (!examCategoryId) {
      navigationData.examinationCategories = await ExaminationCategory.find({
        isActive: true
      }).select('name code year description bannerImage').sort({ priority: 1, year: -1 }).lean();
    }

    // Get subjects if exam category is provided
    if (examCategoryId) {
      const [subjects, category] = await Promise.all([
        Subject.find({
          examinationCategory: examCategoryId,
          isActive: true
        }).select('name code description icon color').sort({ priority: 1, name: 1 }).lean(),
        ExaminationCategory.findById(examCategoryId)
          .select('name code year description').lean()
      ]);
      navigationData.subjects = subjects;
      navigationData.examinationCategory = category;
    }

    // Get topic categories if subject is provided
    if (subjectId) {
      const [topics, subject] = await Promise.all([
        TopicCategory.find({
          subject: subjectId,
          isActive: true
        }).select('name code description difficulty icon color').sort({ priority: 1, name: 1 }).lean(),
        Subject.findById(subjectId)
          .populate('examinationCategory','name code year')
          .select('name code description').lean()
      ]);
      navigationData.topicCategories = topics;
      navigationData.subject = subject;
    }

    // Get test series if topic category is provided
    if (topicCategoryId) {
      const [tests, topic] = await Promise.all([
        TestSeries.find({
          topicCategory: topicCategoryId,
          status:'approved',
          isActive: true
        }).select('title seriesNumber testType difficulty duration totalMarks totalQuestions isPaid price')
          .sort({ seriesNumber: 1 }).lean(),
        TopicCategory.findById(topicCategoryId)
          .populate({
            path:'subject',
            populate: {
              path:'examinationCategory',
              select:'name code year'
            }
          }).lean()
      ]);
      navigationData.testSeries = tests;
      navigationData.topicCategory = topic;
    }

    res.status(200).json({
      success: true,
      data: navigationData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error fetching hierarchical navigation data',
      error: error.message
    });
  }
};

//  Keep existing test attempt functions (no changes needed)
const startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const testSeries = await TestSeries.findById(testId);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Check if user has already attempted maximum times
    const attemptCount = await TestAttempt.countDocuments({
      testSeries: testId,
      user: userId,
      status:'completed'
    });

    if (attemptCount >= testSeries.maxAttempts) {
      return res.status(400).json({
        success: false,
        message:'Maximum attempts exceeded'
      });
    }

    // Check if there's an ongoing attempt
    const ongoingAttempt = await TestAttempt.findOne({
      testSeries: testId,
      user: userId,
      status:'ongoing'
    });

    if (ongoingAttempt) {
      return res.status(200).json({
        success: true,
        message:'Resuming ongoing test',
        data: {
          attemptId: ongoingAttempt._id,
          startTime: ongoingAttempt.startTime,
          duration: testSeries.duration
        }
      });
    }

    // Create new attempt
    const testAttempt = new TestAttempt({
      testSeries: testId,
      user: userId,
      startTime: new Date()
    });

    await testAttempt.save();

    res.status(201).json({
      success: true,
      message:'Test started successfully',
      data: {
        attemptId: testAttempt._id,
        startTime: testAttempt.startTime,
        duration: testSeries.duration,
        questions: testSeries.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options.map(opt => ({ text: opt.text }))
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error starting test',
      error: error.message
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt || attempt.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message:'Test attempt not found'
      });
    }

    const testSeries = await TestSeries.findById(attempt.testSeries);
    const question = testSeries.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message:'Question not found'
      });
    }

    const isCorrect = question.options[selectedOption]?.isCorrect || false;
    const marksObtained = isCorrect ? question.marks : -question.negativeMarks;

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      ans => ans.questionId.toString() === questionId
    );

    if (existingAnswerIndex !== -1) {
      attempt.answers[existingAnswerIndex] = {
        questionId,
        selectedOption,
        isCorrect,
        marksObtained,
        timeSpent
      };
    } else {
      attempt.answers.push({
        questionId,
        selectedOption,
        isCorrect,
        marksObtained,
        timeSpent
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message:'Answer submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error submitting answer',
      error: error.message
    });
  }
};

const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('testSeries');

    if (!attempt || attempt.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message:'Test attempt not found'
      });
    }

    // Calculate results
    const totalQuestions = attempt.testSeries.questions.length;
    const correctAnswers = attempt.answers.filter(ans => ans.isCorrect).length;
    const incorrectAnswers = attempt.answers.filter(ans => !ans.isCorrect && ans.selectedOption !== undefined).length;
    const unanswered = totalQuestions - attempt.answers.length;
    const totalScore = attempt.answers.reduce((sum, ans) => sum + ans.marksObtained, 0);
    const percentage = (totalScore / attempt.testSeries.totalMarks) * 100;

    // Update attempt
    attempt.endTime = new Date();
    attempt.status ='completed';
    attempt.isSubmitted = true;
    attempt.totalScore = totalScore;
    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.unanswered = unanswered;
    attempt.percentage = Math.max(0, percentage);
    attempt.timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000);

    await attempt.save();

    // Update analytics
    await updateTestAnalytics(attempt.testSeries._id, attempt);

    res.status(200).json({
      success: true,
      message:'Test submitted successfully',
      data: {
        totalScore,
        percentage: Math.max(0, percentage),
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeSpent: attempt.timeSpent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error submitting test',
      error: error.message
    });
  }
};

// Helper function to update analytics
const updateTestAnalytics = async (testSeriesId, attempt) => {
  try {
    const analytics = await TestAnalytics.findOne({ testSeries: testSeriesId });
    if (analytics) {
      analytics.totalAttempts += 1;

      // Recalculate average score
      const allAttempts = await TestAttempt.find({
        testSeries: testSeriesId,
        status:'completed'
      });

      const totalScore = allAttempts.reduce((sum, att) => sum + att.totalScore, 0);
      analytics.averageScore = totalScore / allAttempts.length;
      analytics.highestScore = Math.max(analytics.highestScore, attempt.totalScore);
      analytics.lowestScore = analytics.lowestScore === 0 ?
        attempt.totalScore : Math.min(analytics.lowestScore, attempt.totalScore);

      await analytics.save();
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
};

//  UPDATED: Get test series by teacher with hierarchical grouping
const getTestSeriesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 50, status, category, search } = req.query;
    const skip = (page - 1) * limit;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message:'Teacher ID is required'
      });
    }

    const filter = { createdBy: teacherId };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get analytics for each test series
    const testSeriesWithAnalytics = await Promise.all(
      testSeries.map(async (test) => {
        const analytics = await TestAnalytics.findOne({ testSeries: test._id });
        const totalAttempts = await TestAttempt.countDocuments({
          testSeries: test._id,
          status:'completed'
        });

        return {
          ...test.toObject(),
          analytics: {
            totalAttempts: analytics?.totalAttempts || 0,
            averageScore: analytics?.averageScore || 0,
            highestScore: analytics?.highestScore || 0,
            lowestScore: analytics?.lowestScore || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithAnalytics,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching teacher test series:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching teacher test series',
      error: error.message
    });
  }
};

//  NEW: Helper function to validate hierarchical structure
const validateHierarchy = async (examinationCategoryId, subjectId, topicCategoryId) => {
  try {
    // Check if examination category exists
    const examCategory = await ExaminationCategory.findById(examinationCategoryId);
    if (!examCategory) {
      return { valid: false, message:'Examination category not found' };
    }

    // Check if subject exists and belongs to examination category
    const subject = await Subject.findOne({
      _id: subjectId,
      examinationCategory: examinationCategoryId
    });
    if (!subject) {
      return { valid: false, message:'Subject not found or does not belong to this examination category' };
    }

    // Check if topic category exists and belongs to subject
    const topicCategory = await TopicCategory.findOne({
      _id: topicCategoryId,
      subject: subjectId
    });
    if (!topicCategory) {
      return { valid: false, message:'Topic category not found or does not belong to this subject' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message:'Error validating hierarchy:' + error.message };
  }
};

//  NEW: Get next available series number for a topic category
const getNextSeriesNumber = async (req, res) => {
  try {
    const { topicCategoryId } = req.params;

    // Get highest series number for this topic category
    const lastSeries = await TestSeries.findOne({
      topicCategory: topicCategoryId
    }).sort({ seriesNumber: -1 });

    const nextSeriesNumber = lastSeries ? lastSeries.seriesNumber + 1 : 1;

    res.status(200).json({
      success: true,
      data: {
        nextSeriesNumber,
        currentSeriesCount: lastSeries ? lastSeries.seriesNumber : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Error getting next series number',
      error: error.message
    });
  }
};



//  NEW: Admin approve test series
const approveTestSeries = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(' Admin approving test series:', testId);

    const testSeries = await TestSeries.findById(testId);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Check if already approved
    if (testSeries.status ==='approved') {
      return res.status(400).json({
        success: false,
        message:'Test series is already approved'
      });
    }

    // Update test series status
    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      testId,
      {
        status:'approved',
        approvalDate: new Date(),
        isActive: true,
        rejectionReason: null // Clear any previous rejection reason
      },
      { new: true }
    )
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code');

    console.log(' Test series approved successfully:', updatedTestSeries._id);

    // Trigger notifications for approval
    await triggerTestSeriesNotification('approved', updatedTestSeries);

    res.status(200).json({
      success: true,
      message:'Test series approved successfully',
      data: updatedTestSeries
    });
  } catch (error) {
    console.error(' Error approving test series:', error);
    res.status(500).json({
      success: false,
      message:'Error approving test series',
      error: error.message
    });
  }
};

//  NEW: Admin reject test series
const rejectTestSeries = async (req, res) => {
  try {
    const { testId } = req.params;
    const { rejectionReason } = req.body;

    console.log(' Admin rejecting test series:', testId,'Reason:', rejectionReason);

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message:'Rejection reason is required and must be at least 10 characters long'
      });
    }

    const testSeries = await TestSeries.findById(testId);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Check if already rejected
    if (testSeries.status ==='rejected') {
      return res.status(400).json({
        success: false,
        message:'Test series is already rejected'
      });
    }

    // Update test series status
    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      testId,
      {
        status:'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectionDate: new Date(),
        isActive: false
      },
      { new: true }
    )
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code');

    console.log(' Test series rejected successfully:', updatedTestSeries._id);

    // Trigger notification for rejection
    await triggerTestSeriesNotification('rejected', updatedTestSeries, rejectionReason);

    res.status(200).json({
      success: true,
      message:'Test series rejected successfully',
      data: updatedTestSeries
    });
  } catch (error) {
    console.error(' Error rejecting test series:', error);
    res.status(500).json({
      success: false,
      message:'Error rejecting test series',
      error: error.message
    });
  }
};

//  Enhanced: Generic status update (keep existing but enhance)
const updateTestSeriesStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const { status, rejectionReason } = req.body;

    console.log(' Updating test series status:', testId,'New status:', status);

    // Validate status
    const validStatuses = ['draft','pending','approved','rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:'Invalid status. Must be one of:' + validStatuses.join(',')
      });
    }

    // If rejecting, require rejection reason
    if (status ==='rejected' && (!rejectionReason || rejectionReason.trim().length < 10)) {
      return res.status(400).json({
        success: false,
        message:'Rejection reason is required and must be at least 10 characters long'
      });
    }

    const testSeries = await TestSeries.findById(testId);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Block deactivation/rejection if test series has purchases or enrollments
    if (status ==='rejected' || status ==='draft') {
      const { canDelete, message } = await checkTestSeriesPurchases(testId);
      if (!canDelete) {
        return res.status(400).json({
          success: false,
          message: message
        });
      }
    }

    // Build update object
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status ==='approved') {
      updateData.approvalDate = new Date();
      updateData.isActive = true;
      updateData.rejectionReason = null; // Clear any previous rejection
    } else if (status ==='rejected') {
      updateData.rejectionReason = rejectionReason.trim();
      updateData.rejectionDate = new Date();
      updateData.isActive = false;
    } else if (status ==='pending') {
      updateData.isActive = false;
      // Keep existing rejection reason for reference
    } else if (status ==='draft') {
      updateData.isActive = false;
    }

    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      testId,
      updateData,
      { new: true }
    )
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code');

    console.log(' Test series status updated:', updatedTestSeries._id,'Status:', status);

    // Trigger notifications based on status
    if (status ==='approved') {
      await triggerTestSeriesNotification('approved', updatedTestSeries);
    } else if (status ==='rejected') {
      await triggerTestSeriesNotification('rejected', updatedTestSeries, rejectionReason);
    }

    res.status(200).json({
      success: true,
      message: `Test series ${status} successfully`,
      data: updatedTestSeries
    });
  } catch (error) {
    console.error(' Error updating test series status:', error);
    res.status(500).json({
      success: false,
      message:'Error updating test series status',
      error: error.message
    });
  }
};

//  NEW: Get all test series for admin dashboard
const getAllTestSeriesForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      teacherId,
      sortBy ='createdAt',
      sortOrder ='desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (teacherId) filter.createdBy = teacherId;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { category: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name email tname')
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get comprehensive statistics
    const stats = {
      total: await TestSeries.countDocuments(),
      approved: await TestSeries.countDocuments({ status:'approved' }),
      pending: await TestSeries.countDocuments({ status:'pending' }),
      rejected: await TestSeries.countDocuments({ status:'rejected' }),
      draft: await TestSeries.countDocuments({ status:'draft' }),
      categories: await TestSeries.distinct('category'),
      totalTeachers: await TestSeries.distinct('createdBy').then(arr => arr.length)
    };

    console.log(' Admin dashboard stats:', stats);

    const testSeriesWithCounts = testSeries.map(test => {
      const testObj = test.toObject();
      return {
        ...testObj,
        totalQuestions: test.questions ? test.questions.length : 0,
        questions: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithCounts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        statistics: stats
      }
    });
  } catch (error) {
    console.error(' Error fetching admin test series:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series for admin',
      error: error.message
    });
  }
};



//  NEW: Get test series by examination category
const getTestSeriesByExamination = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      page = 1,
      limit = 100,
      difficulty,
      isPaid,
      search,
      testType,
      sortBy ='createdAt',
      sortOrder ='desc'
    } = req.query;

    console.log(' Fetching test series for examination:', examId);

    const skip = (page - 1) * limit;
    const filter = {
      examinationCategory: examId,
      status:'approved',
      isActive: true
    };

    // Apply filters
    if (difficulty) filter.difficulty = difficulty;
    if (isPaid !== undefined) filter.isPaid = isPaid ==='true';
    if (testType) filter.testType = testType;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name tname email tspecialization tprofile')
      .populate('examinationCategory','name code year description')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get examination category details
    const examinationCategory = await ExaminationCategory.findById(examId);
    if (!examinationCategory) {
      return res.status(404).json({
        success: false,
        message:'Examination category not found'
      });
    }

    // Calculate statistics
    const statistics = {
      totalTests: total,
      totalSubjects: await Subject.countDocuments({ examinationCategory: examId, isActive: true }),
      totalTopics: await TopicCategory.countDocuments({
        subject: { $in: await Subject.find({ examinationCategory: examId }).select('_id') }
      }),
      freeTests: await TestSeries.countDocuments({ ...filter, isPaid: false }),
      paidTests: await TestSeries.countDocuments({ ...filter, isPaid: true }),
      beginnerLevel: await TestSeries.countDocuments({ ...filter, difficulty:'beginner' }),
      intermediateLevel: await TestSeries.countDocuments({ ...filter, difficulty:'intermediate' }),
      advancedLevel: await TestSeries.countDocuments({ ...filter, difficulty:'advanced' }),
      averageDuration: Math.round(testSeries.reduce((sum, test) => sum + test.duration, 0) / testSeries.length) || 0
    };

    console.log(' Examination statistics:', statistics);

    const testSeriesWithCounts = testSeries.map(test => {
      const testObj = test.toObject();
      return {
        ...testObj,
        totalQuestions: test.questions ? test.questions.length : 0,
        questions: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithCounts,
        examinationCategory,
        statistics,
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
    console.error(' Error fetching test series by examination:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series by examination',
      error: error.message
    });
  }
};

//  NEW: Get test series by subject
const getTestSeriesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const {
      page = 1,
      limit = 100,
      difficulty,
      isPaid,
      search,
      testType,
      sortBy ='createdAt',
      sortOrder ='desc'
    } = req.query;

    console.log(' Fetching test series for subject:', subjectId);

    const skip = (page - 1) * limit;
    const filter = {
      subject: subjectId,
      status:'approved',
      isActive: true
    };

    // Apply filters
    if (difficulty) filter.difficulty = difficulty;
    if (isPaid !== undefined) filter.isPaid = isPaid ==='true';
    if (testType) filter.testType = testType;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name tname email tspecialization tprofile')
      .populate('examinationCategory','name code year description')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get subject details with examination category
    const subject = await Subject.findById(subjectId)
      .populate('examinationCategory','name code year description');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message:'Subject not found'
      });
    }

    // Calculate statistics
    const statistics = {
      totalTests: total,
      totalSubjects: 1,
      totalTopics: await TopicCategory.countDocuments({ subject: subjectId, isActive: true }),
      freeTests: await TestSeries.countDocuments({ ...filter, isPaid: false }),
      paidTests: await TestSeries.countDocuments({ ...filter, isPaid: true }),
      beginnerLevel: await TestSeries.countDocuments({ ...filter, difficulty:'beginner' }),
      intermediateLevel: await TestSeries.countDocuments({ ...filter, difficulty:'intermediate' }),
      advancedLevel: await TestSeries.countDocuments({ ...filter, difficulty:'advanced' }),
      averageDuration: Math.round(testSeries.reduce((sum, test) => sum + test.duration, 0) / testSeries.length) || 0
    };

    const testSeriesWithCounts = testSeries.map(test => {
      const testObj = test.toObject();
      return {
        ...testObj,
        totalQuestions: test.questions ? test.questions.length : 0,
        questions: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithCounts,
        subject,
        examinationCategory: subject.examinationCategory,
        statistics,
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
    console.error(' Error fetching test series by subject:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series by subject',
      error: error.message
    });
  }
};

//  NEW: Get test series by topic category (Enhanced existing function)
const getTestSeriesByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const {
      page = 1,
      limit = 100,
      difficulty,
      isPaid,
      search,
      testType,
      sortBy ='seriesNumber',
      sortOrder ='asc'
    } = req.query;

    console.log(' Fetching test series for topic:', topicId);

    const skip = (page - 1) * limit;
    const filter = {
      topicCategory: topicId,
      status:'approved',
      isActive: true
    };

    // Apply filters
    if (difficulty) filter.difficulty = difficulty;
    if (isPaid !== undefined) filter.isPaid = isPaid ==='true';
    if (testType) filter.testType = testType;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

    const testSeries = await TestSeries.find(filter)
      .populate('createdBy','name tname email tspecialization tprofile')
      .populate('examinationCategory','name code year description')
      .populate('subject','name code')
      .populate('topicCategory','name code description')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSeries.countDocuments(filter);

    // Get topic category details with full hierarchy
    const topicCategory = await TopicCategory.findById(topicId)
      .populate({
        path:'subject',
        populate: {
          path:'examinationCategory',
          select:'name code year description'
        }
      });

    if (!topicCategory) {
      return res.status(404).json({
        success: false,
        message:'Topic category not found'
      });
    }

    // Calculate statistics
    const statistics = {
      totalTests: total,
      totalSubjects: 1,
      totalTopics: 1,
      freeTests: await TestSeries.countDocuments({ ...filter, isPaid: false }),
      paidTests: await TestSeries.countDocuments({ ...filter, isPaid: true }),
      beginnerLevel: await TestSeries.countDocuments({ ...filter, difficulty:'beginner' }),
      intermediateLevel: await TestSeries.countDocuments({ ...filter, difficulty:'intermediate' }),
      advancedLevel: await TestSeries.countDocuments({ ...filter, difficulty:'advanced' }),
      averageDuration: Math.round(testSeries.reduce((sum, test) => sum + test.duration, 0) / testSeries.length) || 0
    };

    const testSeriesWithCounts = testSeries.map(test => {
      const testObj = test.toObject();
      return {
        ...testObj,
        totalQuestions: test.questions ? test.questions.length : 0,
        questions: undefined
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testSeries: testSeriesWithCounts,
        topicCategory,
        subject: topicCategory.subject,
        examinationCategory: topicCategory.subject.examinationCategory,
        statistics,
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
    console.error(' Error fetching test series by topic:', error);
    res.status(500).json({
      success: false,
      message:'Error fetching test series by topic',
      error: error.message
    });
  }
};


const Tesseract = require('tesseract.js');

const importQuestionFromImageOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:'Image file is required'
      });
    }

    const result = await Tesseract.recognize(req.file.path,'eng');

    const extractedText = result.data.text.trim();

    // IMPORTANT: DO NOT SAVE ANYTHING
    // Just return text so frontend can prefill modal
    return res.status(200).json({
      success: true,
      data: {
        questionText: extractedText
      }
    });

  } catch (error) {
    console.error('OCR Error:', error);
    return res.status(500).json({
      success: false,
      message:'Failed to extract text from image'
    });
  }
};



const officeParser = require('officeparser');

function parseQuestionFromText(text) {
  const get = (key) => {
    const match = text.match(
      new RegExp(`${key}:([\\s\\S]*?)(\\n[A-Z]+:|$)`)
    );
    return match ? match[1].trim() :"";
  };

  const optionsBlock = get("OPTIONS");
  const options = optionsBlock
    .split("\n")
    .filter(Boolean)
    .map(opt => ({
      text: opt.replace(/^[A-D]\.\s*/,"").trim(),
      isCorrect: false,
    }));

  const answer = get("ANSWER");
  if (answer && options[answer.charCodeAt(0) - 65]) {
    options[answer.charCodeAt(0) - 65].isCorrect = true;
  }

  return {
    questionText: text.split("OPTIONS:")[0].trim(),
    options,
    marks: Number(get("MARKS")) || 1,
    negativeMarks: Number(get("NEGATIVE")) || 0,
    difficulty: get("DIFFICULTY") ||"medium",
  };
}


function parseQuestionFromSlide(text) {
  const get = (key) => {
    const match = text.match(
      new RegExp(`${key}:([\\s\\S]*?)(\\n[A-Z]+:|$)`)
    );
    return match ? match[1].trim() :"";
  };

  const optionsBlock = get("OPTIONS");
  const options = optionsBlock
    .split("\n")
    .filter(Boolean)
    .map(opt => ({
      text: opt.replace(/^[A-D]\.\s*/,"").trim(),
      isCorrect: false,
    }));

  const answer = get("ANSWER");
  if (answer && options[answer.charCodeAt(0) - 65]) {
    options[answer.charCodeAt(0) - 65].isCorrect = true;
  }

  return {
    questionText: text.split("OPTIONS:")[0].trim(),
    options,
    marks: Number(get("MARKS")) || 1,
    negativeMarks: Number(get("NEGATIVE")) || 0,
    difficulty: get("DIFFICULTY") ||"medium",
  };
}





// const officeParser = require("officeparser");
// const fs = require("fs");

const importQuestionsFromPPT = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:"No PPT uploaded",
      });
    }

    const filePath = req.file.path;

    //  Wrap callback-based API into Promise
    const text = await new Promise((resolve, reject) => {
      officeParser.parseOffice(filePath, (data, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message:"No readable content found in PPT",
      });
    }

    // officeparser separates slides with form-feed
    const slides = text
      .split("===")      //  reliable delimiter
      .map(s => s.trim())
      .filter(Boolean);


    const questions = slides
      .map(slideText => parseQuestionFromSlide(slideText))
      .filter(Boolean);

    // cleanup
    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      data: { questions },
    });

  } catch (err) {
    console.error("PPT import error:", err);
    return res.status(500).json({
      success: false,
      message:"PPT import failed",
    });
  }
};

// Controllers/TestSeriesController.js
const PptxGenJS = require("pptxgenjs");

const exportQuestionPPTTemplate = async (req, res) => {
  try {
    const pptx = new PptxGenJS();

    // Slide 1  Instructions
    let slide = pptx.addSlide();
    slide.addText("PPT Question Import Template", {
      x: 1,
      y: 0.5,
      fontSize: 28,
      bold: true,
    });

    slide.addText(
"Rules:\n" +
" 1 slide = 1 question\n" +
" Use exact keywords\n" +
" ANSWER must be A/B/C/D\n",
      { x: 1, y: 1.6, fontSize: 14 }
    );

    // Slide 2  Sample Question
    slide = pptx.addSlide();
    slide.addText(
      `QUESTION:
What is the time complexity of binary search?

OPTIONS:
A. O(n)
B. O(log n)
C. O(n^2)
D. O(1)

ANSWER: B
MARKS: 1
NEGATIVE: 0.25
DIFFICULTY: medium
EXPLANATION:
Binary search halves the search space.

===`,
      { x: 0.5, y: 0.5, fontSize: 14 }
    );


    // Generate buffer
    const buffer = await pptx.write("nodebuffer");

    //  THIS IS WHY TXT ISSUE WAS HAPPENING
    res.setHeader(
"Content-Type",
"application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    res.setHeader(
"Content-Disposition",
"attachment; filename=question_import_template.pptx"
    );

    return res.end(buffer);
  } catch (err) {
    console.error("PPT export error:", err);
    res.status(500).json({ success: false, message:"PPT export failed" });
  }
};

const importQuestionsFromLatex = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:"No LaTeX file uploaded",
      });
    }

    //  READ FROM DISK
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath,"utf-8");

    // Split questions
    const blocks = content
      .split("===")
      .map(b => b.trim())
      .filter(Boolean);

    const questions = blocks.map(block => {
      const get = (key) => {
        const match = block.match(
          new RegExp(`${key}:([\\s\\S]*?)(\\n[A-Z]+:|$)`)
        );
        return match ? match[1].trim() :"";
      };

      const optionsBlock = get("OPTIONS");
      const options = optionsBlock
        .split("\n")
        .filter(Boolean)
        .map(opt => ({
          text: opt.replace(/^[A-D]\.\s*/,"").trim(),
          isCorrect: false,
        }));

      const answer = get("ANSWER").trim();
      if (answer && options[answer.charCodeAt(0) - 65]) {
        options[answer.charCodeAt(0) - 65].isCorrect = true;
      }

      return {
        questionText: block.split("OPTIONS:")[0].trim(),
        isLatex: true,
        options,
        marks: Number(get("MARKS")) || 1,
        negativeMarks: Number(get("NEGATIVE")) || 0,
        difficulty: get("DIFFICULTY") ||"medium",
        explanation: get("EXPLANATION"),
      };
    });

    return res.json({
      success: true,
      data: { questions },
    });
  } catch (err) {
    console.error("LaTeX import error:", err);
    res.status(500).json({
      success: false,
      message:"LaTeX import failed",
    });
  }
};
const exportLatexTemplate = async (req, res) => {
  try {
    const template = `
% ================================
% Draa  LaTeX Question Template
% ================================
% RULES:
% 1. One question block separated by ===
% 2. ANSWER must be A/B/C/D
% 3. Use valid LaTeX inside $$ $$

Evaluate the integral:

$$
\\int_0^1 x^2 \\, dx
$$

OPTIONS:
A. $\\frac{1}{3}$
B. $\\frac{1}{2}$
C. $1$
D. $2$

ANSWER: A
MARKS: 1
NEGATIVE: 0.25
DIFFICULTY: medium
EXPLANATION:
Standard definite integral.

===

Solve the equation:

$$
x^2 - 5x + 6 = 0
$$

OPTIONS:
A. $1,6$
B. $2,3$
C. $-2,-3$
D. $0,6$

ANSWER: B
MARKS: 2
NEGATIVE: 0.5
DIFFICULTY: hard
`;

    res.setHeader("Content-Type","text/plain");
    res.setHeader(
"Content-Disposition",
"attachment; filename=latex_question_template.tex"
    );

    return res.send(template);
  } catch (err) {
    console.error("LaTeX template export error:", err);
    res.status(500).json({
      success: false,
      message:"Failed to export LaTeX template",
    });
  }
};




module.exports = {
  //  Updated functions with hierarchical support
  createTestSeries,
  getMyTestSeries,
  getTestSeriesById,
  updateTestSeries,
  deleteTestSeries,
  getPendingTestSeries,
  getActiveTestSeries,
  getTestSeriesByTeacher,

  //  New hierarchical functions
  getTestSeriesByTopicCategory,
  getExamFullHierarchy,
  getHierarchicalNavigation,
  getNextSeriesNumber,

  //  NEW: Missing hierarchical filtering functions
  getTestSeriesByExamination,  //  THIS WAS MISSING!
  getTestSeriesBySubject,      //  THIS WAS MISSING!
  getTestSeriesByTopic,

  //  Existing test functions (unchanged)
  startTest,
  submitAnswer,
  submitTest,

  //  Admin approval functions
  approveTestSeries,
  rejectTestSeries,
  updateTestSeriesStatus, // Enhanced existing function
  getAllTestSeriesForAdmin,

  //  Keep for backward compatibility
  getActiveTestSeriesByCategory: getTestSeriesByTopicCategory, // Alias for backward compatibility



  importQuestionFromImageOCR,
  importQuestionsFromPPT,
  exportQuestionPPTTemplate,
  importQuestionsFromLatex,
  exportLatexTemplate
};

