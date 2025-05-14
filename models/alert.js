// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location',
    required: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['temperature', 'precipitation', 'wind', 'humidity']
  },
  threshold: { 
    type: Number, 
    required: true 
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['above', 'below']
  },
  isActive: { 
    type: Boolean, 
    default: true 
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

// Add compound index for user and location
alertSchema.index({ user: 1, location: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;