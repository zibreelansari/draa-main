const mongoose = require('mongoose');

const studentBookPurchaseSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    index: true
  },
  // StudentBookPurchaseModel needs these fields:
  quantity: Number,          //  How many copies purchased
  cart_checkout: Boolean,    //  Flag for cart vs single
  cart_item_index: Number,   //  Position in cart
  student_details: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  },

  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Book',
    required: true
  },
  book_details: {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: String,
    category: String,
    coverImage: String,
    pdfUrl: String,
    price: { type: Number, required: true },
    bookType: {
      type: String,
      enum: ['physical','pdftype','paperback'],
      required: true
    },
    isbn: String,
    pages: Number,
    language: String,
    tags: [String]
  },

  purchase_details: {
    amount_paid: { type: Number, required: true },
    currency: { type: String, default:'INR' },
    payment_status: {
      type: String,
      enum: ['pending','completed','failed','refunded'],
      default:'pending'
    },
    purchase_date: { type: Date, default: Date.now },
    access_granted: { type: Boolean, default: false },
    access_granted_date: Date,

    // For Physical Books - Delivery Details
    delivery_details: {
      address: {
        fullName: String,
        phone: String,
        email: String,
        house: String,
        area: String,
        landmark: String,
        pincode: String,
        district: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default:'India' }
      },
      delivery_status: {
        type: String,
        enum: ['pending','processing','shipped','delivered','cancelled'],
        default:'pending'
      },
      tracking_number: String,
      estimated_delivery: Date,
      actual_delivery: Date,
      delivery_notes: String
    }
  },

  razorpay_details: {
    order_id: String,
    payment_id: String,
    signature: String,
    receipt: String,
    status: String
  },

  download_details: {
    download_count: { type: Number, default: 0 },
    last_download: Date,
    download_limit: { type: Number, default: 5 }, // For PDF books
    download_expires: Date // Optional expiry for downloads
  },

  enrollment_source: { type: String, default:'web' },
  ip_address: String,
  user_agent: String

}, {
  timestamps: true
});

// Indexes
studentBookPurchaseSchema.index({ student_id: 1, book_id: 1 });
studentBookPurchaseSchema.index({'purchase_details.payment_status': 1 });
studentBookPurchaseSchema.index({'book_details.bookType': 1 });
studentBookPurchaseSchema.index({ createdAt: -1 });

// Instance methods
studentBookPurchaseSchema.methods.grantAccess = function () {
  this.purchase_details.access_granted = true;
  this.purchase_details.access_granted_date = new Date();
  return this.save();
};

studentBookPurchaseSchema.methods.updateDeliveryStatus = function (status, trackingNumber = null) {
  this.purchase_details.delivery_details.delivery_status = status;
  if (trackingNumber) {
    this.purchase_details.delivery_details.tracking_number = trackingNumber;
  }
  if (status ==='delivered') {
    this.purchase_details.delivery_details.actual_delivery = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('StudentBookPurchase', studentBookPurchaseSchema);
