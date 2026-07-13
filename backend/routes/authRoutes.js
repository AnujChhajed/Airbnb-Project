const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { signupRules, loginRules, validate } = require('../middleware/validationMiddleware');

router.post('/signup', signupRules, validate, authController.signup);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
