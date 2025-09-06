const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { generalLimiter } = require('../middleware/rateLimit');

// Apply authentication and admin role check to all routes
router.use(authenticateToken, requireAdmin);

// Level management routes
router.get('/levels', generalLimiter, adminController.getLevels);
router.post('/levels', generalLimiter, upload.array('images', 10), handleUploadError, adminController.createLevel);
router.put('/levels/:id', generalLimiter, upload.array('images', 10), handleUploadError, adminController.updateLevel);
router.delete('/levels/:id', generalLimiter, adminController.deleteLevel);

// Submission management routes
router.get('/submissions', generalLimiter, adminController.getPendingSubmissions);
router.post('/submissions/:id/approve', generalLimiter, adminController.approveSubmission);
router.post('/submissions/:id/reject', generalLimiter, adminController.rejectSubmission);

// Leaderboard route
router.get('/leaderboard', generalLimiter, adminController.getLeaderboard);

// Game control routes
router.post('/game/start', generalLimiter, adminController.startGame);
router.post('/game/pause', generalLimiter, adminController.pauseGame);
router.post('/game/reset', generalLimiter, adminController.resetGame);
router.get('/game/state', generalLimiter, adminController.getGameState);

module.exports = router;
