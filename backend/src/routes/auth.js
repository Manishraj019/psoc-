const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

// Public routes
router.post('/admin/login', authLimiter, authController.adminLogin);
router.post('/team/register', authLimiter, authController.teamRegister);
router.post('/team/login', authLimiter, authController.teamLogin);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
