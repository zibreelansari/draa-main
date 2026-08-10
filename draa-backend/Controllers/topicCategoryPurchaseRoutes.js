const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const TopicCategory = require('../Models/Topic.models');
const TopicCategoryPurchase = require('../Models/TopicCategoryPurchaseModel');
const TestSeries = require('../Models/TestSeriesModels');
const PurchaseModel = require('../Models/purchaseModels');
const { authMiddleware } = require('../Middlewares/student.auth.middleware')
const { sendTopicPurchaseMail } = require("../utils/sendTopicPurchaseMail");
const mongoose = require("mongoose");
const CoinTransaction = require("../Models/CoinTransaction");

const COIN_VALUE = 0.10; // 1 coin = 0.10

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});


// Helper function to generate short receipt
const generateShortReceipt = (topicId, studentId) => {
  const timestamp = Date.now().toString().slice(-8);
  const topicHash = topicId.slice(-6);
  const studentHash = studentId.slice(-6);
  return `TOPIC_${topicHash}_S${studentHash}_${timestamp}`;
};


// Helper to safely get examination_category_id from topic
const getExaminationCategoryId = async (topic) => {
  try {
    // Try different possible field names
    if (topic.examination_category_id) {
      return topic.examination_category_id;
    }
    if (topic.examinationCategory) {
      return topic.examinationCategory;
    }
    if (topic.examination) {
      return topic.examination;
    }

    // If topic has subject, try to get exam from subject
    if (topic.subject) {
      const Subject = require('../Models/Subject.models');
      const subject = await Subject.findById(topic.subject);
      if (subject && subject.examination_category_id) {
        return subject.examination_category_id;
      }
      if (subject && subject.examinationCategory) {
        return subject.examinationCategory;
      }
    }

    return null;
  } catch (error) {
    console.log(' Could not get examination_category_id:', error.message);
    return null;
  }
};


