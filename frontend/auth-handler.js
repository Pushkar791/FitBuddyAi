// Authentication UI Handler
// This script manages the display of login/signup forms without requiring page navigation

// Global variables
let currentAuthPage = null;
const authComponents = {
  login: {
    title: 'Sign in to your account',
    formHtml: `
      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <div id="login-error" class="error-message" style="display: none;"></div>
        <button type="submit">Sign in</button>
        <div class="auth-divider">
          <span>OR</span>
        </div>
        <button type="button" id="google-login" class="google-auth-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
        <p class="auth-switch">
          Don't have an account? <a href="#signup" onclick="loadAuthPage('signup'); return false;">Sign up</a>
        </p>
      </form>
    `
  },
  signup: {
    title: 'Create your account',
    formHtml: `
      <form id="signup-form" class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" name="confirm-password" required>
        </div>
        <div id="signup-error" class="error-message" style="display: none;"></div>
        <button type="submit">Sign up</button>
        <div class="auth-divider">
          <span>OR</span>
        </div>
        <button type="button" id="google-signup" class="google-auth-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign up with Google
        </button>
        <p class="auth-switch">
          Already have an account? <a href="#login" onclick="loadAuthPage('login'); return false;">Sign in</a>
        </p>
      </form>
    `
  }
};

// Initialize Firebase when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if Firebase is loaded properly
  if (typeof firebase !== 'undefined') {
    console.log('Firebase SDK loaded');
    
    // Check if Firebase config has been properly set up
    try {
      const config = firebase.app().options;
      
      // Check if placeholder values are still being used
      if (config.apiKey === "YOUR_API_KEY" || 
          config.apiKey.includes("REPLACE_WITH") || 
          config.projectId === "YOUR_PROJECT_ID" || 
          config.projectId.includes("REPLACE_WITH")) {
        
        console.error('Firebase configuration contains placeholder values!');
        alert('Firebase configuration error: You need to replace the placeholder values with your actual Firebase project details. Check the console for more information.');
        
        console.log('Follow these steps to set up Firebase:');
        console.log('1. Go to https://console.firebase.google.com/');
        console.log('2. Create a new project');
        console.log('3. Add a web app to your project');
        console.log('4. Copy the configuration values');
        console.log('5. Replace the placeholder values in index.html');
        
        return;
      }
      
      // Initialize authentication
      const auth = firebase.auth();
      
      // Check if the page loaded with a hash
      const hash = window.location.hash.substring(1);
      if (hash === 'login') {
        loadAuthPage('login');
      } else if (hash === 'signup') {
        loadAuthPage('signup');
      }
      
      // Set up auth state listener
      auth.onAuthStateChanged(function(user) {
        // Get auth links and profile elements
        const authLinks = document.querySelectorAll('.auth-link');
        const profileMenuContainer = document.getElementById('profile-menu-container') || createProfileMenuContainer();
        
        if (user) {
          // User is signed in
          console.log('User is signed in:', user.email);
          
          // Hide auth links
          authLinks.forEach(link => {
            link.parentElement.style.display = 'none';
          });
          
          // Show profile menu with user info
          updateProfileMenu(user);
          profileMenuContainer.style.display = 'block';
          
          if (currentAuthPage) {
            window.location.hash = 'dashboard';
            closeAuthPage();
          }
        } else {
          // User is signed out
          console.log('User is signed out');
          
          // Show auth links
          authLinks.forEach(link => {
            link.parentElement.style.display = 'block';
          });
          
          // Hide profile menu
          profileMenuContainer.style.display = 'none';
        }
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      alert('Firebase initialization error: ' + error.message);
    }
  } else {
    console.error('Firebase SDK not loaded');
    alert('Firebase SDK not loaded. Please check your internet connection and try again.');
  }
  
  // Show welcome popup after a small delay
  setTimeout(showWelcomePopup, 2000);
});

// Function to load authentication page
function loadAuthPage(page) {
  if (!authComponents[page]) {
    console.error('Unknown auth page:', page);
    return;
  }
  
  currentAuthPage = page;
  
  // Hide all sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Hide header content and footer
  document.querySelector('header').classList.add('auth-mode');
  if (document.querySelector('footer')) {
    document.querySelector('footer').style.display = 'none';
  }
  
  // Create or show the auth container
  let authContainer = document.getElementById('auth-container');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'auth-container';
    authContainer.className = 'auth-container';
    document.body.appendChild(authContainer);
  } else {
    authContainer.style.display = 'flex';
  }
  
  // Set the content of the auth container
  authContainer.innerHTML = `
    <div class="auth-card">
      <h2>${authComponents[page].title}</h2>
      ${authComponents[page].formHtml}
      <div class="auth-back">
        <a href="#home" onclick="closeAuthPage(); return false;">Back to Home</a>
      </div>
    </div>
  `;
  
  // Attach event listeners to forms
  if (page === 'login') {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-login').addEventListener('click', handleGoogleAuth);
  } else if (page === 'signup') {
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('google-signup').addEventListener('click', handleGoogleAuth);
  }
}

