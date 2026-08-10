const mongoose = require("mongoose");

const rewardConfigSchema = new mongoose.Schema({

  action: {
    type: String,
    unique: true
  },

  coins: {
    type: Number,
    required: true
  }

});

module.exports = mongoose.model("RewardConfig", rewardConfigSchema);