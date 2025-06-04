// controllers/userController.jsMore actions
const User = require("../models/User");

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