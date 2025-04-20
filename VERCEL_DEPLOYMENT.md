# FitBuddy Vercel Deployment Guide

This guide provides detailed instructions for deploying the FitBuddy project to Vercel.

## Project Structure for Vercel

The project has been configured with the following structure for Vercel deployment:

```
fitbuddy/
├── frontend/              # Frontend static assets
│   ├── assets/            # Static assets including SVGs
│   ├── index.html         # Main HTML file
│   ├── auth-handler.js    # Authentication handler
│   ├── app.js             # Main application logic
│   └── styles.css         # CSS styles
├── backend/               # Backend Python Flask API
│   ├── api/               # Vercel serverless functions
│   │   └── index.py       # API entry point for Vercel
│   ├── app.py             # Main Flask application
│   └── requirements.txt   # Python dependencies
├── vercel.json            # Vercel deployment configuration
└── requirements.txt       # Copy of backend requirements for Vercel
```

## Preparation

1. Before deploying, make sure to clean up the project:
   - Remove duplicate directories: `frontend/fitbuddy`, `frontend/node_modules`, `venv`
   - Ensure the API directory exists: `backend/api`
   - Make sure all necessary files are committed to your repository

## Deployment Options

### Option 1: Deploy Frontend and Backend Together

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Navigate to the project root directory and run:
   ```
   vercel
   ```

4. Follow the prompts to configure your deployment.

5. For production deployment:
   ```
   vercel --prod
   ```

### Option 2: Deploy Frontend and Backend Separately

#### Frontend Deployment

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

#### Backend Deployment

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

3. Update your frontend configuration to point to your backend URL.

## Virtual Environment Considerations

When deploying to Vercel:

1. You don't need to include the virtual environment (`venv` directory)
2. Vercel will install required Python packages from `requirements.txt`
3. The `DEMO_MODE` environment variable is set to `true` in the Vercel configuration, so the application will run without a database

## Environment Variables

The following environment variables are set in `vercel.json`:

- `DEMO_MODE`: Set to `true` to run without a database
- `PYTHONPATH`: Set to `backend` to ensure proper module imports

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel logs in the Vercel dashboard
2. Verify all required files are included in your deployment
3. Ensure your `requirements.txt` includes all necessary Python packages
4. Check your serverless function is properly configured

## Updating Your Deployment

After making changes to your project:

1. Commit your changes
2. Run `vercel` again to create a preview deployment
3. Verify everything works correctly in the preview
4. Deploy to production with `vercel --prod` 