const express = require('express');
const router = express.Router();
const PurchaseModel = require('../Models/purchaseModels');
const mongoose = require('mongoose');
const { sendDeliveryUpdateMail } = require('../utils/books.delivery.mail');

//  Get Payment Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log(' Fetching payment dashboard statistics...');

    // Total Revenue Calculation
    const totalRevenueResult = await PurchaseModel.aggregate([
      { $match: { payment_status:'paid' } },
      { $group: { _id: null, total: { $sum:'$pricing.final_amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Monthly Revenue (Current Month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await PurchaseModel.aggregate([
      {
        $match: {
          payment_status:'paid',
          payment_completed_at: { $gte: currentMonth }
        }
      },
      { $group: { _id: null, total: { $sum:'$pricing.final_amount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Total Transactions
    const totalTransactions = await PurchaseModel.countDocuments();

    // Successful Transactions
    const successfulTransactions = await PurchaseModel.countDocuments({
      payment_status:'paid'
    });

    // Pending Transactions
    const pendingTransactions = await PurchaseModel.countDocuments({
      status:'pending'
    });

    // Failed Transactions
    const failedTransactions = await PurchaseModel.countDocuments({
      payment_status:'failed'
    });

    // Purchase Type Breakdown
    const purchaseTypeStats = await PurchaseModel.aggregate([
      { $match: { payment_status:'paid' } },
      {
        $group: {
          _id:'$purchase_type',
          count: { $sum: 1 },
          revenue: { $sum:'$pricing.final_amount' }
        }
      }
    ]);

    // Monthly Revenue Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await PurchaseModel.aggregate([
      {
        $match: {
          payment_status:'paid',
          payment_completed_at: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year:'$payment_completed_at' },
            month: { $month:'$payment_completed_at' }
          },
          revenue: { $sum:'$pricing.final_amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: {'_id.year': 1,'_id.month': 1 } }
    ]);

    // Payment Gateway Stats
    const gatewayStats = await PurchaseModel.aggregate([
      { $match: { payment_status:'paid' } },
      {
        $group: {
          _id:'$payment_gateway',
          count: { $sum: 1 },
          revenue: { $sum:'$pricing.final_amount' }
        }
      }
    ]);

    // Average Order Value
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / successfulTransactions : 0;

    // Success Rate
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    const dashboardStats = {
      overview: {
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        totalTransactions,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        avgOrderValue: Math.round(avgOrderValue),
        successRate: Math.round(successRate * 100) / 100
      },
      purchaseTypes: purchaseTypeStats,
      monthlyTrend: monthlyTrend,
      gatewayStats: gatewayStats
    };

    console.log(' Dashboard statistics calculated:', dashboardStats.overview);

    res.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error(' Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

//  Get All Payments with Advanced Filtering
router.get("/payments", async (req, res) => {
  try {

    const {
      page = 1,
      limit = 50
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    /* ---------------- FETCH PURCHASES ---------------- */

    const purchases = await PurchaseModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await PurchaseModel.countDocuments();

    /* ---------------- MAP DATA FOR FRONTEND ---------------- */

    const payments = purchases.map(p => ({

      id: p._id,

      /* ---------- CUSTOMER ---------- */

      customer: {
        name: p.customer_details?.name ||"N/A",
        email: p.customer_details?.email ||"N/A",
        phone: p.customer_details?.phone ||""
      },

      /* ---------- ITEM ---------- */

      item: {
        name: p.item_details?.name ||"Item",
        type: p.purchase_type, // book / course
        category: p.item_details?.category ||""
      },

      /* ---------- FINANCIAL ---------- */

      financial: {
        originalPrice: p.pricing?.original_price || 0,
        finalAmount: p.pricing?.final_amount || 0,
        discountAmount: p.pricing?.discount_amount || 0,
        currency: p.pricing?.currency ||"INR"
      },

      /* ---------- PAYMENT ---------- */

      payment: {
        gateway: p.payment_gateway ||"razorpay",
        status: p.payment_status ||"pending",
        orderId: p.gateway_details?.order_id ||"",
        paymentId: p.gateway_details?.payment_id ||""
      },

      /* ---------- ORDER STATUS ---------- */

      status: p.status ||"pending",

      purchaseDate: p.purchase_initiated_at || p.createdAt,
      completedDate: p.payment_completed_at || null,

      invoiceNumber: p.invoice_number || null,

      /* ---------- DELIVERY ---------- */

      delivery: {
        required: p.delivery_details?.required || false,
        status: p.delivery_details?.status ||"pending",
        courier: p.delivery_details?.courier || null,
        tracking_id: p.delivery_details?.tracking_id || null,
        tracking_url: p.delivery_details?.tracking_url || null
      }

    }));

    /* ---------------- RESPONSE ---------------- */

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total
        }
      }
    });

  } catch (error) {

    console.error("Payments fetch error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to fetch payments"
    });

  }
});
//  Get Payment Details by ID
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid payment ID'
      });
    }

    const payment = await PurchaseModel.findById(paymentId).lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:'Payment not found'
      });
    }

    console.log(' Payment details retrieved:', paymentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error(' Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch payment details',
      error: error.message
    });
  }
});

