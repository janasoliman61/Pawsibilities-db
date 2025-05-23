// middleware/auth.js
// ─── Simple JWT–based protection middleware ──────────────────────────────
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Expect header “Authorization: Bearer <token>”
    const authHeader = req.header('Authorization');
    if (!authHeader) throw new Error('No auth header');

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user for downstream handlers
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
