#!/bin/bash

# This script is for custom build steps in Vercel

# Print Python version for debugging
echo "Python version:"
python --version

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "Installing dependencies from requirements.txt..."
python -m pip install -r backend/requirements.txt --no-cache-dir

# Print installed packages for debugging
echo "Installed packages:"
python -m pip list

# Make sure the api directory exists
mkdir -p api

# Copy workout data for serverless functions
echo "Copying workout data to API directory..."
mkdir -p api/data
cp -f backend/data/workout_data.json api/data/ 2>/dev/null || echo "No workout data to copy"

# Exit with success
echo "Build script completed successfully"
exit 0 