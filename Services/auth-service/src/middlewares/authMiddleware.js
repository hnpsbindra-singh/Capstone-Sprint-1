const jwt = require('jsonwebtoken');
const config = require('../config/env');

/*
 * Middleware to verify JWT token and attach user to req.user
 * Mirrors Spring Boot JwtUtils claim parsing
 */
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    req.user = {
      username: decoded.sub,
      role: decoded.role,
      userId: decoded.userId,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based authorization middleware
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role))) {
      return res.status(403).json({ error: 'Forbidden: insufficient role privileges' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRoles };
