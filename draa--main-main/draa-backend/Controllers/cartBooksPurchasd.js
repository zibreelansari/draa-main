//  cartBooksPurchasd.js - COMPLETE WITH ALL FIXES

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Book = require('../Models/booksModel');
const StudentBookPurchase = require('../Models/BooksPurchaseModels');
const PurchaseModel = require('../Models/purchaseModels');
const Cart = require('../Models/CartModel');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');
const mongoose = require("mongoose");
const CoinTransaction = require("../Models/CoinTransaction");
const { sendBookPurchaseMail } = require("../utils/sendBookPurchaseEmail");
const { validateIndianPincodeAddress } = require("../utils/pincodeLookup");
const SHIPPING_CHARGE = 100;
const COIN_VALUE = 0.10;
const MIN_COINS = 100;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

//  Helper function to generate short receipt
const generateShortReceipt = (cartId, studentId) => {
  const timestamp = Date.now().toString().slice(-8);
  const cartHash = cartId.slice(-6);
  const studentHash = studentId.slice(-6);
  return `CART${cartHash}_S${studentHash}_${timestamp}`;
};

// ================= STEP 1: CREATE CART ORDER =================
router.post('/create-cart-order', authMiddleware, async (req, res) => {
  try {

    let { books, student_data, delivery_address, coins_used = 0 } = req.body;

    if (!student_data || !student_data.id) {
      return res.status(401).json({
        success: false,
        message:"Student authentication required"
      });
    }

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({
        success: false,
        message:"Cart cannot be empty"
      });
    }

    const studentObjectId = new mongoose.Types.ObjectId(student_data.id);

    /* ================= FETCH BOOKS ================= */

    const bookIds = books.map(b => b.book_id || b.bookId);

    const dbBooks = await Book.find({
      _id: { $in: bookIds },
      isApproved: true
    });

    if (dbBooks.length !== books.length) {
      return res.status(404).json({
        success: false,
        message:"Some books not found"
      });
    }

    const bookMap = {};
    dbBooks.forEach(b => {
      bookMap[b._id.toString()] = b;
    });

    /* ================= CART TOTAL ================= */

    let subtotal = 0;
    let validatedBooks = [];

    for (const item of books) {

      const book = bookMap[(item.book_id || item.bookId).toString()];
      const quantity = Math.max(1, Number(item.quantity || 1));

      let unitPrice;
      let bookType;

      // DIGITAL BOOK
      if (item.type ==="pdftype" || item.type ==="ebook") {

        const discount = book.digitalDiscountPercentage || 0;

        unitPrice = Math.floor(
          book.digitalPrice - (book.digitalPrice * discount / 100)
        );

        bookType ="pdftype";

      } else {

        const discount = book.physicalDiscountPercentage || 0;

        unitPrice = Math.floor(
          book.physicalPrice - (book.physicalPrice * discount / 100)
        );

        bookType ="physical";
      }

      const itemTotal = unitPrice * quantity;

      subtotal += itemTotal;

      validatedBooks.push({
        book_id: book._id,
        quantity,
        unitPrice,
        itemTotal,
        bookType
      });

    }

    /* ================= SHIPPING ================= */

    const hasPhysical = validatedBooks.some(
      b => b.bookType ==="physical"
    );

    const shippingFee = hasPhysical ? SHIPPING_CHARGE : 0;

    let totalAmount = subtotal + shippingFee;

    if (hasPhysical) {
      const pincodeValidation = await validateIndianPincodeAddress(delivery_address);
      if (!pincodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: pincodeValidation.message,
          suggestions: pincodeValidation.suggestions || []
        });
      }
    }

    /* ================= COIN DISCOUNT ================= */

    coins_used = Math.max(0, Number(coins_used) || 0);

    let coinDiscount = Math.floor(coins_used / 10);

    if (coinDiscount > totalAmount) {
      coinDiscount = totalAmount;
    }

    const finalAmount = totalAmount - coinDiscount;

    console.log("Coins received:", coins_used);
    console.log("Subtotal:", subtotal);
    console.log("Shipping:", shippingFee);
    console.log("Coin discount:", coinDiscount);
    console.log("Final amount:", finalAmount);

    /* ================= CREATE RAZORPAY ORDER ================= */

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.max(finalAmount, 1) * 100,
      currency:"INR",
      receipt: generateShortReceipt(bookIds.join("_"), student_data.id),
      notes: {
        student_id: student_data.id,
        coins_used,
        coin_discount: coinDiscount,
        shipping_fee: shippingFee
      }
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      pricing: {
        subtotal,
        shippingFee,
        coinDiscount,
        finalAmount
      }
    });

  } catch (error) {

    console.error("Create cart order error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to create order"
    });

  }
});



