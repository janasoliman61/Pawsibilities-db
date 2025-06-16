const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed
const router = express.Router();

// JWT Secret - consistent across all routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware with debug logging
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔐 [AUTH] Token received:', token.substring(0, 20) + '...');
    console.log('🔐 [AUTH] JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔐 [AUTH] Using secret:', process.env.JWT_SECRET ? 'from env' : 'fallback');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ [AUTH] Token decoded successfully:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Token verification failed:', error.message);
    console.error('❌ [AUTH] Error type:', error.name);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

// @route   POST /users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, userName, gender, address } = req.body;
    
    console.log('📝 [REGISTER] Registration attempt for:', firstName, lastName, email);

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('❌ [REGISTER] User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      phone: phone || '',
      userName: userName || `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      gender: gender || 'prefer_not_to_say',
      address: address || ''
    });

    await user.save();
    console.log('✅ [REGISTER] User created successfully:', user._id);

    // Create JWT token
    const payload = {
      id: user._id,
      email: user.email
    };

    console.log('🔐 [REGISTER] Creating token with secret:', process.env.JWT_SECRET ? 'from env' : 'fallback');
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ [REGISTER] Token created for new user:', user.firstName, user.lastName);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('❌ [REGISTER] Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /users/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 [LOGIN] Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ [LOGIN] User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ [LOGIN] Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      id: user._id,
      email: user.email
    };

    console.log('🔐 [LOGIN] Creating token with secret:', process.env.JWT_SECRET ? 'from env' : 'fallback');
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ [LOGIN] Token created for user:', user.firstName, user.lastName);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('❌ [LOGIN] Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    console.log('👤 [PROFILE] Getting profile for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('❌ [PROFILE] User not found in database:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ [PROFILE] Profile retrieved for:', user.firstName, user.lastName);
    
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ [PROFILE] Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /users/profile (alternative endpoint)
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('👤 [PROFILE-ALT] Getting profile for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('❌ [PROFILE-ALT] User not found in database:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ [PROFILE-ALT] Profile retrieved for:', user.firstName, user.lastName);
    
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ [PROFILE-ALT] Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('📝 [UPDATE] Updating profile for user ID:', req.user.id);
    
    const { firstName, lastName, bio, location, profileImageUrl } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('❌ [UPDATE] User not found in database:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    await user.save();
    console.log('✅ [UPDATE] Profile updated for:', user.firstName, user.lastName);

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ [UPDATE] Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /users/test
// @desc    Test endpoint
// @access  Public
router.get('/test', (req, res) => {
  console.log('🧪 [TEST] Test endpoint called');
  res.json({ 
    message: 'User routes working!',
    timestamp: new Date().toISOString(),
    jwtSecret: process.env.JWT_SECRET ? 'Environment variable set' : 'Using fallback',
    endpoints: [
      'POST /users/register',
      'POST /users/login', 
      'GET /users/me',
      'GET /users/profile',
      'PUT /users/profile',
      'GET /users/test'
    ]
  });
});

// @route   GET /users/debug-token
// @desc    Debug token validation
// @access  Private
router.get('/debug-token', auth, async (req, res) => {
  try {
    console.log('🐛 [DEBUG] Debug token endpoint called');
    console.log('🐛 [DEBUG] req.user:', req.user);
    
    const user = await User.findById(req.user.id);
    console.log('🐛 [DEBUG] Found user:', user ? `${user.firstName} ${user.lastName}` : 'NOT FOUND');
    
    res.json({
      message: 'Token is valid!',
      tokenData: req.user,
      userId: req.user.id,
      userExists: !!user,
      user: user ? {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      } : null
    });
  } catch (error) {
    console.log('🐛 [DEBUG] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;