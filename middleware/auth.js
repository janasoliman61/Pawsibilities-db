// middleware/auth.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Protect Routes Middleware (JWT)
module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email: email,
        firstName: profile.name.givenName || 'Google',
        lastName: profile.name.familyName || 'User',
        userName: profile.displayName || `google_${Math.random().toString(36).substring(2, 8)}`,
        gender: 'Not Specified',
        userId: `google_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
        password: Math.random().toString(36).slice(-8)
      });
      await user.save();
    }

    // ✅ Generate JWT token after login
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    done(null, { user, token });
  } catch (err) {
    done(err, null);
  }
}
));

// Passport session handlers
passport.serializeUser((obj, done) => {
  done(null, obj);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
