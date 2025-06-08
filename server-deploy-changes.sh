#!/bin/bash

# Script to deploy updated Angular frontend after git pull

echo "Changing directory to the git repository..."
cd /opt/bitzomax-git

echo "Pulling latest changes from Git..."
git pull

echo "Building frontend with production settings..."
cd frontend
npm run build --configuration=production

echo "Backing up existing frontend files..."
mkdir -p /opt/backup/frontend/$(date +%Y%m%d_%H%M%S)
cp -r /opt/bitzomax-git/frontend/dist/frontend/browser/* /opt/backup/frontend/$(date +%Y%m%d_%H%M%S)/

echo "Deploying new frontend files..."
rm -rf /opt/bitzomax-git/frontend/dist/frontend/browser/*
cp -r dist/frontend/browser/* /opt/bitzomax-git/frontend/dist/frontend/browser/

echo "Deployment complete!"
echo "Please check http://91.99.49.208 to verify that the application is working properly."
