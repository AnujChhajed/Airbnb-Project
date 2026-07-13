const Review = require('../models/Review');
const Listing = require('../models/Listing');

// @desc    Add review and rating to a listing (User only)
// @route   POST /api/reviews
// @access  Private/User
exports.createReview = async (req, res, next) => {
  const { listingId, rating, comment } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({ listing: listingId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this stay listing' });
    }

    const review = await Review.create({
      listing: listingId,
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    // Recalculate Average Rating for Listing
    const reviews = await Review.find({ listing: listingId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));

    listing.rating = avgRating;
    await listing.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a specific listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
exports.getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};
