const asyncHandler = require('express-async-handler');
const Offer = require('../Models/Offer');
const { cloudinary } = require('../Middelware/uploadMiddleware');

// @desc    Get active offer
// @route   GET /api/offers/active
// @access  Public
const getActiveOffer = asyncHandler(async (req, res) => {
    const offer = await Offer.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: offer });
});

// @desc    Get all offers
// @route   GET /api/offers
// @access  Admin
const getAllOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: offers.length, data: offers });
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Admin
const createOffer = asyncHandler(async (req, res) => {
    const { title, description, link, isActive } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('Offer image is required');
    }

    // Optional: Deactivate other offers if this one is active
    if (isActive === 'true' || isActive === true) {
        await Offer.updateMany({}, { isActive: false });
    }

    const offer = await Offer.create({
        title,
        description,
        link: link || '/shop',
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
        isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({ success: true, data: offer });
});

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Admin
const deleteOffer = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
        res.status(404);
        throw new Error('Offer not found');
    }
    // Remove image from Cloudinary
    if (offer.imagePublicId) {
        await cloudinary.uploader.destroy(offer.imagePublicId);
    }
    await offer.deleteOne();
    res.json({ success: true, message: 'Offer removed' });
});

// @desc    Update offer status
// @route   PUT /api/offers/:id/status
// @access  Admin
const updateOfferStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    
    if (isActive) {
        // Only one offer can be active at a time for the hero section
        await Offer.updateMany({}, { isActive: false });
    }

    const offer = await Offer.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    );

    if (!offer) {
        res.status(404);
        throw new Error('Offer not found');
    }

    res.json({ success: true, data: offer });
});

module.exports = { getActiveOffer, getAllOffers, createOffer, deleteOffer, updateOfferStatus };
