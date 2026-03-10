const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats } = require('../Controller/adminController');
const { protectAdmin } = require('../Middelware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/stats', protectAdmin, getDashboardStats);

module.exports = router;
