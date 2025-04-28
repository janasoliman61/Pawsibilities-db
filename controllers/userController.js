// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pet = require('../models/Pet');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const secretKey = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_characters'; // 32 characters for AES-256
const iv = crypto.randomBytes(16); // Initialization vector

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted
  };
}

function decrypt(encryptedContent, ivString) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf8'), Buffer.from(ivString, 'hex'));
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, gender, address, phone, email, password, username } = req.body;

    // Encrypt the password
    const encryptedPassword = encrypt(password);
    // Create and save the new user
    const user = new User({
      firstName,
      lastName,
      userName,
      username,
      gender,
      address,
      phone,
      email,
      password: encryptedPassword.content,
      iv: encryptedPassword.iv // Save IV separately
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Create and return a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
exports.forgotPassword = async (req, res, next) => {
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    // always 200:
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1h
      await user.save();

      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await sendEmail({
        to: email,
        subject: 'Password Reset',
        text: `Reset your password via:\n\n${resetURL}`
      });
    }
    res.json({ message: 'If that email is registered, you’ll receive reset instructions.' });
  }
  catch(ex){
    next(ex);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    email,
    resetPasswordToken:   hashed,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password has been reset.' });
};



// CHANGE EMAIL
exports.changeEmail = async (req, res, next) => {
  try {
    const { userName, newEmail, currentPassword } = req.body;

    // Find user by userName instead of userId
    const user = await User.findOne({ userName });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const decryptedPassword = decrypt(user.password, user.iv);

    // Check if the current password matches
    if (decryptedPassword!=currentPassword) return res.status(400).json({ message: 'Incorrect password' });

    // Update email
    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    next(err);
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res, next) => {
  try {
    // const { userId, currentPassword, newPassword } = req.body;

    // const user = await User.findById(userId);
    // if (!user) return res.status(404).json({ message: 'User not found' });

    // const isMatch = await bcrypt.compare(currentPassword, user.password);
    // if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    // user.password = await bcrypt.hash(newPassword, 12);
    // await user.save();
    // res.json({ message: 'Password changed successfully' });
    const { userName, currentPassword, newPassword } = req.body;

    // Find user by userName instead of userId
    const user = await User.findOne({ userName });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const decryptedPassword = decrypt(user.password, user.iv);

    // Check if the current password matches
    if (decryptedPassword!=currentPassword) return res.status(400).json({ message: 'Incorrect password' });

    // Update email
    user.password = encrypt(newPassword).content;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};


