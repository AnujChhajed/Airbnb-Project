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
                  <div className="text-center md:text-right shrink-0 flex flex-col gap-2 items-center md:items-end justify-center md:border-l md:border-neutral-100 md:pl-8 py-3">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Paid</span>
                    <span className="text-lg font-black text-neutral-800">Rs {booking.totalPrice}</span>
                    <span className={`font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : booking.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                      {booking.status === 'confirmed' ? 'Approved' : booking.status === 'pending' ? 'Pending Approval' : 'Declined'}
                    </span>
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
    </main>
  );
};

export default UserDashboard;
