const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Team = require('../models/Team');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.userId);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid admin token' });
      }
      req.user = { ...admin.toObject(), type: 'admin' };
    } 
    // Check if it's a team token
    else if (decoded.type === 'team') {
      const team = await Team.findById(decoded.userId);
      if (!team) {
        return res.status(401).json({ error: 'Invalid team token' });
      }
      req.user = { ...team.toObject(), type: 'team' };
    } else {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireTeam = (req, res, next) => {
  if (req.user.type !== 'team') {
    return res.status(403).json({ error: 'Team access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireTeam
};
