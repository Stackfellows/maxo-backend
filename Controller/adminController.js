const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../Models/Admin');
const Order = require('../Models/Order');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !(await admin.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    res.json({
        success: true,
        data: {
            _id: admin._id,
            email: admin.email,
            role: 'admin',
            token: generateToken(admin._id)
        }
    });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    res.json({
        success: true,
        data: {
            totalOrders,
            totalRevenue: revenue,
            processingOrders,
            shippedOrders,
            deliveredOrders
        }
    });
});

module.exports = { loginAdmin, getDashboardStats };
