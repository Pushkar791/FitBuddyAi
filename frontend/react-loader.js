// React Integration Loader
// This script helps integrate React components with the existing application

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a React route
  const pathname = window.location.pathname;
  const reactRoutes = ['/login', '/signup', '/profile', '/dashboard'];
  
  if (reactRoutes.includes(pathname)) {
    // For React routes, hide the regular content
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Make sure the React root is visible
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
    } else {
      console.error('React root element not found. Make sure you have a div with id="root" in your HTML.');
    }
    
    console.log('Loading React application for route:', pathname);
    
    // In a real implementation, this would be handled by React Router
    // For now, we're just showing an explanation message
    if (!window.React) {
      const message = document.createElement('div');
      message.className = 'react-message';
      message.innerHTML = `
        <div style="max-width: 600px; margin: 100px auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2>React Authentication Setup</h2>
          <p>The authentication system has been implemented using React components.</p>
          <p>To fully integrate React with this application:</p>
          <ol>
            <li>Run <code>npm install</code> to install all dependencies</li>
            <li>Run <code>npm start</code> to start the development server</li>
            <li>Visit <a href="/login">Login</a> or <a href="/signup">Signup</a> to use the authentication system</li>
          </ol>
          <p>Current components implemented:</p>
          <ul>
            <li>Login.js - Email/password login form</li>
            <li>Signup.js - User registration form</li>
            <li>Profile.js - User profile display</li>
            <li>ProtectedRoute.js - Authentication guard for protected routes</li>
          </ul>
          <p>Firebase authentication has been configured with your project settings.</p>
          <p><a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Back to Home</a></p>
        </div>
      `;
      
      if (root) {
        root.appendChild(message);
      } else {
        document.body.appendChild(message);
      }
    }
  }
});

// Log that the React loader has been initialized
console.log('React Authentication Integration Loader Initialized');
console.log('Login and Signup links have been added to the navigation');
console.log('Visit /login or /signup to access the authentication system'); 