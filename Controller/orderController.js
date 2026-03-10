const asyncHandler = require('express-async-handler');
const Order = require('../Models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    const { customerName, phone, address, city, items, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items provided');
    }

    const jwt = require('jsonwebtoken');
    let userId = null;

    // Check for user token manually to link order if logged in
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            // Not a priority if token fails here, just proceed as guest
        }
    }

    const order = await Order.create({
        customerName,
        phone,
        address,
        city,
        user: userId,
        items,
        totalAmount,
        paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    res.status(201).json({
        success: true,
        data: {
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount
        }
    });
});

// @desc    Track order by order number (public)
// @route   GET /api/orders/:orderNumber
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
        res.status(404);
        throw new Error('Order not found. Please check your Order ID.');
    }
    res.json({ success: true, data: order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
    console.log(`Admin ${req.admin.email} is fetching all orders`);
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    order.status = req.body.status;
    await order.save();
    res.json({ success: true, data: order });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
});

module.exports = { createOrder, trackOrder, getAllOrders, updateOrderStatus, getMyOrders };
