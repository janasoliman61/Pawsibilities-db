// controllers/userController.js
const User = require("../models/User");
// const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Pet = require("../models/Pet");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//later add on process.env.ENCRYPTION_SECRET in .env file
const secretKey = "default_secret_key_32_characters"; // 32 characters for AES-256
const iv = crypto.randomBytes(16); // Initialization vector

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "utf8"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}

function decrypt(encryptedContent, ivString) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "utf8"),
    Buffer.from(ivString, "hex")
  );
  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

exports.finduser = async (req, res, next) => {
  try {
    const { userName } = req.body;
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      gender,
      address,
      phone,
      email,
      password,
      dob,
    } = req.body;

    // Check if userName already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(410).json({ message: "Email already exists" });
    }

    // Encrypt the password
    const encryptedPassword = encrypt(password);

    // Create and save the new user
    const user = new User({
      firstName,
      lastName,
      userName,
      gender,
      address,
      phone,
      dob,
      email,
      password: encryptedPassword.content,
      preferences: {},
      pets: [],
      iv: encryptedPassword.iv,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const decryptedPassword = decrypt(user.password, user.iv);

    // Check if the current password matches
    if (decryptedPassword != pass)
      return res.status(400).json({ message: "Incorrect password" });

    // Create and return a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// FORGOT PASSWORD
// exports.forgotPassword = async (req, res, next) => {
//   try{
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     // always 200:
//     if (user) {
//       const token = crypto.randomBytes(32).toString('hex');
//       user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
//       user.resetPasswordExpires = Date.now() + 3600000; // 1h
//       await user.save();

//       const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
//       await sendEmail({
//         to: email,
//         subject: 'Password Reset',
//         text: `Reset your password via:\n\n${resetURL}`
//       });
//     }
//     res.json({ message: 'If that email is registered, you’ll receive reset instructions.' });
//   }
//   catch(ex){
//     next(ex);
//   }
// };

// CHANGE EMAIL
exports.changeEmail = async (req, res, next) => {
  try {
    const { userName, newEmail, currentPassword } = req.body;

    // Find user by userName instead of userId
    const user = await User.findOne({ userName });

    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedPassword = decrypt(user.password, user.iv);

    // Check if the current password matches
    if (decryptedPassword != currentPassword)
      return res.status(400).json({ message: "Incorrect password" });

    // Update email
    user.email = newEmail;
    await user.save();

    res.json({ message: "Email updated successfully" });
  } catch (err) {
    next(err);
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res, next) => {
  try {
    const { userName, currentPassword, newPassword } = req.body;

    // Find user by userName instead of userId
    const user = await User.findOne({ userName });

    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedPassword = decrypt(user.password, user.iv);

    // Check if the current password matches
    if (decryptedPassword != currentPassword)
      return res.status(400).json({ message: "Incorrect password" });

    // Update password
    const arrCred = encrypt(newPassword);
    user.password = arrCred.content;
    user.iv = arrCred.iv;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// CHANGE PREFERENCES
exports.updatePreferences = async (req, res, next) => {
  try {
    const { userName, key, value } = req.body;

    // Find user by userName
    const user = await User.findOne({ userName });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update preferences
    user.preferences[key] = value;
    await user.save();

    res.json({ message: "Preferences updated successfully" });
  } catch (err) {
    next(err);
  }
};

// DRAFT // -----------------------------------------------------------------------

// exports.resetPassword = async (req, res, next) => {
//   const { email, token, newPassword } = req.body;
//   const hashed = crypto.createHash('sha256').update(token).digest('hex');
//   const user = await User.findOne({
//     email,
//     resetPasswordToken:   hashed,
//     resetPasswordExpires: { $gt: Date.now() }
//   });
//   if (!user) {
//     return res.status(400).json({ message: 'Invalid or expired token.' });
//   }
//   user.password = newPassword;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;
//   await user.save();
//   res.json({ message: 'Password has been reset.' });
// };