// FREE PURCHASE ENDPOINT (No Razorpay)
router.post('/create-free-purchase', authMiddleware, async (req, res) => {
  try {
    const { type, item_id, student_data } = req.body;

    console.log(' FREE PURCHASE REQUEST:', { type, item_id, student_data });

    //  Validate student
    if (!student_data || !student_data.id || !student_data.email || !student_data.name) {
      return res.json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    if (!type || !item_id) {
      return res.json({
        success: false,
        message:'type and item_id are required'
      });
    }

    const student_id = student_data.id;

    //  GET ITEM (CATEGORY / SUBJECT)
    let item;
    let item_model;

    if (type ==="category") {
      const ExaminationCategory = require('../Models/ExaminationCategory.models');
      item = await ExaminationCategory.findById(item_id);
      item_model ="ExaminationCategory";
    }

    if (type ==="subject") {
      const Subject = require('../Models/Subject.models');
      item = await Subject.findById(item_id);
      item_model ="Subject";
    }

    if (!item) {
      return res.json({
        success: false,
        message:'Item not found'
      });
    }

    console.log(' Item found:', item.name);

    //  ONLY FREE ALLOWED
    if (item.isPaid && item.price > 0) {
      return res.json({
        success: false,
        message:'This is a paid item. Use payment flow.'
      });
    }

    //  CHECK EXISTING PURCHASE
    const existingPurchase = await PurchaseModel.findOne({
      customer_id: student_id,
      item_id,
      purchase_type: type,
      payment_status:'paid'
    });

    if (existingPurchase) {
      return res.json({
        success: false,
        message:'Already purchased',
        already_purchased: true
      });
    }

    //  COUNT TESTS
    let totalTests = 0;

    if (type ==="category") {
      totalTests = await TestSeries.countDocuments({
        examinationCategory: item_id,
        status:'approved',
        isActive: true
      });
    }

    if (type ==="subject") {
      totalTests = await TestSeries.countDocuments({
        subject: item_id,
        status:'approved',
        isActive: true
      });
    }

    console.log(' Total tests:', totalTests);

    //  CREATE PURCHASE (MAIN MODEL)
    const purchase = new PurchaseModel({
      purchase_type: type,
      customer_id: student_id,
      customer_model:'Student',

      customer_details: {
        name: student_data.name,
        email: student_data.email,
        phone: student_data.phone ||''
      },

      item_id: item_id,
      item_model,

      item_details: {
        name: item.name,
        description: item.description ||'',
        category: type,
        sku: item.code ||'N/A'
      },

      pricing: {
        base_price: 0,
        original_price: 0,
        discount_amount: 0,
        gst_amount: 0,
        coin_discount: 0,
        final_amount: 0,
        currency:'INR'
      },

      payment_gateway:'free',

      gateway_details: {
        order_id:'FREE_' + Date.now(),
        payment_id:'FREE_' + Date.now(),
        signature:'free_purchase'
      },

      status:'completed',
      payment_status:'free',
      payment_completed_at: new Date(),

      access_details: {
        granted: true,
        granted_at: new Date()
      }
    });

    await purchase.save();

    console.log(' Purchase created:', purchase._id);

    //  SEND EMAIL (OPTIONAL FIX)
    try {
      await sendTopicPurchaseMail({
        studentName: student_data.name,
        email: student_data.email,
        topicName: item.name,
        totalTests,
        amount: 0,
        orderId: purchase.gateway_details.order_id
      });
    } catch (e) {
      console.log(' Email failed (ignored):', e.message);
    }

    //  RESPONSE
    res.json({
      success: true,
      message: ` Free access granted! ${totalTests} tests unlocked`,
      purchase_id: purchase._id,
      item: {
        id: item._id,
        name: item.name,
        totalTests,
        access_granted: true,
        amount_paid: 0
      }
    });

  } catch (error) {
    console.error(' FREE PURCHASE ERROR:', error);

    res.json({
      success: false,
      message:'Failed to process free purchase',
      error: error.message
    });
  }
});


// STEP 1: Create Razorpay Order for TOPIC Purchase
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { type, item_id, student_data, coins_used = 0 } = req.body;

    console.log(' Create order:', { type, item_id });

    if (!student_data || !student_data.id) {
      return res.status(400).json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    if (!type || !item_id) {
      return res.status(400).json({
        success: false,
        message:'type and item_id required'
      });
    }

    const student_id = student_data.id;

    //  GET ITEM
    let item;
    let item_model;

    if (type ==="category") {
      const ExaminationCategory = require('../Models/ExaminationCategory.models');
      item = await ExaminationCategory.findById(item_id);
      item_model ="ExaminationCategory";
    }

    if (type ==="subject") {
      const Subject = require('../Models/Subject.models');
      item = await Subject.findById(item_id);
      item_model ="Subject";
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message:'Item not found'
      });
    }

    if (!item.isPaid || !item.price || item.price <= 0) {
      return res.status(400).json({
        success: false,
        message:'This item is free'
      });
    }

    //  CHECK EXISTING PURCHASE
    const existing = await PurchaseModel.findOne({
      customer_id: student_id,
      item_id,
      purchase_type: type,
      payment_status:'paid'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:'Already purchased'
      });
    }

    //  TEST COUNT
    let totalTests = 0;

    if (type ==="category") {
      totalTests = await TestSeries.countDocuments({
        examinationCategory: item_id,
        status:'approved',
        isActive: true
      });
    }

    if (type ==="subject") {
      totalTests = await TestSeries.countDocuments({
        subject: item_id,
        status:'approved',
        isActive: true
      });
    }

    //  GST
    const GST_RATE = 0.18;

    const basePrice = Number(item.price);
    const totalAmount = Math.round(basePrice * (1 + GST_RATE));
    const gstAmount = totalAmount - basePrice;

    //  COINS
    const studentObjectId = new mongoose.Types.ObjectId(student_id);

    const credits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"credit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const debits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"debit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const balance = (credits[0]?.total || 0) - (debits[0]?.total || 0);

    let safeCoinsUsed = Math.max(0, Number(coins_used) || 0);

    if (safeCoinsUsed > balance) safeCoinsUsed = balance;

    let coinDiscount = Math.floor(safeCoinsUsed * COIN_VALUE);

    if (coinDiscount > totalAmount) coinDiscount = totalAmount;

    const finalAmount = totalAmount - coinDiscount;

    console.log(" Pricing:", {
      basePrice,
      gstAmount,
      totalAmount,
      coinDiscount,
      finalAmount
    });

    //  RECEIPT
    const shortId = item_id.toString().slice(-8); // last 8 chars
    const receipt = `${type}_${shortId}_${Date.now().toString().slice(-6)}`;

    //  RAZORPAY ORDER
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency:'INR',
      receipt,
      notes: {
        purchase_type: type,
        item_id: item_id.toString(),
        student_id: student_id.toString(),
        item_name: item.name,
        total_tests: totalTests,
        base_price: basePrice,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        coins_used: safeCoinsUsed,
        coin_discount: coinDiscount
      }
    });

    //  RESPONSE
    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt,

      pricing: {
        base_price: basePrice,
        gst_amount: gstAmount,
        coin_discount: coinDiscount,
        final_amount: finalAmount,
        currency:'INR'
      },

      item: {
        id: item._id,
        name: item.name,
        price: basePrice,
        totalTests
      }
    });

  } catch (error) {
    console.error(' Create order error:', error);

    res.status(500).json({
      success: false,
      message:'Failed to create payment order',
      error: error.message
    });
  }
});