/* ========================================================= */
/* ================= VERIFY PAYMENT ======================== */
/* ========================================================= */

router.post('/verify-cart-payment', authMiddleware, async (req, res) => {

  try {

    let {
      books,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_data,
      delivery_address,
      coins_used = 0
    } = req.body;

    const studentObjectId = new mongoose.Types.ObjectId(student_data.id);

    /* ================= VERIFY SIGNATURE ================= */

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:"Invalid payment signature"
      });
    }

    /* ================= FETCH BOOKS ================= */

    const bookIds = books.map(b => b.book_id || b.bookId);

    const dbBooks = await Book.find({
      _id: { $in: bookIds }
    });

    const bookMap = {};
    dbBooks.forEach(b => {
      bookMap[b._id.toString()] = b;
    });

    let subtotal = 0;
    let purchaseRecords = [];

    for (const item of books) {

      const book = bookMap[(item.book_id || item.bookId).toString()];
      const quantity = Math.max(1, Number(item.quantity || 1));

      let unitPrice;
      let bookType;

      if (item.type ==="pdftype" || item.type ==="ebook") {

        const discount = book.digitalDiscountPercentage || 0;

        unitPrice = Math.floor(
          book.digitalPrice - (book.digitalPrice * discount / 100)
        );

        bookType ="pdftype";

      } else {

        const discount = book.physicalDiscountPercentage || 0;

        unitPrice = Math.floor(
          book.physicalPrice - (book.physicalPrice * discount / 100)
        );

        bookType ="physical";
      }

      const itemTotal = unitPrice * quantity;

      subtotal += itemTotal;

      purchaseRecords.push({
        student_id: student_data.id,

        student_details: {
          name: student_data.name,
          email: student_data.email
        },

        book_id: book._id,
        quantity,

        book_details: {
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          pdfUrl: book.pdfUrl,
          price: unitPrice,
          bookType
        },

        purchase_details: {
          amount_paid: itemTotal,
          currency:"INR",
          payment_status:"completed",
          purchase_date: new Date(),
          access_granted: bookType ==="pdftype",

          delivery_details: bookType ==="physical"
            ? {
              address: delivery_address,
              delivery_status:"pending"
            }
            : undefined
        },

        razorpay_details: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature
        }

      });

    }

    /* ================= SHIPPING ================= */

    const hasPhysical = purchaseRecords.some(
      p => p.book_details.bookType ==="physical"
    );

    const shippingFee = hasPhysical ? SHIPPING_CHARGE : 0;

    let totalAmount = subtotal + shippingFee;

    if (hasPhysical) {
      const pincodeValidation = await validateIndianPincodeAddress(delivery_address);
      if (!pincodeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: pincodeValidation.message,
          suggestions: pincodeValidation.suggestions || []
        });
      }

      delivery_address = pincodeValidation.address;
      purchaseRecords = purchaseRecords.map(record => record.book_details.bookType === "physical"
        ? {
          ...record,
          purchase_details: {
            ...record.purchase_details,
            delivery_details: {
              ...record.purchase_details.delivery_details,
              address: delivery_address
            }
          }
        }
        : record
      );
    }

    /* ================= COIN DISCOUNT ================= */

    coins_used = Math.max(0, Number(coins_used) || 0);

    let coinDiscount = Math.floor(coins_used / 10);

    if (coinDiscount > totalAmount) {
      coinDiscount = totalAmount;
    }

    const finalAmount = totalAmount - coinDiscount;

    /* ================= WALLET BALANCE ================= */

    const credits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"credit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const debits = await CoinTransaction.aggregate([
      { $match: { user: studentObjectId, type:"debit" } },
      { $group: { _id: null, total: { $sum:"$amount" } } }
    ]);

    const balance = (credits[0]?.total || 0) - (debits[0]?.total || 0);

    if (coins_used > balance) {
      return res.status(400).json({
        success: false,
        message:"Insufficient coin balance"
      });
    }

    /* ================= SAVE COINS ================= */

    if (coins_used > 0 && coinDiscount > 0) {
      await CoinTransaction.create({
        user: studentObjectId,
        amount: coins_used,
        type:"debit",
        source:"purchase",
        referenceId: new mongoose.Types.ObjectId(),
        description: `Coins used for cart purchase | Razorpay Order: ${razorpay_order_id}`
      });
    }

    /* ================= SAVE PURCHASE ================= */

    /* ================= SAVE PURCHASE ================= */

    await StudentBookPurchase.insertMany(purchaseRecords);

    /* ================= CREATE PURCHASEMODEL RECORDS ================= */

    const purchaseModelRecords = purchaseRecords.map(purchase => {

      return {

        purchase_type:"book",

        customer_model:"Student",
        customer_id: studentObjectId,

        customer_details: {
          name: purchase.student_details.name,
          email: purchase.student_details.email
        },

        item_id: purchase.book_id,
        item_model:"Book",

        item_details: {
          name: purchase.book_details.title,
          category:"book",
          image: purchase.book_details.coverImage
        },

        pricing: {
          base_price: purchase.book_details.price || 0,
          original_price: purchase.book_details.price,
          final_amount: purchase.purchase_details.amount_paid,
          currency:"INR"
        },

        payment_gateway:"razorpay",

        gateway_details: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature
        },

        payment_status:"paid",
        status:"completed",

        payment_completed_at: new Date(),

        metadata: {
          referrer:"cart_checkout"
        }

      };

    });

    await PurchaseModel.insertMany(purchaseModelRecords);
    /* ================= SEND EMAILS ================= */

    try {

      for (const purchase of purchaseRecords) {

        await sendBookPurchaseMail({
          email: student_data.email,
          studentName: student_data.name,
          bookTitle: purchase.book_details.title,
          purchaseType: purchase.book_details.bookType,
          amount: purchase.purchase_details.amount_paid,
          orderId: razorpay_order_id
        });

      }

    } catch (mailError) {

      console.error("Mail sending failed:", mailError);

    }

    // Clear user's cart in database
    try {
      await Cart.deleteOne({ userId: student_data.id });
    } catch (cartClearError) {
      console.error("Failed to clear cart database after purchase:", cartClearError);
    }

    res.json({
      success: true,
      message:" Cart checkout successful"
    });

  } catch (error) {

    console.error("Verify cart payment error:", error);

    res.status(500).json({
      success: false,
      message:"Payment verification failed"
    });

  }

});


