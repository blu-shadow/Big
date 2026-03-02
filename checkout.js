// ======================================================
// DADAXWEAR CHECKOUT SYSTEM - REPAIRED v17.0
// ======================================================

const BASE_URL = 'https://dadaxwear.com';
const API_BASE_URL = `${BASE_URL}/api`;

window.processOrder = async function() {
    console.log("অর্ডার প্রসেস শুরু হচ্ছে...");
    const btn = document.getElementById('place-order-btn');
    
    try {
        const cart = JSON.parse(localStorage.getItem('dxw_cart')) || [];
        if (cart.length === 0) {
            alert("❌ আপনার ব্যাগ খালি! কেনাকাটা করুন।");
            return;
        }

        // ইনপুট ভ্যালু সংগ্রহ
        const nameVal = document.getElementById('cust-name')?.value.trim();
        const phoneVal = document.getElementById('cust-phone')?.value.trim();
        const addrVal = document.getElementById('cust-address')?.value.trim();
        const sizeVal = document.getElementById('order-size')?.value || "Free Size";
        const handVal = document.getElementById('order-hand')?.value || "Default";
        const areaEl = document.getElementById('delivery-area');
        
        // পেমেন্ট মেথড চেক
        const paymentRadio = document.querySelector('input[name="payment"]:checked');
        const trxInput = document.getElementById('trx-id');

        // ১. প্রাথমিক ভ্যালিডেশন
        if (!nameVal || !phoneVal || !addrVal) {
            alert("❌ অনুগ্রহ করে নাম, ফোন এবং পূর্ণ ঠিকানা দিন।");
            return;
        }

        if (!paymentRadio) {
            alert("❌ অনুগ্রহ করে একটি পেমেন্ট মেথড সিলেক্ট করুন।");
            return;
        }

        // ২. শিপিং এবং টোটাল ক্যালকুলেশন
        const shippingCharge = areaEl ? parseInt(areaEl.value) : 60;
        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const totalAmount = subtotal + shippingCharge;

        // ৩. ব্যাক-এন্ডের জন্য ডাটা অবজেক্ট তৈরি
        const orderData = {
            customer: {
                name: nameVal,
                phone: phoneVal,
                address: addrVal
            },
            items: cart.map(item => {
                // এখানে আইডি চেক করা হচ্ছে
                const pId = item.id || item._id;
                return {
                    productId: String(pId), // আইডি স্ট্রিং হিসেবে কনভার্ট করা
                    name: item.name,
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price),
                    size: sizeVal,
                    handType: handVal
                };
            }),
            shippingArea: areaEl ? areaEl.options[areaEl.selectedIndex].text : "ঢাকার ভেতরে",
            shippingCharge: shippingCharge,
            totalAmount: totalAmount,
            paymentMethod: paymentRadio.value.toLowerCase(),
            transactionId: (paymentRadio.value !== 'cod') ? (trxInput?.value.trim() || 'N/A') : 'N/A'
        };

        console.log("সার্ভারে পাঠানো ডাটা:", orderData);

        // বাটন লোডিং স্টেট
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> প্রসেস হচ্ছে...`;

        // ৪. সার্ভারে ডাটা পাঠানো
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await res.json();

        if (res.ok) {
            console.log("অর্ডার সফলভাবে সেভ হয়েছে:", result);
            localStorage.removeItem('dxw_cart'); // কার্ট পরিষ্কার
            
            // সাকসেস মোডাল চেক
            const modal = document.getElementById('order-success-modal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                alert("✅ আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!");
                window.location.href = "index.html";
            }
        } else {
            console.error("সার্ভার রেসপন্স এরর:", result);
            alert("❌ অর্ডার ব্যর্থ হয়েছে: " + (result.message || "সার্ভার এরর।"));
        }

    } catch (err) {
        console.error("নেটওয়ার্ক বা জেএস এরর:", err);
        alert("❌ একটি কারিগরি সমস্যা হয়েছে। আপনার ইন্টারনেট চেক করুন অথবা কনসোল দেখুন।");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>CONFIRM ORDER</span> <i class="fas fa-arrow-right"></i>`;
        }
    }
};

// টোস্ট নোটিফিকেশন ফাংশন
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = msg;
    document.body.classList.add('show-toast');
    setTimeout(() => document.body.classList.remove('show-toast'), 3000);
}
