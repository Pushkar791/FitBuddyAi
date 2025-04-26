// Common.js - Handles loading common components like header and footer

document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        loadHeader();
    }
    
    // Load footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        loadFooter();
    }
    
    // Load Firebase
    loadFirebase();
});

/**
 * Loads the header component into the header placeholder
 */
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if (!headerPlaceholder) return;
    
    // Create the header HTML
    const headerHTML = `
    <header>
        <div class="nav-container">
            <div class="logo">
                <a href="index.html">
                    <i class="fas fa-heartbeat"></i>
                    <span>FitBuddy</span>
                </a>
            </div>
            
            <nav id="main-nav">
                <div class="mobile-menu-toggle">
                    <i class="fas fa-bars"></i>
                </div>
                
                <ul class="nav-main-menu">
                    <li><a href="index.html">Home</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">Features <i class="fas fa-angle-down"></i></a>
                        <ul class="dropdown-menu">
                            <li><a href="index.html#she-sync"><i class="fas fa-venus"></i> SHE SYNC</a></li>
                            <li><a href="index.html#emotional-wellness"><i class="fas fa-smile"></i> Emotional Wellness</a></li>
                            <li><a href="index.html#neuroacoustic"><i class="fas fa-music"></i> Neuroacoustic</a></li>
                            <li><a href="index.html#hand-gestures"><i class="fas fa-hand-paper"></i> Hand Gestures</a></li>
                            <li><a href="index.html#air-piano"><i class="fas fa-piano-keyboard"></i> Air Piano</a></li>
                            <li><a href="index.html#stress-games"><i class="fas fa-gamepad"></i> Stress Games</a></li>
                        </ul>
                    </li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">Health Tools <i class="fas fa-angle-down"></i></a>
                        <ul class="dropdown-menu">
                            <li><a href="index.html#workout-recommendations"><i class="fas fa-dumbbell"></i> Workout Planner</a></li>
                            <li><a href="index.html#she-sync"><i class="fas fa-calendar-alt"></i> Period Tracker</a></li>
                        </ul>
                    </li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">Resources <i class="fas fa-angle-down"></i></a>
                        <ul class="dropdown-menu">
                            <li><a href="#"><i class="fas fa-question-circle"></i> Help Center</a></li>
                            <li><a href="#contact"><i class="fas fa-envelope"></i> Contact Us</a></li>
                            <li><a href="#"><i class="fas fa-user-md"></i> Find a Specialist</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
            
            <div class="nav-right">
                <button class="theme-toggle" title="Toggle dark mode">
                    <i class="fas fa-moon"></i>
                </button>
                <div class="notification-icon" title="Notifications">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge">2</span>
                </div>
                <div class="auth-buttons">
                    <li><a href="#login" class="auth-link btn-login">Sign In</a></li>
                    <li><a href="#signup" class="auth-link btn-signup">Sign Up</a></li>
                </div>
                <div id="profile-menu-container" class="profile-menu-container" style="display: none;"></div>
            </div>
        </div>
    </header>
    `;
    
    // Insert the header
    headerPlaceholder.innerHTML = headerHTML;
    
    // Initialize mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Initialize dropdowns for mobile
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Handle mobile dropdown toggle clicks (for touch devices)
    if (window.innerWidth <= 768) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                // Only trigger if we're in mobile view
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = this.parentNode;
                    const dropdownMenu = parent.querySelector('.dropdown-menu');
                    
                    // Check if this dropdown is already active
                    const isActive = dropdownMenu.style.display === 'block';
                    
                    // Close all dropdowns first
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        menu.style.display = 'none';
                    });
                    
                    document.querySelectorAll('.dropdown-toggle i').forEach(icon => {
                        icon.style.transform = 'rotate(0)';
                    });
                    
                    // Toggle the current dropdown
                    if (!isActive) {
                        dropdownMenu.style.display = 'block';
                        this.querySelector('i').style.transform = 'rotate(180deg)';
                    }
                }
            });
        });
    }
    
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        // Check for saved theme preference or respect OS preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkTheme)) {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
        
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // Update icon
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Notification icon functionality
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            alert('Notifications feature coming soon!');
        });
    }
    
    // Auth links
    const authLinks = document.querySelectorAll('.auth-link');
    authLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1); // Remove # from href
            if (typeof loadAuthPage === 'function') {
                loadAuthPage(target);
            } else {
                console.error('Auth functionality not available');
                alert('Please go to the main page to log in or sign up.');
            }
        });
    });
}

/**
 * Loads the footer component into the footer placeholder
 */
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (!footerPlaceholder) return;
    
    // Create the footer HTML
    const footerHTML = `
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h3 class="gradient-text">FitBuddy</h3>
                    <p>Your AI-powered health and wellness companion</p>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="index.html#home">Home</a></li>
                        <li><a href="index.html#features">Features</a></li>
                        <li><a href="index.html#she-sync">SHE SYNC</a></li>
                        <li><a href="index.html#emotional-wellness">Emotional Wellness</a></li>
                        <li><a href="index.html#neuroacoustic">Neuroacoustic</a></li>
                        <li><a href="index.html#hand-gestures">Hand Gestures</a></li>
                        <li><a href="index.html#air-piano">Air Piano</a></li>
                        <li><a href="index.html#stress-games">Stress Games</a></li>
                    </ul>
                </div>
                <div class="footer-social">
                    <h4>Connect With Us</h4>
                    <div class="social-icons">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 FitBuddy. All rights reserved.</p>
            </div>
        </div>
    </footer>
    `;
    
    // Insert the footer
    footerPlaceholder.innerHTML = footerHTML;
}

