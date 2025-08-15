#!/bin/sh
set -e

# CODEMA App Docker Entrypoint Script
# This script handles initialization for both development and production environments

echo "🚀 Starting CODEMA App..."

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name ($host:$port)..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo "❌ Failed to connect to $service_name after $max_attempts attempts"
    return 1
}

# Check environment
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in PRODUCTION mode"
    
    # Production-specific initialization
    if [ -f "/usr/share/nginx/html/index.html" ]; then
        echo "✅ Production build found"
    else
        echo "❌ Production build not found!"
        exit 1
    fi
    
    # Start nginx (production)
    exec "$@"
    
elif [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Running in DEVELOPMENT mode"
    
    # Wait for database if configured
    if [ -n "$DATABASE_URL" ]; then
        # Extract host and port from DATABASE_URL
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
            wait_for_service "$DB_HOST" "$DB_PORT" "PostgreSQL"
        fi
    fi
    
    # Install dependencies if missing
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "📦 Installing dependencies..."
        npm ci
    fi
    
    # Check for package.json changes
    if [ -f "/tmp/package.json.md5" ]; then
        CURRENT_MD5=$(md5sum package.json | cut -d' ' -f1)
        CACHED_MD5=$(cat /tmp/package.json.md5)
        
        if [ "$CURRENT_MD5" != "$CACHED_MD5" ]; then
            echo "📦 Package.json changed, updating dependencies..."
            npm ci
            echo "$CURRENT_MD5" > /tmp/package.json.md5
        fi
    else
        md5sum package.json | cut -d' ' -f1 > /tmp/package.json.md5
    fi
    
    # Run database migrations if available
    if [ -d "supabase/migrations" ] && [ -n "$DATABASE_URL" ]; then
        echo "🗄️ Checking for pending migrations..."
        # Add migration logic here if needed
    fi
    
    # Generate TypeScript types if Supabase is configured
    if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
        echo "🔧 Supabase configured, types will be generated as needed"
    fi
    
    # Start the development server
    echo "🚀 Starting Vite development server..."
    exec "$@"
    
else
    echo "⚠️ Unknown NODE_ENV: $NODE_ENV"
    echo "   Defaulting to development mode"
    NODE_ENV=development
    exec "$@"
fi