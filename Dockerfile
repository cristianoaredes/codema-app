# Multi-stage Dockerfile for CODEMA App
# Supports both development and production builds

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && \
    npm cache clean --force

# Install all dependencies (including dev) for development stage
FROM node:20-alpine AS deps-dev
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps-dev stage
COPY --from=deps-dev /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Development
FROM node:20-alpine AS development
WORKDIR /app

# Install git for development tools
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install all dependencies (use npm install for development flexibility)
RUN --mount=type=cache,target=/root/.npm \
    npm install && \
    npm cache clean --force

# Copy source code (will be overridden by volume mount in development)
COPY . .

# Expose Vite dev server port
EXPOSE 8080

# Expose Vite HMR port
EXPOSE 8080

# Set environment to development
ENV NODE_ENV=development

# Start Vite dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /assets { \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
    } \
    \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]