const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery'
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    }
}, { timestamps: true });

// Auto-generate order number before saving
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        this.orderNumber = 'MX' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
    }
});

module.exports = mongoose.model('Order', orderSchema);
