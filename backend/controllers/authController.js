const User = require('../models/User');

// @desc    Register a new user / host
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  const { name, email, password, role, contactNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      contactNumber: contactNumber || '',
    });

    // Automatically establish session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user / host
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set session data
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / host
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to destroy session' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private (auth middleware checks req.session.userId)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request 6-digit reset code
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
    await user.save();

    console.log(`[PASSWORD RESET CODE FOR ${email}]: ${resetCode}`);

    res.status(200).json({
      message: 'Password reset code generated and printed to server logs.',
      // Return code in JSON in development for simple verification
      resetCode: resetCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password - Verify code and set new password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset verification code' });
    }

    // Set new password (triggers pre-save hashing)
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

