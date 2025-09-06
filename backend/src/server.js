const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const socketService = require('./services/socketService');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/photo-marathon';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('📊 Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('🔌 HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('📊 MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
🚀 Photo Marathon Backend Server Started!
📡 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API Base URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
