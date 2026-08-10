const express = require("express");
const router = express.Router();

const {
  getWalletSummary,
  getAllTransactions
} = require("../Controllers/StudentWalletController");

const { authMiddleware } = require("../Middlewares/student.auth.middleware");

/*
================================
STUDENT WALLET ROUTES
================================
*/

router.use(authMiddleware);

// wallet summary
router.get("/", getWalletSummary);

// all transactions
router.get("/transactions", getAllTransactions);

module.exports = router;