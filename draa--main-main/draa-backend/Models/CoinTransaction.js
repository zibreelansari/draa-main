const mongoose = require("mongoose");

const coinTransactionSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ["credit","debit"],
    required: true
  },

  source: {
    type: String,
    enum: [
"blog_reward",
"referral_reward",
"purchase",
"admin_bonus",
"topic_purchase"
    ]
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },

  description: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("CoinTransaction", coinTransactionSchema);