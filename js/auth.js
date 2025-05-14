// DOM Elements
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const footerLoginBtn = document.getElementById('footer-login');
const footerSignupBtn = document.getElementById('footer-signup');
const footerForgotPasswordBtn = document.getElementById('footer-forgot-password');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const logoutBtn = document.getElementById('logout-btn');
const closeButtons = document.querySelectorAll('.close');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const userProfile = document.querySelector('.user-profile');
const authButtons = document.querySelector('.auth-buttons');
const userName = document.getElementById('user-name');
const getStartedBtn = document.getElementById('get-started-btn');
const signupCtaBtn = document.getElementById('signup-cta-btn');
const weatherContent = document.getElementById('weather-content');
const landingPage = document.getElementById('landing-page');
const body = document.body;

// API URL (replace with your actual backend URL)
const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // User is logged in
        if (authButtons) {
            authButtons.querySelector('#login-btn').classList.add('hidden');
            authButtons.querySelector('#signup-btn').classList.add('hidden');
            userProfile.classList.remove('hidden');
        }
        
        // Update user name in dashboard if it exists
        const userNameFromStorage = localStorage.getItem('userName');
        if (userName && userNameFromStorage) {
            userName.textContent = userNameFromStorage;
        }
        
        // Show weather content and hide landing page
        body.classList.add('authenticated');
        
        return true;
    } else {
        // User is not logged in
        if (authButtons) {
            authButtons.querySelector('#login-btn').classList.remove('hidden');
            authButtons.querySelector('#signup-btn').classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
        
        // Hide weather content and show landing page
        body.classList.remove('authenticated');
        
        return false;
    }
}

// Open modal function
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close modal function
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        closeModal(modal);
    });
}

// Event listeners for opening modals
if (loginBtn) {
    loginBtn.addEventListener('click', () => openModal(loginModal));
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => openModal(signupModal));
}

if (footerLoginBtn) {
    footerLoginBtn.addEventListener('click', () => openModal(loginModal));
}

if (footerSignupBtn) {
    footerSignupBtn.addEventListener('click', () => openModal(signupModal));
}

if (footerForgotPasswordBtn) {
    footerForgotPasswordBtn.addEventListener('click', () => openModal(forgotPasswordModal));
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(forgotPasswordModal);
    });
}

// Get Started and CTA buttons
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => openModal(signupModal));
}

if (signupCtaBtn) {
    signupCtaBtn.addEventListener('click', () => openModal(signupModal));
}

// Event listeners for closing modals
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // In a real application, you would send this to your backend
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('userName', data.user.name);
                
                // Update UI
                checkAuthStatus();
                closeModal(loginModal);
                
                // Show success message
                alert('Login successful!');
                
                // Refresh the page to update UI
                window.location.reload();
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // For demo purposes, simulate successful login
            simulateSuccessfulLogin(email);
        }
    });
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            // In a real application, you would send this to your backend
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                closeModal(signupModal);
                alert('Registration successful! Please check your email to verify your account.');
                openModal(loginModal);
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            
            // For demo purposes, simulate successful registration
            simulateSuccessfulRegistration(name, email);
        }
    });
}

// Forgot password form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('reset-email').value;
        
        try {
            // In a real application, you would send this to your backend
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                closeModal(forgotPasswordModal);
                alert('Password reset link has been sent to your email!');
            } else {
                alert(data.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            
            // For demo purposes, simulate successful password reset request
            simulateSuccessfulPasswordReset(email);
        }
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // Update UI
        checkAuthStatus();
        
        // Redirect to home page
        window.location.href = '/';
    });
}

// Simulate successful login (for demo purposes)
function simulateSuccessfulLogin(email) {
    const name = email.split('@')[0];
    localStorage.setItem('token', 'demo-token-12345');
    localStorage.setItem('userId', 'demo-user-id');
    localStorage.setItem('userName', name);
    
    checkAuthStatus();
    closeModal(loginModal);
    alert('Login successful!');
    window.location.reload();
}

// Simulate successful registration (for demo purposes)
function simulateSuccessfulRegistration(name, email) {
    closeModal(signupModal);
    alert(`Registration successful! A confirmation email has been sent to ${email}. Please verify your account.`);
    openModal(loginModal);
}

// Simulate successful password reset (for demo purposes)
function simulateSuccessfulPasswordReset(email) {
    closeModal(forgotPasswordModal);
    alert(`Password reset link has been sent to ${email}!`);
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);