// STEP 2: Verify Payment & Complete TOPIC Purchase
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const {
      type,
      item_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_data,
      coins_used = 0
    } = req.body;

    if (!student_data || !student_data.id) {
      return res.status(400).json({
        success: false,
        message:'Student authentication required'
      });
    }

    const student_id = student_data.id;

    //  VERIFY SIGNATURE
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:'Invalid payment signature'
      });
    }

    console.log(' Payment verified');

    //  GET ITEM
    let item;
    let item_model;

    if (type ==="category") {
      const ExaminationCategory = require('../Models/ExaminationCategory.models');
      item = await ExaminationCategory.findById(item_id);
      item_model ="ExaminationCategory";
    }

    if (type ==="subject") {
      const Subject = require('../Models/Subject.models');
      item = await Subject.findById(item_id);
      item_model ="Subject";
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message:'Item not found'
      });
    }

    //  PRICING
    const GST_RATE = 0.18;

    const basePrice = Number(item.price);
    const totalAmount = Math.round(basePrice * (1 + GST_RATE));
    const gstAmount = totalAmount - basePrice;

    //  COINS
    const studentObjectId = new mongoose.Types.ObjectId(student_id);

    const credits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"credit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const debits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"debit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const balance = (credits[0]?.total || 0) - (debits[0]?.total || 0);

    let safeCoinsUsed = Math.min(balance, Math.max(0, Number(coins_used)));

    let coinDiscount = Math.floor(safeCoinsUsed * COIN_VALUE);
    if (coinDiscount > totalAmount) coinDiscount = totalAmount;

    const finalAmount = totalAmount - coinDiscount;

    //  TEST COUNT
    let totalTests = 0;

    if (type ==="category") {
      totalTests = await TestSeries.countDocuments({
        examinationCategory: item_id,
        status:'approved',
        isActive: true
      });
    }

    if (type ==="subject") {
      totalTests = await TestSeries.countDocuments({
        subject: item_id,
        status:'approved',
        isActive: true
      });
    }

    //  SAVE COIN TRANSACTION
    if (safeCoinsUsed > 0) {
      await CoinTransaction.create({
        user: studentObjectId,
        amount: safeCoinsUsed,
        type:"debit",
        source:"purchase",
        referenceId: new mongoose.Types.ObjectId(),
        description: `Coins used | Order: ${razorpay_order_id}`
      });
    }

    //  CREATE PURCHASE (FINANCIAL RECORD)
    const purchase = new PurchaseModel({
      purchase_type: type,
      customer_id: student_id,
      customer_model:'Student',

      customer_details: {
        name: student_data.name,
        email: student_data.email
      },

      item_id,
      item_model,

      item_details: {
        name: item.name,
        description: item.description ||''
      },

      pricing: {
        base_price: basePrice,
        gst_amount: gstAmount,
        coin_discount: coinDiscount,
        final_amount: finalAmount,
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

      access_details: {
        granted: true,
        granted_at: new Date()
      }
    });

    await purchase.save();

    console.log(' Purchase saved:', purchase._id);

    //  CREATE ENROLLMENT (ACCESS CONTROL)
    const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');

    const enrollment = new TestSeriesEnrollment({
      student_id,
      purchase_type: type,

      examination_category_id: type ==="category" ? item_id : null,
      subject_id: type ==="subject" ? item_id : null,

      item_snapshot: {
        name: item.name,
        code: item.code,
        description: item.description
      },

      pricing: {
        base_price: basePrice,
        discount_amount: 0,
        gst_amount: gstAmount,
        coin_discount: coinDiscount,
        final_amount: finalAmount
      },

      payment: {
        gateway:"razorpay",
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status:"paid"
      },

      access: {
        granted: true,
        granted_at: new Date()
      }
    });

    await enrollment.save();

    console.log(' Enrollment created:', enrollment._id);

    //  EMAIL
    try {
      await sendTopicPurchaseMail({
        studentName: student_data.name,
        email: student_data.email,
        topicName: item.name,
        totalTests,
        amount: finalAmount,
        orderId: razorpay_order_id
      });
    } catch (e) { }

    //  RESPONSE
    res.json({
      success: true,
      message: ` Payment successful! ${totalTests} tests unlocked`,
      purchase_id: purchase._id,
      enrollment_id: enrollment._id
    });

  } catch (error) {
    console.error(' Verify payment error:', error);

    res.status(500).json({
      success: false,
      message:'Payment verification failed',
      error: error.message
    });
  }
});


