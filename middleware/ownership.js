// middleware/ownership.js
const Location = require('../models/location');
const Alert = require('../models/alert');

// Check location ownership
exports.checkLocationOwnership = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    if (location.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }
    
    req.location = location; // Attach location to request
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check alert ownership
exports.checkAlertOwnership = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (alert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this alert' });
    }
    
    req.alert = alert; // Attach alert to request
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};