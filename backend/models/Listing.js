const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
      required: [true, 'House name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
    },
    photos: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Listing must belong to an owner'],
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization and text search
listingSchema.index({ owner: 1 });
listingSchema.index({ location: 'text', houseName: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
