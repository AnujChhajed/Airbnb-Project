const User = require('../models/User');

// Protect routes - ensure user is logged in via session
const protect = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'The user belonging to this session no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Guard roles (e.g. host or user)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to perform this action.' });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
