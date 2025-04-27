const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback after Google login
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // send back JWT token, after successful login
    res.json({
      message: 'Login successful',
      token: req.user.token,
      user: req.user.user  // optional if you want to send user info too
    });
  }
);

module.exports = router;
