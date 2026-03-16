const express = require('express');
const router = express.Router();
const { getActiveOffer, getAllOffers, createOffer, deleteOffer, updateOfferStatus } = require('../Controller/offerController');
const { protectAdmin } = require('../Middelware/authMiddleware');
const { upload } = require('../Middelware/uploadMiddleware');

// Public route
router.get('/active', getActiveOffer);

// Admin routes
router.get('/', protectAdmin, getAllOffers);
router.post('/', protectAdmin, upload.single('image'), createOffer);
router.delete('/:id', protectAdmin, deleteOffer);
router.put('/:id/status', protectAdmin, updateOfferStatus);


module.exports = router;
