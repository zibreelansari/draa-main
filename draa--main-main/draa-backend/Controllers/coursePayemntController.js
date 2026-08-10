const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../Models/CourseModel');
const StudentCoursePurchase = require('../Models/studentCoursePurchaseModels');
const PurchaseModel = require('../Models/purchaseModels');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');
const { sendCoursePurchaseMail } = require("../utils/sendCoursePurchaseMail");
const CoinTransaction = require("../Models/CoinTransaction");
const CourseProgress = require("../Models/CourseProgressModels");
const mongoose = require("mongoose");
const GST_RATE = 0.18;

// routes protected
// router.use(authMiddleware);


// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

//  Helper function to generate short receipt
const generateShortReceipt = (courseId, studentId) => {
  const timestamp = Date.now().toString().slice(-8);
  const courseHash = courseId.slice(-6);
  const studentHash = studentId.slice(-6);
  return `C${courseHash}_S${studentHash}_${timestamp}`;
};

//  STEP 1: Create Razorpay Order (Just creates order, no database records yet)
router.post('/create-order', authMiddleware, async (req, res) => {
  try {

    console.log("Creating Razorpay order...");

    const { course_id, student_data, coins_used = 0 } = req.body;

    const COIN_VALUE = 0.10;
    const MIN_COINS = 100;

    if (!student_data || !student_data.id || !student_data.email || !student_data.name) {
      return res.status(401).json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    const student_id = student_data.id;
    const studentObjectId = new mongoose.Types.ObjectId(student_id);
    console.log(' Creating Razorpay order for student:', student_id, student_data.name);

    const course = await Course.findById(course_id).populate('teacher_id');

    if (!course) {
      return res.status(404).json({
        success: false,
        message:'Course not found'
      });
    }

    const teacherName = course.teacher_id?.tname ||"Admin";
    const teacherId = course.teacher_id?._id || null;

    const existingPurchase = await StudentCoursePurchase.findOne({
      student_id,
      course_id,
'purchase_details.payment_status':'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message:'You have already purchased this course'
      });
    }

    // ===============================
    // ORIGINAL PRICE
    // ===============================

    const basePrice = Number(course.price);
    const gstAmount = Number((basePrice * GST_RATE).toFixed(2));
    const totalAmount = Number((basePrice + gstAmount).toFixed(2));

    // ===============================
    // COIN DISCOUNT
    // ===============================

    let coinDiscount = 0;

    if (coins_used >= MIN_COINS) {
      coinDiscount = Number((coins_used * COIN_VALUE).toFixed(2));
    }

    const finalAmount = Math.max(totalAmount - coinDiscount, 0);

    console.log(" Pricing Calculation:");
    console.log("Base Price:", basePrice);
    console.log("GST (18%):", gstAmount);
    console.log("Total Amount:", totalAmount);
    console.log("Coins Used:", coins_used);
    console.log("Coin Discount:", coinDiscount);
    console.log("Final Amount:", finalAmount);

    const shortReceipt = generateShortReceipt(course_id, student_id);

    const razorpayOptions = {

      amount: Math.round(finalAmount * 100),

      currency:'INR',
      receipt: shortReceipt,

      notes: {
        course_id: course_id.toString(),
        student_id: student_id.toString(),
        course_title: course.title.substring(0, 50),
        student_name: student_data.name.substring(0, 30),
        student_email: student_data.email,
        teacher_id: teacherId ? teacherId.toString() :"Admin",
        teacher_name: teacherName,

        base_price: basePrice,
        gst_amount: gstAmount,
        total_amount: totalAmount,

        coins_used: coins_used,
        coin_discount: coinDiscount,
        final_amount: finalAmount
      }
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,

      pricing: {
        basePrice,
        gstAmount,
        totalAmount,
        coinDiscount,
        finalAmount
      },

      course: {
        id: course._id,
        title: course.title,
        price: basePrice,
        teacherId,
        teacherName
      }
    });

  } catch (error) {

    console.error(' Create Razorpay order error:', error);

    res.status(500).json({
      success: false,
      message:'Failed to create payment order',
      error: error.message || error.toString()
    });

  }
});


