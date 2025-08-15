#!/bin/bash
set -e

# CODEMA App - Docker Build Script
# This script builds the Docker image for production

echo "🚀 Building CODEMA App Docker Image..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="codema-app"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "latest")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Parse command line arguments
TARGET="production"
PUSH=false
CACHE=true
PLATFORMS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --target|-t)
            TARGET="$2"
            shift 2
            ;;
        --push|-p)
            PUSH=true
            shift
            ;;
        --no-cache)
            CACHE=false
            shift
            ;;
        --platform)
            PLATFORMS="$2"
            shift 2
            ;;
        --version|-v)
            VERSION="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -t, --target TARGET      Build target (development|production) [default: production]"
            echo "  -v, --version VERSION    Version tag [default: git tag or 'latest']"
            echo "  -p, --push               Push image to registry"
            echo "  --no-cache               Build without cache"
            echo "  --platform PLATFORMS     Build for specific platforms (e.g., linux/amd64,linux/arm64)"
            echo "  -h, --help               Show this help message"
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

# Enable BuildKit
export DOCKER_BUILDKIT=1

# Prepare build arguments
BUILD_ARGS=(
    "--build-arg" "VERSION=${VERSION}"
    "--build-arg" "BUILD_DATE=${BUILD_DATE}"
    "--build-arg" "GIT_COMMIT=${GIT_COMMIT}"
    "--label" "version=${VERSION}"
    "--label" "build-date=${BUILD_DATE}"
    "--label" "git-commit=${GIT_COMMIT}"
    "--label" "maintainer=CODEMA"
)

# Add target
BUILD_ARGS+=("--target" "${TARGET}")

# Add cache option
if [ "$CACHE" = false ]; then
    BUILD_ARGS+=("--no-cache")
fi

# Add platform if specified
if [ -n "$PLATFORMS" ]; then
    BUILD_ARGS+=("--platform" "${PLATFORMS}")
fi

# Tags to build
TAGS=(
    "-t" "${IMAGE_NAME}:${VERSION}"
    "-t" "${IMAGE_NAME}:latest"
)

if [ "$TARGET" = "development" ]; then
    TAGS=(
        "-t" "${IMAGE_NAME}:dev-${VERSION}"
        "-t" "${IMAGE_NAME}:dev-latest"
    )
fi

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo -e "  • Image:      ${IMAGE_NAME}"
echo -e "  • Version:    ${VERSION}"
echo -e "  • Target:     ${TARGET}"
echo -e "  • Git Commit: ${GIT_COMMIT:0:8}"
echo -e "  • Build Date: ${BUILD_DATE}"
if [ -n "$PLATFORMS" ]; then
    echo -e "  • Platforms:  ${PLATFORMS}"
fi

# Build the image
echo -e "\n${YELLOW}🔨 Building Docker image...${NC}"
docker build \
    "${BUILD_ARGS[@]}" \
    "${TAGS[@]}" \
    -f Dockerfile \
    .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Show image size
    IMAGE_SIZE=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep "${IMAGE_NAME}:${VERSION}" | awk '{print $2}')
    echo -e "\n${BLUE}📦 Image Details:${NC}"
    echo -e "  • Name: ${IMAGE_NAME}:${VERSION}"
    echo -e "  • Size: ${IMAGE_SIZE}"
    
    # List all layers if verbose
    if [ "$VERBOSE" = true ]; then
        echo -e "\n${BLUE}📋 Image Layers:${NC}"
        docker history "${IMAGE_NAME}:${VERSION}"
    fi
    
    # Push if requested
    if [ "$PUSH" = true ]; then
        echo -e "\n${YELLOW}📤 Pushing image to registry...${NC}"
        for tag in "${IMAGE_NAME}:${VERSION}" "${IMAGE_NAME}:latest"; do
            docker push "$tag"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Pushed: $tag${NC}"
            else
                echo -e "${RED}❌ Failed to push: $tag${NC}"
            fi
        done
    fi
    
    # Security scan (optional)
    if command -v trivy &> /dev/null; then
        echo -e "\n${YELLOW}🔍 Running security scan...${NC}"
        trivy image --severity HIGH,CRITICAL "${IMAGE_NAME}:${VERSION}"
    fi
    
    echo -e "\n${GREEN}🎉 Build complete!${NC}"
    echo -e "\n${BLUE}To run the image:${NC}"
    if [ "$TARGET" = "production" ]; then
        echo -e "  ${YELLOW}docker run -p 80:8080 ${IMAGE_NAME}:${VERSION}${NC}"
    else
        echo -e "  ${YELLOW}docker run -p 8080:8080 ${IMAGE_NAME}:${VERSION}${NC}"
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi