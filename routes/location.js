// routes/locations.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkLocationOwnership } = require('../middleware/ownership');
const { apiLimiter } = require('../middleware/rateLimiter');


// Get all locations for user
router.get('/', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user.id });
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add location
router.post('/', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const { name, country, lat, lon, isDefault } = req.body;
    
    // Validate input
    if (!name || !lat || !lon) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required' });
    }
    
    // If setting as default, unset any existing default
    if (isDefault) {
      await Location.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Create new location
    const newLocation = new Location({
      user: req.user.id,
      name,
      country,
      lat,
      lon,
      isDefault: isDefault || false
    });
    
    await newLocation.save();
    
    res.status(201).json(newLocation);
    
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update location
router.put('/:id', authenticateToken, checkLocationOwnership, apiLimiter, async (req, res) => {
  try {
    const { name, country, lat, lon, isDefault } = req.body;
    
    // If setting as default, unset any existing default
    if (isDefault && !req.location.isDefault) {
      await Location.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Update location
    req.location.name = name || req.location.name;
    req.location.country = country || req.location.country;
    req.location.lat = lat !== undefined ? lat : req.location.lat;
    req.location.lon = lon !== undefined ? lon : req.location.lon;
    req.location.isDefault = isDefault !== undefined ? isDefault : req.location.isDefault;
    
    await req.location.save();
    
    res.json(req.location);
    
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete location
router.delete('/:id', authenticateToken, checkLocationOwnership, apiLimiter, async (req, res) => {
  try {
    await req.location.remove();
    
    // Delete associated alerts
    await Alert.deleteMany({ location: req.params.id });
    
    res.json({ message: 'Location deleted successfully' });
    
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;