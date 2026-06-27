// API endpoints
const API_URL = 'http://localhost:5000/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    } else if (!token && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    console.log('Login form submitted');
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Attempting login with:', { email });

    try {
        console.log('Making API request to:', `${API_URL}/login`);
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});

// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Clear previous error messages
    document.getElementById('signupErrorMsg').textContent = '';

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        document.getElementById('signupErrorMsg').textContent = 'All fields are required';
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('signupErrorMsg').textContent = 'Please enter a valid email address';
        return;
    }

    // Validate password length
    if (password.length < 6) {
        document.getElementById('signupErrorMsg').textContent = 'Password must be at least 6 characters long';
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        document.getElementById('signupErrorMsg').textContent = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Signup successful
            alert('Signup successful! Please login.');
            window.location.href = 'index.html';
        } else {
            // Show error message from server
            document.getElementById('signupErrorMsg').textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        console.error('Error during signup:', error);
        document.getElementById('signupErrorMsg').textContent = 'An error occurred during signup. Please try again.';
    }
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
});

// Load user's subscriptions
async function loadSubscriptions() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/subscriptions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const subscriptions = await response.json();
            displaySubscriptions(subscriptions);
        }
    } catch (error) {
        console.error('Error loading subscriptions:', error);
    }
}

// Display subscriptions in the UI
function displaySubscriptions(subscriptions) {
    const subscriptionGrid = document.querySelector('.subscription-grid');
    if (!subscriptionGrid) return;

    const services = {
        netflix: {
            name: 'Netflix',
            logo: 'images/netflix-logo.png'
        },
        disney: {
            name: 'Disney+ Hotstar',
            logo: 'images/disney-logo.png'
        }
    };

    Object.entries(services).forEach(([service, info]) => {
        const subscription = subscriptions.find(s => s.service_name === service);
        const status = subscription ? subscription.subscription_status : 'inactive';
        
        const card = document.createElement('div');
        card.className = 'subscription-card';
        card.onclick = () => location.href = `subscription-details.html?service=${service}`;
        
        card.innerHTML = `
            <img src="${info.logo}" alt="${info.name}">
            <h3>${info.name}</h3>
            <span class="status ${status}">${status}</span>
        `;
        
        subscriptionGrid.appendChild(card);
    });
}

// Load user's invoices
async function loadInvoices() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/invoices`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const invoices = await response.json();
            displayInvoices(invoices);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

// Display invoices in the UI
function displayInvoices(invoices) {
    const invoicesList = document.getElementById('invoicesList');
    if (!invoicesList) return;

    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p>No invoices found</p>';
        return;
    }

    const token = localStorage.getItem('token');

    invoicesList.innerHTML = invoices.map(invoice => `
        <div class="invoice-item">
            <div class="invoice-details">
                <p class="service">${invoice.service_name}</p>
                <p class="plan">${invoice.plan_name}</p>
                <p class="amount">₹${invoice.paid_amount}</p>
                <p class="date">${new Date(invoice.payment_date).toLocaleDateString()}</p>
            </div>
            <a href="${API_URL}/download-invoice/${invoice.payment_id}?token=${token}" class="download-btn" target="_blank">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `).join('');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Tab switching logic for index.html (Login / Signup tabs)
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (tabs.length && loginForm && signupForm) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const targetTab = tab.dataset.tab;
                if (targetTab === 'login') {
                    loginForm.classList.remove('hidden');
                    signupForm.classList.add('hidden');
                } else {
                    loginForm.classList.add('hidden');
                    signupForm.classList.remove('hidden');
                }
            });
        });
    }

    // Toggle password visibility on index.html
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = togglePasswordBtn.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const userName = localStorage.getItem('userName');
        if (userName) {
            userNameElement.textContent = `Welcome, ${userName}`;
        }
    }
    loadSubscriptions();
    loadInvoices();
}); 