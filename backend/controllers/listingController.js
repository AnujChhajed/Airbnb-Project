const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Favourite = require('../models/Favourite');
const path = require('path');
const fs = require('fs');

// Helper to delete an image file from local storage
const deleteImage = (photoPath) => {
  try {
    const fullPath = path.join(__dirname, '..', photoPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`Failed to delete listing photo: ${photoPath}`, err);
  }
};

// @desc    Create a listing (Host only)
// @route   POST /api/listings
// @access  Private/Host
exports.createListing = async (req, res, next) => {
  const { houseName, price, location, description, amenities } = req.body;

  try {
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    let parsedAmenities = [];
    if (amenities) {
      parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    }

    const listing = await Listing.create({
      houseName,
      price: Number(price),
      location,
      description,
      photos,
      owner: req.user._id,
      amenities: parsedAmenities,
    });

    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    // If database save fails, clean up uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => deleteImage(`/uploads/${file.filename}`));
    }
    next(error);
  }
};

// @desc    Get all listings (Explore / Search with filters, pagination)
// @route   GET /api/listings
// @access  Public
exports.getAllListings = async (req, res, next) => {
  const { search, minPrice, maxPrice, page = 1, limit = 8 } = req.query;

  try {
    const filter = {};

    // Filter by text search (location or name)
    if (search) {
      filter.$or = [
        { location: { $regex: search, $options: 'i' } },
        { houseName: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const totalListings = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('owner', 'name email contactNumber')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      listings,
      pagination: {
        totalListings,
        totalPages: Math.ceil(totalListings / pageLimit),
        currentPage,
        pageLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings created by the logged-in Host
// @route   GET /api/listings/host
// @access  Private/Host
exports.getHostListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single listing detail (Populates Host and Reviews)
// @route   GET /api/listings/:id
// @access  Public
exports.getListingDetails = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email contactNumber');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(200).json({ listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing (Owner only)
// @route   PUT /api/listings/:id
// @access  Private/Host
exports.updateListing = async (req, res, next) => {
  const { houseName, price, location, description, amenities, deletePhotos } = req.body;

  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ensure logged-in user owns the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    // Update basic fields
    if (houseName) listing.houseName = houseName;
    if (price) listing.price = Number(price);
    if (location) listing.location = location;
    if (description) listing.description = description;

    if (amenities) {
      listing.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    }

    // Handle photo deletion if requested
    if (deletePhotos) {
      const photosToDelete = typeof deletePhotos === 'string' ? JSON.parse(deletePhotos) : deletePhotos;
      if (Array.isArray(photosToDelete)) {
        photosToDelete.forEach(photo => {
          listing.photos = listing.photos.filter(p => p !== photo);
          deleteImage(photo);
        });
      }
    }

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      listing.photos = [...listing.photos, ...newPhotos];
    }

    const updatedListing = await listing.save();
    res.status(200).json({ message: 'Listing updated successfully', listing: updatedListing });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => deleteImage(`/uploads/${file.filename}`));
    }
    next(error);
  }
};

// @desc    Delete a listing (Owner only)
// @route   DELETE /api/listings/:id
// @access  Private/Host
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ensure logged-in user owns the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    // Delete listing files from local disk
    if (listing.photos && listing.photos.length > 0) {
      listing.photos.forEach(photo => deleteImage(photo));
    }

    // Delete listing document
    await Listing.deleteOne({ _id: listing._id });

    // Cascade delete associated documents
    await Booking.deleteMany({ listing: listing._id });
    await Review.deleteMany({ listing: listing._id });
    await Favourite.deleteMany({ listing: listing._id });

    res.status(200).json({ message: 'Listing and all related reservations, favourites, and reviews deleted.' });
  } catch (error) {
    next(error);
  }
};
