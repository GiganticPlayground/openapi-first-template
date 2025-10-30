# Stage 1: Build stage - compile TypeScript
FROM node:24-slim AS builder

# Enable corepack to use yarn
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for TypeScript compiler)
RUN yarn install --frozen-lockfile

# Copy source code and configuration files
COPY . .

# Compile TypeScript to JavaScript
RUN yarn build

# Stage 2: Production stage - run compiled code
FROM node:24-slim

# Enable corepack to use yarn
RUN corepack enable

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy bundled code from builder stage
COPY --from=builder /app/dist/index.js ./dist/index.js
COPY --from=builder /app/dist/index.js.map ./dist/index.js.map

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
CMD ["yarn", "start"]
