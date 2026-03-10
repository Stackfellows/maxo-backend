const asyncHandler = require('express-async-handler');
const Product = require('../Models/Product');
const { cloudinary } = require('../Middelware/uploadMiddleware');

// @desc    Get all products (optional ?category= filter)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.category) {
        filter.category = req.query.category;
    }
    if (req.query.newArrival === 'true') {
        filter.newArrival = true;
    }
    if (req.query.collection) {
        filter.collection = req.query.collection;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, data: product });
});

// @desc    Create product (with Cloudinary image)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, category, subCategory, description, newArrival, collection } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('Product image is required');
    }

    const product = await Product.create({
        name,
        price: Number(price),
        category,
        subCategory: subCategory || '',
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
        description: description || '',
        newArrival: newArrival === 'true' || newArrival === true,
        collection: collection || ''
    });

    res.status(201).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    // Remove image from Cloudinary
    if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, category, subCategory, description, newArrival, collection } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Prepare update data
    const updateData = {
        name: name || product.name,
        price: price ? Number(price) : product.price,
        category: category || product.category,
        subCategory: subCategory !== undefined ? subCategory : product.subCategory,
        description: description !== undefined ? description : product.description,
        newArrival: newArrival !== undefined ? (newArrival === 'true' || newArrival === true) : product.newArrival,
        collection: collection !== undefined ? collection : product.collection
    };

    // If new image uploaded
    if (req.file) {
        // Delete old image from Cloudinary
        if (product.imagePublicId) {
            await cloudinary.uploader.destroy(product.imagePublicId);
        }
        updateData.imageUrl = req.file.path;
        updateData.imagePublicId = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedProduct });
});

module.exports = { getProducts, getProductById, createProduct, deleteProduct, updateProduct };
