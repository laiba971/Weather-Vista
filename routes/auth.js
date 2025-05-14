// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { sendEmail } = require('../utils/emails');

// Register user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      verificationToken
    });
    
    await newUser.save();
    
    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email - WeatherWise',
      `
      <h1>Welcome to WeatherWise!</h1>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      `
    );
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other auth routes (login, verify, forgot-password, etc.)
// ...

module.exports = router;