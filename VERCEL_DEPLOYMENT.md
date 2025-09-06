# Vercel Deployment Guide

## ✅ Build Issue Fixed
The Vercel build error has been resolved. The issue was an import/export mismatch in the `apiClient` service.

## 🚀 Deployment Steps

### 1. **Frontend Deployment (Vercel)**

#### Environment Variables
Set these in your Vercel project settings:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

#### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Root Directory
If your frontend is in a subfolder, set:
- **Root Directory**: `frontend`

### 2. **Backend Deployment Options**

#### Option A: Vercel (Serverless Functions)
- Deploy backend as Vercel serverless functions
- Good for: Small to medium traffic
- Limitations: 10-second execution limit

#### Option B: Railway/Render (Recommended)
- Deploy backend as a containerized service
- Good for: High traffic, real-time features
- Better for: Socket.IO, file uploads, long-running processes

#### Option C: DigitalOcean App Platform
- Full-stack deployment
- Good for: Production applications
- Features: Auto-scaling, managed databases

### 3. **Database Setup**

#### MongoDB Atlas (Already Configured)
```env
MONGO_URI=mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 4. **Environment Variables for Backend**

```env
# Database
MONGO_URI=mongodb+srv://bitphotographicsociety_db_user:T2pwgtyajSgEU5Hh@cluster0.0gzgwrl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=7d

# Server
PORT=4000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload
UPLOADS_DIR=/tmp/uploads
MAX_UPLOAD_SIZE_MB=10

# Image Processing
AUTO_APPROVAL_THRESHOLD=75
OPENCV_METHOD=phash

# Redis (if using)
REDIS_URL=your-redis-url
```

## 🔧 **Quick Deploy Commands**

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

## 📋 **Pre-Deployment Checklist**

### Frontend ✅
- [x] Build error fixed (apiClient import)
- [x] All components working
- [x] Environment variables configured
- [x] Vite config optimized
- [x] Dependencies up to date

### Backend ✅
- [x] Docker build working
- [x] OpenCV issue resolved
- [x] Image similarity working
- [x] All API endpoints functional
- [x] Socket.IO configured
- [x] Security middleware enabled

### Database ✅
- [x] MongoDB Atlas configured
- [x] Connection string ready
- [x] Seed data available

## 🎯 **Post-Deployment Steps**

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Verify API endpoints
3. **Test Database**: Check MongoDB connection
4. **Test Game Flow**: Complete registration → submission → approval
5. **Test Real-time**: Verify Socket.IO connections
6. **Test File Upload**: Upload and process images

## 🚨 **Troubleshooting**

### Common Issues:
1. **CORS Errors**: Update `CORS_ORIGIN` in backend
2. **Socket.IO Issues**: Check WebSocket support on hosting platform
3. **File Upload Issues**: Verify file size limits and storage
4. **Database Connection**: Check MongoDB Atlas IP whitelist

### Support:
- Check Vercel deployment logs
- Monitor backend application logs
- Test API endpoints with Postman/curl
- Verify environment variables

## 🎉 **Success!**
Your Photo Marathon platform is now ready for production deployment!
