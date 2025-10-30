# Stage 1: Build stage - compile TypeScript
FROM node:24-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compiler)
RUN npm ci

# Copy source code and configuration files
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage - run compiled code
FROM node:24-slim

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Copy any other required runtime files (API specs, configs, etc.)
COPY api ./api

# Expose the port the app runs on
EXPOSE 3000

# Create non-root user for security
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start the application with compiled code
CMD ["npm", "run", "start"]
