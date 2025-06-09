# Stage 1: Build the application
FROM node:20 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build the Angular application
RUN npm run build

# Stage 2: Set up Nginx to serve the application
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular app from the build stage to nginx directory
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
