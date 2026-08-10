const User = require("../Models/UserModel");
const CoinTransaction = require("../Models/CoinTransaction");
const mongoose = require("mongoose");

/*
================================
GET STUDENT WALLET SUMMARY
================================
*/
const getWalletSummary = async (req, res) => {
  try {

    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid user ID"
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjectId).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:"User not found"
      });
    }

    /*
    =================================
    CALCULATE WALLET BALANCE
    =================================
    */

    const balanceData = await CoinTransaction.aggregate([
      { $match: { user: userObjectId } },

      {
        $group: {
          _id:"$type",
          total: { $sum:"$amount" }
        }
      }
    ]);

    let creditTotal = 0;
    let debitTotal = 0;

    balanceData.forEach(item => {
      if (item._id ==="credit") creditTotal = item.total;
      if (item._id ==="debit") debitTotal = item.total;
    });

    const balance = creditTotal - debitTotal;

    /*
    =================================
    RECENT TRANSACTIONS
    =================================
    */

    const transactions = await CoinTransaction.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      wallet: {
        balance,
        transactions
      }
    });

  } catch (error) {

    console.error("Wallet Error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to load wallet"
    });

  }
};

/*
================================
GET ALL TRANSACTIONS
================================
*/

const getAllTransactions = async (req, res) => {
  try {

    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message:"Invalid user ID"
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const transactions = await CoinTransaction.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {

    console.error("Transaction Error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to fetch transactions"
    });

  }
};

module.exports = {
  getWalletSummary,
  getAllTransactions
};