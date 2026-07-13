const Favourite = require('../models/Favourite');
const Listing = require('../models/Listing');

// @desc    Toggle favourite (Add / Remove)
// @route   POST /api/favourites/toggle
// @access  Private/User
exports.toggleFavourite = async (req, res, next) => {
  const { listingId } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const existingFav = await Favourite.findOne({ user: req.user._id, listing: listingId });

    if (existingFav) {
      await Favourite.deleteOne({ _id: existingFav._id });
      return res.status(200).json({ message: 'Removed from Favourites', isFavourite: false });
    } else {
      await Favourite.create({ user: req.user._id, listing: listingId });
      return res.status(201).json({ message: 'Added to Favourites', isFavourite: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all favourite listings for the logged-in User
// @route   GET /api/favourites
// @access  Private/User
exports.getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user._id })
      .populate({
        path: 'listing',
        populate: { path: 'owner', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Filter out any null listings (in case a listing was deleted)
    const validFavourites = favourites.filter(fav => fav.listing !== null).map(fav => fav.listing);

    res.status(200).json({ favourites: validFavourites });
  } catch (error) {
    next(error);
  }
};