//  Get Top Selling Items
router.get('/top-selling', async (req, res) => {
  try {
    const { limit = 10, type ='all' } = req.query;

    console.log(' Fetching top selling items...');

    const matchQuery = { payment_status:'paid' };
    if (type !=='all') {
      matchQuery.purchase_type = type;
    }

    const topSelling = await PurchaseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            item_id:'$item_id',
            item_name:'$item_details.name',
            item_type:'$purchase_type',
            category:'$item_details.category'
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum:'$pricing.final_amount' },
          avgPrice: { $avg:'$pricing.final_amount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const transformedData = topSelling.map(item => ({
      itemId: item._id.item_id,
      name: item._id.item_name,
      type: item._id.item_type,
      category: item._id.category,
      totalSales: item.totalSales,
      totalRevenue: Math.round(item.totalRevenue),
      avgPrice: Math.round(item.avgPrice)
    }));

    console.log(` Retrieved ${transformedData.length} top selling items`);

    res.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error(' Error fetching top selling items:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch top selling items',
      error: error.message
    });
  }
});

//  Get Revenue Analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period ='monthly', year = new Date().getFullYear() } = req.query;

    console.log(` Fetching ${period} revenue analytics for ${year}...`);

    let groupBy, matchDate;

    if (period ==='daily') {
      // Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchDate = { $gte: thirtyDaysAgo };
      groupBy = {
        year: { $year:'$payment_completed_at' },
        month: { $month:'$payment_completed_at' },
        day: { $dayOfMonth:'$payment_completed_at' }
      };
    } else if (period ==='monthly') {
      // Current year
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);
      matchDate = { $gte: yearStart, $lte: yearEnd };
      groupBy = {
        year: { $year:'$payment_completed_at' },
        month: { $month:'$payment_completed_at' }
      };
    } else {
      // Yearly - last 5 years
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      matchDate = { $gte: fiveYearsAgo };
      groupBy = {
        year: { $year:'$payment_completed_at' }
      };
    }

    const revenueData = await PurchaseModel.aggregate([
      {
        $match: {
          payment_status:'paid',
          payment_completed_at: matchDate
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum:'$pricing.final_amount' },
          transactions: { $sum: 1 },
          avgOrderValue: { $avg:'$pricing.final_amount' }
        }
      },
      { $sort: {'_id.year': 1,'_id.month': 1,'_id.day': 1 } }
    ]);

    console.log(` Retrieved ${revenueData.length} revenue data points`);

    res.json({
      success: true,
      data: revenueData.map(item => ({
        period: item._id,
        revenue: Math.round(item.revenue),
        transactions: item.transactions,
        avgOrderValue: Math.round(item.avgOrderValue)
      }))
    });

  } catch (error) {
    console.error(' Error fetching revenue analytics:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

//  Update Payment Status (Admin Function)
router.put('/payments/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, payment_status, internal_notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message:'Invalid payment ID'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (internal_notes) updateData.internal_notes = internal_notes;

    if (payment_status ==='paid' && !updateData.payment_completed_at) {
      updateData.payment_completed_at = new Date();
    }

    const updatedPayment = await PurchaseModel.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message:'Payment not found'
      });
    }

    console.log(' Payment status updated:', paymentId);

    res.json({
      success: true,
      message:'Payment status updated successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error(' Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update payment status',
      error: error.message
    });
  }
});

