// controllers/userController.js (finduser function cleaned)
const User = require("../models/User");

exports.finduser = async (req, res, next) => {
  try {
    const { userId } = req.body; // use Mongo _id instead of usrsname
    const user = await User.findById(userId).select('firstName lastName avatar email');
    if (!user) {
      return res.status(400).json({ message: "User Not Found!" });
    }

    // Optional: return minimal display info
    res.json({
      _id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
