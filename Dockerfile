# Use Node.js 24 Debian slim for better Prisma compatibility
FROM node:24-slim

# Install OpenSSL and other dependencies required by Prisma
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code and configuration files
COPY . .

# Generate Prisma client
# RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Create non-root user for security
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start the application in development mode with watch
CMD ["npm", "run", "start"]
