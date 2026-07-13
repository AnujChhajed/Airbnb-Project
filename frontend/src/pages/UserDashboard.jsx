import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  // Data states
  const [bookings, setBookings] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleOpenPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentMethod('online');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBooking) return;

    setPaymentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${selectedBooking._id}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ paymentMethod }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(paymentMethod === 'online' ? 'Online payment successful! Your booking is confirmed.' : 'Offline payment selected! Your booking is confirmed.');
        setBookings(prev =>
          prev.map(b => (b._id === selectedBooking._id ? { ...b, status: 'confirmed', paymentMethod, paymentStatus: paymentMethod === 'online' ? 'paid' : 'unpaid' } : b))
        );
        setShowPaymentModal(false);
      } else {
        alert(`Failed to complete payment: ${data.message}`);
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert('Network error while completing payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await fetch('http://localhost:3000/api/bookings/my-trips', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings);
        }
      } else if (activeTab === 'favourites') {
        const res = await fetch('http://localhost:3000/api/favourites', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setFavourites(data.favourites);
        }
      }
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const switchTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Remove favourite from UI list on toggle removal
  const handleToggleFavSuccess = (listingId, isFav) => {
    if (!isFav) {
      setFavourites(prev => prev.filter(listing => listing._id !== listingId));
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-7xl mt-8">
      {/* Profile Header */}
      <div className="bg-white border border-neutral-200/50 rounded-3xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 text-3xl shadow-sm shrink-0 uppercase">
          {user?.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-neutral-800">{user?.name}</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{user?.email}</p>
          <span className="inline-block mt-3 bg-rose-50 text-rose-600 font-bold text-xs px-3.5 py-1 rounded-full border border-rose-100 uppercase tracking-wide">
            {user?.role} Profile
          </span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200 mb-8">
        <button
          onClick={() => switchTab('bookings')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <i className="fa-solid fa-suitcase-rolling mr-2 text-xs"></i>
          My Bookings
        </button>
        <button
          onClick={() => switchTab('favourites')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
            activeTab === 'favourites'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <i className="fa-solid fa-heart mr-2 text-xs"></i>
          My Favourites
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : activeTab === 'bookings' ? (
        // Bookings View
        bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-3xl shadow-sm max-w-lg mx-auto px-6">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-suitcase-rolling text-2xl text-rose-500"></i>
            </div>
            <h3 className="text-xl font-bold text-neutral-800">No bookings yet</h3>
            <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't reserved any stays yet. Let's find your next destination stay!
            </p>
            <div className="mt-8">
              <Link to="/listings" className="inline-block bg-rose-500 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20">
                Start Searching Stays
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const coverPhoto = booking.listing?.photos && booking.listing.photos.length > 0
                ? `http://localhost:3000${booking.listing.photos[0]}`
                : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

              return (
                <div key={booking._id} className="bg-white border border-neutral-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row gap-5 items-center">
                  <div className="w-full md:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shrink-0 shadow-sm">
                    <img src={coverPhoto} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-neutral-800 hover:text-rose-500 transition-colors">
                      <Link to={`/listings/${booking.listing?._id}`}>
                        {booking.listing?.houseName || 'Unknown Listing'}
                      </Link>
                    </h3>
                    <p className="text-neutral-500 text-xs mt-1 flex items-center justify-center md:justify-start gap-1">
                      <i className="fa-solid fa-location-dot text-rose-500"></i>
                      {booking.listing?.location}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-100 p-3 rounded-xl max-w-lg">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Check-in</span>
                        <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Check-out</span>
                        <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Guests</span>
                        <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right shrink-0 flex flex-col gap-2 items-center md:items-end justify-center md:border-l md:border-neutral-100 md:pl-8 py-3 w-full md:w-auto">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Price</span>
                    <span className="text-lg font-black text-neutral-800">Rs {booking.totalPrice}</span>
                    <div className="flex flex-col items-center md:items-end gap-1.5 mt-1">
                      <span className={`font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : booking.status === 'approved'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : booking.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-rose-50 text-rose-500 border-rose-100'
                      }`}>
                        {booking.status === 'confirmed'
                          ? 'Confirmed'
                          : booking.status === 'approved'
                          ? 'Approved (Pending Payment)'
                          : booking.status === 'pending'
                          ? 'Pending Approval'
                          : 'Declined'}
                      </span>
                      {booking.status === 'confirmed' && (
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                          Payment: {booking.paymentStatus === 'paid' ? 'Paid Online' : 'Pay Offline (Unpaid)'}
                        </span>
                      )}
                      {booking.status === 'approved' && (
                        <button
                          onClick={() => handleOpenPaymentModal(booking)}
                          className="mt-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider cursor-pointer shadow-sm hover:scale-105 active:scale-[0.98] transition"
                        >
                          Pay Now / Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Favourites View
        favourites.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-3xl shadow-sm max-w-lg mx-auto px-6">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-heart text-2xl text-rose-500"></i>
            </div>
            <h3 className="text-xl font-bold text-neutral-800">No favourites yet</h3>
            <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Stumbled on something you like? Click the heart icon on listings to save them here for later!
            </p>
            <div className="mt-8">
              <Link to="/listings" className="inline-block bg-rose-500 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20">
                Explore Stays
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {favourites.map(listing => (
              <ListingCard
                key={listing._id}
                listing={listing}
                isFavouritedInitial={true}
                onToggleFavSuccess={handleToggleFavSuccess}
              />
            ))}
          </div>
        )
      )}
      {/* Complete Stay Checkout Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-neutral-100 animate-fade-in space-y-6 text-left">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-800">Checkout Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Bill summary info */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs font-semibold text-neutral-600 space-y-2">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Billing Summary</span>
              <div className="flex justify-between">
                <span>Stay Location</span>
                <span className="text-neutral-800 font-bold">{selectedBooking.listing?.houseName}</span>
              </div>
              <div className="flex justify-between">
                <span>Dates</span>
                <span>{new Date(selectedBooking.checkIn).toLocaleDateString()} - {new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-800 pt-2 border-t border-neutral-200">
                <span>Total Amount Due</span>
                <span>Rs {selectedBooking.totalPrice}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                  paymentMethod === 'online'
                    ? 'bg-white text-rose-500 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <i className="fa-solid fa-credit-card mr-2"></i>Pay Online
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('offline')}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                  paymentMethod === 'offline'
                    ? 'bg-white text-rose-500 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <i className="fa-solid fa-money-bill-wave mr-2"></i>Pay Offline
              </button>
            </div>

            {/* Content for payment choices */}
            {paymentMethod === 'online' ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 1234 5678"
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s?/g, '').replace(/[^0-9]/g, '');
                      const matches = v.match(/\d{4,16}/g);
                      const match = matches && matches[0] || '';
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      setCardNumber(parts.length > 0 ? parts.join(' ') : v);
                    }}
                    required
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '');
                        if (v.length >= 2) {
                          setCardExpiry(v.substring(0, 2) + '/' + v.substring(2, 4));
                        } else {
                          setCardExpiry(v);
                        }
                      }}
                      required
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition text-center"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">CVV Code</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition text-center"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-sm disabled:opacity-50"
                  >
                    {paymentLoading ? 'Processing...' : `Pay Rs ${selectedBooking.totalPrice}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 font-medium">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-start gap-2.5 text-xs">
                  <i className="fa-solid fa-circle-info mt-0.5 text-emerald-500 shrink-0"></i>
                  <div className="leading-relaxed">
                    <strong className="block mb-0.5">Pay at Stay Confirmation</strong>
                    By selecting Offline Payment, your stay will be confirmed immediately. You can complete the cash/card payment directly with the host upon checking in.
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={paymentLoading}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-sm disabled:opacity-50"
                  >
                    {paymentLoading ? 'Confirming...' : 'Confirm Pay Offline'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default UserDashboard;
