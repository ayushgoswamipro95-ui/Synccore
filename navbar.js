// Global Navbar State & Authentication Modal Controller
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
});

function initNavbar() {
    const navContent = document.querySelector('.navbar .nav-content');
    if (!navContent) return;

    // Check if user is logged in
    const user = window.API ? window.API.getUser() : null;

    // Check if auth container already exists
    let authArea = document.getElementById('nav-auth-container') || document.getElementById('nav-auth-area');
    if (!authArea) {
        authArea = document.createElement('div');
        authArea.id = 'nav-auth-area';
        authArea.style.display = 'flex';
        authArea.style.alignItems = 'center';
        authArea.style.gap = '0.75rem';
        navContent.appendChild(authArea);
    }

    const isInsidePages = window.location.pathname.includes('/pages/');
    const myBookingsUrl = isInsidePages ? 'my-bookings.html' : 'pages/my-bookings.html';

    if (user) {
        authArea.innerHTML = `
            <a href="${myBookingsUrl}" class="nav-link" style="display:flex; align-items:center; gap:0.35rem; color:#fff;">
                <span style="font-size:1.1rem;">👤</span>
                <span style="font-weight:600;">${user.name || user.email.split('@')[0]}</span>
            </a>
            <button id="btn-global-logout" type="button" class="btn btn-secondary btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem; border-color:rgba(255,255,255,0.2);">
                Logout
            </button>
        `;

        const logoutBtn = document.getElementById('btn-global-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (window.API) await window.API.logout();
                if (window.Toast) Toast.info('Logged out successfully.');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            });
        }
    } else {
        authArea.innerHTML = `
            <button id="btn-global-login" type="button" class="btn btn-primary btn-sm" style="font-weight:700; padding:0.35rem 0.85rem; font-size:0.8rem;">
                🔐 Sign In / Register
            </button>
        `;

        const loginBtn = document.getElementById('btn-global-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                openAuthModal('login');
            });
        }
    }
}

