# 🐳 Docker Setup for CODEMA App

This guide explains how to run the CODEMA application using Docker for both development and production environments.

## 📋 Prerequisites

- Docker Desktop (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- 4GB of available RAM for Docker
- 10GB of free disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd codema-app

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your-url-here
# VITE_SUPABASE_ANON_KEY=your-key-here
```

### 2. Start Development Environment

```bash
# Start all services (app, database, adminer)
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

The application will be available at:
- 🌐 **App**: http://localhost:8080
- 🗄️ **Adminer** (Database UI): http://localhost:8081
- 📊 **PostgreSQL**: localhost:5432

### 3. Development with Hot Reload

For enhanced development experience with additional tools:

```bash
# Use development override configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# This adds:
# - MailHog (Email testing): http://localhost:8025
# - pgAdmin (Database management): http://localhost:5050
# - Enhanced debugging capabilities
```

## 🏗️ Architecture

### Services

1. **app** - Vite React application
   - Port: 8080
   - Hot module replacement enabled
   - Source code mounted for live editing

2. **postgres** - PostgreSQL database
   - Port: 5432
   - Persistent data volume
   - Auto-runs migrations on startup

3. **adminer** - Database management UI
   - Port: 8081
   - Lightweight alternative to pgAdmin

4. **mailhog** (dev only) - Email testing
   - SMTP: Port 1025
   - Web UI: Port 8025

5. **pgadmin** (dev only) - Advanced database management
   - Port: 5050
   - Default login: admin@codema.local / admin

## 📁 Project Structure

```
codema-app/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Main orchestration file
├── docker-compose.dev.yml  # Development overrides
├── .dockerignore          # Files to exclude from Docker
├── .env.example           # Environment template
└── src/                   # Application source code
```

## 🛠️ Common Commands

### Container Management

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Rebuild after dependency changes
docker-compose build --no-cache app

# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec app sh
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d codema_dev

# Run migrations manually
docker-compose exec postgres psql -U postgres -d codema_dev -f /docker-entrypoint-initdb.d/your-migration.sql

# Backup database
docker-compose exec postgres pg_dump -U postgres codema_dev > backup.sql

# Restore database
docker-compose exec postgres psql -U postgres -d codema_dev < backup.sql
```

### Development Workflow

```bash
# Install new npm package
docker-compose exec app npm install <package-name>

# Run linter
docker-compose exec app npm run lint

# Run TypeScript check
docker-compose exec app npx tsc --noEmit

# Access container shell
docker-compose exec app sh
```

## 🚢 Production Deployment

### Build Production Image

```bash
# Build optimized production image
docker build -t codema-app:prod --target production .

# Run production container
docker run -d \
  -p 80:80 \
  --name codema-prod \
  --env-file .env.production \
  codema-app:prod

# Check health
docker exec codema-prod curl -f http://localhost/ || echo "Health check failed"
```

### Production Docker Image

The production image:
- Uses nginx for static file serving
- Optimized to ~50MB
- Includes gzip compression
- Health checks enabled
- Security headers configured

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Database (Local Development)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/codema_dev

# Application
NODE_ENV=development
VITE_APP_NAME="CODEMA - Sistema de Gestão"
```

### Volumes

- `node_modules` - Cached dependencies
- `postgres_data` - Database persistence
- `vite_cache` - Build cache (dev only)
- `pgadmin_data` - pgAdmin settings (dev only)

### Networks

All services communicate via `codema-network` (172.20.0.0/16)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
lsof -i :8080

# Use different port
VITE_DEV_SERVER_PORT=3000 docker-compose up
```

### Node Modules Issues

```bash
# Clear and rebuild
docker-compose down
docker volume rm codema-app_node_modules
docker-compose build --no-cache app
docker-compose up
```

### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Recreate database
docker-compose down -v
docker-compose up
```

### Permission Errors

```bash
# Fix ownership (Linux/Mac)
sudo chown -R $(whoami):$(whoami) .

# Or run with user mapping
docker-compose run --user $(id -u):$(id -g) app npm install
```

## 🔍 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean unused resources
docker system prune -a
```

## 🚀 Performance Tips

1. **Allocate More Memory**: Docker Desktop → Preferences → Resources → Memory: 4GB+
2. **Use `.dockerignore`**: Excludes unnecessary files from build context
3. **Enable BuildKit**: `DOCKER_BUILDKIT=1 docker-compose build`
4. **Volume Performance**: Use `delegated` flag for Mac: `- .:/app:delegated`
5. **Cache Dependencies**: Leverage Docker layer caching

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Docker Guide](https://vitejs.dev/guide/docker.html)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🤝 Contributing

When adding new services or modifying Docker configuration:

1. Update both `docker-compose.yml` and `docker-compose.dev.yml`
2. Document new environment variables in `.env.example`
3. Update this README with new commands/services
4. Test both development and production builds

## 📝 License

This Docker configuration is part of the CODEMA project and follows the same license terms.