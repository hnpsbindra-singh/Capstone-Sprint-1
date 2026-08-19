// Shared JWT Authentication Middleware
// MUST use same secret as Spring Boot JwtUtils.java
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined!');
}

/**
 * Middleware to verify JWT token and attach user to req.user
 * Role is extracted from the token's "role" claim (same format as Spring Boot)
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    // Spring Boot stores: subject = username, claim "role" = role name
    req.user = {
      username: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based access middleware factory
 * @param {...string} allowedRoles - e.g. 'NGO', 'ADMIN', 'DONOR', 'VICTIM'
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET };
