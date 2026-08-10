const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const TestSeries = require('../Models/TestSeriesModels');
const TestSeriesPurchase = require('../Models/TestSeriesPurchaseModel');
const PurchaseModel = require('../Models/purchaseModels');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');




// Initialize Razorpay    
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Helper function to generate short receipt
const generateShortReceipt = (testId, studentId) => {
  const timestamp = Date.now().toString().slice(-8);
  const testHash = testId.slice(-6);
  const studentHash = studentId.slice(-6);
  return `TS${testHash}_S${studentHash}_${timestamp}`;
};


router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { test_series_id, student_data } = req.body;

    // Validate student data
    if (!student_data || !student_data.id || !student_data.email || !student_data.name) {
      return res.status(401).json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    const student_id = student_data.id;
    console.log(' Creating test series order for student:', student_id, student_data.name);

    // Validate test series exists and is approved
    const testSeries = await TestSeries.findById(test_series_id)
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .populate('createdBy','name tname email');

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    if (testSeries.status !=='approved' || !testSeries.isActive) {
      return res.status(400).json({
        success: false,
        message:'This test series is not available for purchase'
      });
    }

    if (!testSeries.isPaid) {
      return res.status(400).json({
        success: false,
        message:'This test series is free and does not require payment'
      });
    }

    if (!testSeries.price || testSeries.price <= 0) {
      return res.status(400).json({
        success: false,
        message:'Test series price is not set correctly'
      });
    }

    // Check if student already purchased this test series
    const existingPurchase = await TestSeriesPurchase.findOne({
      student_id,
      test_series_id,
'purchase_details.payment_status':'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message:'You have already purchased this test series'
      });
    }

    // Generate receipt
    const shortReceipt = generateShortReceipt(test_series_id, student_id);
    console.log(' Generated receipt:', shortReceipt);

    // Create Razorpay order
    const razorpayOptions = {
      amount: testSeries.price * 100, // Amount in paise
      currency:'INR',
      receipt: shortReceipt,
      notes: {
        test_series_id: test_series_id.toString(),
        student_id: student_id.toString(),
        test_title: testSeries.title.substring(0, 50),
        test_type: testSeries.testType ||'practice',
        student_name: student_data.name.substring(0, 30),
        student_email: student_data.email,
        exam_category: testSeries.examinationCategory?.name ||'General'
      }
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);
    console.log(' Razorpay order created:', razorpayOrder.id);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      testSeries: {
        id: testSeries._id,
        title: testSeries.title,
        price: testSeries.price,
        duration: testSeries.duration,
        totalQuestions: testSeries.questions?.length || 0,
        maxAttempts: testSeries.maxAttempts,
        difficulty: testSeries.difficulty,
        testType: testSeries.testType,
        seriesNumber: testSeries.seriesNumber,
        hierarchical_context: {
          examination: testSeries.examinationCategory?.name,
          subject: testSeries.subject?.name,
          topic: testSeries.topicCategory?.name
        }
      }
    });

  } catch (error) {
    console.error(' Create test series order error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to create payment order',
      error: error.message
    });
  }
});

//  STEP 2: Verify Payment & Complete Test Series Purchase
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const {
      test_series_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_data
    } = req.body;

    // Validate student data
    if (!student_data || !student_data.id) {
      return res.status(401).json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    const student_id = student_data.id;
    console.log(' Verifying test series payment for student:', student_id);

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error(' Payment signature verification failed!');
      return res.status(400).json({
        success: false,
        message:'Payment verification failed - Invalid signature'
      });
    }

    console.log(' Payment signature verified successfully!');

    // Get test series details with populated references
    const testSeries = await TestSeries.findById(test_series_id)
      .populate('examinationCategory','name code year')
      .populate('subject','name code')
      .populate('topicCategory','name code')
      .populate('createdBy','name tname email');

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    // Create test series purchase record
    const testSeriesPurchase = new TestSeriesPurchase({
      student_id,
      test_series_id,
      student_details: {
        name: student_data.name,
        email: student_data.email,
        phone: student_data.phone ||''
      },
      test_series_details: {
        title: testSeries.title,
        description: testSeries.description,
        examinationCategory: testSeries.examinationCategory?._id,
        subject: testSeries.subject?._id,
        topicCategory: testSeries.topicCategory?._id,
        seriesNumber: testSeries.seriesNumber,
        testType: testSeries.testType,
        duration: testSeries.duration,
        totalMarks: testSeries.totalMarks,
        totalQuestions: testSeries.questions?.length || 0,
        maxAttempts: testSeries.maxAttempts,
        difficulty: testSeries.difficulty,
        price: testSeries.price,
        tags: testSeries.tags,
        createdBy: testSeries.createdBy?._id
      },
      purchase_details: {
        amount_paid: testSeries.price,
        currency:'INR',
        payment_status:'completed',
        purchase_date: new Date(),
        access_granted: true,
        access_granted_date: new Date(),
        validity_period: 365 // 1 year access
      },
      razorpay_details: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status:'captured'
      },
      enrollment_source:'web'
    });

    await testSeriesPurchase.save();
    console.log(' Test series purchase record created:', testSeriesPurchase._id);

    // Create general purchase record for analytics
    const generalPurchase = new PurchaseModel({
      purchase_type:'test_series',
      customer_id: student_id,
      customer_model:'Student',
      customer_details: {
        name: student_data.name,
        email: student_data.email,
        phone: student_data.phone ||''
      },
      item_id: test_series_id,
      item_model:'TestSeries',
      item_details: {
        name: testSeries.title,
        description: testSeries.description,
        category: testSeries.examinationCategory?.name || testSeries.category,
        type: testSeries.testType ||'practice',
        difficulty: testSeries.difficulty,
        duration: testSeries.duration,
        questions: testSeries.questions?.length || 0
      },
      pricing: {
        base_price: testSeries.price || 0,
        original_price: testSeries.price,
        final_amount: testSeries.price,
        currency:'INR'
      },
      payment_gateway:'razorpay',
      gateway_details: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature
      },
      status:'completed',
      payment_status:'paid',
      payment_completed_at: new Date(),
      delivery_required: false
    });

    await generalPurchase.save();
    console.log(' General purchase record created:', generalPurchase._id);

    // Create notifications for teacher, admin, and student on purchase
    try {
      const studentName = student_data.name || "A Student";
      const studentObjectId = new mongoose.Types.ObjectId(student_id);
      const Notification = require("../Models/NotificationModel");

      // 1. Notify the teacher who created the test series
      if (testSeries.createdBy) {
        const teacherId = testSeries.createdBy._id || testSeries.createdBy;
        await Notification.create({
          recipient: teacherId.toString(),
          recipientModel: 'Teacher',
          sender: studentObjectId,
          senderModel: 'User',
          senderName: studentName,
          type: 'course_upload',
          title: 'New Test Series Enrollment!',
          message: `Congratulations! Student "${studentName}" has purchased your Test Series "${testSeries.title}".`,
          referenceId: testSeries._id
        });
        console.log('Notification triggered for teacher on test series purchase');
      }

      // 2. Notify the admin
      await Notification.create({
        recipient: 'admin',
        recipientModel: 'Admin',
        sender: studentObjectId,
        senderModel: 'User',
        senderName: studentName,
        type: 'course_upload',
        title: 'New Test Series Purchased',
        message: `Student "${studentName}" has purchased the Test Series "${testSeries.title}" for ₹${testSeries.price}.`,
        referenceId: testSeries._id
      });
      console.log('Notification triggered for admin on test series purchase');

      // 3. Notify the student
      await Notification.create({
        recipient: student_id.toString(),
        recipientModel: 'User',
        sender: null,
        senderModel: 'Admin',
        senderName: 'EduDocs Team',
        type: 'general',
        title: 'Test Series Purchased Successfully!',
        message: `You have successfully purchased the Test Series "${testSeries.title}".`,
        referenceId: testSeries._id
      });
      console.log('Notification triggered for student on test series purchase');
    } catch (notifErr) {
      console.error('Failed to trigger notifications on test series purchase:', notifErr);
    }

    // Update test series popularity
    try {
      await TestSeries.findByIdAndUpdate(test_series_id, {
        $inc: { popularity: 1 }
      });
    } catch (updateError) {
      console.warn(' Failed to update test series popularity:', updateError.message);
    }

    res.json({
      success: true,
      message:'Payment successful! You now have access to the test series.',
      purchase_id: testSeriesPurchase._id,
      test_series: {
        id: testSeries._id,
        title: testSeries.title,
        duration: testSeries.duration,
        maxAttempts: testSeries.maxAttempts,
        totalQuestions: testSeries.questions?.length || 0,
        access_granted: true,
        validity_until: testSeriesPurchase.purchase_details.access_expires_at
      },
      hierarchical_context: {
        examination: testSeries.examinationCategory?.name,
        subject: testSeries.subject?.name,
        topic: testSeries.topicCategory?.name
      }
    });

  } catch (error) {
    console.error(' Test series payment verification error:', error);
    res.status(500).json({
      success: false,
      message:'Payment verification failed',
      error: error.message
    });
  }
});

//  Check if student has purchased a test series
router.get('/check-purchase/:testSeriesId', async (req, res) => {
  try {
    const { testSeriesId } = req.params;
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message:'Student ID is required'
      });
    }

    const purchase = await TestSeriesPurchase.findOne({
      student_id,
      test_series_id: testSeriesId,
'purchase_details.payment_status':'completed'
    }).populate('test_series_id','title isPaid maxAttempts');

    if (!purchase) {
      return res.json({
        success: true,
        purchased: false,
        access_granted: false
      });
    }

    const isAccessValid = purchase.isAccessValid();
    const remainingAttempts = purchase.getRemainingAttempts();

    res.json({
      success: true,
      purchased: true,
      access_granted: isAccessValid,
      purchase_date: purchase.purchased_at,
      validity_until: purchase.purchase_details.access_expires_at,
      attempts_used: purchase.attempt_details.attempts_used,
      remaining_attempts: remainingAttempts,
      best_score: purchase.attempt_details.best_score,
      best_percentage: purchase.attempt_details.best_percentage,
      completion_status: purchase.attempt_details.completion_status
    });

  } catch (error) {
    console.error('Check test series purchase error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to check purchase status',
      error: error.message
    });
  }
});

