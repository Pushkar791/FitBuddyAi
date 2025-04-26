// User Profile Management
// This script handles user profile functionality

// Profile data schema (stored in Firebase)
// {
//   displayName: string,
//   email: string,
//   photoURL: string,
//   fitnessGoals: string,
//   age: number,
//   gender: string,
//   weight: number,
//   height: number,
//   activityLevel: string,
//   bio: string,
//   preferences: {
//     notifications: boolean,
//     theme: string,
//     units: string
//   },
//   healthMetrics: {
//     mentalScore: number,
//     physicalScore: number,
//     sleepQuality: number,
//     stressLevel: number,
//     mindfulnessMinutes: number,
//     weeklyWorkouts: number
//   }
// }

// Initialize profile page when loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check for profile page
  if (window.location.hash === '#profile') {
    loadProfilePage();
  }
  
  // Listen for hash changes
  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#profile') {
      loadProfilePage();
    }
  });
});

// Load profile page
function loadProfilePage() {
  // Make sure the user is authenticated
  const auth = firebase.auth();
  const user = auth.currentUser;
  
  if (!user) {
    // Redirect to login if not authenticated
    window.location.hash = 'login';
    return;
  }
  
  // Create or show the profile page container
  let profileContainer = document.getElementById('profile-container');
  if (!profileContainer) {
    profileContainer = document.createElement('div');
    profileContainer.id = 'profile-container';
    profileContainer.className = 'profile-page';
    document.body.appendChild(profileContainer);
  } else {
    profileContainer.style.display = 'block';
  }
  
  // Show loading state
  profileContainer.innerHTML = `
    <div class="profile-loading">
      <div class="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>
  `;
  
  // Get user data from Firestore (if exists)
  getUserProfileData(user.uid)
    .then((profileData) => {
      // Render profile wizard
      renderProfileWizard(user, profileData);
    })
    .catch((error) => {
      console.error("Error loading profile data:", error);
      // Render profile wizard with just auth data
      renderProfileWizard(user);
    });
  
  // Hide other sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
}

