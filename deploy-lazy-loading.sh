#!/bin/bash
# Deployment script for lazy loading video feature

echo -e "\e[36mStarting deployment of lazy loading video feature...\e[0m"

# Navigate to the project root directory
PROJECT_ROOT=$(pwd)

# Build Frontend
echo -e "\e[32mBuilding frontend...\e[0m"
cd "$PROJECT_ROOT/frontend"
npm install
npm run build --prod

# Build Backend (if any backend changes were made)
echo -e "\e[32mBuilding backend...\e[0m"
cd "$PROJECT_ROOT/backend"
./mvnw clean package -DskipTests

# Deploy the applications
echo -e "\e[32mDeploying applications...\e[0m"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "\e[31mDocker is not installed or not in PATH. Please install Docker and try again.\e[0m"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "\e[31mDocker Compose is not installed or not in PATH. Please install Docker Compose and try again.\e[0m"
    exit 1
fi

# Return to project root
cd "$PROJECT_ROOT"

# Build and start containers
echo -e "\e[32mBuilding and starting Docker containers...\e[0m"
docker-compose down
docker-compose build
docker-compose up -d

echo -e "\e[36mDeployment completed successfully!\e[0m"
echo -e "\e[32mLazy loading video feature is now live.\e[0m"

# Optionally, add verification steps
echo -e "\e[33mTo verify the deployment, browse to: http://localhost:80\e[0m"
