import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const Explore = () => {
  const { isAuthenticated, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Trending');

  const categories = [
    { name: 'Trending', icon: 'fa-fire' },
    { name: 'Beachfront', icon: 'fa-umbrella-beach' },
    { name: 'Cabins', icon: 'fa-mountain-sun' },
    { name: 'Lakefront', icon: 'fa-water' },
    { name: 'Arctic', icon: 'fa-snowflake' },
    { name: 'Cities', icon: 'fa-city' },
    { name: 'Camping', icon: 'fa-campground' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured listings (limit=4)
        const listingsRes = await fetch('http://localhost:3000/api/listings?limit=4');
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data.listings);
        }

        // Fetch user favourites if logged in
        if (isAuthenticated && user?.role === 'user') {
          const favsRes = await fetch('http://localhost:3000/api/favourites', {
            credentials: 'include',
          });
          if (favsRes.ok) {
            const favsData = await favsRes.json();
            setFavIds(favsData.favourites.map(f => f._id));
          }
        }
      } catch (err) {
        console.error('Error fetching explore data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user]);

  const handleToggleFavSuccess = (listingId, isFav) => {
    if (isFav) {
      setFavIds(prev => [...prev, listingId]);
    } else {
      setFavIds(prev => prev.filter(id => id !== listingId));
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-7xl">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white rounded-3xl py-12 px-6 md:px-12 my-8 shadow-xl shadow-rose-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_45%)]"></div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full backdrop-blur-md">
            Introducing Airbnb Lite
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight tracking-tight animate-fade-in">
            Find your next perfect getaway.
          </h1>
          <p className="text-rose-100/90 mt-3 text-base md:text-lg font-medium">
            Explore premium stays, curated vacation rentals, and cozy family homes in top locations.
          </p>
          <div className="mt-8">
            <Link
              to="/listings"
              className="inline-block bg-white text-rose-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 hover:bg-neutral-50 transition duration-200"
            >
              Start Exploring Stays
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs Mockup */}
      <div className="mb-10 border-b border-neutral-200 pb-4">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar py-2 text-neutral-500 font-semibold text-xs tracking-wider uppercase">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 transition duration-200 shrink-0 cursor-pointer ${
                activeCategory === cat.name
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent hover:text-neutral-800 hover:border-neutral-300'
              }`}
            >
              <i className={`fa-solid ${cat.icon} text-lg`}></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listing Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Featured Accommodations</h2>
        <Link
          to="/listings"
          className="text-rose-500 hover:text-rose-600 text-sm font-bold flex items-center gap-1 transition"
        >
          View All <i className="fa-solid fa-chevron-right text-xs"></i>
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-3xl shadow-sm">
          <i className="fa-solid fa-house-chimney-crack text-5xl text-neutral-300 mb-4"></i>
          <h3 className="text-xl font-bold text-neutral-700">No Listings Registered Yet</h3>
          <p className="text-neutral-500 mt-1 max-w-sm mx-auto">
            Be the first to list a property on Airbnb by visiting the Host section.
          </p>
          {user?.role === 'host' ? (
            <Link
              to="/host/add-listing"
              className="inline-block mt-4 bg-rose-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20"
            >
              Add Your Home
            </Link>
          ) : (
            <Link
              to="/signup?role=host"
              className="inline-block mt-4 bg-rose-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20"
            >
              Become a Host
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {listings.map(listing => (
            <ListingCard
              key={listing._id}
              listing={listing}
              isFavouritedInitial={favIds.includes(listing._id)}
              onToggleFavSuccess={handleToggleFavSuccess}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default Explore;
