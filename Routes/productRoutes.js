const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, deleteProduct, updateProduct } = require('../Controller/productController');
const { protectAdmin } = require('../Middelware/authMiddleware');
const { upload } = require('../Middelware/uploadMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protectAdmin, upload.single('image'), createProduct);
router.put('/:id', protectAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;
