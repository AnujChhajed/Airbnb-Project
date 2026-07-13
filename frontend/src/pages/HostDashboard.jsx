import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab Selection
  const [activeTab, setActiveTab] = useState('listings');

  // Data states
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHostData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const res = await fetch('http://localhost:3000/api/listings/host', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings);
        }
      } else if (activeTab === 'reservations') {
        const res = await fetch('http://localhost:3000/api/bookings/reservations', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data.reservations);
        }
      }
    } catch (err) {
      console.error('Error fetching host dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, [activeTab]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this listing? This will permanently delete the stay listing along with all bookings, favourites, and reviews associated with it.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });

      if (res.ok) {
        alert('Listing deleted successfully!');
        setListings(prev => prev.filter(l => l._id !== listingId));
      } else {
        const data = await res.json();
        alert(`Failed to delete listing: ${data.message}`);
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Network error while deleting listing.');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReservations(prev =>
          prev.map(res => (res._id === bookingId ? { ...res, status: newStatus } : res))
        );
      } else {
        const data = await res.json();
        alert(`Failed to update booking status: ${data.message}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error while updating booking status.');
    }
  };


  const pendingRequests = reservations.filter(r => r.status === 'pending');
  const reservationHistory = reservations.filter(r => r.status !== 'pending');

  const renderReservationCard = (res) => {
    const coverPhoto = res.listing?.photos && res.listing.photos.length > 0
      ? `http://localhost:3000${res.listing.photos[0]}`
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

    return (
      <div key={res._id} className="bg-white border border-neutral-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row gap-5 items-center relative overflow-hidden">
        {res.status === 'pending' && (
          <div className="absolute top-0 left-0 bg-rose-500 text-white font-extrabold text-[9px] px-3.5 py-1 rounded-br-2xl uppercase tracking-wider animate-pulse">
            New Request
          </div>
        )}
        <div className="w-full md:w-36 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
          <img src={coverPhoto} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div>
            <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Property Booked</span>
            <h3 className="font-extrabold text-neutral-800 text-base">{res.listing?.houseName}</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-100 p-3 rounded-xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Guest Name</span>
              <span>{res.user?.name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Guest Contact</span>
              <span className="truncate">{res.user?.email}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dates</span>
              <span>{new Date(res.checkIn).toLocaleDateString()} - {new Date(res.checkOut).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Guests</span>
              <span>{res.guests}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-right shrink-0 flex flex-col gap-2 items-center md:items-end justify-center md:border-l md:border-neutral-100 md:pl-8 py-3 w-full md:w-auto">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Payout Amount</span>
          <span className="text-lg font-black text-neutral-800">Rs {res.totalPrice}</span>
          
          {res.status === 'pending' ? (
            <div className="flex gap-1.5 mt-1.5 w-full justify-center md:justify-end">
              <button
                onClick={() => handleUpdateStatus(res._id, 'approved')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider cursor-pointer transition active:scale-[0.97]"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(res._id, 'cancelled')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider cursor-pointer transition active:scale-[0.97]"
              >
                Decline
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-end gap-1 mt-1">
              <span className={`font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border ${
                res.status === 'confirmed'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : res.status === 'approved'
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-rose-50 text-rose-500 border-rose-100'
              }`}>
                {res.status === 'confirmed'
                  ? 'Confirmed'
                  : res.status === 'approved'
                  ? 'Approved (Unpaid)'
                  : 'Declined'}
              </span>
              {res.status === 'confirmed' && (
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                  Payment: {res.paymentMethod === 'online' ? 'Online Card' : 'Pay Offline'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-7xl mt-8">
      {/* Profile Header */}
      <div className="bg-white border border-neutral-200/50 rounded-3xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center font-bold text-rose-600 text-3xl shadow-sm uppercase shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-800">{user?.name}</h1>
            <p className="text-neutral-500 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-block mt-3 bg-rose-50 text-rose-600 font-bold text-xs px-3.5 py-1 rounded-full border border-rose-100 uppercase tracking-wide">
              {user?.role} Portal
            </span>
          </div>
        </div>
        <Link
          to="/host/add-listing"
          className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-full shadow-md shadow-rose-500/20 transition cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-circle-plus mr-2 text-xs"></i>Add Stay Listing
        </Link>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200 mb-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
            activeTab === 'listings'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <i className="fa-solid fa-sliders mr-2 text-xs"></i>
          My Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
            activeTab === 'reservations'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <i className="fa-solid fa-suitcase-rolling mr-2 text-xs"></i>
          Guest Reservations ({activeTab === 'reservations' ? reservations.length : '?'})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : activeTab === 'listings' ? (
        // Listings List
        listings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-3xl shadow-sm max-w-lg mx-auto px-6">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-list text-2xl text-neutral-400"></i>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 font-extrabold">No properties listed yet</h3>
            <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Start earning by welcoming guests to your properties. List your first home away from home right now!
            </p>
            <div className="mt-8">
              <Link to="/host/add-listing" className="inline-block bg-rose-500 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20">
                Add Your Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => {
              const coverPhoto = listing.photos && listing.photos.length > 0
                ? `http://localhost:3000${listing.photos[0]}`
                : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

              return (
                <div key={listing._id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/50 shadow-sm hover:shadow-md transition duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img src={coverPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-neutral-800 text-base line-clamp-1">{listing.houseName}</h3>
                      <p className="text-neutral-500 text-xs flex items-center gap-1 mt-1 mb-3">
                        <i className="fa-solid fa-location-dot text-neutral-400 text-[10px]"></i>
                        {listing.location}
                      </p>
                    </div>
                    <div className="border-t border-neutral-100 pt-3.5 mt-auto flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
                        <span>Price: Rs {listing.price} / night</span>
                        <div className="flex items-center">
                          <i className="fa-solid fa-star text-amber-400 mr-1"></i>
                          <span>{listing.rating > 0 ? listing.rating : 'New'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => navigate(`/host/edit-listing/${listing._id}`)}
                          className="py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-rose-500 hover:text-white transition duration-200 cursor-pointer text-center"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing._id)}
                          className="py-2 rounded-xl bg-neutral-50 text-rose-500 border border-neutral-200/50 text-xs font-bold hover:bg-rose-500 hover:text-white hover:border-transparent transition duration-200 cursor-pointer text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Reservations List
        reservations.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-3xl shadow-sm max-w-lg mx-auto px-6">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-suitcase-rolling text-2xl text-rose-500"></i>
            </div>
            <h3 className="text-xl font-bold text-neutral-800">No bookings yet</h3>
            <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              When guests reserve one of your listings, their trip schedules and contact details will show up right here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* New Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                  <h3 className="font-extrabold text-neutral-800 text-lg">New Incoming Requests</h3>
                  <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shrink-0">
                    {pendingRequests.length}
                  </span>
                </div>
                <div className="space-y-4 animate-fade-in">
                  {pendingRequests.map(res => renderReservationCard(res))}
                </div>
              </div>
            )}

            {/* Historical Reservations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                <h3 className="font-extrabold text-neutral-800 text-lg">Stays & Reservation History</h3>
                <span className="bg-neutral-200 text-neutral-600 text-xs font-black px-2.5 py-0.5 rounded-full shrink-0">
                  {reservationHistory.length}
                </span>
              </div>
              {reservationHistory.length === 0 ? (
                <div className="text-center py-8 bg-white border border-neutral-100 rounded-3xl text-sm text-neutral-400">
                  No historical or processed stays found.
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {reservationHistory.map(res => renderReservationCard(res))}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </main>
  );
};

export default HostDashboard;
