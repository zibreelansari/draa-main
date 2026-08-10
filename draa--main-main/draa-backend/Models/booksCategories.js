const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

// Make sure to export with the correct name
module.exports = mongoose.model('BookCategory', categorySchema);
