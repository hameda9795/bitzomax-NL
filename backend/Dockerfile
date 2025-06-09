# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS build

# Copy pom.xml and source code
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Package the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create directory for uploads
RUN mkdir -p /opt/bitzomax/uploads

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set environment variable for production profile
ENV SPRING_PROFILES_ACTIVE=prod

# Expose the port the app runs on
EXPOSE 8082

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
