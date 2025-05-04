// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pet = require('../models/Pet');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const nodemailer = require('nodemailer');
const { text } = require('stream/consumers');

exports.register = async (req, res, next) => {
  try {
    const {
      firstName, lastName, userName,
      gender, address, phone, email, password
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, lastName, userName,
      gender, address, phone, email,
      password: hashed
    });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next ) =>{
  try{
    // law ma3andoosh 2 factor haneb3atlo token 3ady
    const {email,password} = req.body;
    const user  = await User.findOne({email});

    if(!user){
      res.status(404).json({message:"email not found "});
    }
    const match = bcrypt.compare(password, user.password);
    if(!match){
      res.status(404).json({message:"invalid password "});
    }
    if(!user.twoFactorEnabled){
      const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET,{expiresIn:"1h"}) ;
      return res.json({token});
    }

    const code = Math.floor(100000+Math.random()*90000);
    const hash = await bcrypt.hash(code, 10);
    user.twoFactorCodeExpires = Date().now + 10*60*1000 // 10--> minuts ,60-> seconds , 1000 -> milli seconds ya3ny el rakam lazem yetla3 bel milli secs
    await user.save();

    await transporter.sendEmail({
      from: `"Pawsibilities "<${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Your Verification Code",
      text: 'Your verification code is ${code}'
    });

    res.json({twoFactorEnabled: true, message:"enter the code emailed to you "});

  }catch(err){
    next(err);
  }
};

exports.verify2fasetup = async (req, res, next) =>{
try{
  const { code } = req.body;
  const email = await User.findById(req.user.userId);
  if(!user.twoFactorCodeExpires || Date.now() > user.twoFactorCodeExpires){
    res.status(401).json({message: " code expired"});
  }
  const valid = bcrypt.compare(code,user.twoFactorCode);
  if(!valid){
    res.status(401).json({message:"invalid code"});
  }
  user.twoFactorEnabled = true;
  user.twoFactorCode = null;
  user.twoFactorCodeExpires = null;
  await user.save();
  res.json({message:" 2fa enabled"});
}catch(err){
  next(err);
}
};

exports.send2facode = async (req,res, next) =>{
  try{
    const user = User.findById(req.user.userId);
    const code = Math.floor(100000+Math.random()*900000).toString();
    const hash = bcrypt.hash(code,10);
    user.twoFactorCode = hash;
    const twoFactorCodeExpires = Date.now() + 10*60*1000;
    await user.save();

    await transporter.sendEmail({
      from: `"Pawsibilities"<$process.env.GMAIL_USER$>`,
      to:user.email,
      text: `"Your two factor authentication code is ${code}`,
      subject:"your 2fa code"
    })
    res.json({message: "your code is sent "});
  }catch(err){
  next(err);
}
};

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

    // Issue final JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.twoFactorCode        = null;
    user.twoFactorCodeExpires = null;
    await user.save();

    res.json({ token });
  } catch (err) {
    next(err);
  }
};



exports.forgotPassword = async (req, res, next) => {
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

const transpoeter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});


