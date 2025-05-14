// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Authentication middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Check if user exists middleware
exports.checkUserExists = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.userDoc = user; // Attach user document to request
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};