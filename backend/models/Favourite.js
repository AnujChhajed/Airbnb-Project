const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Favourite must belong to a user'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Favourite must belong to a listing'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favourites for same user/listing
favouriteSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
