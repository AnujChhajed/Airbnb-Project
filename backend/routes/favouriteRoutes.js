const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/toggle', protect, restrictTo('user'), favouriteController.toggleFavourite);
router.get('/', protect, restrictTo('user'), favouriteController.getFavourites);

module.exports = router;
