const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==================== UTILS ====================
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret === 'your_super_secret_jwt_key_change_this_in_production') {
    throw new Error("JWT_SECRET is not configured. Please set it in server/.env file");
  }

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user'
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PROTECT MIDDLEWARE ====================
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your_super_secret_jwt_key_change_this_in_production') {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// ==================== AUTHORIZE ROLES ====================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized`
      });
    }
    next();
  };
};

module.exports = router;
module.exports.protect = protect;
module.exports.authorize = authorize;
