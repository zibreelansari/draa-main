const mongoose = require('mongoose');

const purchaseModelSchema = new mongoose.Schema({
  // Purchase Type
  purchase_type: {
    type: String,
    enum: ['course','subscription','ebook', ,'book','test_series','TestSeries','certification','other','topic_category','category','subject'],
    required: true
  },

  // Customer Information
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath:'customer_model'
  },
  customer_model: {
    type: String,
    enum: ['Student','Teacher','Admin'],
    required: true
  },
  customer_details: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },

  // Product/Service Information
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath:'item_model'
  },
  item_model: {
    type: String,
enum: ['Course','Subscription','Ebook','Book','Certification','TestSeries','TopicCategory','Subject','ExaminationCategory'],
    required: true
  },
  item_details: {
    name: {
      type: String,
      required: true
    },
    description: String,
    category: String,
    sku: String,
    image: String
  },
//  NEW CORE FIELDS (ADD HERE)
category_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref:'ExaminationCategory'
},

subject_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref:'Subject'
},

// Coins tracking
coins_used: {
  type: Number,
  default: 0
},

coin_discount_amount: {
  type: Number,
  default: 0
},
  // Financial Information
  pricing: {
  //  Base price before any calculations
  base_price: {
    type: Number,
    default: function() {
      return this.original_price ?? this.final_amount ?? 0;
    }
  },

  //  Original price (for showing discount)
  original_price: {
    type: Number
  },

  //  Discount (system or manual)
  discount_amount: {
    type: Number,
    default: 0
  },

  discount_percentage: {
    type: Number,
    default: 0
  },

  //  GST / TAX
  gst_amount: {
    type: Number,
    default: 0
  },

  tax_amount: {
    type: Number,
    default: 0
  },

  //  COINS (VERY IMPORTANT FOR YOUR SYSTEM)
  coin_discount: {
    type: Number,
    default: 0
  },

  coins_used: {
    type: Number,
    default: 0
  },

  coin_value: {
    type: Number,
    default: 0.10 // 0.10 per coin
  },

  //  FINAL PAYABLE
  final_amount: {
    type: Number,
    required: true
  },

  //  CURRENCY
  currency: {
    type: String,
    default:'INR'
  }
}
,
  // Payment Gateway Information
  payment_gateway: {
    type: String,
    enum: ['razorpay','stripe','paypal','bank_transfer','cash','free'],
    default:'razorpay'
  },
  gateway_details: {
    order_id: String,
    payment_id: String,
    signature: String,
    receipt: String,
    gateway_response: mongoose.Schema.Types.Mixed
  },

  // Purchase Status
  status: {
    type: String,
    enum: ['initiated','pending','completed','failed','cancelled','refunded','partially_refunded'],
    default:'initiated'
  },
  payment_status: {
    type: String,
    enum: ['unpaid','paid','failed','refunded','partially_refunded','free'],
    default:'unpaid'
  },

  //  ACCESS CONTROL
access_details: {
  granted: {
    type: Boolean,
    default: false
  },
  granted_at: Date,
  expires_at: Date,
  validity_days: {
    type: Number,
    default: 365
  }
},

  // Timestamps
  purchase_initiated_at: {
    type: Date,
    default: Date.now
  },
  payment_completed_at: Date,
  refund_initiated_at: Date,
  refund_completed_at: Date,

  // Billing Information
  billing_details: {
    invoice_number: String,
    invoice_date: Date,
    due_date: Date,
    tax_details: {
      gst_number: String,
      tax_rate: Number,
      tax_amount: Number
    }
  },

  // Discount & Coupon Information
  discount_details: {
    coupon_code: String,
    discount_type: {
      type: String,
      enum: ['percentage','fixed','buy_one_get_one']
    },
    discount_value: Number,
    discount_amount: Number
  },

  // Refund Information
  refund_details: {
    refund_amount: Number,
    refund_reason: String,
    refund_status: {
      type: String,
      enum: ['pending','processed','failed']
    },
    refund_transaction_id: String,
    refunded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Admin'
    },
    refunded_at: Date
  },

  // Additional Metadata
  metadata: {
    ip_address: String,
    user_agent: String,
    referrer: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    device_type: String,
    browser: String
  },

  // Delivery Information (Only for physical items like books)
  delivery_details: {
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: [
'pending',
'packed',
'shipped',
'out_for_delivery',
'delivered',
'cancelled'
      ],
      default:'pending'
    },
    courier: String,
    tracking_id: String,
    tracking_url: String,
    packed_at: Date,
    shipped_at: Date,
    delivered_at: Date
  },

  // Notes and Comments
  internal_notes: String,
  customer_notes: String,

},


  {
    timestamps: true
  });

// Indexes
purchaseModelSchema.index({ customer_id: 1, purchase_type: 1 });
purchaseModelSchema.index({ status: 1 });
purchaseModelSchema.index({ payment_status: 1 });
purchaseModelSchema.index({'gateway_details.order_id': 1 });
purchaseModelSchema.index({ purchase_initiated_at: -1 });
purchaseModelSchema.index({'billing_details.invoice_number': 1 });
purchaseModelSchema.pre('save', function(next) {

  if (this.purchase_type ==='book') {
    this.delivery_details = this.delivery_details || {};
    this.delivery_details.required = true;
  }

  next();
});
purchaseModelSchema.pre('save', function(next) {
  if (this.access_details?.granted && !this.access_details.expires_at) {
    this.access_details.expires_at = new Date(
      Date.now() + (this.access_details.validity_days || 365) * 86400000
    );
  }
  next();
});
const PurchaseModel = mongoose.model('PurchaseModel', purchaseModelSchema);
module.exports = PurchaseModel;
