# Deployment Guide

## Revenue Forecaster AI - Production Deployment

This guide covers deploying Revenue Forecaster AI to production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: 20GB free space
- **Network**: Stable internet connection

### Software Requirements

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+
- **Python**: 3.8+
- **Git**: 2.30+

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/revenue-forecaster-ai.git
cd revenue-forecaster-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3. Backend Setup (Optional)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p data pickle output logs

# Run development server
python -m uvicorn src.backend.main:app --reload --port 8000
```

Backend API will be available at `http://localhost:8000`

### 4. Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here  # Optional
ENV=development
DEBUG=true
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t revenue-forecaster-ai:latest .
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the application
- Start the container
- Expose ports 8000 (backend) and 5173 (frontend)
- Mount volumes for data persistence

### 3. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:8000/health
```

### 4. Stop Services

```bash
docker-compose down
```

---

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance

**Launch Instance**:
```bash
# Ubuntu 22.04 LTS
# t3.medium (2 vCPU, 4GB RAM)
# 30GB SSD
```

**Security Group**:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 8000 (API)

**Install Dependencies**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git
```

**Deploy Application**:
```bash
# Clone repository
git clone https://github.com/yourusername/revenue-forecaster-ai.git
cd revenue-forecaster-ai

# Set environment variables
cp .env.example .env
nano .env  # Add API keys

# Start services
docker-compose up -d

# Setup Nginx reverse proxy
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/revenue-forecaster
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

**Enable Site**:
```bash
sudo ln -s /etc/nginx/sites-available/revenue-forecaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**SSL with Let's Encrypt**:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 2. RDS Database (PostgreSQL)

**Create RDS Instance**:
- Engine: PostgreSQL 14
- Instance class: db.t3.micro (free tier)
- Storage: 20GB SSD
- Multi-AZ: No (for cost savings)

**Update .env**:
```env
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/revenue_forecaster
```

#### 3. S3 for Model Storage

**Create S3 Bucket**:
```bash
aws s3 mb s3://revenue-forecaster-models
```

**Update Application**:
```python
# Use boto3 to load/save models
import boto3

s3 = boto3.client('s3')
s3.download_file('revenue-forecaster-models', 'model.pkl', '/tmp/model.pkl')
```

### Google Cloud Platform (GCP)

#### 1. Compute Engine

```bash
# Create instance
gcloud compute instances create revenue-forecaster \
    --machine-type=e2-medium \
    --zone=us-central1-a \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB

# SSH into instance
gcloud compute ssh revenue-forecaster

# Follow EC2 deployment steps
```

#### 2. Cloud SQL (PostgreSQL)

```bash
gcloud sql instances create revenue-forecaster-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1
```

#### 3. Cloud Storage

```bash
gsutil mb gs://revenue-forecaster-models
```

### Microsoft Azure

#### 1. Virtual Machine

```bash
az vm create \
    --resource-group revenue-forecaster-rg \
    --name revenue-forecaster-vm \
    --image UbuntuLTS \
    --size Standard_B2s \
    --admin-username azureuser \
    --generate-ssh-keys
```

#### 2. Azure Database for PostgreSQL

```bash
az postgres server create \
    --resource-group revenue-forecaster-rg \
    --name revenue-forecaster-db \
    --location eastus \
    --admin-user adminuser \
    --admin-password <password> \
    --sku-name B_Gen5_1
```

### Kubernetes Deployment

**kubernetes/deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: revenue-forecaster
spec:
  replicas: 3
  selector:
    matchLabels:
      app: revenue-forecaster
  template:
    metadata:
      labels:
        app: revenue-forecaster
    spec:
      containers:
      - name: revenue-forecaster
        image: your-registry/revenue-forecaster-ai:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: openai-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: revenue-forecaster-service
spec:
  selector:
    app: revenue-forecaster
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

**Deploy**:
```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl get services
```

---

## Environment Configuration

### Production Environment Variables

```env
# Application
ENV=production
DEBUG=false
SECRET_KEY=your-secret-key-here

# API Keys
OPENAI_API_KEY=sk-prod-key-here
GEMINI_API_KEY=gemini-prod-key-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis Cache
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Model Configuration
MODEL_PATH=/app/pickle/model.pkl
MAX_UPLOAD_SIZE=100MB
```

