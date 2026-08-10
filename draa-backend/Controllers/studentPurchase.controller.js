const PurchaseModel = require("../Models/purchaseModels");
const mongoose = require("mongoose");
const { generateInvoicePDF } = require("../utils/generateInvoicePDF");

/**
 * GET /api/student/purchases
 * Student purchase history (paginated)
 */
exports.getStudentPurchases = async (req, res) => {
  try {

    const studentId = req.user.userId;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {
      customer_id: new mongoose.Types.ObjectId(studentId),
      customer_model:"Student",
    };

    if (req.query.payment_status) {
      filter.payment_status = req.query.payment_status;
    }

    if (req.query.purchase_type) {
      filter.purchase_type = req.query.purchase_type;
    }

    const purchases = await PurchaseModel.find(filter)
      .sort({ purchase_initiated_at: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        _id: 1,
        purchase_type: 1,
        item_details: 1,
        customer_details: 1,
        pricing: 1,
        payment_gateway: 1,
        gateway_details: 1,
        payment_status: 1,
        status: 1,
        payment_completed_at: 1,
        purchase_initiated_at: 1,
        createdAt: 1,
      })
      .lean();

    const total = await PurchaseModel.countDocuments(filter);

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: purchases,
    });

  } catch (err) {

    console.error("getStudentPurchases error:", err);

    res.status(500).json({
      success: false,
      message:"Failed to fetch purchase history",
    });

  }
};



/**
 * GET /api/student/purchases/:id
 * Get single purchase for invoice
 */
exports.getStudentPurchaseById = async (req, res) => {
  try {

    const studentId = req.user.userId;
    const purchaseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid purchase ID",
      });
    }

    const purchase = await PurchaseModel.findOne({
      _id: purchaseId,
      customer_id: new mongoose.Types.ObjectId(studentId),
      customer_model:"Student",
    })
      .select({
        _id: 1,
        purchase_type: 1,
        item_details: 1,
        customer_details: 1,
        pricing: 1,
        payment_gateway: 1,
        gateway_details: 1,
        payment_status: 1,
        status: 1,
        payment_completed_at: 1,
        purchase_initiated_at: 1,
        createdAt: 1,
      })
      .lean();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:"Purchase not found",
      });
    }

    res.json({
      success: true,
      data: purchase,
    });

  } catch (err) {

    console.error("getStudentPurchaseById error:", err);

    res.status(500).json({
      success: false,
      message:"Failed to fetch purchase",
    });

  }
};



/**
 * GET /api/student/purchases/summary
 * Dashboard summary
 */
exports.getStudentPurchaseSummary = async (req, res) => {
  try {

    const studentId = new mongoose.Types.ObjectId(req.user.userId);

    const summary = await PurchaseModel.aggregate([
      {
        $match: {
          customer_id: studentId,
          customer_model:"Student",
          payment_status:"paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum:"$pricing.final_amount" },
          totalPurchases: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: summary[0] || {
        totalSpent: 0,
        totalPurchases: 0,
      },
    });

  } catch (err) {
    console.error("purchase summary error:", err);
    res.status(500).json({
      success: false,
      message:"Failed to load summary",
    });
  }
};

/**
 * GET /api/student/purchases/invoice/:id
 * Generate and download invoice PDF
 */
exports.getInvoicePDF = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const purchaseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({ success: false, message:"Invalid purchase ID" });
    }

    const purchase = await PurchaseModel.findOne({
      _id: purchaseId,
      customer_id: new mongoose.Types.ObjectId(studentId),
      customer_model:"Student",
    }).lean();

    if (!purchase) {
      return res.status(404).json({ success: false, message:"Purchase not found" });
    }

    if (purchase.payment_status !=='paid') {
      return res.status(400).json({ success: false, message:"Invoice only available for paid purchases" });
    }

    // Generate Invoice PDF Buffer
    const invoiceBuffer = await generateInvoicePDF({
      orderId: purchase.gateway_details?.order_id || purchase._id,
      transactionId: purchase.gateway_details?.payment_id ||"N/A",
      purchaseDate: purchase.payment_completed_at || purchase.createdAt,
      customerName: purchase.customer_details?.name ||"Student",
      customerEmail: purchase.customer_details?.email ||"",
      itemTitle: purchase.item_details?.name ||"Educational Item",
      amountPaid: purchase.pricing?.final_amount || 0,
      subtotal: purchase.pricing?.original_price || purchase.pricing?.final_amount,
      discount: purchase.pricing?.discount_amount || 0,
      tax: purchase.pricing?.tax_amount || 0,
      paymentMethod: purchase.payment_gateway ||"Online",
      billingDetails: purchase.billing_details || {}
    });

    const fileName = `Invoice-${purchase._id.toString().slice(-6).toUpperCase()}.pdf`;

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(invoiceBuffer);

  } catch (err) {
    console.error("getInvoicePDF error:", err);
    res.status(500).json({ success: false, message:"Failed to generate invoice" });
  }
};