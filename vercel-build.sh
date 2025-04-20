#!/bin/bash

# This script is for custom build steps in Vercel

# Print Python version for debugging
python --version

# Install dependencies
pip install -r requirements.txt

# Print installed packages for debugging
pip list

# Exit with success
exit 0 