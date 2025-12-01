// middleware/auth.js - Authentication middleware

const jwt = require('jsonwebtoken');

// ============================================
// VERIFY TOKEN MIDDLEWARE
// ============================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Include Authorization header: Bearer <token>' 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// VERIFY ADMIN MIDDLEWARE
// ============================================
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.',
      userRole: req.user.role
    });
  }

  next();
};

// ============================================
// VERIFY USER OWN DATA
// ============================================
const verifyOwnData = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const resourceId = req.params[paramName];

    // Admin can access anything
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Regular user can only access their own data
    if (req.user.userId !== resourceId) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own data.' 
      });
    }

    next();
  };
};

// ============================================
// RATE LIMITING MIDDLEWARE (Optional)
// ============================================
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const timestamps = requests.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    requests.set(ip, timestamps);

    if (timestamps.length > maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    next();
  };
};

// ============================================
// LOGGING MIDDLEWARE
// ============================================
const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId || 'anonymous';
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms - User: ${userId}`
    );
  });

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyOwnData,
  rateLimit,
  logRequest
};
