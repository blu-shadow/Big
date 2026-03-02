const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    নতুন অর্ডার তৈরি করা (কাস্টমারের জন্য)
// @route   POST /api/orders
router.post('/', asyncHandler(async (req, res) => {
    const { 
        customer, 
        items, 
        shippingArea, 
        shippingCharge, 
        totalAmount, 
        paymentMethod, 
        transactionId 
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('আপনার কার্টে কোনো পণ্য নেই!');
    }

    const order = new Order({
        customer,
        items,
        shippingArea,
        shippingCharge,
        totalAmount,
        paymentMethod: paymentMethod.toLowerCase(),
        transactionId: transactionId || 'N/A'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
}));

// @desc    সব অর্ডার দেখা (অ্যাডমিনের জন্য)
// @route   GET /api/orders
router.get('/', asyncHandler(async (req, res) => {
    // ডাটাবেস থেকে সব অর্ডার লেটেস্ট অনুযায়ী নিয়ে আসবে
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
}));

// @desc    অর্ডার স্ট্যাটাস আপডেট করা (অ্যাডমিনের জন্য)
// @route   PUT /api/orders/:id/status
router.put('/:id/status', asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json({
            success: true,
            message: 'অর্ডার স্ট্যাটাস আপডেট করা হয়েছে।',
            order: updatedOrder
        });
    } else {
        res.status(404);
        throw new Error('অর্ডারটি খুঁজে পাওয়া যায়নি!');
    }
}));

// @desc    অর্ডার ডিলিট করা (যদি প্রয়োজন হয়)
// @route   DELETE /api/orders/:id
router.delete('/:id', asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        await order.deleteOne();
        res.json({ message: 'অর্ডারটি মুছে ফেলা হয়েছে।' });
    } else {
        res.status(404);
        throw new Error('অর্ডার পাওয়া যায়নি!');
    }
}));

module.exports = router;
