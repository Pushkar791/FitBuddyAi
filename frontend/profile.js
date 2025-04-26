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
  
  // Get user data from Firestore (if exists)
  getUserProfileData(user.uid)
    .then((profileData) => {
      // Render profile form
      renderProfileForm(user, profileData);
    })
    .catch((error) => {
      console.error("Error loading profile data:", error);
      // Render profile form with just auth data
      renderProfileForm(user);
    });
  
  // Hide other sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
}

// Render profile form
function renderProfileForm(user, profileData = null) {
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
    ...profileData // Override with data from Firestore if available
  };
  
  profileContainer.innerHTML = `
    <div class="profile-header-section">
      <img src="${data.photoURL || 'assets/default-avatar.svg'}" alt="Profile" class="profile-large-avatar" id="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || 'User')}&size=120&background=random'">
      <div>
        <label class="profile-upload-btn">
          <i class="fas fa-camera"></i> Change Photo
          <input type="file" id="profile-photo-upload" accept="image/*" style="display: none">
        </label>
      </div>
    </div>
    
    <div class="profile-form-section">
      <h3>Personal Information</h3>
      <form id="profile-form" class="profile-form">
        <div class="form-group">
          <label for="displayName">Full Name</label>
          <input type="text" id="displayName" name="displayName" value="${data.displayName}" required>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" value="${data.email}" readonly>
        </div>
        
        <div class="form-group">
          <label for="age">Age</label>
          <input type="number" id="age" name="age" value="${data.age}" min="1" max="120">
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
        
        <div class="form-group">
          <label for="weight">Weight (kg)</label>
          <input type="number" id="weight" name="weight" value="${data.weight}" min="1" step="0.1">
        </div>
        
        <div class="form-group">
          <label for="height">Height (cm)</label>
          <input type="number" id="height" name="height" value="${data.height}" min="1" max="300">
        </div>
        
        <div class="form-group">
          <label for="activityLevel">Activity Level</label>
          <select id="activityLevel" name="activityLevel">
            <option value="sedentary" ${data.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary</option>
            <option value="light" ${data.activityLevel === 'light' ? 'selected' : ''}>Lightly Active</option>
            <option value="moderate" ${data.activityLevel === 'moderate' ? 'selected' : ''}>Moderately Active</option>
            <option value="active" ${data.activityLevel === 'active' ? 'selected' : ''}>Active</option>
            <option value="very-active" ${data.activityLevel === 'very-active' ? 'selected' : ''}>Very Active</option>
          </select>
        </div>
        
        <div class="form-group full-width">
          <label for="fitnessGoals">Fitness Goals</label>
          <select id="fitnessGoals" name="fitnessGoals">
            <option value="" ${!data.fitnessGoals ? 'selected' : ''}>Select Goal</option>
            <option value="lose-weight" ${data.fitnessGoals === 'lose-weight' ? 'selected' : ''}>Lose Weight</option>
            <option value="gain-muscle" ${data.fitnessGoals === 'gain-muscle' ? 'selected' : ''}>Gain Muscle</option>
            <option value="improve-fitness" ${data.fitnessGoals === 'improve-fitness' ? 'selected' : ''}>Improve Overall Fitness</option>
            <option value="increase-endurance" ${data.fitnessGoals === 'increase-endurance' ? 'selected' : ''}>Increase Endurance</option>
            <option value="maintain" ${data.fitnessGoals === 'maintain' ? 'selected' : ''}>Maintain Current Fitness</option>
          </select>
        </div>
        
        <div class="form-group full-width">
          <label for="bio">About Me</label>
          <textarea id="bio" name="bio" rows="4">${data.bio}</textarea>
        </div>
        
        <button type="submit" class="profile-save-btn">Save Changes</button>
      </form>
    </div>
  `;
  
  // Add event listeners
  const form = document.getElementById('profile-form');
  form.addEventListener('submit', saveProfileData);
  
  // Handle profile photo upload
  const photoUpload = document.getElementById('profile-photo-upload');
  photoUpload.addEventListener('change', handleProfilePhotoUpload);
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
async function saveProfileData(e) {
  e.preventDefault();
  
  // Make sure user is authenticated
  const user = firebase.auth().currentUser;
  if (!user) {
    alert('You must be logged in to save profile data');
    window.location.hash = 'login';
    return;
  }
  
  // Get form data
  const form = e.target;
  const displayName = form.displayName.value.trim();
  const age = form.age.value ? parseInt(form.age.value) : null;
  const gender = form.gender.value;
  const weight = form.weight.value ? parseFloat(form.weight.value) : null;
  const height = form.height.value ? parseFloat(form.height.value) : null;
  const activityLevel = form.activityLevel.value;
  const fitnessGoals = form.fitnessGoals.value;
  const bio = form.bio.value.trim();
  
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
    updatedAt: new Date()
  };
  
  try {
    // Update Firebase Auth display name
    await user.updateProfile({
      displayName: displayName
    });
    
    // Update profile in Firestore
    const db = firebase.firestore();
    await db.collection('user_profiles').doc(user.uid).set(profileData, { merge: true });
    
    // Show success message
    alert('Profile updated successfully!');
    
    // Update any UI elements showing user information
    updateUserUI(user);
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile: ' + error.message);
  }
}

// Handle profile photo upload
async function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Make sure user is authenticated
  const user = firebase.auth().currentUser;
  if (!user) {
    alert('You must be logged in to update profile photo');
    window.location.hash = 'login';
    return;
  }
  
  // Make sure Firebase Storage is available
  if (typeof firebase === 'undefined' || typeof firebase.storage === 'undefined') {
    console.error('Firebase Storage not available');
    alert('Firebase Storage not available');
    return;
  }
  
  // Show loading state
  const avatarImg = document.getElementById('profile-avatar');
  const originalSrc = avatarImg.src;
  avatarImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDEwMHYxMDBIMHoiLz48Y2lyY2xlIHN0cm9rZT0iI0UwRTBFMCIgc3Ryb2tlLXdpZHRoPSIxMCIgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBzdHJva2UtZGFzaGFycmF5PSIxNTAuNzkgMTUwLjc5IiBzdHJva2UtZGFzaG9mZnNldD0iMSI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgNTAgNTAiIHRvPSIzNjAgNTAgNTAiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PC9nPjwvc3ZnPg==';
  
  try {
    // Create a reference to the user's profile image
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`profile_photos/${user.uid}_${Date.now()}`);
    
    // Upload the file
    const snapshot = await fileRef.put(file);
    
    // Get the download URL
    const photoURL = await snapshot.ref.getDownloadURL();
    
    // Update user profile with new photo URL
    await user.updateProfile({
      photoURL: photoURL
    });
    
    // Update Firestore profile data
    const db = firebase.firestore();
    await db.collection('user_profiles').doc(user.uid).update({
      photoURL: photoURL
    });
    
    // Update avatar in UI
    avatarImg.src = photoURL;
    
    // Update any UI elements showing user information
    updateUserUI(user);
    
    console.log('Profile photo updated successfully');
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    alert('Error uploading profile photo: ' + error.message);
    
    // Reset avatar on error
    avatarImg.src = originalSrc;
  }
}

// Update UI elements that display user information
function updateUserUI(user) {
  // Update profile menu
  if (typeof updateProfileMenu === 'function') {
    updateProfileMenu(user);
  }
  
  // Additional UI updates can be added here
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