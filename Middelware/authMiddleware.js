const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../Models/Admin'); // Keep for backward compatibility for now
const User = require('../Models/User');

const protectAdmin = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (req.user && req.user.role === 'admin') {
                req.admin = req.user;
                return next();
            }

            console.warn(`Access denied for user: ${req.user ? req.user.email : 'Unknown'}, Role: ${req.user ? req.user.role : 'None'}`);
            res.status(401);
            throw new Error('Not authorized as admin');
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const protectUser = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized as user');
            }
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protectAdmin, protectUser, protect: protectAdmin };
