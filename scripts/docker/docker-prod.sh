#!/bin/bash
set -e

# CODEMA App - Docker Production Deployment Script
# This script deploys the application in production mode

echo "🚀 Deploying CODEMA App to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_NAME="codema-app"
BACKUP_DIR="./backups"

# Parse command line arguments
ACTION="deploy"
BACKUP=true
HEALTH_CHECK=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --rollback|-r)
            ACTION="rollback"
            shift
            ;;
        --stop|-s)
            ACTION="stop"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        --no-backup)
            BACKUP=false
            shift
            ;;
        --no-health-check)
            HEALTH_CHECK=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  deploy (default)     Deploy the application"
            echo "  -r, --rollback       Rollback to previous version"
            echo "  -s, --stop           Stop the application"
            echo "  --restart            Restart the application"
            echo "  --no-backup          Skip database backup"
            echo "  --no-health-check    Skip health checks"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check for production .env file
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "Please create .env.production with production values."
    exit 1
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Function to perform health check
health_check() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Checking health of ${service}...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service} is healthy!${NC}"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ ${service} health check failed${NC}"
    return 1
}

# Function to backup database
backup_database() {
    if [ "$BACKUP" = true ] && [ -n "$DB_HOST" ]; then
        echo -e "${YELLOW}💾 Backing up database...${NC}"
        
        # Create backup directory if it doesn't exist
        mkdir -p "$BACKUP_DIR"
        
        # Generate backup filename
        BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Perform backup
        docker-compose -f "$COMPOSE_FILE" exec -T postgres \
            pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database backed up to: ${BACKUP_FILE}${NC}"
            
            # Keep only last 10 backups
            ls -t "${BACKUP_DIR}"/backup_*.sql | tail -n +11 | xargs -r rm
        else
            echo -e "${RED}❌ Database backup failed${NC}"
            return 1
        fi
    fi
}

# Function to deploy application
deploy() {
    echo -e "${BLUE}📋 Deployment Configuration:${NC}"
    echo -e "  • Image:      ${IMAGE_NAME}:latest"
    echo -e "  • Environment: Production"
    echo -e "  • Compose:    ${COMPOSE_FILE}"
    
    # Backup database before deployment
    backup_database
    
    # Pull latest image
    echo -e "${YELLOW}📥 Pulling latest image...${NC}"
    docker pull "${IMAGE_NAME}:latest"
    
    # Deploy with zero-downtime
    echo -e "${YELLOW}🚀 Deploying application...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale app=2 app
    
    # Wait for new container to be healthy
    if [ "$HEALTH_CHECK" = true ]; then
        sleep 5
        health_check "Application" "http://localhost/health"
    fi
    
    # Remove old containers
    echo -e "${YELLOW}🧹 Cleaning up old containers...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps --remove-orphans app
    
    # Prune unused images
    docker image prune -f
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
}

# Function to rollback
rollback() {
    echo -e "${YELLOW}⏮️ Rolling back to previous version...${NC}"
    
    # Get previous image
    PREVIOUS_IMAGE=$(docker images "${IMAGE_NAME}" --format "{{.Tag}}" | grep -v latest | head -n 1)
    
    if [ -z "$PREVIOUS_IMAGE" ]; then
        echo -e "${RED}❌ No previous version found${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Rolling back to: ${IMAGE_NAME}:${PREVIOUS_IMAGE}${NC}"
    
    # Tag previous as latest
    docker tag "${IMAGE_NAME}:${PREVIOUS_IMAGE}" "${IMAGE_NAME}:latest"
    
    # Deploy
    deploy
}

# Function to stop application
stop() {
    echo -e "${YELLOW}⏹️ Stopping application...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✅ Application stopped${NC}"
}

# Function to restart application
restart() {
    echo -e "${YELLOW}🔄 Restarting application...${NC}"
    docker-compose -f "$COMPOSE_FILE" restart
    
    if [ "$HEALTH_CHECK" = true ]; then
        sleep 5
        health_check "Application" "http://localhost/health"
    fi
    
    echo -e "${GREEN}✅ Application restarted${NC}"
}

# Execute action
case $ACTION in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
        echo -e "${RED}Unknown action: $ACTION${NC}"
        exit 1
        ;;
esac

# Show status
if [ "$ACTION" != "stop" ]; then
    echo -e "\n${BLUE}📊 Current Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo -e "\n${BLUE}📋 Service URLs:${NC}"
    echo -e "  • Application: ${GREEN}http://localhost${NC}"
    echo -e "  • Health:      ${GREEN}http://localhost/health${NC}"
    
    echo -e "\n${BLUE}📝 Useful commands:${NC}"
    echo -e "  • View logs:    ${YELLOW}docker-compose -f ${COMPOSE_FILE} logs -f${NC}"
    echo -e "  • Scale up:     ${YELLOW}docker-compose -f ${COMPOSE_FILE} up -d --scale app=3${NC}"
    echo -e "  • Scale down:   ${YELLOW}docker-compose -f ${COMPOSE_FILE} up -d --scale app=1${NC}"
    echo -e "  • Stop:         ${YELLOW}./scripts/docker-prod.sh --stop${NC}"
    echo -e "  • Rollback:     ${YELLOW}./scripts/docker-prod.sh --rollback${NC}"
fi