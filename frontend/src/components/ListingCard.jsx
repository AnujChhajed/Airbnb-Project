import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ListingCard = ({ listing, isFavouritedInitial = false, onToggleFavSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const [isFav, setIsFav] = useState(isFavouritedInitial);
  const [toggleLoading, setToggleLoading] = useState(false);

  const coverPhoto = listing.photos && listing.photos.length > 0
    ? `http://localhost:3000${listing.photos[0]}`
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

  const handleToggleFav = async (e) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to add stays to your favourites!');
      return;
    }
    if (user?.role !== 'user') {
      alert('Only guest user accounts can add stays to favourites!');
      return;
    }

    setToggleLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/favourites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ listingId: listing._id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFav(data.isFavourite);
        if (onToggleFavSuccess) {
          onToggleFavSuccess(listing._id, data.isFavourite);
        }
      }
    } catch (err) {
      console.error('Error toggling favourite:', err);
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/50 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={coverPhoto}
          alt={listing.houseName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* Favorite Heart Button */}
        {(!user || user.role === 'user') && (
          <button
            onClick={handleToggleFav}
            disabled={toggleLoading}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition hover:scale-110 active:scale-95 cursor-pointer"
          >
            <i
              className={`fa-${isFav ? 'solid text-rose-500' : 'regular text-neutral-600'} fa-heart text-base`}
            ></i>
          </button>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="font-bold text-neutral-800 text-base line-clamp-1 group-hover:text-rose-500 transition-colors">
              {listing.houseName}
            </h3>
            <div className="flex items-center text-sm font-semibold text-neutral-700 shrink-0">
              <i className="fa-solid fa-star text-amber-400 mr-1 text-xs"></i>
              <span>{listing.rating > 0 ? listing.rating : 'New'}</span>
            </div>
          </div>
          <p className="text-neutral-500 text-sm flex items-center gap-1 mb-3">
            <i className="fa-solid fa-location-dot text-neutral-400 text-xs"></i>
            <span className="line-clamp-1">{listing.location}</span>
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-3.5 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 font-semibold tracking-wide uppercase">Price</span>
            <span className="text-sm font-extrabold text-neutral-800">
              Rs {listing.price} <span className="text-neutral-500 font-normal text-xs">/ night</span>
            </span>
          </div>
          
          <Link
            to={`/listings/${listing._id}`}
            className="text-xs font-bold px-4.5 py-2 rounded-full bg-neutral-100 text-neutral-700 hover:bg-rose-500 hover:text-white transition duration-200 cursor-pointer"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
