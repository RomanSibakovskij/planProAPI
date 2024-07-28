# Use an Ubuntu base image
FROM ubuntu:20.04

# Install Node.js and other dependencies
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js (replace with the version you need)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]