// Function to close auth page
function closeAuthPage() {
  // Show all sections again
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'block';
  });
  
  // Show header content and footer
  document.querySelector('header').classList.remove('auth-mode');
  if (document.querySelector('footer')) {
    document.querySelector('footer').style.display = 'block';
  }
  
  // Hide auth container
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.style.display = 'none';
  }
  
  currentAuthPage = null;
}

// Handle Google authentication
function handleGoogleAuth() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase not initialized');
    return;
  }

  const errorElement = document.getElementById(currentAuthPage === 'login' ? 'login-error' : 'signup-error');
  
  // Show loading state in the button
  const googleButton = document.getElementById(currentAuthPage === 'login' ? 'google-login' : 'google-signup');
  const originalButtonText = googleButton.innerHTML;
  
  // Create the loading text with inline SVG
  const loadingHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg> Connecting...`;
  
  googleButton.innerHTML = loadingHTML;
  googleButton.disabled = true;
  
  // Clear previous errors
  errorElement.style.display = 'none';
  
  // Firebase Google authentication
  const provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Successfully signed in with Google
      console.log('Google authentication successful');
      window.location.hash = 'dashboard';
      closeAuthPage();
    })
    .catch((error) => {
      // Handle errors
      console.error('Google auth error:', error);
      errorElement.textContent = error.message || 'Google authentication failed';
      errorElement.style.display = 'block';
    })
    .finally(() => {
      // Reset button state
      googleButton.innerHTML = originalButtonText;
      googleButton.disabled = false;
    });
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  
  if (typeof firebase === 'undefined') {
    console.error('Firebase not initialized');
    return;
  }
  
  // Get the form directly
  const form = e.target;
  
  // Get form values
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const errorElement = document.getElementById('login-error');
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Signing in...';
  submitButton.disabled = true;
  
  // Clear previous errors
  errorElement.style.display = 'none';
  
  // Basic validation
  if (!email || !password) {
    errorElement.textContent = 'Please enter both email and password';
    errorElement.style.display = 'block';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return;
  }
  
  // Firebase authentication
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Successfully signed in
      console.log('Login successful');
      window.location.hash = 'dashboard';
      closeAuthPage();
    })
    .catch((error) => {
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage;
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again';
      }
      
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
}

// Handle signup form submission
function handleSignup(e) {
  e.preventDefault();
  
  if (typeof firebase === 'undefined') {
    console.error('Firebase not initialized');
    return;
  }
  
  // Get the form directly
  const form = e.target;
  
  // Get form values directly from the form elements
  const name = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const confirmPassword = form.querySelector('#confirm-password').value;
  const errorElement = document.getElementById('signup-error');
  
  // Debug info
  console.log('Form elements found:', {
    nameField: form.querySelector('#name') !== null,
    emailField: form.querySelector('#email') !== null,
    passwordField: form.querySelector('#password') !== null,
    confirmPasswordField: form.querySelector('#confirm-password') !== null
  });
  console.log('Name length:', name.length);
  console.log('Email length:', email.length);
  console.log('Password length:', password.length);
  console.log('Confirm password length:', confirmPassword.length);
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Creating account...';
  submitButton.disabled = true;
  
  // Clear previous errors
  errorElement.style.display = 'none';
  
  // Validate form data
  if (!name) {
    errorElement.textContent = 'Please enter your name';
    errorElement.style.display = 'block';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return;
  }
  
  if (!email) {
    errorElement.textContent = 'Please enter your email';
    errorElement.style.display = 'block';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return;
  }
  
  if (password.length < 6) {
    errorElement.textContent = 'Password must be at least 6 characters';
    errorElement.style.display = 'block';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return;
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    errorElement.textContent = 'Passwords do not match';
    errorElement.style.display = 'block';
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return;
  }
  
  // Firebase authentication - create new user
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Successfully signed up
      console.log('Signup successful');
      
      // Update user profile with name
      userCredential.user.updateProfile({
        displayName: name
      }).then(() => {
        console.log('User profile updated');
      }).catch((error) => {
        console.error('Error updating user profile:', error);
      });
      
      window.location.hash = 'dashboard';
      closeAuthPage();
    })
    .catch((error) => {
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message || 'Signup failed. Please try again';
      }
      
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
}

// Check for hash changes to handle authentication pages
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.substring(1); // Remove the # character
  if (hash === 'login') {
    loadAuthPage('login');
  } else if (hash === 'signup') {
    loadAuthPage('signup');
  } else if ((hash === 'home' || hash === '') && currentAuthPage) {
    closeAuthPage();
  }
});

// Create profile menu container if it doesn't exist
function createProfileMenuContainer() {
  const nav = document.getElementById('main-nav');
  const ul = nav.querySelector('ul');
  
  const li = document.createElement('li');
  li.id = 'profile-menu-container';
  li.className = 'profile-menu-container';
  li.style.display = 'none';
  
  li.innerHTML = `
    <a href="#" class="profile-toggle">
      <img src="assets/default-avatar.png" alt="Profile" class="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=User&background=random'">
      <span class="profile-name">User</span>
      <i class="fas fa-chevron-down"></i>
    </a>
    <div class="profile-dropdown">
      <div class="profile-header">
        <img src="assets/default-avatar.png" alt="Profile" class="profile-dropdown-avatar" onerror="this.src='https://ui-avatars.com/api/?name=User&size=50&background=random'">
        <div class="profile-dropdown-info">
          <div class="profile-dropdown-name">User</div>
          <div class="profile-dropdown-email">user@example.com</div>
        </div>
      </div>
      <ul class="profile-dropdown-menu">
        <li><a href="#profile"><i class="fas fa-user"></i> My Profile</a></li>
        <li><a href="#settings"><i class="fas fa-cog"></i> Settings</a></li>
        <li><a href="#" id="logout-button"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      </ul>
    </div>
  `;
  
  ul.appendChild(li);
  
  // Add event listeners for the profile menu
  const profileToggle = li.querySelector('.profile-toggle');
  const profileDropdown = li.querySelector('.profile-dropdown');
  const logoutButton = li.querySelector('#logout-button');
  
  profileToggle.addEventListener('click', function(e) {
    e.preventDefault();
    profileDropdown.classList.toggle('show');
  });
  
  logoutButton.addEventListener('click', function(e) {
    e.preventDefault();
    signOut();
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!li.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });
  
  return li;
}

// Update profile menu with user info
function updateProfileMenu(user) {
  const profileContainer = document.getElementById('profile-menu-container');
  if (!profileContainer) return;
  
  const profileName = profileContainer.querySelector('.profile-name');
  const dropdownName = profileContainer.querySelector('.profile-dropdown-name');
  const dropdownEmail = profileContainer.querySelector('.profile-dropdown-email');
  const avatars = profileContainer.querySelectorAll('.profile-avatar, .profile-dropdown-avatar');
  
  // Set name and email
  const displayName = user.displayName || 'User';
  profileName.textContent = displayName;
  dropdownName.textContent = displayName;
  dropdownEmail.textContent = user.email;
  
  // Set avatar if user has a photoURL
  if (user.photoURL) {
    avatars.forEach(avatar => {
      avatar.src = user.photoURL;
    });
  } else {
    // Use name initials for avatar via UI Avatars API
    const initials = encodeURIComponent(displayName);
    avatars.forEach(avatar => {
      avatar.onerror = null; // Remove previous error handler
      avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=random`;
    });
  }
}

