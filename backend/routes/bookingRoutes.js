const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', protect, restrictTo('user'), bookingController.createBooking);
router.get('/my-trips', protect, restrictTo('user'), bookingController.getUserBookings);
router.get('/reservations', protect, restrictTo('host'), bookingController.getHostReservations);
router.patch('/:id/status', protect, restrictTo('host'), bookingController.updateBookingStatus);

module.exports = router;
