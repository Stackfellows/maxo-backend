const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Offer title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Offer description is required']
    },
    imageUrl: {
        type: String,
        required: [true, 'Offer image is required']
    },
    imagePublicId: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '/shop'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
