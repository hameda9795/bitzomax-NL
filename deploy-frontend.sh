#!/bin/bash

# Script to build and deploy updated Angular frontend

# Build the Angular app with production settings
echo "Building Angular app with production settings..."
cd c:/Users/31623/Documents/My-Projecten/bitzomax/frontend
npm run build --configuration=production

# Create deployment package
echo "Creating deployment package..."
cd dist/frontend/browser
zip -r frontend-dist.zip .

# This script just builds the app - you'll need to manually upload the zip file to the server
echo "Build complete! frontend-dist.zip is ready in the dist/frontend/browser folder."
echo "Please upload this file to the server and extract it to /opt/bitzomax-git/frontend/dist/frontend/browser/"
