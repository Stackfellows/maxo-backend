const express = require('express');
const router = express.Router();
const { createOrder, trackOrder, getAllOrders, updateOrderStatus, getMyOrders } = require('../Controller/orderController');
const { protectAdmin, protectUser } = require('../Middelware/authMiddleware');

router.post('/', createOrder); // Optional user link in controller
router.get('/my-orders', protectUser, getMyOrders);
router.get('/all', protectAdmin, getAllOrders);
router.get('/:orderNumber', trackOrder);
router.put('/:id/status', protectAdmin, updateOrderStatus);

module.exports = router;