/**
 * Dynamically loads Firebase SDK scripts and initializes Firebase
 */
function loadFirebase() {
    // Check if Firebase is already loaded
    if (typeof firebase !== 'undefined') {
        console.log('Firebase already loaded');
        return;
    }
    
    // Load Firebase scripts
    const scripts = [
        { src: 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js' },
        { src: 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth-compat.js' },
        { src: 'https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics-compat.js' },
        { src: 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore-compat.js' },
        { src: 'https://www.gstatic.com/firebasejs/9.19.1/firebase-storage-compat.js' }
    ];
    
    loadScriptsSequentially(scripts, 0, initializeFirebase);
}

/**
 * Loads scripts sequentially to ensure proper loading order
 */
function loadScriptsSequentially(scripts, index, callback) {
    if (index >= scripts.length) {
        if (callback) callback();
        return;
    }
    
    const script = document.createElement('script');
    script.src = scripts[index].src;
    script.onload = function() {
        loadScriptsSequentially(scripts, index + 1, callback);
    };
    script.onerror = function() {
        console.error('Error loading script:', scripts[index].src);
        loadScriptsSequentially(scripts, index + 1, callback);
    };
    
    document.body.appendChild(script);
}

/**
 * Initialize Firebase with configuration
 */
function initializeFirebase() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCdV4-6kFNRQ5LVZ4Mgy8XXRUVcdq_wDtk",
        authDomain: "fitbuddy-829c8.firebaseapp.com",
        projectId: "fitbuddy-829c8",
        storageBucket: "fitbuddy-829c8.firebasestorage.app",
        messagingSenderId: "96621796266",
        appId: "1:96621796266:web:84b759a1e7feb5a830a9d3",
        measurementId: "G-RJC2FJ46X7"
    };
    
    // Initialize Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        const analytics = firebase.analytics();
        console.log('Firebase initialized successfully');
        
        // Set up auth state listener
        const auth = firebase.auth();
        auth.onAuthStateChanged(updateUserInterface);
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

/**
 * Updates the UI based on authentication state
 */
function updateUserInterface(user) {
    const authLinks = document.querySelectorAll('.auth-link');
    const profileMenuContainer = document.getElementById('profile-menu-container');
    
    if (!profileMenuContainer) return;
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        
        // Hide auth links
        authLinks.forEach(link => {
            if (link.parentElement) {
                link.parentElement.style.display = 'none';
            }
        });
        
        // Show profile menu with user info
        profileMenuContainer.innerHTML = `
            <div class="profile-toggle">
                <div class="profile-avatar">
                    ${user.photoURL ? `<img src="${user.photoURL}" alt="${user.displayName || user.email}">` : 
                      `<span>${(user.displayName || user.email || '').charAt(0).toUpperCase()}</span>`}
                </div>
                <span class="profile-name">${user.displayName || user.email}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="profile-dropdown">
                <div class="profile-header">
                    <div class="profile-dropdown-avatar">
                        ${user.photoURL ? `<img src="${user.photoURL}" alt="${user.displayName || user.email}">` : 
                          `<span>${(user.displayName || user.email || '').charAt(0).toUpperCase()}</span>`}
                    </div>
                    <div class="profile-dropdown-info">
                        <div class="profile-dropdown-name">${user.displayName || 'User'}</div>
                        <div class="profile-dropdown-email">${user.email}</div>
                    </div>
                </div>
                <ul class="profile-dropdown-menu">
                    <li><a href="#profile"><i class="fas fa-user"></i> My Profile</a></li>
                    <li><a href="#settings"><i class="fas fa-cog"></i> Settings</a></li>
                    <li><a href="#" id="logout-button"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </div>
        `;
        
        // Set up logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                firebase.auth().signOut()
                    .then(() => {
                        console.log('User signed out');
                        window.location.href = 'index.html';
                    })
                    .catch(error => {
                        console.error('Error signing out:', error);
                    });
            });
        }
        
        // Set up profile toggle
        const profileToggle = document.querySelector('.profile-toggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', function() {
                document.querySelector('.profile-dropdown').classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!profileToggle.contains(e.target) && !document.querySelector('.profile-dropdown').contains(e.target)) {
                    document.querySelector('.profile-dropdown').classList.remove('show');
                }
            });
        }
        
        profileMenuContainer.style.display = 'block';
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Show auth links
        authLinks.forEach(link => {
            if (link.parentElement) {
                link.parentElement.style.display = 'block';
            }
        });
        
        // Hide profile menu
        profileMenuContainer.style.display = 'none';
    }
} 