// ======================================================
// DXW AUTHENTICATION LOGIC - CLIENT SIDE (SYNCED)
// ======================================================

const AUTH_API = 'https://dadaxwear.com/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    // ১. লগইন ফর্ম হ্যান্ডলার
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // ২. সাইনআপ ফর্ম হ্যান্ডলার
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// --- লগইন ফাংশন ---
async function handleLogin(e) {
    e.preventDefault();
    // ব্যাকএন্ডে 'username' নামে পাঠানো হচ্ছে, তাই এখানে login-email ফিল্ডের ভ্যালুকেও username ধরতে হবে
    const username = document.getElementById('login-email').value; 
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    setLoading(submitBtn, true);

    try {
        const response = await fetch(`${AUTH_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // ব্যাকএন্ড লজিকের সাথে মিল রেখে username পাঠানো হচ্ছে
            body: JSON.stringify({ username, password }) 
        });

        const data = await response.json();

        if (response.ok) {
            // ডাটাবেস থেকে আসা টোকেন ও ইউজার তথ্য সেভ করা
            localStorage.setItem('dxw_token', data.token);
            localStorage.setItem('dxw_user', JSON.stringify({
                _id: data._id,
                username: data.username,
                role: data.role
            }));
            localStorage.setItem('isLoggedIn', 'true');

            showToast("✅ Login Successful!");
            
            // রোল অনুযায়ী রিডাইরেক্ট
            setTimeout(() => {
                if (data.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
            }, 1000);
        } else {
            showToast(`❌ ${data.message || 'Login Failed'}`);
        }
    } catch (error) {
        showToast("❌ Server error. Try again!");
    } finally {
        setLoading(submitBtn, false);
    }
}

// --- সাইনআপ ফাংশন ---
async function handleSignup(e) {
    e.preventDefault();
    // তোমার ব্যাকএন্ডে 'username' আছে, তাই আমরা ইমেইল বা ইউজারনেম ফিল্ড থেকে এটি নেব
    const username = document.getElementById('reg-email').value; 
    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;
    const submitBtn = document.getElementById('signup-submit-btn');

    if (password !== confirmPass) {
        showToast("❌ Passwords do not match!");
        return;
    }

    setLoading(submitBtn, true);

    try {
        const response = await fetch(`${AUTH_API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }) // ব্যাকএন্ডে শুধু এই দুটি পাঠানো হচ্ছে
        });

        const data = await response.json();

        if (response.ok) {
            showToast("🎉 Account Created! Please Login.");
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showToast(`❌ ${data.message || 'Signup Failed'}`);
        }
    } catch (error) {
        showToast("❌ Connection failed!");
    } finally {
        setLoading(submitBtn, false);
    }
}

// --- হেল্পার ফাংশন ---
function setLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.id.includes('login') ? 'SIGN IN <i class="fas fa-sign-in-alt"></i>' : 'CREATE ACCOUNT <i class="fas fa-user-plus"></i>';
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const container = document.getElementById('toast-container');
    if (toast && container) {
        toast.innerText = msg;
        container.classList.add('show');
        setTimeout(() => container.classList.remove('show'), 3000);
    } else {
        alert(msg);
    }
}
