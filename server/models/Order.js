const mongoose = require('mongoose');

// ১. আইটেম সাব-স্কিমা
// এখানে productId কে স্ট্রিং হিসেবে রাখা হয়েছে যাতে ভুল আইডি ফরম্যাটের কারণে অর্ডার রিজেক্ট না হয়
const OrderItemSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true 
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    handType: { type: String, required: true }
});

// ২. মূল অর্ডার স্কিমা
const OrderSchema = new mongoose.Schema({
    // কাস্টমারের তথ্য
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    // কার্ট আইটেমস
    items: [OrderItemSchema],
    
    // শিপিং এবং পেমেন্ট
    shippingArea: { type: String, required: true },
    shippingCharge: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['cod', 'bkash', 'nagad'] // পেমেন্ট মেথড লিমিট করে দেওয়া হলো
    },
    transactionId: { 
        type: String, 
        default: 'N/A' 
    },
    
    // অর্ডার স্ট্যাটাস
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] 
    },
    deliveredAt: { type: Date }
}, { 
    timestamps: true // এটি অটোমেটিক createdAt এবং updatedAt তৈরি করবে
});

// মডেল এক্সপোর্ট
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
