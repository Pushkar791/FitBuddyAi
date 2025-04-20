# FitBuddy Authentication Setup

## Firebase Configuration Instructions

To properly set up authentication for FitBuddy, follow these steps:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project called "FitBuddy"
3. Enable Google Analytics if prompted (recommended but optional)

### 2. Register Your Web App

1. On the Firebase project dashboard, click on the Web icon (</>) 
2. Register your app with a nickname (e.g., "fitbuddy-web")
3. Click "Register app"

### 3. Copy Firebase Configuration

After registering, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copy this entire configuration object.

### 4. Update Your Configuration

1. Open `fitbuddy/frontend/index.html`
2. Find the Firebase configuration section
3. Replace the placeholder values with your actual Firebase configuration values

### 5. Enable Authentication Methods

1. In the Firebase Console, navigate to Authentication (in the Build section of the sidebar)
2. Click "Get started"
3. Click on the "Sign-in method" tab
4. Enable the following authentication methods:
   - Email/Password
   - Google

### 6. Test Your Authentication

1. Open your app in a browser
2. Try signing up with an email and password
3. Try signing in with the registered email and password
4. Try signing in with Google

### Troubleshooting

If you encounter any issues:

1. Check the browser console for error messages
2. Verify that your Firebase configuration is correct
3. Make sure you've enabled the required authentication methods
4. Check if your Firebase project has any usage restrictions

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup) 