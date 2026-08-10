const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middlewares/student.auth.middleware");

const {
  getStudentPurchases,
  getStudentPurchaseById,
  getStudentPurchaseSummary,
} = require("../Controllers/studentPurchase.controller");

// Student payment history
router.get("/", authMiddleware, getStudentPurchases);
router.get("/summary", authMiddleware, getStudentPurchaseSummary);
router.get("/invoice/:id", authMiddleware, require("../Controllers/studentPurchase.controller").getInvoicePDF);
router.get("/:id", authMiddleware, getStudentPurchaseById);

module.exports = router;