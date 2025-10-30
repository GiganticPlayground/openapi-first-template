# Deployment Guide

## Docker Deployment

### Docker Configuration

#### Dockerfile

**Location**: `./Dockerfile`

**Key Features**:

- Base image: `node:24-slim` (Debian-based, minimal size)
- Non-root user: `nodejs` (security best practice)
- Health check: Built-in Docker health monitoring
- Direct TypeScript execution (no build step)

**Build Stages**:

```dockerfile
# 1. Set up working directory
WORKDIR /app

# 2. Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# 3. Copy source code
COPY . .

# 4. Generate types and controllers
RUN yarn generate

# 5. Switch to non-root user
USER nodejs

# 6. Expose port
EXPOSE 3000

# 7. Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 8. Start application
CMD ["tsx", "src/index.ts"]
```

**Why No Build Step?**

- Faster iteration during development
- TypeScript source is readable for debugging
- tsx is fast enough for container execution
- Build step can be added later for production optimization

#### docker-compose.yml

**Location**: `./docker-compose.yml`

**Configuration**:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: openapi-first-poc-api
    ports:
      - '3001:3000' # Host:Container
    environment:
      - NODE_ENV=development
      - PORT=3000
    env_file:
      - .env # Load additional env vars
    restart: unless-stopped # Auto-restart on failure
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Port Mapping**:

- Container internal port: 3000
- Host external port: 3001
- Access: http://localhost:3001

**Why Different Ports?**

- Avoids conflict with local dev server (port 3000)
- Allows running both local and Docker simultaneously

---

## Docker Commands

### Building

```bash
# Build image
yarn docker:build

# Or directly with Docker
docker build -t openapi-first-poc .

# Build with no cache (fresh build)
docker build --no-cache -t openapi-first-poc .

# View images
docker images | grep openapi
```

### Running

```bash
# Start container (detached)
yarn docker:up

# Or with Docker Compose
docker compose up -d

# Start and view logs
docker compose up

# Start specific service
docker compose up api
```

### Stopping

```bash
# Stop container
yarn docker:down

# Or with Docker Compose
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Logs

```bash
# View logs (follow)
yarn docker:logs

# Or with Docker Compose
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100

# View logs for specific service
docker compose logs -f api
```

### Management

```bash
# Restart container
docker compose restart

# Rebuild and restart
yarn docker:build && yarn docker:up

# Stop container
docker compose stop

# Start stopped container
docker compose start

# View container status
docker ps

# View all containers (including stopped)
docker ps -a
```

---

## Environment Configuration

### Environment Variables

**Required Variables**:

```bash
NODE_ENV=production
PORT=3000
API_KEYS_FILE=./config/api-keys.json
```

### Configuration Methods

#### Method 1: .env File (Recommended)

**Create**: `.env` in project root

```bash
NODE_ENV=production
PORT=3000
API_KEYS_FILE=./config/api-keys.json
```

**Usage**: Loaded automatically by docker-compose.yml

```yaml
env_file:
  - .env
```

#### Method 2: docker-compose.yml

**Direct declaration**:

```yaml
services:
  api:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEYS_FILE=./config/api-keys.json
```

#### Method 3: Docker CLI

**Pass at runtime**:

```bash
docker run -e NODE_ENV=production \
           -e PORT=3000 \
           -e API_KEYS_FILE=./config/api-keys.json \
           -p 3001:3000 \
           openapi-first-poc
```

### Secrets Management

**API Keys**:

**Current Implementation**: File-based (config/api-keys.json)

**Options**:

1. **Volume Mount** (Development):

```yaml
services:
  api:
    volumes:
      - ./config/api-keys.json:/app/config/api-keys.json:ro
```

2. **Docker Secrets** (Production):

```yaml
services:
  api:
    secrets:
      - api_keys

secrets:
  api_keys:
    file: ./config/api-keys.json
```

3. **Environment Variable** (Cloud):

```yaml
services:
  api:
    environment:
      - API_KEYS_JSON=${API_KEYS_JSON}
```

**Security Note**: Never commit real API keys to git!

---

## Health Checks

### Docker Health Check

**Configuration** (Dockerfile):

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

**Parameters**:

- `interval`: Check every 30 seconds
- `timeout`: Wait up to 3 seconds for response
- `start-period`: Grace period after container start (5s)
- `retries`: Mark unhealthy after 3 consecutive failures

**Health Check Endpoint**: GET /health

**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### Checking Health Status

```bash
# View container health
docker ps

