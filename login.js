/**
 * Gents Choice - Profile Setup & Login Logic
 */

const API_BASE_URL = 'https://dadaxwear.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const previewImg = document.getElementById('previewImg');
    const setupForm = document.getElementById('profile-setup-form');
    const submitBtn = document.getElementById('submitBtn');

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewImg) previewImg.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (setupForm) {
        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const phone = document.getElementById('phone').value.trim();
            const name = document.getElementById('name').value.trim();
            const birthYear = document.getElementById('birthYear').value;
            const age = document.getElementById('age').value;

            if (!phone || !name) {
                return showToast("⚠️ Name and Phone are required!");
            }

            submitBtn.disabled = true;
            const btnText = document.getElementById('btnText');
            const btnLoader = document.getElementById('btnLoader');
            if (btnText) btnText.style.opacity = '0.5';
            if (btnLoader) btnLoader.style.display = 'inline-block';

            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', document.getElementById('username').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', phone);
            formData.append('birthYear', birthYear);
            formData.append('age', age);
            formData.append('address', document.getElementById('address').value);

            if (fileInput.files[0]) {
                formData.append('profileImage', fileInput.files[0]);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/user/save-profile`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('user_phone', phone);
                    showToast("✅ Profile Created Successfully!");
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1500);
                } else {
                    showToast("❌ Error: " + (result.message || "Failed to save"));
                }
            } catch (error) {
                console.error("Setup Error:", error);
                showToast("❌ Server Connection Failed!");
            } finally {
                submitBtn.disabled = false;
                if (btnText) btnText.style.opacity = '1';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}