//  NEW: Bulk purchase check (ONE CALL for all subjects in an exam)
router.get('/check-bulk-purchase', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subjectIds, student_id } = req.query;

    if (!student_id || !categoryId) {
      return res.status(400).json({ success: false, message:'student_id and categoryId are required' });
    }

    const sIds = Array.isArray(subjectIds) ? subjectIds : (subjectIds ? subjectIds.split(',') : []);

    const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');

    // 1. Check Category Purchase
    const categoryEnrollment = await TestSeriesEnrollment.findOne({
      student_id,
      purchase_type:'category',
      examination_category_id: categoryId,
"access.granted": true
    });

    const isCategoryPurchased = !!categoryEnrollment;

    // 2. Check Subject Purchases (Only if category NOT purchased)
    let purchasedSubjectIds = [];
    if (isCategoryPurchased) {
      purchasedSubjectIds = sIds; // All unlocked
    } else if (sIds.length > 0) {
      const subjectEnrollments = await TestSeriesEnrollment.find({
        student_id,
        purchase_type:'subject',
        subject_id: { $in: sIds },
"access.granted": true
      }).select('subject_id');

      purchasedSubjectIds = subjectEnrollments.map(e => e.subject_id.toString());
    }

    res.json({
      success: true,
      categoryPurchased: isCategoryPurchased,
      purchasedSubjectIds
    });

  } catch (error) {
    console.error(' Bulk check error:', error);
    res.status(500).json({ success: false, message:'Failed to check bulk purchase' });
  }
});

// Check if student has purchased a TOPIC
router.get('/check-purchase', authMiddleware, async (req, res) => {
  try {
    const { type, item_id, student_id } = req.query;

    if (!student_id || !type || !item_id) {
      return res.status(400).json({
        success: false,
        message:'student_id, type, item_id are required'
      });
    }

    const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');

    //  FIND ENROLLMENT
    let query = {
      student_id,
      purchase_type: type,
"access.granted": true
    };

    if (type ==="category") {
      query.examination_category_id = item_id;
    }

    if (type ==="subject") {
      query.subject_id = item_id;
    }

    const enrollment = await TestSeriesEnrollment.findOne(query);

    if (!enrollment) {
      return res.json({
        success: true,
        purchased: false,
        access_granted: false
      });
    }

    //  CHECK VALIDITY
    let isAccessValid = true;

    if (enrollment.access?.expires_at) {
      isAccessValid = new Date() < new Date(enrollment.access.expires_at);
    }

    //  RESPONSE
    res.json({
      success: true,
      purchased: true,
      access_granted: isAccessValid,

      purchase_date: enrollment.createdAt,
      validity_until: enrollment.access?.expires_at,

      item: {
        name: enrollment.item_snapshot?.name,
        purchase_type: enrollment.purchase_type
      },

      usage: {
        total_tests_attempted: enrollment.usage?.total_tests_attempted || 0,
        total_time_spent: enrollment.usage?.total_time_spent || 0
      }
    });

  } catch (error) {
    console.error(' Check purchase error:', error);

    res.status(500).json({
      success: false,
      message:'Failed to check purchase status',
      error: error.message
    });
  }
});


// Check if student has access to a specific TEST
router.get('/check-test-access/:testSeriesId', async (req, res) => {
  try {
    const { testSeriesId } = req.params;
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message:'Student ID is required'
      });
    }

    //  Get test with subject + category
    const testSeries = await TestSeries.findById(testSeriesId)
      .populate({
        path:'topicCategory',
        select:'subject',
        populate: {
          path:'subject',
          select:'examinationCategory'
        }
      })
      .select('title topicCategory');

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message:'Test series not found'
      });
    }

    const subjectId = testSeries.topicCategory?.subject?._id;
    const categoryId = testSeries.topicCategory?.subject?.examinationCategory;

    const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');

    //  CHECK CATEGORY ACCESS (FULL UNLOCK)
    const categoryAccess = await TestSeriesEnrollment.findOne({
      student_id,
      purchase_type:'category',
      examination_category_id: categoryId,
"access.granted": true
    });

    if (categoryAccess) {
      return res.json({
        success: true,
        has_access: true,
        access_type:'category',
        test_title: testSeries.title,
        validity_until: categoryAccess.access?.expires_at
      });
    }

    //  CHECK SUBJECT ACCESS
    const subjectAccess = await TestSeriesEnrollment.findOne({
      student_id,
      purchase_type:'subject',
      subject_id: subjectId,
"access.granted": true
    });

    if (subjectAccess) {
      return res.json({
        success: true,
        has_access: true,
        access_type:'subject',
        test_title: testSeries.title,
        validity_until: subjectAccess.access?.expires_at
      });
    }

    //  NO ACCESS
    return res.json({
      success: true,
      has_access: false,
      access_type:'locked',
      message:'Please purchase subject or full course to access this test'
    });

  } catch (error) {
    console.error(' Check test access error:', error);

    res.status(500).json({
      success: false,
      message:'Failed to check test access',
      error: error.message
    });
  }
});


