// models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  country: { 
    type: String,
    trim: true,
    maxlength: 100
  },
  lat: { 
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lon: { 
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Add compound index for user and isDefault
locationSchema.index({ user: 1, isDefault: 1 });

// Add geospatial index for future location-based queries
locationSchema.index({ lat: 1, lon: 1 });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;