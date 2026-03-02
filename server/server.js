// ===========================================
// server.js - DADAXWEAR PREMIUM SERVER v27.0
// =========================================== 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer'); 
const fs = require('fs');
const { ObjectId } = require('mongoose').Types; 

// রাউট ইমপোর্ট
const orderRoutes = require('./routes/orders'); 

dotenv.config();
const app = express();
const projectRoot = path.join(__dirname, '..'); 

// --- ১. CORS & সিকিউরিটি (Domain Based) ---
const corsOptions = {
    origin: [
        'https://dadaxwear.com', 
        'https://www.dadaxwear.com',
        'http://localhost:5001' // লোকাল টেস্টিং এর জন্য
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// ২. ফোল্ডার সেটআপ
const uploadDir = path.join(projectRoot, 'uploads');
const folders = ['profiles', 'logos', 'products'];
folders.forEach(f => {
    const dir = path.join(uploadDir, f);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}); 

// স্ট্যাটিক ফাইল এক্সেস
app.use('/uploads', express.static(uploadDir)); 
app.use(express.static(projectRoot)); 

// --- ৩. Multer কনফিগারেশন ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'products';
        if (file.fieldname === 'profileImage') folder = 'profiles';
        if (file.fieldname === 'logo') folder = 'logos';
        cb(null, path.join(uploadDir, folder));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }); 

// ৫. ডাটাবেস কানেকশন
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Dadaxwear DB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err)); 

// --- ৬. ইউজার প্রোফাইল API ---
app.post('/api/user/save-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false });
        const db = mongoose.connection.db;
        let updateData = { ...req.body, updatedAt: new Date() };
        if (req.file) updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
        await db.collection('users').updateOne({ phone: phone.trim() }, { $set: updateData }, { upsert: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/user/get-profile/:phone', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ phone: req.params.phone.trim() });
        res.json({ success: !!user, exists: !!user, user });
    } catch (err) { res.status(500).json({ success: false }); }
})

// --- ৭. অ্যাডমিন লোগো API ---
app.post('/api/admin/update-logo', upload.single('logo'), async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const logoPath = `/uploads/logos/${req.file.filename}`;
        await db.collection('settings').updateOne({ type: "site_config" }, { $set: { logo: logoPath } }, { upsert: true });
        res.json({ success: true, logo: logoPath });
    } catch (err) { res.status(500).json({ success: false }); }
}); 

app.get('/api/settings/logo', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const settings = await db.collection('settings').findOne({ type: "site_config" });
        res.json(settings || { logo: "/uploads/logos/default.png" });
    } catch (err) { res.status(500).json({ success: false }); }
}); 

// --- ৮. প্রোডাক্ট ম্যানেজমেন্ট --- 

app.post('/api/admin/add-product', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 3 }
]), async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        let mainImage = "";
        if (req.files['image']) {
            mainImage = `/uploads/products/${req.files['image'][0].filename}`;
        } 

        let galleryImages = [];
        if (req.files['gallery']) {
            galleryImages = req.files['gallery'].map(file => `/uploads/products/${file.filename}`);
        } 

        const productData = { 
            name: req.body.name,
            price: parseFloat(req.body.price),
            description: req.body.description || "",
            category: req.body.category || "All",
            image: mainImage,
            gallery: galleryImages,
            createdAt: new Date() 
        }; 

        await db.collection('products').insertOne(productData);
        res.json({ success: true, message: "Product added!" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
}); 

app.get('/api/products', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const products = await db.collection('products').find().sort({ createdAt: -1 }).toArray();
        res.json(products);
    } catch (err) { res.status(500).json([]); }
}); 

app.get('/api/products/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ success: false, message: "Not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
}); 

app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
}); 

// --- ৯. অর্ডার ম্যানেজমেন্ট ---
app.use('/api/orders', orderRoutes); 

// ১০. ডিফল্ট রাউটিং
app.get('/', (req, res) => res.sendFile(path.join(projectRoot, 'index.html')));

app.get('/:page', (req, res, next) => {
    let page = req.params.page;
    if (!page.includes('.')) page += '.html';
    const filePath = path.join(projectRoot, page);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else next();
}); 

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Online at https://dadaxwear.com`);
});
