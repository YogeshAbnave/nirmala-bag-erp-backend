const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebUser', // Reference to the user
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    images: [{
      type: String,
      required: true
    }],
    bestseller: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      required: true
    },
    subCategory: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'Razorpay', 'COD'],
    default: 'COD'
  },
  paid: {
    type: Boolean,
    required: true,
    default: false // This is for marking if the payment is done
  }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.order || mongoose.model('order', orderSchema);
