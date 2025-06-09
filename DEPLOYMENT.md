# Bitzomax Deployment Instructions

This document provides step-by-step instructions for deploying the Bitzomax application on a Hetzner server using Docker.

## Prerequisites

- A Hetzner Cloud server with SSH access
- Docker and Docker Compose installed on the server
- Git installed on the server

## Deployment Steps

### Step 1: Connect to Your Hetzner Server

Connect to your Hetzner server using PuTTY with your credentials.

### Step 2: Create Project Directory

```bash
# Create directory for the project
mkdir -p /opt/bitzomax
cd /opt/bitzomax
```

### Step 3: Clone the Repository

```bash
# Clone your project repository
git clone [YOUR_GIT_REPOSITORY_URL] .
```

### Step 4: Deploy with Docker Compose

```bash
# Run the containers in detached mode
docker-compose up -d
```

### Step 5: Monitor the Deployment

```bash
# Check if all containers are running
docker ps

# View logs for each container
docker logs bitzomax_postgres
docker logs bitzomax_backend
docker logs bitzomax_frontend
```

## Accessing Your Application

After successful deployment:

- The frontend will be accessible at: `http://YOUR_SERVER_IP`
- The backend will be running on port 8082

## Updating the Application

To update the application with the latest changes:

```bash
# Pull latest changes from Git
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

If you encounter any issues:

- Check container logs: `docker logs [container_name]`
- Verify network connectivity between containers: `docker network inspect bitzomax-network`
- Ensure PostgreSQL is running and accessible: `docker exec -it bitzomax_postgres psql -U bitzomax -d bitzomax`