// Render profile wizard with multi-step form
function renderProfileWizard(user, profileData = null) {
  const profileContainer = document.getElementById('profile-container');
  
  // Use auth data combined with any additional profile data
  const data = {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    fitnessGoals: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    bio: '',
    preferences: {
      notifications: true,
      theme: 'light',
      units: 'metric'
    },
    healthMetrics: {
      mentalScore: 0,
      physicalScore: 0,
      sleepQuality: 0,
      stressLevel: 0,
      mindfulnessMinutes: 0,
      weeklyWorkouts: 0
    },
    ...profileData // Override with data from Firestore if available
  };
  
  profileContainer.innerHTML = `
    <div class="profile-wizard">
      <div class="wizard-header">
        <h2>Profile Setup</h2>
        <p>Complete your profile to get personalized recommendations</p>
        <div class="progress-indicator">
          <div class="progress-step active" data-step="1">
            <div class="step-number">1</div>
            <div class="step-label">Basic Info</div>
          </div>
          <div class="progress-connector"></div>
          <div class="progress-step" data-step="2">
            <div class="step-number">2</div>
            <div class="step-label">Body Stats</div>
          </div>
          <div class="progress-connector"></div>
          <div class="progress-step" data-step="3">
            <div class="step-number">3</div>
            <div class="step-label">Goals</div>
          </div>
          <div class="progress-connector"></div>
          <div class="progress-step" data-step="4">
            <div class="step-number">4</div>
            <div class="step-label">Preferences</div>
          </div>
        </div>
      </div>
      
      <div class="wizard-content">
        <!-- Step 1: Basic Info -->
        <div class="wizard-step active" data-step="1">
          <div class="profile-header-section">
            <div class="profile-avatar-container">
              <img src="${data.photoURL || 'assets/default-avatar.svg'}" alt="Profile" class="profile-large-avatar" id="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || 'User')}&size=120&background=random'">
              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                <span>Change</span>
                <input type="file" id="profile-photo-upload" accept="image/*" style="display: none">
              </div>
            </div>
          </div>
          
          <form id="profile-step-1" class="profile-form">
            <div class="form-group">
              <label for="displayName">Full Name</label>
              <input type="text" id="displayName" name="displayName" value="${data.displayName}" placeholder="Enter your full name" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" value="${data.email}" readonly>
              <small>Email cannot be changed</small>
            </div>
            
            <div class="form-group">
              <label for="age">Age</label>
              <input type="number" id="age" name="age" value="${data.age}" min="13" max="120" placeholder="Enter your age">
            </div>
            
            <div class="form-group">
              <label for="gender">Gender</label>
              <select id="gender" name="gender">
                <option value="" ${!data.gender ? 'selected' : ''}>Select Gender</option>
                <option value="male" ${data.gender === 'male' ? 'selected' : ''}>Male</option>
                <option value="female" ${data.gender === 'female' ? 'selected' : ''}>Female</option>
                <option value="other" ${data.gender === 'other' ? 'selected' : ''}>Other</option>
                <option value="prefer-not-to-say" ${data.gender === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-next" data-next="2">Next <i class="fas fa-arrow-right"></i></button>
            </div>
          </form>
        </div>
        
        <!-- Step 2: Body Stats -->
        <div class="wizard-step" data-step="2">
          <form id="profile-step-2" class="profile-form">
            <div class="form-group">
              <label for="height">Height (cm)</label>
              <input type="number" id="height" name="height" value="${data.height}" min="1" max="300" placeholder="Enter your height">
            </div>
            
            <div class="form-group">
              <label for="weight">Weight (kg)</label>
              <input type="number" id="weight" name="weight" value="${data.weight}" min="1" step="0.1" placeholder="Enter your weight">
            </div>
            
            <div class="form-group">
              <label for="activityLevel">Activity Level</label>
              <select id="activityLevel" name="activityLevel">
                <option value="sedentary" ${data.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary (little or no exercise)</option>
                <option value="light" ${data.activityLevel === 'light' ? 'selected' : ''}>Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderate" ${data.activityLevel === 'moderate' ? 'selected' : ''}>Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="active" ${data.activityLevel === 'active' ? 'selected' : ''}>Active (hard exercise 6-7 days/week)</option>
                <option value="very-active" ${data.activityLevel === 'very-active' ? 'selected' : ''}>Very Active (very hard exercise & physical job)</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-back" data-prev="1"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="button" class="btn btn-next" data-next="3">Next <i class="fas fa-arrow-right"></i></button>
            </div>
          </form>
        </div>
        
        <!-- Step 3: Goals -->
        <div class="wizard-step" data-step="3">
          <form id="profile-step-3" class="profile-form">
            <div class="form-group full-width">
              <label for="fitnessGoals">Primary Fitness Goal</label>
              <select id="fitnessGoals" name="fitnessGoals">
                <option value="" ${!data.fitnessGoals ? 'selected' : ''}>Select Goal</option>
                <option value="lose-weight" ${data.fitnessGoals === 'lose-weight' ? 'selected' : ''}>Lose Weight</option>
                <option value="gain-muscle" ${data.fitnessGoals === 'gain-muscle' ? 'selected' : ''}>Gain Muscle</option>
                <option value="improve-fitness" ${data.fitnessGoals === 'improve-fitness' ? 'selected' : ''}>Improve Overall Fitness</option>
                <option value="increase-endurance" ${data.fitnessGoals === 'increase-endurance' ? 'selected' : ''}>Increase Endurance</option>
                <option value="reduce-stress" ${data.fitnessGoals === 'reduce-stress' ? 'selected' : ''}>Reduce Stress</option>
                <option value="improve-sleep" ${data.fitnessGoals === 'improve-sleep' ? 'selected' : ''}>Improve Sleep</option>
                <option value="maintain" ${data.fitnessGoals === 'maintain' ? 'selected' : ''}>Maintain Current Fitness</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label for="bio">About Me</label>
              <textarea id="bio" name="bio" rows="4" placeholder="Tell us a bit about yourself, your fitness journey, and wellness goals">${data.bio}</textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-back" data-prev="2"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="button" class="btn btn-next" data-next="4">Next <i class="fas fa-arrow-right"></i></button>
            </div>
          </form>
        </div>
        
        <!-- Step 4: Preferences -->
        <div class="wizard-step" data-step="4">
          <form id="profile-step-4" class="profile-form">
            <div class="form-group switch-group">
              <label>
                <span>Notifications</span>
                <div class="switch-container">
                  <input type="checkbox" id="notifications" name="notifications" ${data.preferences.notifications ? 'checked' : ''}>
                  <span class="switch-toggle"></span>
                </div>
              </label>
              <small>Receive personalized reminders and updates</small>
            </div>
            
            <div class="form-group">
              <label for="theme">Theme Preference</label>
              <select id="theme" name="theme">
                <option value="light" ${data.preferences.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                <option value="dark" ${data.preferences.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                <option value="system" ${data.preferences.theme === 'system' ? 'selected' : ''}>System Default</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="units">Measurement Units</label>
              <select id="units" name="units">
                <option value="metric" ${data.preferences.units === 'metric' ? 'selected' : ''}>Metric (kg, cm)</option>
                <option value="imperial" ${data.preferences.units === 'imperial' ? 'selected' : ''}>Imperial (lb, in)</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-back" data-prev="3"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="submit" class="btn btn-primary" id="save-profile">Save Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners for wizard navigation
  setupWizardNavigation();
  
  // Add submit event listener to the last form
  const finalForm = document.getElementById('profile-step-4');
  if (finalForm) {
    finalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfileData();
    });
  }
  
  // Handle profile photo upload
  const photoUpload = document.getElementById('profile-photo-upload');
  if (photoUpload) {
    photoUpload.addEventListener('change', handleProfilePhotoUpload);
  }
  
  // Add click event to avatar container to trigger file input
  const avatarContainer = document.querySelector('.profile-avatar-container');
  if (avatarContainer) {
    avatarContainer.addEventListener('click', () => {
      photoUpload.click();
    });
  }
}

// Setup wizard navigation
function setupWizardNavigation() {
  // Next buttons
  document.querySelectorAll('.btn-next').forEach(button => {
    button.addEventListener('click', () => {
      const nextStep = button.getAttribute('data-next');
      navigateToStep(nextStep);
    });
  });
  
  // Back buttons
  document.querySelectorAll('.btn-back').forEach(button => {
    button.addEventListener('click', () => {
      const prevStep = button.getAttribute('data-prev');
      navigateToStep(prevStep);
    });
  });
  
  // Progress steps (to allow clicking on steps)
  document.querySelectorAll('.progress-step').forEach(step => {
    step.addEventListener('click', () => {
      const stepNumber = step.getAttribute('data-step');
      navigateToStep(stepNumber);
    });
  });
}

// Navigate to a specific step
function navigateToStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.wizard-step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show target step
  const targetStep = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
  if (targetStep) {
    targetStep.classList.add('active');
    
    // Add animation class
    targetStep.classList.add('step-fade-in');
    setTimeout(() => {
      targetStep.classList.remove('step-fade-in');
    }, 500);
  }
  
  // Update progress indicator
  document.querySelectorAll('.progress-step').forEach(step => {
    const stepNum = step.getAttribute('data-step');
    if (parseInt(stepNum) <= parseInt(stepNumber)) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// Get user profile data from Firestore
async function getUserProfileData(userId) {
  // Make sure Firebase and Firestore are available
  if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
    console.error('Firestore not available');
    return null;
  }
  
  try {
    const db = firebase.firestore();
    const doc = await db.collection('user_profiles').doc(userId).get();
    
    if (doc.exists) {
      return doc.data();
    } else {
      console.log('No profile data found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting profile data:', error);
    throw error;
  }
}

// Save profile data to Firestore
async function saveProfileData() {
  // Show loading overlay
  showLoadingOverlay('Saving your profile...');
  
  // Make sure user is authenticated
  const user = firebase.auth().currentUser;
  if (!user) {
    hideLoadingOverlay();
    showNotification('error', 'You must be logged in to save profile data');
    window.location.hash = 'login';
    return;
  }
  
  // Get form data from all steps
  const displayName = document.getElementById('displayName').value.trim();
  const age = document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null;
  const gender = document.getElementById('gender').value;
  const weight = document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null;
  const height = document.getElementById('height').value ? parseFloat(document.getElementById('height').value) : null;
  const activityLevel = document.getElementById('activityLevel').value;
  const fitnessGoals = document.getElementById('fitnessGoals').value;
  const bio = document.getElementById('bio').value.trim();
  const notifications = document.getElementById('notifications').checked;
  const theme = document.getElementById('theme').value;
  const units = document.getElementById('units').value;
  
  // Update profile data object
  const profileData = {
    displayName,
    email: user.email,
    photoURL: user.photoURL || '',
    fitnessGoals,
    age,
    gender,
    weight,
    height,
    activityLevel,
    bio,
    preferences: {
      notifications,
      theme,
      units
    },
    healthMetrics: {
      mentalScore: 0,
      physicalScore: 0,
      sleepQuality: 0,
      stressLevel: 0,
      mindfulnessMinutes: 0,
      weeklyWorkouts: 0
    },
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    // Save to Firestore
    const db = firebase.firestore();
    await db.collection('user_profiles').doc(user.uid).set(profileData, { merge: true });
    
    // Update Firebase Auth profile
    await user.updateProfile({
      displayName: displayName,
    });
    
    // Update UI
    updateUserUI(user);
    
    // Show success message
    hideLoadingOverlay();
    showNotification('success', 'Profile updated successfully');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.hash = 'dashboard';
    }, 1500);
  } catch (error) {
    console.error('Error saving profile:', error);
    hideLoadingOverlay();
    showNotification('error', 'Failed to save profile: ' + error.message);
  }
}

// Handle profile photo upload
async function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Show loading overlay
  showLoadingOverlay('Uploading your photo...');
  
  const user = firebase.auth().currentUser;
  if (!user) {
    hideLoadingOverlay();
    return;
  }
  
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      throw new Error('Only image files are allowed');
    }
    
    // Create a storage reference
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const profileImgRef = storageRef.child(`profile_images/${user.uid}/${file.name}`);
    
    // Upload file
    await profileImgRef.put(file);
    
    // Get download URL
    const downloadURL = await profileImgRef.getDownloadURL();
    
    // Update user profile
    await user.updateProfile({
      photoURL: downloadURL
    });
    
    // Update profile image in UI
    document.getElementById('profile-avatar').src = downloadURL;
    
    // Update in Firestore
    const db = firebase.firestore();
    await db.collection('user_profiles').doc(user.uid).update({
      photoURL: downloadURL
    });
    
    hideLoadingOverlay();
    showNotification('success', 'Profile photo updated');
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    hideLoadingOverlay();
    showNotification('error', 'Failed to upload photo: ' + error.message);
  }
}

// Update user UI elements with current user info
function updateUserUI(user) {
  // Update all user-related UI elements
  document.querySelectorAll('.user-display-name').forEach(el => {
    el.textContent = user.displayName || 'User';
  });
  
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (user.photoURL) {
      el.src = user.photoURL;
    } else {
      el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&size=64&background=random`;
    }
  });
  
  // Update login/logout buttons visibility
  document.querySelectorAll('.login-required').forEach(el => {
    el.style.display = 'flex';
  });
  
  document.querySelectorAll('.logout-button').forEach(el => {
    el.style.display = 'block';
  });
  
  document.querySelectorAll('.login-button').forEach(el => {
    el.style.display = 'none';
  });
}

// Show loading overlay
function showLoadingOverlay(message = 'Loading...') {
  let loadingOverlay = document.getElementById('loading-overlay');
  
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p id="loading-message">${message}</p>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  } else {
    document.getElementById('loading-message').textContent = message;
    loadingOverlay.style.display = 'flex';
  }
}

// Hide loading overlay
function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// Show notification
function showNotification(type, message) {
  let notification = document.getElementById('notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    </div>
    <div class="notification-message">${message}</div>
  `;
  
  notification.style.display = 'flex';
  
  // Auto dismiss after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
      notification.style.opacity = '1';
    }, 300);
  }, 3000);
}

// If user navigates to profile page directly, load the page
if (window.location.hash === '#profile') {
  // Make sure the DOM is loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    loadProfilePage();
  } else {
    document.addEventListener('DOMContentLoaded', loadProfilePage);
  }
} 