// Global Auth Modal Helper
function openAuthModal(initialTab = 'login', onSuccessCallback = null) {
    if (typeof initialTab === 'function') {
        onSuccessCallback = initialTab;
        initialTab = 'login';
    }

    const isSignup = (initialTab === 'signup');

    const modalHtml = `
        <div style="margin-bottom:1.25rem; display:flex; border-bottom:1px solid var(--border-color);">
            <button id="tab-auth-login" type="button" class="btn btn-secondary btn-sm" style="flex:1; border-radius:0; border-bottom:2px solid ${isSignup ? 'transparent' : 'var(--accent-cyan)'}; color:${isSignup ? 'var(--text-muted)' : '#fff'}; font-weight:700;">
                Log In
            </button>
            <button id="tab-auth-signup" type="button" class="btn btn-secondary btn-sm" style="flex:1; border-radius:0; border-bottom:2px solid ${isSignup ? 'var(--accent-cyan)' : 'transparent'}; color:${isSignup ? '#fff' : 'var(--text-muted)'}; font-weight:700;">
                Sign Up
            </button>
        </div>

        <!-- Login Form -->
        <form id="modal-form-login" style="display:${isSignup ? 'none' : 'block'};">
            <div class="form-group" style="margin-bottom:1rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.3rem; display:block;">Email / Gmail *</label>
                <input type="email" id="modal-login-email" class="form-control" placeholder="e.g. user@gmail.com" required autocomplete="email" style="width:100%;">
            </div>
            <div class="form-group" style="margin-bottom:1.5rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.3rem; display:block;">Password *</label>
                <input type="password" id="modal-login-pass" class="form-control" placeholder="Enter your account password" required autocomplete="current-password" style="width:100%;">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; font-weight:700;">
                Log In &rarr;
            </button>
        </form>

        <!-- Signup Form -->
        <form id="modal-form-signup" style="display:${isSignup ? 'block' : 'none'};">
            <div class="form-group" style="margin-bottom:0.85rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">Full Name *</label>
                <input type="text" id="modal-signup-name" class="form-control" placeholder="e.g. Ayush Sharma" required autocomplete="name" style="width:100%;">
            </div>
            <div class="form-group" style="margin-bottom:0.85rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">Email / Gmail *</label>
                <input type="email" id="modal-signup-email" class="form-control" placeholder="e.g. ayush@gmail.com" required autocomplete="email" style="width:100%;">
            </div>
            <div class="form-group" style="margin-bottom:0.85rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">Password * (Min 4 chars)</label>
                <input type="password" id="modal-signup-pass" class="form-control" placeholder="Create a strong password" required autocomplete="new-password" style="width:100%;">
            </div>
            <div class="form-group" style="margin-bottom:0.85rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">Confirm Password *</label>
                <input type="password" id="modal-signup-pass-confirm" class="form-control" placeholder="Re-enter password" required autocomplete="new-password" style="width:100%;">
            </div>
            <div class="form-group" style="margin-bottom:1.25rem;">
                <label style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">Phone Number (Optional)</label>
                <input type="tel" id="modal-signup-phone" class="form-control" placeholder="e.g. +91 9876543210" autocomplete="tel" style="width:100%;">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; font-weight:700;">
                Create Account &rarr;
            </button>
        </form>
    `;

    if (window.Modal) {
        Modal.open('SyncCore Customer Authentication', modalHtml);

        const tabLogin = document.getElementById('tab-auth-login');
        const tabSignup = document.getElementById('tab-auth-signup');
        const formLogin = document.getElementById('modal-form-login');
        const formSignup = document.getElementById('modal-form-signup');

        if (tabLogin && tabSignup) {
            tabLogin.addEventListener('click', () => {
                tabLogin.style.borderBottomColor = 'var(--accent-cyan)';
                tabLogin.style.color = '#fff';
                tabSignup.style.borderBottomColor = 'transparent';
                tabSignup.style.color = 'var(--text-muted)';
                formLogin.style.display = 'block';
                formSignup.style.display = 'none';
            });

            tabSignup.addEventListener('click', () => {
                tabSignup.style.borderBottomColor = 'var(--accent-cyan)';
                tabSignup.style.color = '#fff';
                tabLogin.style.borderBottomColor = 'transparent';
                tabLogin.style.color = 'var(--text-muted)';
                formSignup.style.display = 'block';
                formLogin.style.display = 'none';
            });
        }

        // Handle Login Submission
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('modal-login-email').value.trim();
                const pass = document.getElementById('modal-login-pass').value;

                if (!email || !pass) {
                    if (window.Toast) Toast.error('Please enter both email and password.');
                    return;
                }

                const res = await window.API.login(email, pass);
                if (res.success) {
                    if (window.Toast) Toast.success(res.message || 'Logged in successfully!');
                    Modal.close();
                    initNavbar();
                    if (typeof onSuccessCallback === 'function') {
                        onSuccessCallback(res.user);
                    } else {
                        window.location.reload();
                    }
                } else {
                    if (window.Toast) Toast.error(res.message || 'Invalid credentials');
                }
            });
        }

        // Handle Signup Submission
        if (formSignup) {
            formSignup.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('modal-signup-name').value.trim();
                const email = document.getElementById('modal-signup-email').value.trim();
                const pass = document.getElementById('modal-signup-pass').value;
                const passConf = document.getElementById('modal-signup-pass-confirm').value;
                const phone = document.getElementById('modal-signup-phone').value.trim();

                if (pass !== passConf) {
                    if (window.Toast) Toast.error('Passwords do not match. Please verify.');
                    return;
                }

                if (pass.length < 4) {
                    if (window.Toast) Toast.error('Password must be at least 4 characters.');
                    return;
                }

                const res = await window.API.signup(name, email, pass, phone);
                if (res.success) {
                    if (window.Toast) Toast.success(res.message || 'Account created successfully!');
                    Modal.close();
                    initNavbar();
                    if (typeof onSuccessCallback === 'function') {
                        onSuccessCallback(res.user);
                    } else {
                        window.location.reload();
                    }
                } else {
                    if (window.Toast) Toast.error(res.message || 'Signup failed');
                }
            });
        }
    }
}

// Function to enforce authentication before an action
window.requireAuth = function(actionCallback) {
    if (window.API && window.API.isLoggedIn()) {
        actionCallback(window.API.getUser());
    } else {
        if (window.Toast) Toast.info('Please sign in or create an account to proceed.');
        openAuthModal(actionCallback);
    }
};

window.openAuthModal = openAuthModal;
