const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all products (For index.html & admin.html)
// @route   GET /api/products
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
}));

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}));

// @desc    Add new product (Admin Only)
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const { name, price, image, description, category } = req.body;

    const product = new Product({
        name,
        price,
        image,
        description: description || "Premium Quality Jersey",
        category: category || "Jersey",
        user: req.user._id // যে এডমিন পোস্ট করছে তার আইডি
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
}));

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed successfully' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}));

module.exports = router;