//  Check if student has purchased specific books
//  Check if student has purchased specific books (SECURE + FIXED)
router.post('/check-cart-purchases', authMiddleware, async (req, res) => {
  try {
    let { book_ids, student_id } = req.body;

    /* ------------------ AUTH CHECK ------------------ */
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:'Unauthorized'
      });
    }

    //  Ensure student can check ONLY their own purchases
    if (req.user.userId.toString() !== student_id?.toString()) {
      return res.status(403).json({
        success: false,
        message:'Access denied'
      });
    }

    /* ------------------ VALIDATION ------------------ */
    if (!student_id || !Array.isArray(book_ids) || book_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message:'Student ID and book IDs array are required'
      });
    }

    /* ------------------ NORMALIZE BOOK IDS ------------------ */
    book_ids = book_ids.map(id => id.toString());

    /* ------------------ FETCH PURCHASES ------------------ */
    const purchases = await StudentBookPurchase.find({
      student_id,
      book_id: { $in: book_ids },
'purchase_details.payment_status':'completed'
    }).lean();

    /* ------------------ BUILD RESPONSE MAP ------------------ */
    const purchasedMap = {};

    purchases.forEach(purchase => {
      purchasedMap[purchase.book_id.toString()] = {
        purchased: true,
        purchaseId: purchase._id,
        quantity: purchase.quantity || 1,
        bookType: purchase.book_details.bookType,
        accessGranted: purchase.purchase_details.access_granted,
        deliveryStatus:
          purchase.purchase_details.delivery_details?.delivery_status || null,
        purchaseDate: purchase.createdAt
      };
    });

    /* ------------------ DEFAULT FALSE FOR NON-PURCHASED ------------------ */
    const result = {};
    book_ids.forEach(bookId => {
      result[bookId] = purchasedMap[bookId] || {
        purchased: false
      };
    });

    /* ------------------ RESPONSE ------------------ */
    res.json({
      success: true,
      purchasedCount: purchases.length,
      purchases: result,
      allBookIds: book_ids
    });

  } catch (error) {
    console.error(' Check cart purchases error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to check purchases',
      error: error.message
    });
  }
});


