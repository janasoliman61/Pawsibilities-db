// // middleware/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

const jwt = require("jsonwebtoken");

module.exports = (req, res , next) => {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  const token = header.split(' ')[1];
  if(!token){
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch{
    res.status(401).json({ message: 'Token invalid' });
  }
}