/**
 * DadaXWear - Profile Dashboard Logic
 */

const API_BASE = 'https://dadaxwear.com/api';

document.addEventListener('DOMContentLoaded', async () => {
    const userPhone = localStorage.getItem('user_phone');

    // যদি ফোন নম্বর না থাকে, তবে তাকে লগইন/সেটআপ পেজে পাঠাও
    if (!userPhone) {
        window.location.href = 'login.html';
        return;
    }

    // প্রোফাইল ডাটা লোড করা
    try {
        const res = await fetch(`${API_BASE}/user/get-profile/${userPhone}`);
        const data = await res.json();

        if (data.exists) {
            updateUI(data.user);
        } else {
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error("Profile Load Error:", err);
    }

    // সাইন আউট লজিক
    document.getElementById('signOutBtn').onclick = () => {
        localStorage.removeItem('user_phone');
        localStorage.removeItem('dxw_user');
        window.location.href = 'login.html';
    };

    // এডিট বাটন লজিক (লগইন পেজে ফেরত নিয়ে যাবে নতুন করে ফিল করতে)
    document.getElementById('editBtn').onclick = () => {
        window.location.href = 'login.html';
    };
});

function updateUI(user) {
    document.getElementById('display-name').innerText = user.name || 'User';
    document.getElementById('display-username').innerText = `@${user.username || 'username'}`;
    document.getElementById('display-email').innerText = user.email || '-';
    document.getElementById('display-phone').innerText = user.phone || '-';
    document.getElementById('display-birth').innerText = user.birthYear || '-';
    document.getElementById('display-age').innerText = user.age || '-';
    document.getElementById('display-address').innerText = user.address || '-';

    if (user.profileImage) {
        // যদি ইমেজ পাথে http না থাকে তবে সার্ভার ইউআরএল যোগ হবে
        const imgUrl = user.profileImage.startsWith('http') ? user.profileImage : `http://156.67.219.98:5001${user.profileImage}`;
        document.getElementById('display-img').src = imgUrl;
    }
}