### Secrets Management

**AWS Secrets Manager**:
```bash
aws secretsmanager create-secret \
    --name revenue-forecaster/openai-key \
    --secret-string "sk-your-key"
```

**GCP Secret Manager**:
```bash
gcloud secrets create openai-key --data-file=-
# Enter key, press Ctrl+D
```

**Azure Key Vault**:
```bash
az keyvault secret set \
    --vault-name revenue-forecaster-vault \
    --name openai-key \
    --value "sk-your-key"
```

---

## Database Setup

### PostgreSQL Production Setup

**Create Database**:
```sql
CREATE DATABASE revenue_forecaster;
CREATE USER forecaster_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE revenue_forecaster TO forecaster_user;
```

**Run Migrations**:
```bash
# Using Alembic
alembic upgrade head
```

**Backup Strategy**:
```bash
# Daily backups
pg_dump -U forecaster_user revenue_forecaster > backup_$(date +%Y%m%d).sql

# Automated with cron
0 2 * * * /usr/bin/pg_dump -U forecaster_user revenue_forecaster | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

---

## Monitoring & Logging

### Application Monitoring

**Prometheus + Grafana**:

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
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Metrics Endpoint** (FastAPI):
```python
from prometheus_client import Counter, Histogram
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)

prediction_counter = Counter('predictions_total', 'Total predictions')
prediction_duration = Histogram('prediction_duration_seconds', 'Prediction duration')
```

### Logging

**Structured Logging**:
```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
        }
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

**Centralized Logging (ELK Stack)**:
```yaml
# docker-compose.elk.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    ports:
      - "5000:5000"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
```

### Error Tracking (Sentry)

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    environment="production",
    traces_sample_rate=0.1,
)
```

---

## Troubleshooting

### Common Issues

**1. Container won't start**:
```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**2. Model loading errors**:
```bash
# Verify model file exists
ls -lh pickle/model.pkl

# Check permissions
chmod 644 pickle/model.pkl

# Test loading
python -c "import pickle; pickle.load(open('pickle/model.pkl', 'rb'))"
```

**3. Database connection issues**:
```bash
# Test connection
psql -h localhost -U forecaster_user -d revenue_forecaster

# Check environment variables
echo $DATABASE_URL

# Verify network
docker network ls
docker network inspect revenue-forecaster_default
```

**4. High memory usage**:
```bash
# Monitor resources
docker stats

# Limit memory
docker run -m 2g revenue-forecaster-ai

# Optimize model
# Use model quantization or smaller models
```

**5. API timeout**:
```bash
# Increase timeout
uvicorn main:app --timeout-keep-alive 120

# Check logs
tail -f logs/app.log

# Monitor performance
curl http://localhost:8000/metrics
```

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_marketing_data_date ON marketing_data(date);
CREATE INDEX idx_marketing_data_channel ON marketing_data(channel);
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date);

-- Analyze tables
ANALYZE marketing_data;
ANALYZE forecasts;

-- Vacuum
VACUUM ANALYZE;
```

### Caching with Redis

```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expire=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Compute
            result = await func(*args, **kwargs)
            
            # Store in cache
            redis_client.setex(cache_key, expire, json.dumps(result))
            
            return result
        return wrapper
    return decorator
```

### Load Balancing

**Nginx Configuration**:
```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables in secrets manager
- [ ] Database credentials rotated regularly
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection headers
- [ ] Regular security updates
- [ ] Firewall rules configured
- [ ] SSH key-based authentication only
- [ ] Regular backups tested
- [ ] Monitoring and alerting active

---

## Production Checklist

- [ ] Docker images built and tested
- [ ] Environment variables configured
- [ ] Database migrated and backed up
- [ ] SSL certificate installed
- [ ] DNS records configured
- [ ] Monitoring dashboards created
- [ ] Logging pipeline active
- [ ] Error tracking (Sentry) configured
- [ ] Load testing completed
- [ ] Backup and restore tested
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## Conclusion

You now have a comprehensive deployment guide for Revenue Forecaster AI. For production deployments, always test in a staging environment first!

**Questions?** Contact DevOps team or check documentation.

Happy deploying! 🚀
