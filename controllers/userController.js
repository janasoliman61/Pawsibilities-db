// controllers/userController.js
require('dotenv').config();
const User       = require('../models/User');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const Pet        = require('../models/Pet');
const crypto     = require('crypto');
const sendEmail  = require('../utils/sendEmail');
const mailer     = require('../config/mailer');

// ── REGISTER ──────────────────────────────────────────────────────────
// controllers/userController.js
exports.register = async (req, res, next) => {
  try {
    // 1) Grab the incoming data
    const {
      firstName,
      lastName,
      userName,
      gender,
      address,
      phone,
      email,
      password   // ← raw password
    } = req.body;

    console.log('Register body:', { email, password });

    // 2) Create the user with raw password
    //    The mongoose pre('save') hook in models/User.js will hash this once.
    const user = new User({
      firstName,
      lastName,
      userName,
      gender,
      address,
      phone,
      email,
      password    // raw, not pre-hashed here
    });

    await user.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    next(err);
  }
};


// ── LOGIN (handles 2FA) ─────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    // 1) Grab credentials
    const { email, password } = req.body;

    // 2) Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3) Compare plain password against the stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4a) If 2FA is NOT enabled, issue JWT immediately
    if (!user.twoFactorEnabled) {
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.json({ token });
    }

    // 4b) If 2FA IS enabled, generate & email a one‐time code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(code, 10);

    user.twoFactorCode        = hash;
    user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await mailer.sendMail({
      from:    `"Pawsibilities" <${process.env.GMAIL_USER}>`,
      to:       user.email,
      subject:  'Your Pawsibilities Login Code',
      text:     `Your verification code is: ${code}`
    });

    // 5) Tell the client to prompt for the OTP
    res.json({
      requires2FA: true,
      message:     'Enter the code we just emailed you.'
    });

  } catch (err) {
    next(err);
  }
};

// ── SEND 2FA SETUP CODE ────────────────────────────────────────────────
exports.send2FACode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(code, 10);
    user.twoFactorCode = hash;
    user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await mailer.sendMail({
      from:    `"Pawsibilities" <${process.env.GMAIL_USER}>`,
      to:       user.email,
      subject:  'Your 2FA Setup Code',
      text:     `Your setup verification code is: ${code}`
    });

    res.json({ message: '2FA setup code sent' });
  } catch (err) {
    next(err);
  }
};

// ── VERIFY 2FA SETUP ──────────────────────────────────────────────────
exports.verify2FASetup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.twoFactorCodeExpires || Date.now() > user.twoFactorCodeExpires) {
      return res.status(400).json({ message: 'Code expired. Request a new one.' });
    }
    const valid = await bcrypt.compare(code, user.twoFactorCode);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save();

    res.json({ message: '2FA enabled 🎉' });
  } catch (err) {
    next(err);
  }
};

// ── VERIFY LOGIN 2FA ─────────────────────────────────────────────────
exports.verifyLogin2FA = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled' });
    }
    if (!user.twoFactorCodeExpires || Date.now() > user.twoFactorCodeExpires) {
      return res.status(400).json({ message: 'Code expired' });
    }
    const valid = await bcrypt.compare(code, user.twoFactorCode);
    if (!valid) return res.status(400).json({ message: 'Invalid code' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save();

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

// ── FORGOT & RESET PASSWORD (unchanged) ───────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({ to: email, subject: 'Password Reset', text: `Reset via: ${resetURL}` });
  }
  res.json({ message: 'If that email is registered, you’ll receive reset instructions.' });
};

exports.resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ email, resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password has been reset.' });
};
