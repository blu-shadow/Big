// ===================================
// models/Product.js - UPGRADED Product Schema
// ===================================

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 
    },
    image: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true, // ক্লায়েন্ট ডিটেইলস চেয়েছে, তাই এটি জরুরি
        default: 'No description provided.'
    },
    category: {
        type: String,
        enum: ['popular', 'all'], // ক্লায়েন্টের চাহিদা অনুযায়ী ২টা অপশন
        default: 'all'
    },
    sizes: { 
        type: [String],
        default: ['M', 'L', 'XL', 'XXL'] // সাইজগুলো ডিফাইন করে রাখা ভালো
    },
    countInStock: {
        type: Number,
        default: 100,
        min: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true 
});

const Product = mongoose.model('Product', ProductSchema);

// পুরনো ইনডেক্স ক্লিনিং (যাতে ডুপ্লিকেট নাম নিয়ে সমস্যা না হয়)
Product.collection.dropIndexes().then(() => {
    console.log("🔥 Old Product indexes cleared!");
}).catch(err => {
    console.log("ℹ️ Product indexes are fresh.");
});

module.exports = Product;
