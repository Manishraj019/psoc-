# 📸 Photo Marathon Platform

A complete race-style photo-matching game platform where teams upload images visually matching admin-supplied reference images. Location doesn't matter — only visual similarity counts!

## 🎯 Features

- **8 Randomized Levels + 1 Final Level**: Each team gets random reference images from pools for levels 1-8, with the same final level for all teams
- **OpenCV Image Similarity**: Automatic image comparison using ORB feature matching or perceptual hashing
- **Auto-Approval System**: Images above similarity threshold are auto-approved, others go to admin review
- **Real-time Updates**: Socket.IO integration for live notifications and leaderboard updates
- **Admin Dashboard**: Complete game management, level creation, submission review, and leaderboard
- **Team Interface**: Clean team dashboard with progress tracking and photo submission
- **Secure Authentication**: JWT-based auth with role-based access control

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Models**: Admin, Team, Level, Submission, GameState (MongoDB/Mongoose)
- **Services**: Image similarity (OpenCV), assignment logic, ranking, Socket.IO
- **API**: RESTful endpoints for auth, levels, submissions, admin functions
- **Security**: JWT tokens, bcrypt password hashing, rate limiting, file validation

### Frontend (React + Vite)
- **Pages**: Admin dashboard, team interface, authentication
- **Components**: Reusable UI components with Tailwind CSS
- **State Management**: Context API for auth and socket connections
- **Real-time**: Socket.IO client for live updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Redis (optional, for queues)

### Option 1: Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd photo-marathon-platform
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Seed the database**:
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Admin Login: username: `admin`, password: `admin@123`

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run seed  # Create admin user and sample data
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/photo-marathon

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
UPLOADS_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10

# OpenCV Configuration
AUTO_APPROVAL_THRESHOLD=75
OPENCV_METHOD=orb

# Redis Configuration (for queues)
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## 🎮 Game Flow

### For Teams
1. **Register**: Create team with leader and members
2. **Login**: Access team dashboard
3. **View Level**: See assigned reference image and hint
4. **Submit Photo**: Upload image for similarity comparison
5. **Get Results**: Auto-approval or manual review notification
6. **Progress**: Unlock next level upon approval

### For Admins
1. **Login**: Access admin dashboard
2. **Create Levels**: Upload reference images and set hints
3. **Start Game**: Begin the photo marathon
4. **Review Submissions**: Approve/reject pending submissions
5. **Monitor Progress**: View real-time leaderboard
6. **Declare Winner**: First team to complete final level wins

## 📊 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/team/register` - Team registration
- `POST /api/auth/team/login` - Team login

### Team Endpoints
- `GET /api/team/progress` - Get current progress
- `POST /api/team/submit` - Submit image for current level
- `GET /api/team/submissions` - Get submission history

### Admin Endpoints
- `GET /api/admin/levels` - List all levels
- `POST /api/admin/levels` - Create new level
- `GET /api/admin/submissions` - Get pending submissions
- `POST /api/admin/submissions/:id/approve` - Approve submission
- `POST /api/admin/submissions/:id/reject` - Reject submission
- `GET /api/admin/leaderboard` - Get leaderboard
- `POST /api/admin/game/start` - Start game
- `POST /api/admin/game/pause` - Pause game
- `POST /api/admin/game/reset` - Reset game

## 🔍 Image Similarity Algorithm

The platform supports two similarity methods:

### ORB Feature Matching (Default)
- Detects ORB keypoints and descriptors
- Uses FLANN matcher with Lowe's ratio test
- Robust to rotation and scale changes
- Similarity = (good matches / total keypoints) × 100

### Perceptual Hash (Fallback)
- Computes pHash for both images
- Calculates Hamming distance
- Fast and simple for exact/near-exact matches
- Less tolerant to viewpoint changes

## 🏆 Scoring & Leaderboard

Teams are ranked by:
1. **Level Completed** (descending)
2. **Total Time** (ascending) - from first submission to final completion

The first team to complete Level 9 (final level) is declared the winner.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse of endpoints
- **File Validation**: Image type and size validation
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers middleware

## 📱 Real-time Features

Socket.IO events for live updates:
- `submission:result` - Team submission results
- `submission:pending` - New pending submissions (admin)
- `submission:reviewed` - Review results
- `level:unlocked` - Next level unlocked
- `leaderboard:update` - Leaderboard changes
- `game:started/paused/reset` - Game state changes
- `game:winner` - Winner announcement

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGO_URI=mongodb://your-production-db
   export JWT_SECRET=your-production-secret
   ```

2. **Build and Deploy**:
   ```bash
   # Backend
   cd backend
   npm ci --only=production
   npm start

   # Frontend
   cd frontend
   npm run build
   # Deploy dist/ folder to your web server
   ```

3. **Docker Production**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

- **Backend**: Render, Heroku, Railway, DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas
- **Storage**: AWS S3, Cloudinary for image storage

## 🛠️ Development

### Project Structure
```
photo-marathon-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, upload, rate limiting
│   │   └── scripts/        # Database seeding
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── services/       # API client services
│   │   └── styles/         # CSS and Tailwind config
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Adding New Features

1. **Backend**: Add routes, controllers, services
2. **Frontend**: Create components, pages, services
3. **Database**: Update models and migrations
4. **Real-time**: Add Socket.IO events
5. **Testing**: Write unit and integration tests

## 🐛 Troubleshooting

### Common Issues

1. **OpenCV Installation Issues**:
   ```bash
   # Install system dependencies
   sudo apt-get install libopencv-dev
   # Or use Docker for consistent environment
   ```

2. **MongoDB Connection Issues**:
   - Check MONGO_URI format
   - Ensure MongoDB is running
   - Verify network connectivity

3. **File Upload Issues**:
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure proper MIME type validation

4. **Socket.IO Connection Issues**:
   - Check CORS configuration
   - Verify JWT token validity
   - Ensure proper proxy settings

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for photo marathon competitions**
