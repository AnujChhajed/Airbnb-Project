import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Listing Data states
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Photo Carousel
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Booking Form states
  // Set default dates: checkin = tomorrow, checkout = day after tomorrow
  const getTomorrowString = (offset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrowString(1));
  const [checkOut, setCheckOut] = useState(getTomorrowString(3));
  const [guests, setGuests] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  
  // Confirm Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Add Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchDetails = async () => {
    try {
      const listingRes = await fetch(`http://localhost:3000/api/listings/${id}`);
      if (!listingRes.ok) {
        throw new Error('Listing not found');
      }
      const listingData = await listingRes.json();
      setListing(listingData.listing);

      const reviewsRes = await fetch(`http://localhost:3000/api/reviews/listing/${id}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Calculate nights and price
  const calculatePricing = () => {
    if (!listing) return { nights: 0, lodgingTotal: 0, cleaningFee: 0, serviceFee: 0, grantTotal: 0 };
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
      return { nights: 0, lodgingTotal: 0, cleaningFee: 0, serviceFee: 0, grantTotal: 0 };
    }

    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const lodgingTotal = listing.price * nights;
    const cleaningFee = 450;
    const serviceFee = 1200;
    const grantTotal = lodgingTotal + cleaningFee + serviceFee;

    return { nights, lodgingTotal, cleaningFee, serviceFee, grantTotal };
  };

  const { nights, lodgingTotal, cleaningFee, serviceFee, grantTotal } = calculatePricing();

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please log in to book a stay!');
      navigate('/login');
      return;
    }
    if (user?.role !== 'user') {
      alert('Only guest accounts can make reservations!');
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing._id,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowConfirmModal(false);
        alert('Reservation request submitted successfully! Redirecting to your bookings.');
        navigate('/dashboard?tab=bookings');
      } else {
        setBookingMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setBookingMessage({ type: 'error', text: 'Server connection error. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviewLoading(true);
    setReviewError(null);

    try {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing._id,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewComment('');
        setNewRating(5);
        // Refresh detail info to reflect updated review list and avg rating
        fetchDetails();
      } else {
        setReviewError(data.message);
      }
    } catch (err) {
      setReviewError('Failed to save review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-rose-500 mb-4"></i>
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-neutral-500 mt-2">{error || 'This property listing was not found.'}</p>
        <Link to="/listings" className="mt-6 inline-block bg-neutral-100 px-6 py-2.5 rounded-full text-sm font-bold">
          Back to Stay List
        </Link>
      </div>
    );
  }

  // Active cover photo logic
  const activePhoto = listing.photos && listing.photos.length > 0
    ? `http://localhost:3000${listing.photos[activePhotoIdx]}`
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-6xl mt-8">
      {/* Back Link */}
      <Link to="/listings" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold text-sm mb-6 transition">
        <i className="fa-solid fa-arrow-left"></i> Back to stays
      </Link>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Images, details, reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200/50 p-4 md:p-6">
            
            {/* Title & Stats */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-800">{listing.houseName}</h1>
                <p className="text-neutral-500 text-sm mt-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-rose-500"></i>
                  {listing.location}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/60 py-1.5 px-3 rounded-full text-sm font-bold text-neutral-800 shrink-0 shadow-sm">
                <i className="fa-solid fa-star text-amber-400"></i>
                <span>{listing.rating > 0 ? `${listing.rating} / 5` : 'New Stay'}</span>
              </div>
            </div>

            {/* Premium Multi-Photo Gallery */}
            <div className="space-y-3 mb-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full bg-neutral-100 shadow-sm border border-neutral-200/40">
                <img
                  src={activePhoto}
                  alt={listing.houseName}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Thumbnails Row */}
              {listing.photos && listing.photos.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
                  {listing.photos.map((photo, index) => (
                    <button
                      key={photo}
                      onClick={() => setActivePhotoIdx(index)}
                      className={`relative rounded-lg overflow-hidden w-20 aspect-[4/3] bg-neutral-100 shrink-0 border-2 cursor-pointer transition ${
                        activePhotoIdx === index ? 'border-rose-500 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={`http://localhost:3000${photo}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-neutral-100 pt-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-3">About this space</h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="border-t border-neutral-100 pt-6 mt-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-700 text-sm">
                  {listing.amenities.map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <i className="fa-solid fa-circle-check text-rose-500 text-sm w-5"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Details */}
            {listing.owner && (
              <div className="border-t border-neutral-100 pt-6 mt-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Meet your Host</h2>
                <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200/50 p-4 rounded-2xl max-w-md">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 text-lg shadow-sm">
                    {listing.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-800">{listing.owner.name}</h4>
                    <p className="text-neutral-500 text-xs">Host since 2026</p>
                    <div className="flex flex-col gap-0.5 mt-2 text-xs text-neutral-600 font-medium">
                      <span><i className="fa-solid fa-envelope mr-1.5 opacity-70"></i>{listing.owner.email}</span>
                      {listing.owner.contactNumber && (
                        <span><i className="fa-solid fa-phone mr-1.5 opacity-70"></i>{listing.owner.contactNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/50 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <i className="fa-solid fa-star text-amber-400"></i>
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </h2>

            {/* Submit Review (Only authenticated user, not host) */}
            {isAuthenticated && user?.role === 'user' && !reviews.some(r => r.user?._id === user.id) && (
              <form onSubmit={handleReviewSubmit} className="border-b border-neutral-100 pb-6 mb-2">
                <h4 className="text-sm font-bold text-neutral-700 mb-3">Write a Review</h4>
                <div className="space-y-4">
                  {/* Stars input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-lg hover:scale-110 transition cursor-pointer"
                        >
                          <i className={`fa-${star <= newRating ? 'solid text-amber-400' : 'regular text-neutral-300'} fa-star`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Comments input */}
                  <textarea
                    placeholder="Describe your stay, details about amenities, check-in, or location..."
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                  ></textarea>

                  {reviewError && (
                    <p className="text-rose-500 text-xs font-semibold"><i className="fa-solid fa-circle-exclamation mr-1.5"></i>{reviewError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md shadow-rose-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {reviewLoading ? 'Posting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-6">No reviews for this property yet. Be the first to share your experience!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map(rev => (
                  <div key={rev._id} className="border border-neutral-100 p-4 rounded-2xl bg-neutral-50/50">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h5 className="font-bold text-neutral-800 text-sm">{rev.user?.name || 'Anonymous User'}</h5>
                        <p className="text-[10px] text-neutral-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center text-xs font-bold text-neutral-700 bg-white border border-neutral-200 py-1 px-2 rounded-full">
                        <i className="fa-solid fa-star text-amber-400 mr-1"></i>
                        {rev.rating}
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Booking Card (Sticky) */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/50 shadow-md sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-2xl font-black text-neutral-800">Rs {listing.price}</span>
                <span className="text-neutral-500 text-sm font-semibold">/ night</span>
              </div>
              <div className="flex items-center text-sm font-bold text-neutral-700">
                <i className="fa-solid fa-star text-amber-400 mr-1"></i>
                <span>{listing.rating > 0 ? listing.rating : 'New'}</span>
              </div>
            </div>

            {/* Check-in Form */}
            <div className="border border-neutral-300 rounded-xl overflow-hidden mb-6 text-sm divide-y divide-neutral-200">
              <div className="grid grid-cols-2 divide-x divide-neutral-200">
                <div className="p-3">
                  <label className="block text-[10px] font-black uppercase text-neutral-500">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full mt-1 bg-transparent border-0 p-0 text-neutral-800 focus:ring-0 font-medium focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-black uppercase text-neutral-500">Checkout</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full mt-1 bg-transparent border-0 p-0 text-neutral-800 focus:ring-0 font-medium focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-[10px] font-black uppercase text-neutral-500">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full mt-1 bg-transparent border-0 p-0 text-neutral-800 focus:ring-0 font-medium focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 guest</option>
                  <option value={2}>2 guests</option>
                  <option value={3}>3 guests</option>
                  <option value={4}>4 guests</option>
                  <option value={5}>5 guests</option>
                </select>
              </div>
            </div>

            {/* Error notifications */}
            {bookingMessage && (
              <div className="p-3 mb-4 rounded-xl text-xs font-bold bg-rose-50 border border-rose-100 text-rose-500 flex gap-2 items-center">
                <i className="fa-solid fa-circle-exclamation text-sm shrink-0"></i>
                <span>{bookingMessage.text}</span>
              </div>
            )}

            {/* Reservation Button */}
            {user?.role === 'host' ? (
              <button
                disabled
                className="w-full py-3 bg-neutral-200 text-neutral-500 font-extrabold rounded-xl cursor-not-allowed mb-4 text-sm"
              >
                Hosts cannot reserve stays
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert('Please log in to book a stay!');
                    navigate('/login');
                    return;
                  }
                  setShowConfirmModal(true);
                }}
                disabled={bookingLoading || nights <= 0}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:brightness-105 active:scale-[0.98] transition cursor-pointer mb-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reserve Stay
              </button>
            )}
            <p className="text-center text-xs text-neutral-400 mb-6">You won't be charged yet</p>

            {/* Price Calculations */}
            {nights > 0 && (
              <>
                <div className="space-y-3.5 text-sm text-neutral-600 border-b border-neutral-100 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="underline">Rs {listing.price} x {nights} nights</span>
                    <span>Rs {lodgingTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>Rs {cleaningFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>Rs {serviceFee}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center font-bold text-neutral-800 text-base mb-6">
                  <span>Total before taxes</span>
                  <span>Rs {grantTotal}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Reservation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-neutral-100 animate-fade-in space-y-6 text-left">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-800">Confirm Reservation</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Stay details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={listing.photos && listing.photos.length > 0 ? `http://localhost:3000${listing.photos[0]}` : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'}
                  className="w-20 h-16 object-cover rounded-xl border border-neutral-200"
                />
                <div>
                  <h4 className="font-extrabold text-neutral-800 text-sm line-clamp-1">{listing.houseName}</h4>
                  <p className="text-xs text-neutral-500">{listing.location}</p>
                </div>
              </div>

              {/* Reservation summary details */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-100 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Check-in</span>
                  <span>{new Date(checkIn).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Check-out</span>
                  <span>{new Date(checkOut).toLocaleDateString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Guests</span>
                  <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>

              {/* Pricing summary */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs font-semibold text-neutral-600 space-y-2">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Price Summary</span>
                <div className="flex justify-between">
                  <span>Rs {listing.price} x {nights} nights</span>
                  <span>Rs {lodgingTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning & Service Fees</span>
                  <span>Rs {cleaningFee + serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-800 pt-2 border-t border-neutral-200">
                  <span>Total Est. Price</span>
                  <span>Rs {grantTotal}</span>
                </div>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
              <i className="fa-solid fa-circle-info mt-0.5 text-amber-500 shrink-0"></i>
              <p className="leading-relaxed">
                This is a reservation request. You will <strong>not be charged yet</strong>. The host will review your request, and once approved, you can complete the payment online or choose pay offline.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBookingSubmit}
                disabled={bookingLoading}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-sm disabled:opacity-50"
              >
                {bookingLoading ? 'Submitting...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ListingDetail;
