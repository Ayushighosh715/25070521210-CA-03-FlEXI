/**
 * Authentication Middleware
 * Validates JWT tokens in the Authorization header to protect sensitive routes.
 */
const jwt = require('jsonwebtoken');

// Strictly protected route middleware
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'devstore_jwt_secret_key_secure_2026_exam_ready'
    );

    req.user = decoded; // Contains id and email
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

// Optional auth middleware (attaches user if token present, does not fail if guest)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'devstore_jwt_secret_key_secure_2026_exam_ready'
      );
      req.user = decoded;
    }
  } catch (err) {
    // Guest or invalid token, proceed without req.user
    req.user = null;
  }
  next();
};

module.exports = { auth, optionalAuth };

