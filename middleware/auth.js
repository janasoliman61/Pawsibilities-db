const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) throw new Error('No auth header');

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    req.user = user; // ✅ full user object, including _id
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