//  Get student's purchased books
router.get('/my-books/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, book_type, category } = req.query;

    const matchQuery = {
      student_id: studentId,
'purchase_details.payment_status':'completed'
    };

    if (book_type && book_type !=='all') {
      matchQuery['book_details.bookType'] = book_type;
    }

    if (category && category !=='all') {
      matchQuery['book_details.category'] = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await StudentBookPurchase.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await StudentBookPurchase.countDocuments(matchQuery);

    // Transform data for frontend
    const books = purchases.map(purchase => ({
      purchaseId: purchase._id,
      bookId: purchase.book_id,
      book: purchase.book_details,
      purchaseDate: purchase.createdAt,
      quantity: purchase.quantity || 1,
      amountPaid: purchase.purchase_details.amount_paid,
      bookType: purchase.book_details.bookType,
      accessGranted: purchase.purchase_details.access_granted,
      downloadCount: purchase.download_details?.download_count || 0,
      downloadLimit: purchase.download_details?.download_limit || 0,
      deliveryStatus: purchase.purchase_details.delivery_details?.delivery_status || null,
      trackingNumber: purchase.purchase_details.delivery_details?.tracking_number || null,
      isCartCheckout: purchase.cart_checkout || false
    }));

    const categories = await StudentBookPurchase.distinct('book_details.category', {
      student_id: studentId,
'purchase_details.payment_status':'completed'
    });

    const bookTypes = await StudentBookPurchase.distinct('book_details.bookType', {
      student_id: studentId,
'purchase_details.payment_status':'completed'
    });

    res.json({
      success: true,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      categories,
      bookTypes,
      stats: {
        totalPurchaseRecords: total,
        totalQuantityPurchased: books.reduce((sum, b) => sum + b.quantity, 0),
        pdfBooks: books.filter(b => b.bookType ==='pdftype').length,
        physicalBooks: books.filter(b => b.bookType ==='physical').length,
        deliveredBooks: books.filter(b => b.deliveryStatus ==='delivered').length
      }
    });

  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch purchased books',
      error: error.message
    });
  }
});

//  Download PDF book
router.get('/download/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { student_id } = req.query;

    const purchase = await StudentBookPurchase.findOne({
      _id: purchaseId,
      student_id,
'purchase_details.payment_status':'completed',
'purchase_details.access_granted': true,
'book_details.bookType':'pdftype'
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:'Book purchase not found or access denied'
      });
    }

    // Check download limit
    if (purchase.download_details && purchase.download_details.download_count >= purchase.download_details.download_limit) {
      return res.status(400).json({
        success: false,
        message:'Download limit exceeded'
      });
    }

    // Check if download has expired
    if (purchase.download_details && purchase.download_details.download_expires && new Date() > purchase.download_details.download_expires) {
      return res.status(400).json({
        success: false,
        message:'Download access has expired'
      });
    }

    // Increment download count
    await StudentBookPurchase.updateOne(
      { _id: purchaseId },
      {
        $inc: {'download_details.download_count': 1 },
        $set: {'download_details.last_download': new Date() }
      }
    );

    const downloadUrl = purchase.book_details.pdfUrl || purchase.book_details.pdf_url;
    const fullDownloadUrl = downloadUrl.startsWith('http') ? downloadUrl : `https://api.draa.in/api/v1${downloadUrl}`;

    res.json({
      success: true,
      download_url: fullDownloadUrl,
      book_title: purchase.book_details.title,
      quantity: purchase.quantity || 1,
      remaining_downloads: (purchase.download_details?.download_limit || 5) - (purchase.download_details?.download_count || 0),
      expires_at: purchase.download_details?.download_expires
    });

  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({
      success: false,
      message:'Failed to process download',
      error: error.message
    });
  }
});


// Sync cart from frontend to database
router.post('/sync-cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items = [] } = req.body;

    const sanitizedItems = items.map(item => ({
      bookId: item.bookId || item.book_id,
      bookType: item.bookType || 'pdftype',
      quantity: Math.max(1, Number(item.quantity) || 1),
      title: item.title,
      author: item.author,
      coverImage: item.coverImage,
      basePrice: item.basePrice || item.price,
      discountPercentage: item.discountPercentage || 0,
      finalPrice: item.finalPrice || item.price,
      addedAt: item.addedAt || new Date()
    }));

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          items: sanitizedItems,
          lastEmailSentAt: null,
          emailSentCount: 0
        } 
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Cart synchronized successfully',
      cart
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
});

// Retrieve cart from database
router.get('/get-cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
});

//  Export router
module.exports = router;
