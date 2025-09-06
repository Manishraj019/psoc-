# 🐳 Docker Troubleshooting Guide

## Issue: npm ci fails with "package-lock.json not found"

### ✅ **SOLUTION 1: Use the Fixed Dockerfiles**

The Dockerfiles have been updated to work properly. Try building again:

```bash
# Clean up any previous builds
docker-compose down
docker system prune -f

# Build and start
docker-compose up -d --build
```

### ✅ **SOLUTION 2: Use Alternative Dockerfile**

If you still encounter issues, use the alternative Dockerfile:

```bash
# Rename the alternative Dockerfile
cd backend
mv Dockerfile Dockerfile.original
mv Dockerfile.alternative Dockerfile

# Build again
cd ..
docker-compose up -d --build
```

### ✅ **SOLUTION 3: Manual Package Lock Generation**

If you have Node.js installed locally:

```bash
# Generate package-lock.json files
cd backend
npm install
cd ../frontend
npm install
cd ..

# Then build Docker
docker-compose up -d --build
```

### ✅ **SOLUTION 4: Use npm install instead of npm ci**

If you continue having issues, modify the Dockerfiles to use `npm install`:

**Backend Dockerfile:**
```dockerfile
# Change this line:
RUN npm ci --omit=dev
# To this:
RUN npm install --omit=dev
```

**Frontend Dockerfile:**
```dockerfile
# Change this line:
RUN npm ci
# To this:
RUN npm install
```

## Common Docker Issues and Solutions

### Issue: OpenCV Installation Fails
```dockerfile
# Add this to Dockerfile before npm install:
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    opencv-dev \
    pkgconfig
```

### Issue: Permission Denied
```dockerfile
# Add user creation to Dockerfile:
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
```

### Issue: Build Cache Problems
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a -f
docker-compose up -d --build --no-cache
```

### Issue: Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :4000
# Or on Windows:
netstat -ano | findstr :4000

# Kill the process or change ports in docker-compose.yml
```

## Production Deployment Alternatives

### Option 1: Platform-as-a-Service (No Docker needed)

**Backend on Render.com:**
1. Connect GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables

**Frontend on Vercel:**
1. Connect GitHub repository
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/dist`

### Option 2: VPS with Manual Setup

```bash
# On your VPS:
git clone <your-repo>
cd photo-marathon-platform

# Backend setup
cd backend
npm install
cp env.example .env
# Edit .env with your settings
npm start

# Frontend setup (in another terminal)
cd frontend
npm install
npm run build
# Serve the dist/ folder with nginx or apache
```

### Option 3: Cloud Run (Google Cloud)

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/photo-marathon-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/photo-marathon-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'photo-marathon-backend', '--image', 'gcr.io/$PROJECT_ID/photo-marathon-backend', '--platform', 'managed', '--region', 'us-central1']
```

## Quick Fix Commands

### If Docker build fails:
```bash
# Try this sequence:
docker-compose down
docker system prune -f
docker-compose up -d --build --no-cache
```

### If you want to skip Docker entirely:
```bash
# Use the manual setup approach
cd backend
npm install
npm start

# In another terminal:
cd frontend
npm install
npm run dev
```

### If you need to reset everything:
```bash
# Nuclear option - clean everything
docker-compose down -v
docker system prune -a -f
docker volume prune -f
docker-compose up -d --build
```

## Success Indicators

You'll know it's working when you see:
- ✅ Backend: "Photo Marathon Backend Server Started!"
- ✅ Frontend: Accessible at http://localhost:3000
- ✅ Database: Connected to MongoDB
- ✅ Admin login: username: admin, password: admin@123

## Still Having Issues?

Try the **Platform-as-a-Service** approach instead of Docker:
1. Deploy backend to Render.com or Railway
2. Deploy frontend to Vercel or Netlify
3. Use MongoDB Atlas for database
4. No Docker complexity needed!

**Your platform will work the same way, just deployed differently! 🚀**
