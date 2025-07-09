import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    sku: String
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  billingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    sameAsShipping: {
      type: Boolean,
      default: true
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      required: true,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'COD']
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    failureReason: String
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded'
    ],
    default: 'Pending'
  },
  tracking: {
    courierName: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    updates: [{
      status: String,
      message: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  notes: {
    customer: String,
    admin: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', 'system']
    },
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed']
    }
  },
  return: {
    reason: String,
    requestedAt: Date,
    approvedAt: Date,
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Picked Up', 'Completed']
    },
    refundAmount: Number
  },
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^VD${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `VD${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Calculate pricing before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotal
    this.pricing.subtotal = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Calculate GST (18% default)
    this.pricing.gst = Math.round(this.pricing.subtotal * 0.18);
    
    // Calculate total
    this.pricing.total = this.pricing.subtotal + this.pricing.gst + this.pricing.shipping - this.pricing.discount;
  }
  next();
});

// Copy shipping address to billing if same
orderSchema.pre('save', function(next) {
  if (this.billingAddress.sameAsShipping) {
    this.billingAddress = {
      ...this.shippingAddress,
      sameAsShipping: true
    };
  }
  next();
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
