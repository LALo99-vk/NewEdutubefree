const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    console.log('Auth successful for user ID:', decoded.user.id);
    next();
  } catch (err) {
    console.error('Auth failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