// Sign out function
function signOut() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase not initialized');
    return;
  }
  
  firebase.auth().signOut()
    .then(() => {
      console.log('User signed out');
      window.location.hash = 'home';
    })
    .catch((error) => {
      console.error('Error signing out:', error);
      alert('Error signing out: ' + error.message);
    });
}

// Add function to show welcome popup for new users
function showWelcomePopup() {
  // Check if user has seen the popup before
  if (localStorage.getItem('welcomePopupShown')) {
    return;
  }
  
  // Create welcome popup element
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'welcome-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="welcome-popup">
      <button class="welcome-popup-close"><i class="fas fa-times"></i></button>
      <div class="welcome-popup-content">
        <h3>Welcome to FitBuddy!</h3>
        <p>Sign up or log in to save your progress and access all features.</p>
        <div class="welcome-popup-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Without an account, your data might be lost when you close the browser.</p>
        </div>
        <div class="welcome-popup-buttons">
          <button id="welcome-signup-btn" class="btn btn-primary">Sign Up</button>
          <button id="welcome-login-btn" class="btn btn-secondary">Log In</button>
          <button id="welcome-later-btn" class="btn btn-text">Maybe Later</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popupOverlay);
  
  // Add event listeners
  const closeBtn = popupOverlay.querySelector('.welcome-popup-close');
  const signupBtn = popupOverlay.querySelector('#welcome-signup-btn');
  const loginBtn = popupOverlay.querySelector('#welcome-login-btn');
  const laterBtn = popupOverlay.querySelector('#welcome-later-btn');
  
  function closePopup() {
    popupOverlay.classList.add('closing');
    setTimeout(() => {
      document.body.removeChild(popupOverlay);
    }, 300);
    localStorage.setItem('welcomePopupShown', 'true');
  }
  
  closeBtn.addEventListener('click', closePopup);
  
  signupBtn.addEventListener('click', function() {
    closePopup();
    loadAuthPage('signup');
  });
  
  loginBtn.addEventListener('click', function() {
    closePopup();
    loadAuthPage('login');
  });
  
  laterBtn.addEventListener('click', closePopup);
  
  // Show popup with animation
  setTimeout(() => {
    popupOverlay.classList.add('active');
  }, 1000);
} 