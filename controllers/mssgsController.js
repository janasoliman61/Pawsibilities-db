// controllers/userController.js
const User = require("../models/User");
// const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Pet = require("../models/Pet");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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