# Output includes health status:
# - starting: Initial period
# - healthy: Passing checks
# - unhealthy: Failed 3+ checks

# View health check logs
docker inspect openapi-first-poc-api | grep -A 20 Health

# Manual health check
curl http://localhost:3001/health
```

### Troubleshooting Unhealthy Containers

```bash
# 1. Check logs
docker compose logs --tail=50

# 2. Inspect container
docker inspect openapi-first-poc-api

# 3. Test health endpoint manually
docker exec openapi-first-poc-api curl http://localhost:3000/health

# 4. Check if server is running
docker exec openapi-first-poc-api ps aux

# 5. Restart container
docker compose restart
```

---

## Container Access & Debugging

### Shell Access

```bash
# Interactive shell
docker exec -it openapi-first-poc-api sh

# Inside container:
pwd                    # /app
ls -la                 # View files
cat src/index.ts       # Read source
env | grep PORT        # Check env vars
curl localhost:3000/health  # Test endpoint
```

### File Inspection

```bash
# Copy file from container
docker cp openapi-first-poc-api:/app/src/index.ts ./index.ts

# Copy file to container
docker cp ./config/api-keys.json openapi-first-poc-api:/app/config/

# View file contents
docker exec openapi-first-poc-api cat src/index.ts
```

### Process Inspection

```bash
# View running processes
docker exec openapi-first-poc-api ps aux

# View resource usage
docker stats openapi-first-poc-api

# View port mappings
docker port openapi-first-poc-api
```

---

## Production Deployment

### Production Build Optimization

**Current Setup**: Development-optimized (tsx execution)

**Production Optimization** (TODO):

1. **Multi-Stage Build**:

```dockerfile
# Stage 1: Build
FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn generate
RUN yarn build

# Stage 2: Production
FROM node:24-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Benefits**:

- Smaller image size (no TypeScript source)
- Faster startup (compiled JavaScript)
- No tsx dependency in production
- Better security (fewer tools)

### Environment-Specific Configs

**Development**:

```yaml
services:
  api:
    environment:
      - NODE_ENV=development
    ports:
      - '3001:3000'
```

**Production**:

