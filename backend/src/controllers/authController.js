const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Team = require('../models/Team');

class AuthController {
  /**
   * Admin login
   */
  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find admin by username
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: admin._id, 
          type: 'admin',
          username: admin.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      res.json({
        token,
        user: {
          id: admin._id,
          username: admin.username,
          type: 'admin'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Team registration
   */
  async teamRegister(req, res) {
    try {
      const { teamName, password, leader, members } = req.body;

      // Validation
      if (!teamName || !password || !leader || !members || !Array.isArray(members)) {
        return res.status(400).json({ 
          error: 'teamName, password, leader, and members array are required' 
        });
      }

      if (members.length === 0) {
        return res.status(400).json({ error: 'At least one member is required' });
      }

      // Check if team already exists
      const existingTeam = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (existingTeam) {
        return res.status(409).json({ error: 'Team name already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create team
      const team = new Team({
        teamName: teamName.toLowerCase(),
        passwordHash,
        leader,
        members,
        currentLevel: 1
      });

      await team.save();

      res.status(201).json({
        message: 'Team registered successfully',
        team: {
          id: team._id,
          teamName: team.teamName,
          leader: team.leader,
          members: team.members,
          currentLevel: team.currentLevel
        }
      });
    } catch (error) {
      console.error('Team registration error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Team name already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Team login
   */
  async teamLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find team by teamName (used as username)
      const team = await Team.findOne({ teamName: username.toLowerCase() });
      if (!team) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, team.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: team._id, 
          type: 'team',
          teamName: team.teamName 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      res.json({
        token,
        team: {
          id: team._id,
          teamName: team.teamName,
          currentLevel: team.currentLevel,
          leader: team.leader,
          members: team.members
        }
      });
    } catch (error) {
      console.error('Team login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(req, res) {
    try {
      if (req.user.type === 'admin') {
        res.json({
          user: {
            id: req.user._id,
            username: req.user.username,
            type: 'admin'
          }
        });
      } else if (req.user.type === 'team') {
        res.json({
          team: {
            id: req.user._id,
            teamName: req.user.teamName,
            currentLevel: req.user.currentLevel,
            leader: req.user.leader,
            members: req.user.members
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid user type' });
      }
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Logout (client-side token removal)
   */
  async logout(req, res) {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // by removing the token from storage
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
