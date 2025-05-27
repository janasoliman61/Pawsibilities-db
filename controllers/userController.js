// controllers/userController.js
require('dotenv').config();
const User       = require('../models/User');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const Pet        = require('../models/Pet');
const crypto     = require('crypto');
const sendEmail  = require('../utils/sendEmail');
const mailer   = require('../config/mailer');  

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

// ── FORGOT PASSWORD (OTP) ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with that email.' });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = otp;
    user.twoFactorCodeExpires = Date.now() + 10*60*1000;
    await user.save();

    // ← send via your Gmail-based mailer
    await mailer.sendMail({
      from:    `"Pawsibilities" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'Your password reset code',
      html:    `<p>Your password reset code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
    });

    res.json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    next(err);
  }
};


// ── RESET PASSWORD (verify OTP + set new) ────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      twoFactorCode: otp,
      twoFactorCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // set & hash new password (your pre-save hook will hash it)
    user.password = newPassword;

    // clear the OTP fields
    user.twoFactorCode        = null;
    user.twoFactorCodeExpires = null;

    await user.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
};
// ── VERIFY 2FA LOGIN CODE ─────────────────────────────────────────────
exports.verifyLogin2FA = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    // 1) user must exist and code not expired
    if (
      !user ||
      !user.twoFactorCodeExpires ||
      Date.now() > user.twoFactorCodeExpires
    ) {
      return res.status(400).json({ message: 'Code expired or invalid.' });
    }

    // 2) compare code against the hashed one you stored
    const valid = await bcrypt.compare(code, user.twoFactorCode);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid code.' });
    }

    // 3) clear the code fields
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save();

    // 4) issue a JWT just like in login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
};


exports.addDeviceToken = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Token is required' })

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { deviceTokens: { token } } },
      { new: true }
    )
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}