//  STEP 2: Verify Payment & Complete Purchase (After payment is done)
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {

    const COIN_VALUE = 0.10;
    const MIN_COINS = 100;

    let {
      course_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_data,
      coins_used = 0
    } = req.body;

    coins_used = Number(coins_used);

    if (!student_data || !student_data.id || !student_data.email || !student_data.name) {
      return res.status(401).json({
        success: false,
        message:'Student authentication data is required'
      });
    }

    const student_id = student_data.id;
    const studentObjectId = new mongoose.Types.ObjectId(student_id);
    console.log(' Verifying payment for student:', student_id);

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error(' Signature verification failed!');
      return res.status(400).json({
        success: false,
        message:'Payment verification failed - Invalid signature'
      });
    }

    console.log(' Signature verification successful');

    const course = await Course.findById(course_id).populate('teacher_id');

    if (!course) {
      return res.status(404).json({
        success: false,
        message:'Course not found'
      });
    }

    const basePrice = Number(course.price);
    const gstAmount = Number((basePrice * GST_RATE).toFixed(2));
    const totalAmount = Number((basePrice + gstAmount).toFixed(2));

    let coinDiscount = 0;

    if (coins_used >= MIN_COINS) {
      coinDiscount = Number((coins_used * COIN_VALUE).toFixed(2));
    }

    const finalAmount = Math.max(totalAmount - coinDiscount, 0);

    console.log(" Payment Breakdown:");
    console.log("Base Price:", basePrice);
    console.log("GST:", gstAmount);
    console.log("Coins Used:", coins_used);
    console.log("Coin Discount:", coinDiscount);
    console.log("Final Paid:", finalAmount);

    // ==============================
    // CHECK USER COIN BALANCE
    // ==============================

    const credits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"credit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const debits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"debit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const creditTotal = credits[0]?.total || 0;
    const debitTotal = debits[0]?.total || 0;

    const balance = creditTotal - debitTotal;

    if (coins_used > balance) {
      return res.status(400).json({
        success: false,
        message:"Insufficient coin balance"
      });
    }


    // ==============================
    // STEP 3.5: SAVE COIN DEBIT TRANSACTION
    // ==============================

    if (coins_used >= MIN_COINS && coinDiscount > 0) {

      console.log(`Deducting ${coins_used} coins from student ${student_id}`);

      await CoinTransaction.create({
        user: studentObjectId,
        amount: coins_used,
        type:"debit",
        source:"purchase",
        referenceId: course_id,
        description: `Coins used for purchasing course ${course.title}`
      });

    }
    const purchaseRecord = new StudentCoursePurchase({

      student_id,

      student_details: {
        name: student_data.name,
        email: student_data.email,
        phone: student_data.phone ||''
      },

      course_id,

      course_details: {
        title: course.title,
        short_desc: course.short_desc,
        long_desc: course.long_desc,
        price: basePrice,
        duration: course.duration,
        teacher_id: course.teacher_id._id,

        teacher_details: {
          tname: course.teacher_id.tname,
          temail: course.teacher_id.temail,
          tspecialization: course.teacher_id.tspecialization,
          tprofile: course.teacher_id.tprofile
        },

        coverphoto: course.coverphoto,
        youtube_link: course.youtube_link,
        language: course.language,
        skill_level: course.skill_level,
        chapters: course.chapters,
        course_category: course.course_category
      },

      purchase_details: {
        base_price: basePrice,
        gst_amount: gstAmount,
        amount_paid: finalAmount,
        coins_used: coins_used,
        coin_discount: coinDiscount,
        currency:'INR',
        payment_status:'completed',
        purchase_date: new Date(),
        access_granted: true,
        access_granted_date: new Date()
      },

      razorpay_details: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status:'captured'
      },

      enrollment_source:'web'
    });

    await purchaseRecord.save();

    console.log(' StudentCoursePurchase record created:', purchaseRecord._id);

    const generalPurchase = new PurchaseModel({

      purchase_type:'course',

      customer_id: student_id,
      customer_model:'Student',

      customer_details: {
        name: student_data.name,
        email: student_data.email,
        phone: student_data.phone ||''
      },

      item_id: course_id,
      item_model:'Course',

      item_details: {
        name: course.title,
        description: course.short_desc,
        category: course.course_category,
        image: course.coverphoto
      },

      pricing: {
        base_price: basePrice,
        original_price: basePrice,
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
      payment_completed_at: new Date()
    });

    await generalPurchase.save();

    console.log(' General purchase record created:', generalPurchase._id);

    // Create notifications for teacher, admin, and student
    try {
      const Notification = require("../Models/NotificationModel");
      const studentName = student_data.name || "A Student";

      // 1. Notify the teacher
      if (course.teacher_id) {
        const teacherId = course.teacher_id._id || course.teacher_id;
        await Notification.create({
          recipient: teacherId.toString(),
          recipientModel: 'Teacher',
          sender: studentObjectId,
          senderModel: 'User',
          senderName: studentName,
          type: 'course_upload',
          title: 'New Course Enrollment!',
          message: `New Student enrollment: Student "${studentName}" has purchased your course "${course.title}".`,
          referenceId: course._id
        });
        console.log('Notification triggered for teacher on course purchase');
      }

      // 2. Notify the admin
      await Notification.create({
        recipient: 'admin',
        recipientModel: 'Admin',
        sender: studentObjectId,
        senderModel: 'User',
        senderName: studentName,
        type: 'course_upload',
        title: 'New Course Purchased',
        message: `Student "${studentName}" has purchased the course "${course.title}" for ₹${finalAmount}.`,
        referenceId: course._id
      });
      console.log('Notification triggered for admin on course purchase');

      // 3. Notify the student
      await Notification.create({
        recipient: student_id.toString(),
        recipientModel: 'User',
        sender: null,
        senderModel: 'Admin',
        senderName: 'EduDocs Team',
        type: 'general',
        title: 'Course Purchased Successfully!',
        message: `You have successfully purchased the course "${course.title}". You now have full access to it.`,
        referenceId: course._id
      });
      console.log('Notification triggered for student on course purchase');
    } catch (notifErr) {
      console.error('Failed to trigger notifications on course purchase:', notifErr);
    }

    try {
      await sendCoursePurchaseMail({
        studentName: student_data.name,
        email: student_data.email,
        courseTitle: course.title,
        amount: finalAmount,
        orderId: razorpay_order_id
      });
      console.log(' Course purchase email sent to', student_data.email);
    } catch (mailErr) {
      // Email is a nice-to-have, NOT a precondition for course access.
      // The purchase record, enrollment, notifications and progress are already
      // saved above — log the mail error so it can be retried, but DO NOT
      // fail the whole payment verification for the student.
      console.error(' Failed to send course purchase email (non-fatal):', mailErr.message);
      try {
        const { logActivity } = require("../utils/activityLogger");
        await logActivity({
          req,
          actionType: 'system_event',
          description: `Email send failed for course purchase — student="${student_data.name}", course="${course.title}", order=${razorpay_order_id}`,
          status: 'failure',
          metadata: { error: mailErr.message, orderId: razorpay_order_id }
        });
      } catch (_) { /* ignore secondary logging failure */ }
    }

    await Course.findByIdAndUpdate(course_id, {
      $inc: { enrolled_count: 1 }
    });

    // Initialize Course Progress record
    try {
      const newProgress = new CourseProgress({
        student_id,
        course_id,
        student_details: {
          name: student_data.name,
          email: student_data.email
        },
        course_details: {
          title: course.title,
          duration: course.duration || 0,
          total_chapters: course.chapters?.length || 0
        },
        enrolled_at: new Date(),
        purchase_id: purchaseRecord._id,
        learning_sessions: []
      });
      await newProgress.save();
      console.log(' CourseProgress record initialized');
    } catch (progressError) {
      // Log error but don't fail the whole payment verification
      // Progress will still be initialized when the student first accesses the course via the frontend
      console.error(' Failed to initialize CourseProgress:', progressError.message);
    }

    // Log successful course purchase
    try {
      const { logActivity } = require("../utils/activityLogger");
      await logActivity({
        req,
        actionType: 'purchase',
        description: `Student "${student_data.name}" successfully purchased course "${course.title}" for ₹${finalAmount}`,
        status: 'success',
        metadata: {
          purchaseType: 'course',
          courseId: course_id,
          amount: finalAmount,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        }
      });
    } catch (logErr) {
      console.error('Failed to log course purchase activity:', logErr);
    }

    res.json({
      success: true,
      message:'Payment verified and course purchased successfully!',
      purchase_id: purchaseRecord._id,
      course_title: course.title,
      access_granted: true,

      pricing: {
        basePrice,
        gstAmount,
        coinDiscount,
        finalAmount
      }
    });

  } catch (error) {

    console.error(' Payment verification error:', error);

    // Log course purchase failure
    try {
      const { logActivity } = require("../utils/activityLogger");
      await logActivity({
        req,
        actionType: 'purchase',
        description: `Failed payment verification for course: "${req.body?.course_id || 'Unknown Course'}"`,
        status: 'failure',
        metadata: {
          error: error.message,
          orderId: req.body?.razorpay_order_id,
          paymentId: req.body?.razorpay_payment_id
        }
      });
    } catch (logErr) {
      console.error('Failed to log course purchase verification failure:', logErr);
    }

    res.status(500).json({
      success: false,
      message:'Payment verification failed',
      error: error.message || error.toString()
    });

  }
});

