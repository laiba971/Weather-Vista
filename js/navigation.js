// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
const pages = document.querySelectorAll('.page');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-links');
const dashboardMenuLinks = document.querySelectorAll('.dashboard-menu a');
const dashboardSections = document.querySelectorAll('.dashboard-section');

// Function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Function to navigate to a page
function navigateToPage(pageId) {
    // Check if page requires authentication
    const selectedPage = document.getElementById(pageId);
    if (selectedPage && selectedPage.classList.contains('auth-required-page') && !isAuthenticated()) {
        alert('Please login to access this page.');
        
        // Open login modal
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'block';
        }
        
        return;
    }
    
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // If navigating to dashboard, show the overview section by default
        if (pageId === 'dashboard') {
            navigateToDashboardSection('overview');
        }
        
        // Update URL hash
        window.location.hash = pageId;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Close mobile menu if open
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

// Function to navigate to dashboard section
function navigateToDashboardSection(sectionId) {
    console.log('Navigating to dashboard section:', sectionId);
    
    // Hide all dashboard sections
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        console.log('Section activated:', sectionId);
    } else {
        console.error('Dashboard section not found:', sectionId);
    }
    
    // Update active menu link
    dashboardMenuLinks.forEach(link => {
        const linkSectionId = link.getAttribute('href').substring(1);
        if (linkSectionId === sectionId) {
            link.parentElement.classList.add('active');
        } else {
            link.parentElement.classList.remove('active');
        }
    });
}

// Event listeners for navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
    });
});

// Event listeners for footer navigation
footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
    });
});

// Event listeners for dashboard navigation
dashboardMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        navigateToDashboardSection(sectionId);
    });
});

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Make navigateToDashboardSection globally available
window.navigateToDashboardSection = navigateToDashboardSection;

// Check URL hash on page load
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateToPage(hash);
    }
    
    // Add click event listeners to any elements with data-section attributes
    document.querySelectorAll('[data-section]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = element.getAttribute('data-section');
            navigateToDashboardSection(sectionId);
        });
    });
    
    // Add click event listeners to "View All" links in the dashboard
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                navigateToDashboardSection(sectionId);
            }
        });
    });
});