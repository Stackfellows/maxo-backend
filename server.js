require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./DB/db');
const Admin = require('./Models/Admin');
const User = require('./Models/User');

// Routes
const productRoutes = require('./Routes/productRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const userRoutes = require('./Routes/userRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get("/", (req, res) => {
    res.send("Backend API is running successfully 🚀");
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Maxo API is running 🚀' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// Seed admin on startup
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL_MAXO;
        const adminPassword = process.env.ADMIN_PASSWORD_MAXO;

        if (!adminEmail || !adminPassword) {
            console.warn('⚠️ Admin credentials missing in .env');
            return;
        }

        // 1. Seed into consolidated User model (New System)
        const userExists = await User.findOne({ email: adminEmail.toLowerCase() });
        if (!userExists) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                phone: '0000000000',
                role: 'admin'
            });
            console.log('✅ Admin user added to User collection');
        } else {
            userExists.password = adminPassword;
            userExists.role = 'admin';
            await userExists.save();
            console.log('✅ Admin user verified/updated in User collection');
        }

        // 2. Sync with legacy Admin model (Legacy Support)
        const adminExists = await Admin.findOne({ email: adminEmail.toLowerCase() });

        if (!adminExists) {
            await Admin.create({
                email: adminEmail,
                password: adminPassword
            });
            console.log('✅ Legacy Admin account created');
        } else {
            adminExists.password = adminPassword;
            await adminExists.save();
        }
    } catch (err) {
        console.error('Admin seed error:', err.message);
    }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await seedAdmin();
});