//  Check if student has purchased a course
router.get('/check-purchase/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message:'Student ID is required'
      });
    }

    const purchase = await StudentCoursePurchase.findOne({
      student_id,
      course_id: courseId,
'purchase_details.payment_status':'completed',
'purchase_details.access_granted': true
    });

    res.json({
      success: true,
      purchased: !!purchase,
      purchase_date: purchase ? purchase.createdAt : null,
      access_granted: purchase ? purchase.purchase_details.access_granted : false
    });

  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to check purchase status',
      error: error.message
    });
  }
});



//  Get student's purchased courses with full details
router.get('/my-courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, category, search } = req.query;

    // Build query
    let matchQuery = {
      student_id: studentId,
'purchase_details.payment_status':'completed',
'purchase_details.access_granted': true
    };

    // Add category filter
    if (category && category !=='all') {
      matchQuery['course_details.course_category'] = category;
    }

    // Add search filter
    if (search) {
      matchQuery.$or = [
        {'course_details.title': { $regex: search, $options:'i' } },
        {'course_details.short_desc': { $regex: search, $options:'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [purchases, total, categories] = await Promise.all([
      StudentCoursePurchase.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudentCoursePurchase.countDocuments(matchQuery),
      StudentCoursePurchase.distinct('course_details.course_category', {
        student_id: studentId,
        'purchase_details.payment_status': 'completed'
      })
    ]);

    // Fetch real progress for these courses
    const courseIds = purchases.map(p => p.course_id);
    const progressRecords = courseIds.length > 0 ? await CourseProgress.find({
      student_id: studentId,
      course_id: { $in: courseIds }
    }).lean() : [];

    const progressMap = progressRecords.reduce((acc, curr) => {
      acc[curr.course_id.toString()] = curr.overall_progress.completion_percentage;
      return acc;
    }, {});

    // Transform data for frontend
    const courses = purchases.map(purchase => ({
      purchaseId: purchase._id,
      courseId: purchase.course_id,
      course: purchase.course_details,
      purchaseDate: purchase.createdAt,
      amountPaid: purchase.purchase_details.amount_paid,
      progress: progressMap[purchase.course_id.toString()] || 0,
      lastAccessed: purchase.updatedAt,
      certificate: progressMap[purchase.course_id.toString()] === 100,
      rating: null
    }));

    res.json({
      success: true,
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      categories,
      stats: {
        totalCourses: total,
        completedCourses: courses.filter(c => c.progress === 100).length,
        inProgressCourses: courses.filter(c => c.progress > 0 && c.progress < 100).length,
        notStartedCourses: courses.filter(c => c.progress === 0).length
      }
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch purchased courses',
      error: error.message
    });
  }
});

