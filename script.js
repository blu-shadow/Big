// ======================================================
// DXW E-COMMERCE CORE LOGIC - FINAL REPAIR v15.0
// ======================================================

const BASE_URL = 'https://dadaxwear.com';
const API_BASE_URL = `${BASE_URL}/api`;

let allProducts = []; 
let cart = JSON.parse(localStorage.getItem('dxw_cart')) || [];

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initApp();
});

// ১. APP INITIALIZATION (FIXED PATH DETECTION)
async function initApp() {
    updateCartUI(); 
    
    const path = window.location.pathname;
    const page = path.split("/").pop().toLowerCase();

    // হোস্টিংগারের জন্য সেফ ডিটেকশন
    const isIndex = page === '' || page === 'index.html' || page === 'index' || path === '/';

    if (isIndex) {
        console.log("Initializing Index Page...");
        await fetchProducts();
        await loadLogo();
    } 
    else if (page.includes('checkout.html')) {
        if(cart.length === 0) {
            showToast("🛒 Your cart is empty!");
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    }
}

// ২. PRODUCT FETCH & RENDER
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Server Error");
        
        allProducts = await response.json();
        renderGrids();
    } catch (error) {
        console.error("Fetch error:", error);
        setTimeout(fetchProducts, 5000); 
    }
}

function renderGrids() {
    const popularGrid = document.getElementById('popular-products');
    const allGrid = document.getElementById('all-products');
    const popCount = document.getElementById('pop-count');

    if (allGrid) {
        allGrid.innerHTML = allProducts.map(p => createCard(p)).join('');
    }
    
    if (popularGrid) {
        const populars = allProducts.filter(p => {
            const cat = (p.category || "").toLowerCase();
            return cat.includes('popular') || p.isPopular === true || p.featured === true;
        });

        const toRender = populars.length > 0 ? populars : allProducts.slice(0, 5);
        popularGrid.innerHTML = toRender.map(p => createCard(p)).join('');
        if(popCount) popCount.innerText = toRender.length;
    }
}

function createCard(p) {
    const imgUrl = p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image.startsWith('/') ? '' : '/'}${p.image}`;
    
    return `
        <div class="product-card" onclick="goToDetails('${p._id}')">
            <div class="img-wrapper">
                <img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <div class="card-badge">${p.category || 'Premium'}</div>
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="card-bottom">
                    <span class="product-price">${Number(p.price).toLocaleString()} TK</span>
                    <button class="add-btn-small" onclick="event.stopPropagation(); quickAdd('${p._id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ৩. CART SYSTEM (SYNCHRONIZED WITH CHECKOUT)
window.quickAdd = function(id) {
    const product = allProducts.find(p => p._id === id);
    if (!product) return;

    // পপুলার গ্রিড থেকে সরাসরি অ্যাড করলে ডিফল্ট ভ্যালু যাবে
    const existingIdx = cart.findIndex(item => item.id === id);
    
    if (existingIdx !== -1) {
        cart[existingIdx].quantity++;
    } else {
        cart.push({
            id: product._id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        });
    }
    saveCart();
    showToast("🛍️ Added to Bag!");
    animateCartBadge();
};

window.updateQty = function(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if(idx === -1) return;
    
    cart[idx].quantity += delta;
    if(cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }
    saveCart();
};

function saveCart() {
    localStorage.setItem('dxw_cart', JSON.stringify(cart));
    updateCartUI();
    
    // যদি ইউজার চেকআউট পেজে থাকে, তবে সেখানেও সামারি আপডেট করতে হবে
    if (typeof renderCheckoutSummary === 'function') {
        renderCheckoutSummary();
    }
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const badge = document.getElementById('cart-count-badge');
    const subtotalEl = document.getElementById('cart-subtotal');
    const footer = document.getElementById('cart-footer');
    
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);

    if(badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if(subtotalEl) subtotalEl.innerText = subtotal.toLocaleString();
    if(footer) footer.style.display = cart.length > 0 ? 'block' : 'none';

    if(list) {
        if(cart.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:40px; opacity:0.5;"><p>Empty Bag</p></div>`;
        } else {
            list.innerHTML = cart.map(item => {
                const imgUrl = item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
                return `
                <div class="cart-item">
                    <img src="${imgUrl}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="cart-item-details" style="flex:1; margin-left:10px;">
                        <h4 style="font-size:0.85rem; margin:0;">${item.name}</h4>
                        <p style="color:var(--primary); font-weight:700; margin:2px 0;">${Number(item.price).toLocaleString()} TK</p>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }
}

// ৪. NAVIGATION & FILTER
window.goToDetails = function(id) {
    if(!id) return;
    window.location.href = `product-details.html?id=${String(id).trim()}`;
};

window.filterByCategory = function(category, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const allGrid = document.getElementById('all-products');
    if(!allGrid) return;

    if(category === 'all') {
        allGrid.innerHTML = allProducts.map(p => createCard(p)).join('');
    } else {
        const filtered = allProducts.filter(p => {
            const pCat = (p.category || "").toLowerCase().trim();
            const target = category.toLowerCase().trim().replace(/-/g, " ");
            return pCat === target || pCat.includes(target);
        });
        allGrid.innerHTML = filtered.length > 0 ? filtered.map(p => createCard(p)).join('') : `<div style="grid-column:1/-1; text-align:center; padding:50px; opacity:0.5;">No items found</div>`;
    }
};

async function loadLogo() {
    try {
        const res = await fetch(`${API_BASE_URL}/settings/logo`);
        const data = await res.json();
        if(data && data.logo) {
            const logoEl = document.getElementById('site-logo-display');
            if(logoEl) logoEl.src = data.logo.startsWith('http') ? data.logo : `${BASE_URL}${data.logo.startsWith('/')?'':'/'}${data.logo}`;
        }
    } catch(e) {}
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerHTML = msg;
    document.body.classList.add('show-toast');
    setTimeout(() => document.body.classList.remove('show-toast'), 3000);
}

function animateCartBadge() {
    const badge = document.getElementById('cart-count-badge');
    if(badge) {
        badge.classList.remove('badge-pulse');
        void badge.offsetWidth; 
        badge.classList.add('badge-pulse');
    }
}
