const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ["Men's Suits", "Ladies Suits", "Ladies Bags"]
    },
    subCategory: {
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        type: String,
        required: [true, 'Product image is required']
    },
    imagePublicId: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    newArrival: {
        type: Boolean,
        default: false
    },
    collection: {
        type: String,
        enum: ['Summer', 'Winter', ''],
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