// Get student's purchased topics
router.get('/my-purchases/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');

    //  FETCH ENROLLMENTS
    const enrollments = await TestSeriesEnrollment.find({
      student_id: studentId,
"access.granted": true
    })
      .populate({ path:'examination_category_id', select:'name' })
      .populate({ 
        path:'subject_id', 
        select:'name examinationCategory',
        populate: { path:'examinationCategory', select:'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await TestSeriesEnrollment.countDocuments({
      student_id: studentId,
"access.granted": true
    });

    //  FORMAT RESPONSE & COUNT TESTS
    const purchases = [];
    
    for (const enrollment of enrollments) {
      let totalTests = 0;
      let examName ="General";
      let subjectName ="Full Course";

      if (enrollment.purchase_type ==="category") {
        totalTests = await TestSeries.countDocuments({
          examinationCategory: enrollment.examination_category_id?._id || enrollment.examination_category_id,
          status:'approved',
          isActive: true
        });
        examName = enrollment.examination_category_id?.name || enrollment.item_snapshot?.name ||"N/A";
        
        // Fetch all subjects belonging to this category to display particular subjects
        try {
          const Subject = require('../Models/Subject.models');
          const subjects = await Subject.find({
            examinationCategory: enrollment.examination_category_id?._id || enrollment.examination_category_id,
            isActive: true
          }).select('name').lean();
          if (subjects.length > 0) {
            subjectName = subjects.map(s => s.name).join(', ');
          } else {
            subjectName = "All Subjects";
          }
        } catch (err) {
          console.error("Error fetching category subjects:", err);
          subjectName = "All Subjects";
        }
      } else if (enrollment.purchase_type ==="subject") {
        totalTests = await TestSeries.countDocuments({
          subject: enrollment.subject_id?._id || enrollment.subject_id,
          status:'approved',
          isActive: true
        });
        examName = enrollment.subject_id?.examinationCategory?.name ||"General";
        subjectName = enrollment.subject_id?.name || enrollment.item_snapshot?.name ||"N/A";
      }

      purchases.push({
        enrollmentId: enrollment._id,
        type: enrollment.purchase_type,

        item: {
          id:
            enrollment.purchase_type ==="category"
              ? enrollment.examination_category_id?._id
              : enrollment.subject_id?._id,

          name: enrollment.item_snapshot?.name,
          code: enrollment.item_snapshot?.code,
          description: enrollment.item_snapshot?.description,
          subject: subjectName,
          examination: examName
        },

        purchaseDate: enrollment.createdAt,
        totalTests,

        pricing: {
          base_price: enrollment.pricing?.base_price || 0,
          final_amount: enrollment.pricing?.final_amount || 0,
          currency: enrollment.pricing?.currency ||'INR'
        },

        access: {
          granted: enrollment.access?.granted,
          granted_at: enrollment.access?.granted_at,
          expires_at: enrollment.access?.expires_at
        },

        usage: {
          total_tests_attempted: enrollment.usage?.total_tests_attempted || 0,
          total_time_spent: enrollment.usage?.total_time_spent || 0
        }
      });
    }

    //  RESPONSE
    res.json({
      success: true,
      purchases,

      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },

      stats: {
        totalPurchases: total,
        totalSpent: purchases.reduce((sum, p) => sum + (p.pricing.final_amount || 0), 0)
      }
    });

  } catch (error) {
    console.error(' Get purchases error:', error);

    res.status(500).json({
      success: false,
      message:'Failed to fetch purchases',
      error: error.message
    });
  }
});


// Update test attempt after completion
router.post('/update-test-attempt/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const {
      test_series_id,
      test_title,
      score,
      percentage,
      time_spent,
      completion_status ='completed'
    } = req.body;

    const purchase = await TopicCategoryPurchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:'Purchase record not found'
      });
    }

    if (purchase.updateTestAttempt) {
      await purchase.updateTestAttempt(test_series_id, {
        test_title,
        score,
        percentage,
        time_spent,
        completion_status
      });
    }

    res.json({
      success: true,
      message:'Test attempt updated successfully'
    });

  } catch (error) {
    console.error('Update test attempt error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update test attempt',
      error: error.message
    });
  }
});


module.exports = router;