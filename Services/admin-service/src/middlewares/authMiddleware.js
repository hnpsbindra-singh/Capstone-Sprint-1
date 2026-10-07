const jwt = require('jsonwebtoken');
const config = require('../config/env');

function auth(roles = []) {
  return (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
      req.user = {
        username: decoded.sub,
        role: decoded.role,
        userId: decoded.userId,
      };

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = { auth };
