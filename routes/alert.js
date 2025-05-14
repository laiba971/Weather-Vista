// routes/alerts.js
const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');
const Location = require('../models/location');
const { authenticateToken } = require('../middleware/auth');
const { checkAlertOwnership } = require('../middleware/ownership');
const { apiLimiter } = require('../middleware/rateLimiter');

// Get all alerts for user
router.get('/', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).populate('location');
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create alert
router.post('/', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const { locationId, type, threshold, condition } = req.body;
    
    // Validate input
    if (!locationId || !type || threshold === undefined || !condition) {
      return res.status(400).json({ 
        message: 'Location ID, type, threshold, and condition are required' 
      });
    }
    
    // Validate location
    const location = await Location.findOne({ 
      _id: locationId, 
      user: req.user.id 
    });
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Create new alert
    const newAlert = new Alert({
      user: req.user.id,
      location: locationId,
      type,
      threshold,
      condition
    });
    
    await newAlert.save();
    
    res.status(201).json(newAlert);
    
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other alert routes (update, delete, etc.)
// ...

module.exports = router;