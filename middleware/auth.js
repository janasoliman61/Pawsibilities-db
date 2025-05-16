// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pull in JSON bodies & headers (ensure express.json() is mounted before your routes!)
  // (In server.js you must have: app.use(express.json()); app.use('/posts', postRoutes); …)

  // 2. Grab the Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Split “Bearer <token>”
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token malformed or missing' });
  }

  // 4. Verify & normalize whatever key you used when signing
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // your login route signed with { id } or 2FA route signs with { userId }
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: 'Token payload missing userId' });
    }
    req.user = { _id: userId };
    return next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Token invalid' });
  }
};
