const { validationResult, body } = require('express-validator');

// Generic validation checker
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// Signup Validation Rules
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'host'])
    .withMessage('Role must be either user or host'),
  body('contactNumber')
    .optional()
    .trim()
];

// Login Validation Rules
const loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Listing Validation Rules (excluding image check which is handled by multer)
const listingRules = [
  body('houseName').trim().notEmpty().withMessage('House name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amenities')
    .optional()
    .custom((value) => {
      // If it comes as a JSON string, try to parse it, otherwise check array
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (e) {
          throw new Error('Amenities must be a valid array');
        }
      }
      return true;
    }),
];

// Review Validation Rules
const reviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  listingRules,
  reviewRules,
};