```yaml
services:
  api:
    environment:
      - NODE_ENV=production
    ports:
      - '80:3000'
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Production Checklist

- [ ] Build optimized Docker image (multi-stage)
- [ ] Use production environment variables
- [ ] Set NODE_ENV=production
- [ ] Configure proper logging (not console.log)
- [ ] Set up log aggregation (CloudWatch, ELK, etc.)
- [ ] Disable response validation (performance)
- [ ] Use real API keys (not dev keys)
- [ ] Set up TLS/HTTPS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring/alerts
- [ ] Configure auto-scaling
- [ ] Set resource limits (CPU, memory)
- [ ] Enable log rotation
- [ ] Set up backup/restore
- [ ] Configure health checks properly
- [ ] Document runbook procedures

---

## Cloud Deployment Options

### AWS ECS (Elastic Container Service)

**Steps**:

1. Push image to ECR (Elastic Container Registry)
2. Create ECS task definition
3. Configure service with load balancer
4. Set up CloudWatch logs
5. Configure auto-scaling

**Example Task Definition**:

```json
{
  "family": "openapi-first-poc",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/openapi-first-poc:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/openapi-first-poc",
          "awslogs-region": "us-east-1"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Google Cloud Run

**Steps**:

1. Push image to GCR (Container Registry)
2. Deploy to Cloud Run
3. Configure environment variables
4. Set up IAM permissions

**Deploy Command**:

```bash
gcloud run deploy openapi-first-poc \
  --image gcr.io/project-id/openapi-first-poc:latest \
  --platform managed \
  --region us-central1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --allow-unauthenticated
```

### Heroku

**Steps**:

1. Install Heroku CLI
2. Create app
3. Deploy container

**Commands**:

```bash
heroku create openapi-first-poc
heroku container:push web
heroku container:release web
heroku config:set NODE_ENV=production
```

### DigitalOcean App Platform

**Steps**:

1. Connect GitHub repo
2. Select Dockerfile
3. Configure environment
4. Deploy

**Configuration**:

```yaml
name: openapi-first-poc
services:
  - name: api
    dockerfile_path: Dockerfile
    github:
      repo: username/openapi-first-poc
      branch: main
    envs:
      - key: NODE_ENV
        value: production
    health_check:
      http_path: /health
    ports:
      - http: 3000
```

### Kubernetes

**Deployment** (k8s/deployment.yml):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openapi-first-poc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: openapi-first-poc
  template:
    metadata:
      labels:
        app: openapi-first-poc
    spec:
      containers:
        - name: api
          image: openapi-first-poc:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            limits:
              memory: '512Mi'
              cpu: '1000m'
```

**Service** (k8s/service.yml):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openapi-first-poc
spec:
  selector:
    app: openapi-first-poc
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## Monitoring & Observability

### Current Status

**Implemented**:

- Health check endpoint
- Docker health checks
- Console logging

**Missing**:

- Structured logging
- Metrics collection
- Distributed tracing
- Error tracking
- Performance monitoring

### Recommended Additions

#### 1. Structured Logging

**Add**: Winston or Pino

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage
logger.info({ userId: '123' }, 'User created');
logger.error({ err }, 'Request failed');
```

#### 2. Error Tracking

**Add**: Sentry

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// In error handler
Sentry.captureException(error);
```

#### 3. Metrics

**Add**: Prometheus + prom-client

```typescript
import { register, Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### 4. APM

**Options**:

- New Relic
- DataDog APM
- Elastic APM
- AWS X-Ray

---

## CI/CD Pipeline

### Current Status

**Implemented**: ❌ None

**Recommended**: GitHub Actions

### Example GitHub Actions Workflow

**.github/workflows/deploy.yml**:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install dependencies
        run: yarn install

      - name: Run linter
        run: yarn lint

      - name: Run type check
        run: yarn type-check

      - name: Build Docker image
        run: docker build -t openapi-first-poc:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag openapi-first-poc:${{ github.sha }} username/openapi-first-poc:latest
          docker push username/openapi-first-poc:latest

      - name: Deploy to production
        run: |
          # Add deployment commands here
          # e.g., kubectl apply, AWS ECS update, etc.
```

---

## Backup & Recovery

### Configuration Backup

**What to Backup**:

- Environment variables (.env)
- API keys (config/api-keys.json)
- SSL certificates (if any)

**How**:

```bash
# Backup config
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/ .env

# Restore config
tar -xzf config-backup-20251030.tar.gz
```

### Database Backup

**Status**: No database yet

**When Added**: Implement automated backups

- Daily snapshots
- Point-in-time recovery
- Offsite storage

---

## Scaling Strategies

### Horizontal Scaling

**Docker Compose** (simple):

```yaml
services:
  api:
    deploy:
      replicas: 3
    # Add load balancer
```

**Kubernetes** (production):

```yaml
spec:
  replicas: 3
  autoscaling:
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

### Load Balancing

**Options**:

- nginx (reverse proxy)
- AWS ALB (Application Load Balancer)
- Google Cloud Load Balancing
- Traefik

**nginx Example**:

```nginx
upstream api_backend {
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 80;
  location / {
    proxy_pass http://api_backend;
  }
}
```

---

## Security Hardening

### Container Security

**Current**: Basic (non-root user)

**Additions**:

- [ ] Use minimal base images (alpine, distroless)
- [ ] Scan for vulnerabilities (Trivy, Snyk)
- [ ] Sign images (Docker Content Trust)
- [ ] Use read-only filesystem where possible
- [ ] Drop unnecessary capabilities
- [ ] Set resource limits

**Hardened Dockerfile**:

```dockerfile
FROM node:24-alpine AS builder
# ... build steps

FROM node:24-alpine
RUN apk add --no-cache dumb-init
USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Network Security

- [ ] Use TLS/HTTPS only
- [ ] Configure firewall rules
- [ ] Limit exposed ports
- [ ] Use private networks for services
- [ ] Enable rate limiting
- [ ] Configure WAF (Web Application Firewall)

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs

# Common issues:
# - Missing environment variables
# - Port already in use
# - Invalid configuration
```

### Health Check Failing

```bash
# Test health endpoint manually
docker exec openapi-first-poc-api curl http://localhost:3000/health

# Check if server started
docker exec openapi-first-poc-api ps aux | grep tsx
```

### Can't Connect to Container

```bash
# Check if container is running
docker ps

# Check port mapping
docker port openapi-first-poc-api

# Check firewall
# macOS: System Preferences → Security & Privacy → Firewall
# Linux: sudo ufw status
```

### Image Build Fails

```bash
# Clear build cache
docker builder prune

# Build with no cache
docker build --no-cache -t openapi-first-poc .

# Check Dockerfile syntax
docker build --check -t openapi-first-poc .
```