//  Get student's purchased test series
router.get('/my-test-series/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      exam_category,
      subject,
      difficulty,
      search
    } = req.query;

    const matchQuery = {
      student_id: studentId,
'purchase_details.payment_status':'completed'
    };

    // Apply filters
    if (status) {
      matchQuery['attempt_details.completion_status'] = status;
    }

    if (difficulty) {
      matchQuery['test_series_details.difficulty'] = difficulty;
    }

    if (search) {
      matchQuery.$or = [
        {'test_series_details.title': { $regex: search, $options:'i' } },
        {'test_series_details.description': { $regex: search, $options:'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [purchases, total, examCategories, subjects, difficulties] = await Promise.all([
      TestSeriesPurchase.find(matchQuery)
        .populate('test_series_details.examinationCategory','name code year')
        .populate('test_series_details.subject','name code')
        .populate('test_series_details.topicCategory','name code')
        .populate('test_series_details.createdBy','name tname tspecialization')
        .sort({ purchased_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      TestSeriesPurchase.countDocuments(matchQuery),
      TestSeriesPurchase.distinct('test_series_details.examinationCategory', {
        student_id: studentId,
        'purchase_details.payment_status':'completed'
      }),
      TestSeriesPurchase.distinct('test_series_details.subject', {
        student_id: studentId,
        'purchase_details.payment_status':'completed'
      }),
      TestSeriesPurchase.distinct('test_series_details.difficulty', {
        student_id: studentId,
        'purchase_details.payment_status':'completed'
      })
    ]);

    // Transform data for frontend
    const testSeries = purchases.map(purchase => ({
      purchaseId: purchase._id,
      testSeriesId: purchase.test_series_id,
      testSeries: {
        ...purchase.test_series_details,
        hierarchical_context: {
          examination: purchase.test_series_details.examinationCategory,
          subject: purchase.test_series_details.subject,
          topic: purchase.test_series_details.topicCategory
        }
      },
      purchaseDate: purchase.purchased_at,
      amountPaid: purchase.purchase_details.amount_paid,
      accessGranted: purchase.purchase_details.access_granted,
      validityUntil: purchase.purchase_details.access_expires_at,
      attemptsUsed: purchase.attempt_details.attempts_used,
      remainingAttempts: purchase.test_series_details.maxAttempts - purchase.attempt_details.attempts_used,
      bestScore: purchase.attempt_details.best_score,
      bestPercentage: purchase.attempt_details.best_percentage,
      completionStatus: purchase.attempt_details.completion_status,
      lastAttempt: purchase.attempt_details.last_attempt_date,
      totalTimeSpent: purchase.attempt_details.total_time_spent
    }));

    res.json({
      success: true,
      testSeries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        examCategories,
        subjects,
        difficulties
      },
      stats: {
        totalPurchased: total,
        completed: testSeries.filter(t => t.completionStatus ==='completed').length,
        inProgress: testSeries.filter(t => t.completionStatus ==='in_progress').length,
        notStarted: testSeries.filter(t => t.completionStatus ==='not_started').length,
        totalSpent: testSeries.reduce((sum, t) => sum + t.amountPaid, 0),
        totalTimeSpent: testSeries.reduce((sum, t) => sum + (t.totalTimeSpent || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get my test series error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch purchased test series',
      error: error.message
    });
  }
});

//  Update attempt details after test completion
router.post('/update-attempt/:purchaseId', authMiddleware, async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const {
      score,
      percentage,
      time_spent,
      completion_status ='completed'
    } = req.body;

    const purchase = await TestSeriesPurchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:'Purchase record not found'
      });
    }

    // Update attempt details
    const updateData = {
'attempt_details.attempts_used': purchase.attempt_details.attempts_used + 1,
'attempt_details.last_attempt_date': new Date(),
'attempt_details.completion_status': completion_status
    };

    if (time_spent) {
      updateData['attempt_details.total_time_spent'] =
        (purchase.attempt_details.total_time_spent || 0) + time_spent;
    }

    if (score > purchase.attempt_details.best_score) {
      updateData['attempt_details.best_score'] = score;
    }

    if (percentage > purchase.attempt_details.best_percentage) {
      updateData['attempt_details.best_percentage'] = percentage;
    }

    await TestSeriesPurchase.findByIdAndUpdate(purchaseId, updateData);

    res.json({
      success: true,
      message:'Attempt details updated successfully'
    });

  } catch (error) {
    console.error('Update attempt error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update attempt details',
      error: error.message
    });
  }
});

module.exports = router;
