const socketIO = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.adminRoom = 'admin';
    this.teamRooms = new Map(); // teamId -> room name
  }

  /**
   * Initialize Socket.IO with the HTTP server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.IO middleware for authentication
   */
  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        socket.userId = decoded.userId;
        socket.userType = decoded.type;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userType})`);

      // Join appropriate room based on user type
      if (socket.userType === 'admin') {
        socket.join(this.adminRoom);
        console.log(`Admin ${socket.userId} joined admin room`);
      } else if (socket.userType === 'team') {
        const teamRoom = `team_${socket.userId}`;
        socket.join(teamRoom);
        this.teamRooms.set(socket.userId, teamRoom);
        console.log(`Team ${socket.userId} joined team room: ${teamRoom}`);
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        if (socket.userType === 'team') {
          this.teamRooms.delete(socket.userId);
        }
      });
    });
  }

  /**
   * Emit submission result to team
   * @param {string} teamId - Team ID
   * @param {Object} data - Submission result data
   */
  emitSubmissionResult(teamId, data) {
    if (!this.io) return;

    const teamRoom = this.teamRooms.get(teamId) || `team_${teamId}`;
    this.io.to(teamRoom).emit('submission:result', {
      teamId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Emit pending submission to admin
   * @param {Object} data - Pending submission data
   */
  emitPendingSubmission(data) {
    if (!this.io) return;

    this.io.to(this.adminRoom).emit('submission:pending', {
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Emit submission review result
   * @param {string} teamId - Team ID
   * @param {Object} data - Review result data
   */
  emitSubmissionReviewed(teamId, data) {
    if (!this.io) return;

    // Emit to team
    const teamRoom = this.teamRooms.get(teamId) || `team_${teamId}`;
    this.io.to(teamRoom).emit('submission:reviewed', {
      teamId,
      ...data,
      timestamp: new Date()
    });

    // Emit to admin
    this.io.to(this.adminRoom).emit('submission:reviewed', {
      teamId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Emit level unlocked event to team
   * @param {string} teamId - Team ID
   * @param {Object} data - Level unlock data
   */
  emitLevelUnlocked(teamId, data) {
    if (!this.io) return;

    const teamRoom = this.teamRooms.get(teamId) || `team_${teamId}`;
    this.io.to(teamRoom).emit('level:unlocked', {
      teamId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Emit leaderboard update to admin
   * @param {Array} leaderboard - Updated leaderboard data
   */
  emitLeaderboardUpdate(leaderboard) {
    if (!this.io) return;

    this.io.to(this.adminRoom).emit('leaderboard:update', {
      leaderboard,
      timestamp: new Date()
    });
  }

  /**
   * Emit game state change
   * @param {string} event - Game event type
   * @param {Object} data - Game state data
   */
  emitGameStateChange(event, data) {
    if (!this.io) return;

    // Emit to all connected clients
    this.io.emit(`game:${event}`, {
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Emit winner announcement
   * @param {Object} winnerData - Winner team data
   */
  emitWinnerAnnouncement(winnerData) {
    if (!this.io) return;

    this.io.emit('game:winner', {
      ...winnerData,
      timestamp: new Date()
    });
  }

  /**
   * Get connected clients count
   * @returns {Object} Connection statistics
   */
  getConnectionStats() {
    if (!this.io) return { total: 0, admins: 0, teams: 0 };

    const adminRoom = this.io.sockets.adapter.rooms.get(this.adminRoom);
    const adminCount = adminRoom ? adminRoom.size : 0;
    const totalCount = this.io.sockets.sockets.size;
    const teamCount = totalCount - adminCount;

    return {
      total: totalCount,
      admins: adminCount,
      teams: teamCount
    };
  }

  /**
   * Broadcast message to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Data to broadcast
   */
  broadcast(event, data) {
    if (!this.io) return;

    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
}

module.exports = new SocketService();
