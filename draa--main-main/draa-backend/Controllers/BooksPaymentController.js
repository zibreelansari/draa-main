const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const Book = require('../Models/booksModel');
const StudentBookPurchase = require('../Models/BooksPurchaseModels');
const PurchaseModel = require('../Models/purchaseModels');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');
const CoinTransaction = require('../Models/CoinTransaction');
const mongoose = require("mongoose");
const {
  validatePurchaseType,
  resolveAmountByType,
  requiresDelivery
} = require('../utils/bookPurchase.helper');
const { sendBookPurchaseMail } = require("../utils/sendBookPurchaseEmail");
const { validateIndianPincodeAddress } = require("../utils/pincodeLookup");
const SHIPPING_CHARGE = 100;
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

const generateReceipt = (bookId, studentId) => {
  const book = String(bookId);
  const student = String(studentId);

  return `BOOK_${book.slice(-6)}_${student.slice(-6)}_${Date.now()}`;
};

/* ======================================================
   CREATE ORDER
====================================================== */
const applyDiscount = (price, discount) => {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
};

router.post('/create-order', authMiddleware, async (req, res) => {

  try {
    let { book_id, purchase_type, delivery_address, coins_used = 0 } = req.body;
    const student = req.user;

    const COIN_VALUE = 0.10;
    const MIN_COINS = 100;

    const VALID_TYPES = ['pdftype','paperback','both(ppt+pdf)'];

    if (!VALID_TYPES.includes(purchase_type)) {
      return res.status(400).json({
        success: false,
        message:'Invalid purchase type'
      });
    }

    const book = await Book.findById(book_id);
    if (!book || !book.isApproved) {
      return res.status(404).json({
        success: false,
        message:'Book unavailable'
      });
    }

    if (!validatePurchaseType(book, purchase_type)) {
      return res.status(400).json({
        success: false,
        message:'Selected format not available'
      });
    }

    if (requiresDelivery(purchase_type) && !delivery_address) {
      return res.status(400).json({
        success: false,
        message:'Delivery address required'
      });
    }

    if (requiresDelivery(purchase_type)) {
      const pincodeValidation = await validateIndianPincodeAddress(delivery_address);
      if (!pincodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: pincodeValidation.message,
          suggestions: pincodeValidation.suggestions || []
        });
      }
      delivery_address = pincodeValidation.address;
    }

    let baseAmount = resolveAmountByType(book, purchase_type);

    if (purchase_type ==='pdftype') {
      baseAmount = applyDiscount(baseAmount, book.digitalDiscountPercentage);
    }

    if (purchase_type ==='paperback') {
      baseAmount = applyDiscount(baseAmount, book.physicalDiscountPercentage);
    }

    if (purchase_type ==='both(ppt+pdf)') {
      const pdfPrice = applyDiscount(book.digitalPrice, book.digitalDiscountPercentage);
      const physicalPrice = applyDiscount(book.physicalPrice, book.physicalDiscountPercentage);
      baseAmount = pdfPrice + physicalPrice;
    }

    const shippingAmount =
      purchase_type ==='paperback' ? SHIPPING_CHARGE : 0;

    const totalAmount = baseAmount + shippingAmount;

    /* ===============================
       COIN DISCOUNT
    =============================== */

    const studentObjectId = new mongoose.Types.ObjectId(student.userId);

    let coinDiscount = 0;

    if (coins_used >= MIN_COINS) {
      coinDiscount = Math.floor(coins_used * COIN_VALUE);
    }

    const finalAmount = Math.max(totalAmount - coinDiscount, 0);

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency:'INR',
      receipt: generateReceipt(book_id, student.userId),
      notes: {
        book_id,
        student_id: student.userId,
        purchase_type,
        coins_used,
        coin_discount: coinDiscount,
        final_amount: finalAmount
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      purchase_type,
      pricing: {
        baseAmount,
        shippingAmount,
        coinDiscount,
        finalAmount
      }
    });

  } catch (err) {

    console.error('Create order error:', err);

    res.status(500).json({
      success: false,
      message:'Order creation failed'
    });

  }
});

/* ======================================================
   VERIFY PAYMENT
====================================================== */
router.post('/verify-payment', authMiddleware, async (req, res) => {

  try {

    let {
      book_id,
      purchase_type,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      delivery_address,
      coins_used = 0
    } = req.body;

    const student = req.user;

    const COIN_VALUE = 0.10;
    const MIN_COINS = 100;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:'Invalid payment signature'
      });
    }

    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message:'Book not found'
      });
    }

    let baseAmount = resolveAmountByType(book, purchase_type);

    if (purchase_type ==='pdftype') {
      baseAmount = applyDiscount(baseAmount, book.digitalDiscountPercentage);
    }

    if (purchase_type ==='paperback') {
      baseAmount = applyDiscount(baseAmount, book.physicalDiscountPercentage);
    }

    if (purchase_type ==='both(ppt+pdf)') {
      const pdfPrice = applyDiscount(book.digitalPrice, book.digitalDiscountPercentage);
      const physicalPrice = applyDiscount(book.physicalPrice, book.physicalDiscountPercentage);
      baseAmount = pdfPrice + physicalPrice;
    }

    const shippingAmount =
      purchase_type ==='paperback' ? SHIPPING_CHARGE : 0;

    const totalAmount = baseAmount + shippingAmount;

    if (requiresDelivery(purchase_type)) {
      const pincodeValidation = await validateIndianPincodeAddress(delivery_address);
      if (!pincodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: pincodeValidation.message,
          suggestions: pincodeValidation.suggestions || []
        });
      }
      delivery_address = pincodeValidation.address;
    }

    /* ===============================
       COIN CALCULATION
    =============================== */

    const studentObjectId = new mongoose.Types.ObjectId(student.userId);

    let coinDiscount = 0;

    if (coins_used >= MIN_COINS) {
      coinDiscount = Math.floor(coins_used * COIN_VALUE);
    }

    const finalAmount = Math.max(totalAmount - coinDiscount, 0);

    /* ===============================
       CHECK WALLET BALANCE
    =============================== */

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

    /* ===============================
       SAVE COIN DEBIT
    =============================== */

    if (coins_used >= MIN_COINS && coinDiscount > 0) {

      await CoinTransaction.create({
        user: studentObjectId,
        amount: coins_used,
        type:"debit",
        source:"purchase",
        referenceId: book_id,
        description: `Coins used for purchasing book ${book.title}`
      });

    }

    /* ===============================
       STUDENT ACCESS RECORD
    =============================== */

    await StudentBookPurchase.create({
      student_id: student.userId,
      student_details: {
        name: student.email.split('@')[0],
        email: student.email
      },
      book_id,
      book_details: {
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        pdfUrl:
          purchase_type ==='pdftype' || purchase_type ==='both(ppt+pdf)'
            ? book.pdfUrl
            :'',
        price: baseAmount,
        bookType: purchase_type
      },
      purchase_details: {
        amount_paid: finalAmount,
        coins_used,
        coin_discount: coinDiscount,
        currency:'INR',
        payment_status:'completed',
        access_granted: purchase_type !=='paperback',
        purchase_date: new Date(),
        delivery_details:
          requiresDelivery(purchase_type)
            ? {
              address: delivery_address,
              delivery_status:'pending',
              shipping_fee: shippingAmount
            }
            : undefined
      }
    });

    /* ===============================
       FINANCIAL RECORD
    =============================== */

    await PurchaseModel.create({
      purchase_type:
        purchase_type ==='pdftype'
          ?'ebook'
          : purchase_type ==='paperback'
            ?'book'
            :'combo',

      customer_id: student.userId,
      customer_model:'Student',
      customer_details: {
        name: student.email.split('@')[0],
        email: student.email
      },

      item_id: book._id,
      item_model:'Book',
      item_details: {
        name: book.title,
        image: book.coverImage
      },

      pricing: {
        base_price: baseAmount,
        original_price: baseAmount,
        shipping_fee: shippingAmount,
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

    console.log(' General purchase record created');

    // Create notifications for teacher, admin, and student
    try {
      const Notification = require("../Models/NotificationModel");
      const studentName = student.email.split('@')[0] || "A Student";

      // 1. Notify the teacher who uploaded the book
      if (book.uploadedBy) {
        await Notification.create({
          recipient: book.uploadedBy.toString(),
          recipientModel: 'Teacher',
          sender: studentObjectId,
          senderModel: 'User',
          senderName: studentName,
          type: 'book_upload',
          title: 'New Book Purchased!',
          message: `Congratulations! Student "${studentName}" has purchased your book "${book.title}".`,
          referenceId: book._id
        });
        console.log('Notification triggered for teacher on book purchase');
      }

      // 2. Notify the admin
      await Notification.create({
        recipient: 'admin',
        recipientModel: 'Admin',
        sender: studentObjectId,
        senderModel: 'User',
        senderName: studentName,
        type: 'book_upload',
        title: 'New Book Purchased',
        message: `Student "${studentName}" has purchased the book "${book.title}" (${purchase_type}) for ₹${finalAmount}.`,
        referenceId: book._id
      });
      console.log('Notification triggered for admin on book purchase');

      // 3. Notify the student
      await Notification.create({
        recipient: student.userId.toString(),
        recipientModel: 'User',
        sender: null,
        senderModel: 'Admin',
        senderName: 'EduDocs Team',
        type: 'general',
        title: 'Book Purchased Successfully!',
        message: `You have successfully purchased the book "${book.title}".`,
        referenceId: book._id
      });
      console.log('Notification triggered for student on book purchase');
    } catch (notifErr) {
      console.error('Failed to trigger notifications on book purchase:', notifErr);
    }

    await sendBookPurchaseMail({
      email: student.email,
      studentName: student.email.split("@")[0],
      bookTitle: book.title,
      purchaseType: purchase_type,
      amount: finalAmount,
      orderId: razorpay_order_id
    });

    res.json({
      success: true,
      message:
        purchase_type ==='paperback'
          ?'Payment successful. Book will be delivered.'
          :'Payment successful. Access from Student Portal  My Books'
    });

  } catch (err) {

    console.error('Verify payment error:', err);

    res.status(500).json({
      success: false,
      message:'Verification failed'
    });

  }

});

/* ======================================================
   CHECK PURCHASE
====================================================== */
router.get('/check-purchase/:bookId', authMiddleware, async (req, res) => {
  const purchase = await StudentBookPurchase.findOne({
    student_id: req.user.userId,
    book_id: req.params.bookId,
    'purchase_details.payment_status':'completed'
  });

  res.json({
    success: true,
    purchased: !!purchase
  });
});

module.exports = router;
