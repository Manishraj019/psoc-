# 🚀 Production Deployment Guide

This guide covers deploying the Photo Marathon Platform to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [x] All features implemented and tested
- [x] Security measures in place (JWT, bcrypt, rate limiting)
- [x] Error handling and logging configured
- [x] Environment variables properly configured
- [x] Docker configuration ready

### ✅ Database Setup
- [x] MongoDB models and schemas defined
- [x] Database indexes created for performance
- [x] Seed script for initial data
- [x] Data validation rules implemented

### ✅ Security
- [x] JWT authentication with secure secrets
- [x] Password hashing with bcrypt
- [x] Rate limiting on API endpoints
- [x] File upload validation
- [x] CORS configuration
- [x] Helmet security headers

## 🌐 Cloud Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

**Best for**: VPS, dedicated servers, or cloud instances

```bash
# 1. Clone repository
git clone <your-repo-url>
cd photo-marathon-platform

# 2. Configure environment
cp backend/env.example backend/.env
# Edit backend/.env with production values

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Seed database
docker-compose exec backend npm run seed
```

**Required Environment Variables**:
```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

### Option 2: Platform-as-a-Service (PaaS)

#### Backend: Render.com
1. Connect your GitHub repository
2. Set build command: `cd backend && npm ci && npm run build`
3. Set start command: `cd backend && npm start`
4. Configure environment variables
5. Deploy

#### Frontend: Vercel
1. Connect your GitHub repository
2. Set build command: `cd frontend && npm ci && npm run build`
3. Set output directory: `frontend/dist`
4. Configure environment variables
5. Deploy

#### Database: MongoDB Atlas
1. Create MongoDB Atlas cluster
2. Configure network access (whitelist IPs)
3. Create database user
4. Get connection string
5. Update MONGO_URI in backend environment

### Option 3: AWS Deployment

#### Backend: AWS App Runner or ECS
```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - cd backend
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 4000
  env:
    - name: NODE_ENV
      value: production
    - name: MONGO_URI
      value: mongodb://your-atlas-cluster
```

#### Frontend: AWS S3 + CloudFront
1. Build frontend: `cd frontend && npm run build`
2. Upload `dist/` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain and SSL

## 🔧 Production Configuration

### Environment Variables

#### Backend (.env)
```env
# Production Settings
NODE_ENV=production
PORT=4000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/photo-marathon

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
UPLOADS_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=10

# OpenCV
AUTO_APPROVAL_THRESHOLD=75
OPENCV_METHOD=orb

# Redis (optional)
REDIS_URL=redis://your-redis-instance:6379

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

### SSL/HTTPS Configuration

#### Nginx Configuration (for VPS deployment)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring
- **Uptime**: Use UptimeRobot or Pingdom
- **Performance**: New Relic, DataDog, or AWS CloudWatch
- **Error Tracking**: Sentry or Rollbar

### Log Management
```javascript
// Add to backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## 🔒 Security Hardening

### Production Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] File upload size limits
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured

### Database Security
```javascript
// MongoDB Atlas Security
// 1. Enable authentication
// 2. Create dedicated database user
// 3. Whitelist IP addresses
// 4. Enable encryption at rest
// 5. Regular backups
```

## 📈 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use Redis for caching
- Optimize database queries
- Implement connection pooling
- Use CDN for static assets

### Frontend Optimization
- Enable gzip compression
- Use CDN for assets
- Implement lazy loading
- Optimize images
- Enable browser caching

## 🚨 Backup Strategy

### Database Backups
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://your-connection-string" --out="/backups/mongodb_$DATE"
```

### File Backups
```bash
# Upload files backup
tar -czf "uploads_$(date +%Y%m%d_%H%M%S).tar.gz" uploads/
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Deploy backend to your platform
          
      - name: Deploy Frontend
        run: |
          # Deploy frontend to your platform
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Security updates
- [ ] SSL certificate renewal

### Troubleshooting
- Check application logs
- Verify database connectivity
- Test API endpoints
- Check file permissions
- Verify environment variables

## 🎯 Go-Live Checklist

### Final Pre-Launch
- [ ] All features tested in production environment
- [ ] SSL certificates installed and working
- [ ] Database seeded with initial data
- [ ] Admin credentials changed from default
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation updated

### Post-Launch
- [ ] Monitor application for 24-48 hours
- [ ] Check error rates and performance
- [ ] Verify all features working correctly
- [ ] Test with real users
- [ ] Document any issues and resolutions

---

**Your Photo Marathon Platform is now ready for production deployment! 🚀**