// //  Get student's purchased courses with full details for android
router.get('/application/my-courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, category, search } = req.query;

    // Build query
    let matchQuery = {
      student_id: studentId,
'purchase_details.payment_status':'completed',
'purchase_details.access_granted': true
    };

    // Add category filter
    if (category && category !=='all') {
      matchQuery['course_details.course_category'] = category;
    }

    // Add search filter
    if (search) {
      matchQuery.$or = [
        {'course_details.title': { $regex: search, $options:'i' } },
        {'course_details.short_desc': { $regex: search, $options:'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await StudentCoursePurchase.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await StudentCoursePurchase.countDocuments(matchQuery);

    // Fetch real progress for these courses
    const courseIds = purchases.map(p => p.course_id);
    const progressRecords = await CourseProgress.find({
      student_id: studentId,
      course_id: { $in: courseIds }
    }).lean();

    const progressMap = progressRecords.reduce((acc, curr) => {
      acc[curr.course_id.toString()] = curr.overall_progress.completion_percentage;
      return acc;
    }, {});

    // Transform data for frontend
    const courses = purchases.map(purchase => ({
      data: {
        course: {
          ...purchase.course_details,
          courseId: purchase.course_id,
          coverphoto: purchase.course_details.coverphoto,
          teacher: purchase.course_details.teacher_details,
          chapters: purchase.course_details.chapters
        },
        purchaseData: {
          purchaseId: purchase._id,
          purchaseDate: purchase.createdAt,
          amountPaid: purchase.purchase_details.amount_paid,
          currency: purchase.purchase_details.currency,
          accessGranted: purchase.purchase_details.access_granted,
          accessGrantedDate: purchase.purchase_details.access_granted_date,
          progress: progressMap[purchase.course_id.toString()] || 0,
          lastAccessed: purchase.updatedAt,
          certificate: progressMap[purchase.course_id.toString()] === 100,
          rating: null
        }
      }
    }));

    // Get categories for filter
    const categories = await StudentCoursePurchase.distinct('course_details.course_category', {
      student_id: studentId,
'purchase_details.payment_status':'completed'
    });

    res.json({
      success: true,
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      categories,
      stats: {
        totalCourses: total,
        completedCourses: courses.filter(c => c.progress === 100).length,
        inProgressCourses: courses.filter(c => c.progress > 0 && c.progress < 100).length,
        notStartedCourses: courses.filter(c => c.progress === 0).length
      }
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch purchased courses',
      error: error.message
    });
  }
});

//  Get single purchased course with full access
router.get('/course-access/:studentId/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // 1 Verify purchase
    const purchase = await StudentCoursePurchase.findOne({
      student_id: studentId,
      course_id: courseId,
'purchase_details.payment_status':'completed',
'purchase_details.access_granted': true
    }).lean();

    if (!purchase) {
      return res.status(403).json({
        success: false,
        hasAccess: false,
        message:'Course not purchased or access denied'
      });
    }

    // 2 ALWAYS fetch fresh course content
    const course = await Course.findById(courseId)
      .populate('teacher_id')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message:'Course not found'
      });
    }

    // 3 Return fresh course + purchase info
    res.json({
      success: true,
      hasAccess: true,
      course: {
        ...course,
        teacher_details: {
          tname: course.teacher_id?.tname ||'Instructor',
          temail: course.teacher_id?.temail ||'',
          tspecialization: course.teacher_id?.tspecialization ||'',
          tprofile: course.teacher_id?.tprofile || null
        }
      },
      purchase: {
        purchaseDate: purchase.createdAt,
        amountPaid: purchase.purchase_details.amount_paid,
        accessGrantedDate: purchase.purchase_details.access_granted_date
      }
    });

  } catch (error) {
    console.error('Course access error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to verify course access',
      error: error.message
    });
  }
});


module.exports = router;
