const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { listingRules, validate } = require('../middleware/validationMiddleware');

router.get('/', listingController.getAllListings);
router.get('/host', protect, restrictTo('host'), listingController.getHostListings);
router.get('/:id', listingController.getListingDetails);

router.post(
  '/',
  protect,
  restrictTo('host'),
  upload.array('photos', 5),
  listingRules,
  validate,
  listingController.createListing
);

router.put(
  '/:id',
  protect,
  restrictTo('host'),
  upload.array('photos', 5),
  listingRules,
  validate,
  listingController.updateListing
);

router.delete('/:id', protect, restrictTo('host'), listingController.deleteListing);

module.exports = router;
