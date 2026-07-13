const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @desc    Create a new booking (User only)
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res, next) => {
  const { listingId, checkIn, checkOut, guests } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check for double booking conflicts
    const conflict = await Booking.findOne({
      listing: listingId,
      status: 'confirmed',
      $or: [
        { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: 'These dates are already booked. Please choose another stay window.' });
    }

    // Calculate nights & price
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Additional fees (Mockup matching)
    const cleaningFee = 450;
    const serviceFee = 1200;
    const totalPrice = (listing.price * nights) + cleaningFee + serviceFee;

    const booking = await Booking.create({
      listing: listingId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests) || 1,
      totalPrice: totalPrice,
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of the logged-in User
// @route   GET /api/bookings/my-trips
// @access  Private/User
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing')
      .sort({ checkIn: 1 });
    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming reservations on properties owned by the logged-in Host
// @route   GET /api/bookings/reservations
// @access  Private/Host
exports.getHostReservations = async (req, res, next) => {
  try {
    // Find all listings owned by host
    const hostListings = await Listing.find({ owner: req.user._id }).select('_id');
    const listingIds = hostListings.map(l => l._id);

    const reservations = await Booking.find({ listing: { $in: listingIds } })
      .populate('listing')
      .populate('user', 'name email contactNumber')
      .sort({ checkIn: 1 });

    res.status(200).json({ reservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve / Decline) - Host only
// @route   PATCH /api/bookings/:id/status
// @access  Private/Host
exports.updateBookingStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!['confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be confirmed or cancelled.' });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the stay owner is the logged in user
    if (booking.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this property listing.' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: `Booking status updated to ${status} successfully`, booking });
  } catch (error) {
    next(error);
  }
};

