#!/bin/bash
# Deployment script for lazy loading video feature

echo "Starting deployment of lazy loading video feature..."

# Navigate to the project directory
cd /opt/bitzomax/bitzomax-NL

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: Could not find docker-compose.yml. Are you in the correct directory?"
    exit 1
fi

# Pull latest changes from git repository
echo "Pulling latest changes from git..."
git pull origin master

# Check if git pull was successful
if [ $? -ne 0 ]; then
    echo "Error: Git pull failed. Please resolve conflicts manually."
    exit 1
fi

# Build and restart Docker containers
echo "Building and restarting Docker containers..."
docker-compose down
docker-compose build
docker-compose up -d

# Check if docker-compose up was successful
if [ $? -ne 0 ]; then
    echo "Error: Docker compose failed to start the containers."
    exit 1
fi

echo "Deployment completed successfully!"
echo "Lazy loading video feature is now live."
echo "You can verify the deployment by visiting the website."
