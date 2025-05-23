# FitBuddy

A fitness tracking application built with React, Node.js, and MongoDB.

## Features

- User authentication
- Workout tracking
- Exercise library
- Progress visualization
- Goal setting

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add MongoDB connection string and JWT secret

4. Start the development servers:
   ```
   # In the client directory
   npm run dev
   
   # In the server directory
   npm run dev
   ```

## Deployment

### Deploying to Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy:
   ```
   vercel
   ```

4. Add environment variables in the Vercel dashboard.

### Database Setup

The application uses MongoDB. Set up a MongoDB Atlas cluster and add the connection string to your environment variables.

## License

MIT 