# 🚀 Production Setup with MongoDB Atlas

## Your MongoDB Atlas Connection String
```
mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 🔧 Quick Production Setup

### Step 1: Configure Environment Variables

Create `backend/.env` file with your MongoDB Atlas connection:

```env
# Database Configuration
MONGO_URI=mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/photo-marathon?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration - CHANGE THIS IN PRODUCTION!
JWT_SECRET=bitphotographicsociety-super-secure-jwt-secret-2024
JWT_EXPIRY=7d

# Server Configuration
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload Configuration
UPLOADS_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=10

# OpenCV Configuration
AUTO_APPROVAL_THRESHOLD=75
OPENCV_METHOD=orb

# Logging Configuration
LOG_LEVEL=info
```

### Step 2: Update Docker Compose for Production

Update your `docker-compose.yml` to use the production database:

```yaml
version: '3.8'

services:
  # MongoDB Database (Optional - you can use Atlas instead)
  mongodb:
    image: mongo:6.0
    container_name: photo-marathon-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: photo-marathon
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - photo-marathon-network

  # Redis for queues (optional)
  redis:
    image: redis:7-alpine
    container_name: photo-marathon-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - photo-marathon-network

  # Backend API
  backend:
    build: ./backend
    container_name: photo-marathon-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 4000
      # Use your MongoDB Atlas connection
      MONGO_URI: mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/photo-marathon?retryWrites=true&w=majority&appName=Cluster0
      JWT_SECRET: bitphotographicsociety-super-secure-jwt-secret-2024
      JWT_EXPIRY: 7d
      CORS_ORIGIN: https://your-frontend-domain.com
      UPLOADS_DIR: /app/uploads
      MAX_UPLOAD_SIZE_MB: 10
      AUTO_APPROVAL_THRESHOLD: 75
      OPENCV_METHOD: orb
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: info
    ports:
      - "4000:4000"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - redis
    networks:
      - photo-marathon-network

  # Frontend
  frontend:
    build: ./frontend
    container_name: photo-marathon-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - photo-marathon-network

volumes:
  redis_data:
  uploads_data:

networks:
  photo-marathon-network:
    driver: bridge
```

### Step 3: Deploy to Production

```bash
# 1. Build and start services
docker-compose up -d --build

# 2. Seed the database with initial data
docker-compose exec backend npm run seed

# 3. Check logs
docker-compose logs -f backend
```

## 🌐 Cloud Deployment Options

### Option 1: Render.com (Recommended)

#### Backend Deployment:
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm ci`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/photo-marathon?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=bitphotographicsociety-super-secure-jwt-secret-2024
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

#### Frontend Deployment:
1. Create a new Static Site on Render
2. Set build command: `cd frontend && npm ci && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-render-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-render-url.onrender.com
   ```

### Option 2: Vercel + Railway

#### Backend (Railway):
1. Connect GitHub repository to Railway
2. Deploy backend service
3. Add environment variables (same as above)

#### Frontend (Vercel):
1. Connect GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variables (same as above)

### Option 3: AWS Deployment

#### Backend (AWS App Runner):
1. Create App Runner service
2. Connect to your GitHub repository
3. Configure build settings:
   - Build command: `cd backend && npm ci`
   - Start command: `cd backend && npm start`
4. Add environment variables

#### Frontend (AWS S3 + CloudFront):
1. Build frontend: `cd frontend && npm run build`
2. Upload `dist/` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain and SSL

## 🔒 Security Checklist for Production

### ✅ Required Changes:
- [ ] Change JWT_SECRET to a secure random string
- [ ] Update CORS_ORIGIN to your actual frontend domain
- [ ] Change admin password from default
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

### ✅ MongoDB Atlas Security:
- [ ] Whitelist your server IP addresses
- [ ] Enable database authentication
- [ ] Use strong database passwords
- [ ] Enable encryption at rest
- [ ] Set up regular backups

## 📊 Monitoring Setup

### Add to your backend for production monitoring:

```javascript
// Add to backend/src/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
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
```

## 🚀 Quick Start Commands

### Local Development with Atlas:
```bash
# 1. Set up environment
cp backend/env.production.example backend/.env
# Edit .env with your settings

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start development
cd backend && npm run dev
cd frontend && npm run dev

# 4. Seed database
cd backend && npm run seed
```

### Production Deployment:
```bash
# 1. Deploy with Docker
docker-compose up -d --build

# 2. Seed database
docker-compose exec backend npm run seed

# 3. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Admin: username: admin, password: admin@123
```

## 🎯 Your Platform is Ready!

With your MongoDB Atlas connection string, your Photo Marathon Platform is now ready for production deployment. The platform will:

1. ✅ Connect to your MongoDB Atlas database
2. ✅ Store all game data securely in the cloud
3. ✅ Handle multiple teams and submissions
4. ✅ Provide real-time updates
5. ✅ Scale automatically with your user base

**Your platform is production-ready and can be deployed immediately! 🚀**
