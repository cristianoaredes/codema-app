#!/bin/bash
set -e

# CODEMA App - Docker Development Script
# This script starts the development environment with Docker

echo "🚀 Starting CODEMA Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file. Please update it with your values.${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Parse command line arguments
REBUILD=false
CLEAN=false
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild|-r)
            REBUILD=true
            shift
            ;;
        --clean|-c)
            CLEAN=true
            shift
            ;;
        --logs|-l)
            LOGS=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -r, --rebuild    Rebuild containers"
            echo "  -c, --clean      Clean volumes and rebuild"
            echo "  -l, --logs       Follow logs after starting"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Cleaning Docker volumes...${NC}"
    docker-compose down -v
    docker volume rm codema-app_node_modules 2>/dev/null || true
    docker volume rm codema-app_vite_cache 2>/dev/null || true
    docker volume rm codema-app_postgres_data 2>/dev/null || true
    echo -e "${GREEN}✅ Volumes cleaned${NC}"
fi

# Build/rebuild if needed
if [ "$REBUILD" = true ] || [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}🔨 Building containers...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
else
    echo -e "${YELLOW}🔨 Building containers (using cache)...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
fi

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Wait for PostgreSQL
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
        break
    fi
    echo "   Waiting for PostgreSQL... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    docker-compose logs postgres
    exit 1
fi

# Wait for app to be ready
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:8080/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is ready!${NC}"
        break
    fi
    echo "   Waiting for application... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}⚠️  Application may still be starting...${NC}"
fi

# Show status
echo -e "\n${GREEN}🎉 Development environment is running!${NC}"
echo -e "\n📋 Services:"
echo -e "  • Application:    ${GREEN}http://localhost:8080${NC}"
echo -e "  • Adminer:        ${GREEN}http://localhost:8081${NC}"
echo -e "  • PostgreSQL:     ${GREEN}localhost:5432${NC}"
echo -e "  • MailHog:        ${GREEN}http://localhost:8025${NC}"
echo -e "  • pgAdmin:        ${GREEN}http://localhost:5050${NC}"

echo -e "\n📝 Useful commands:"
echo -e "  • View logs:      ${YELLOW}docker-compose logs -f app${NC}"
echo -e "  • Stop services:  ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart app:    ${YELLOW}docker-compose restart app${NC}"
echo -e "  • Shell access:   ${YELLOW}docker-compose exec app sh${NC}"
echo -e "  • DB access:      ${YELLOW}docker-compose exec postgres psql -U postgres${NC}"

# Follow logs if requested
if [ "$LOGS" = true ]; then
    echo -e "\n${YELLOW}📋 Following logs (Ctrl+C to exit)...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app
fi