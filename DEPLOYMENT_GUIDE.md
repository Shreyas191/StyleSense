# 🚀 Production Deployment Guide

This guide covers deploying the AI Outfit Analyzer to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords and secret keys
- [ ] Set up SSL/TLS certificates
- [ ] Configure production MongoDB with authentication
- [ ] Set up proper CORS origins
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Prepare backup strategy
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline (optional)

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<strong-random-password>
MONGODB_URL=mongodb://admin:<password>@mongodb:27017/outfit_analyzer?authSource=admin
DATABASE_NAME=outfit_analyzer

# JWT - CHANGE THESE!
SECRET_KEY=<generate-strong-random-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Gemini API
GEMINI_API_KEY=<your-production-gemini-key>

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Generate Secure Secret Key

```bash
# Python method
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL method
openssl rand -base64 32
```

---

## Docker Deployment

### Option 1: Using Docker Compose (Recommended for VPS)

```bash
# Clone repository
git clone <your-repo-url>
cd ai-outfit-analyzer

# Set up production environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# Build and deploy
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Individual Container Deployment

```bash
# Build images
docker build -t outfit-analyzer-backend:latest ./backend
docker build -t outfit-analyzer-frontend:latest ./frontend

# Run MongoDB
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=<password> \
  -v mongodb_data:/data/db \
  mongo:7.0

# Run Backend
docker run -d \
  --name backend \
  -p 8000:8000 \
  --link mongodb:mongodb \
  -e MONGODB_URL=mongodb://admin:<password>@mongodb:27017/outfit_analyzer?authSource=admin \
  -e GEMINI_API_KEY=<your-key> \
  -v ./uploads:/app/uploads \
  outfit-analyzer-backend:latest

# Run Frontend
docker run -d \
  --name frontend \
  -p 80:80 \
  --link backend:backend \
  -e VITE_API_URL=https://api.yourdomain.com \
  outfit-analyzer-frontend:latest
```

---

## Cloud Platform Deployment

### AWS (Amazon Web Services)

#### Using AWS ECS (Elastic Container Service)

1. **Push Images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag outfit-analyzer-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/outfit-analyzer-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/outfit-analyzer-backend:latest

docker tag outfit-analyzer-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/outfit-analyzer-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/outfit-analyzer-frontend:latest
```

2. **Set up MongoDB on AWS DocumentDB or MongoDB Atlas**

3. **Create ECS Task Definitions and Services**

4. **Configure Application Load Balancer**

5. **Set up Route 53 for DNS**

#### Using AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init -p docker outfit-analyzer`
3. Create environment: `eb create production-env`
4. Deploy: `eb deploy`

### Google Cloud Platform (GCP)

#### Using Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/<project-id>/outfit-analyzer-backend backend/
gcloud builds submit --tag gcr.io/<project-id>/outfit-analyzer-frontend frontend/

# Deploy backend
gcloud run deploy outfit-analyzer-backend \
  --image gcr.io/<project-id>/outfit-analyzer-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy outfit-analyzer-frontend \
  --image gcr.io/<project-id>/outfit-analyzer-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Microsoft Azure

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name OutfitAnalyzerRG --location eastus

# Create container registry
az acr create --resource-group OutfitAnalyzerRG --name outfitanalyzer --sku Basic

# Push images
az acr build --registry outfitanalyzer --image outfit-analyzer-backend:latest backend/
az acr build --registry outfitanalyzer --image outfit-analyzer-frontend:latest frontend/

# Deploy containers
az container create \
  --resource-group OutfitAnalyzerRG \
  --name backend \
  --image outfitanalyzer.azurecr.io/outfit-analyzer-backend:latest \
  --ports 8000 \
  --dns-name-label outfit-analyzer-backend
```

### DigitalOcean

#### Using DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Backend: Dockerfile, Port 8000
   - Frontend: Dockerfile, Port 80
3. Add MongoDB managed database
4. Set environment variables
5. Deploy!

### Heroku

```bash
# Login
heroku login
heroku container:login

# Create apps
heroku create outfit-analyzer-backend
heroku create outfit-analyzer-frontend

# Add MongoDB
heroku addons:create mongolab:sandbox -a outfit-analyzer-backend

# Deploy backend
cd backend
heroku container:push web -a outfit-analyzer-backend
heroku container:release web -a outfit-analyzer-backend

# Deploy frontend
cd ../frontend
heroku container:push web -a outfit-analyzer-frontend
heroku container:release web -a outfit-analyzer-frontend
```

---

## Security Hardening

### 1. Enable HTTPS

```bash
# Using Let's Encrypt with Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. Set Up Nginx Reverse Proxy

Create `/etc/nginx/sites-available/outfit-analyzer`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

### 4. MongoDB Security

```javascript
// Connect to MongoDB
use admin

// Create admin user
db.createUser({
  user: "admin",
  pwd: "<strong-password>",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

// Create app user
use outfit_analyzer
db.createUser({
  user: "outfit_app",
  pwd: "<app-password>",
  roles: [ { role: "readWrite", db: "outfit_analyzer" } ]
})
```

### 5. Rate Limiting

Add to backend `main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/outfit/analyze")
@limiter.limit("10/hour")
async def analyze_outfit(...):
    ...
```

---

## Monitoring & Logging

### 1. Application Monitoring

**Prometheus + Grafana:**

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 2. Centralized Logging

**ELK Stack (Elasticsearch, Logstash, Kibana):**

```bash
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
docker run -d --name kibana -p 5601:5601 --link elasticsearch:elasticsearch kibana:8.11.0
```

### 3. Error Tracking

Use Sentry:

```python
# backend/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

---

## Backup & Recovery

### 1. MongoDB Backup

```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec mongodb mongodump \
  --username admin \
  --password <password> \
  --authenticationDatabase admin \
  --out /dump/$DATE

docker cp mongodb:/dump/$DATE $BACKUP_DIR/
```

### 2. Uploads Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Upload to S3
aws s3 cp uploads_backup_$(date +%Y%m%d).tar.gz s3://your-bucket/backups/
```

### 3. Automated Backup with Cron

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

---

## Maintenance

### Rolling Updates

```bash
# Update backend
docker-compose -f docker-compose.prod.yml pull backend
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Update frontend
docker-compose -f docker-compose.prod.yml pull frontend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

### Health Checks

```bash
# Check backend health
curl https://api.yourdomain.com/api/health

# Check database connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## Troubleshooting

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Database Issues
```bash
# Access MongoDB shell
docker exec -it mongodb mongosh -u admin -p

# Check database status
use outfit_analyzer
db.stats()
```

---

**Production deployment requires careful planning and testing. Always test in a staging environment first!**
