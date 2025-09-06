const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken, requireTeam } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimit');

// Apply authentication and team role check to all routes
router.use(authenticateToken, requireTeam);

// Team progress and submission routes
router.get('/progress', teamController.getProgress);
router.post('/submit', uploadLimiter, upload.single('file'), handleUploadError, teamController.submitImage);
router.get('/submissions', teamController.getSubmissionHistory);
router.get('/submission-status', teamController.getCurrentSubmissionStatus);

module.exports = router;
