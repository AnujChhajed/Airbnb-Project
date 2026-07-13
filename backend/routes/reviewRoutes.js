const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { reviewRules, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, restrictTo('user'), reviewRules, validate, reviewController.createReview);
router.get('/listing/:listingId', reviewController.getListingReviews);

module.exports = router;