//  Get Payment Filters Data
router.get('/filters', async (req, res) => {
  try {
    console.log(' Fetching filter options...');

    const [purchaseTypes, paymentGateways] = await Promise.all([
      PurchaseModel.distinct('purchase_type'),
      PurchaseModel.distinct('payment_gateway')
    ]);

    const filters = {
      purchaseTypes: purchaseTypes.sort(),
      paymentGateways: paymentGateways.sort(),
      paymentStatuses: ['unpaid','paid','failed','refunded','partially_refunded'],
      statuses: ['initiated','pending','completed','failed','cancelled','refunded']
    };

    console.log(' Filter options retrieved');

    res.json({
      success: true,
      data: filters
    });

  } catch (error) {
    console.error(' Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch filter options',
      error: error.message
    });
  }
});




router.put('/payments/:paymentId/delivery', async (req, res) => {

  try {

    const { paymentId } = req.params;

    const {
      status,
      courier,
      tracking_id,
      tracking_url
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    const allowedStatuses = [
"pending",
"packed",
"shipped",
"out_for_delivery",
"delivered"
    ];

    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:"Invalid delivery status"
      });
    }

    /* ---------------- FETCH PURCHASE ---------------- */

    const purchase = await PurchaseModel.findById(paymentId);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:"Purchase not found"
      });
    }

    if (purchase.purchase_type !=="book") {
      return res.status(400).json({
        success: false,
        message:"Delivery tracking only allowed for book purchases"
      });
    }

    /* ---------------- INIT DELIVERY OBJECT ---------------- */

    if (!purchase.delivery_details) {
      purchase.delivery_details = {};
    }

    const newStatus = status.toLowerCase();

    /* ---------------- UPDATE FIELDS ---------------- */

    purchase.delivery_details.status = newStatus;

    if (courier) {
      purchase.delivery_details.courier = courier;
    }

    if (tracking_id) {
      purchase.delivery_details.tracking_id = tracking_id;
    }

    if (tracking_url) {
      purchase.delivery_details.tracking_url = tracking_url;
    }

    /* ---------------- STATUS TIMESTAMPS ---------------- */

    const now = new Date();

    if (newStatus ==="packed") {
      purchase.delivery_details.packed_at = now;
    }

    if (newStatus ==="shipped") {
      purchase.delivery_details.shipped_at = now;
    }

    if (newStatus ==="out_for_delivery") {
      purchase.delivery_details.out_for_delivery_at = now;
    }

    if (newStatus ==="delivered") {
      purchase.delivery_details.delivered_at = now;
    }

    /* ---------------- SAVE ---------------- */

    await purchase.save();

    /* ---------------- SEND EMAIL ---------------- */

    try {

      await sendDeliveryUpdateMail({
        studentName: purchase.customer_details?.name,
        email: purchase.customer_details?.email,
        bookName: purchase.item_details?.name,
        status: newStatus,
        courier,
        trackingId: tracking_id,
        trackingUrl: tracking_url
      });

    } catch (mailError) {

      console.error("Delivery email failed:", mailError);

      // Don't break API if mail fails
    }

    /* ---------------- RESPONSE ---------------- */

    res.json({
      success: true,
      message:"Delivery status updated successfully",
      data: purchase.delivery_details
    });

  } catch (error) {

    console.error("Delivery update error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to update delivery",
      error: error.message
    });

  }

});

module.exports = router;
