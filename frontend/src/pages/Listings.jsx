import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const Listings = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [listings, setListings] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters inputs
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Fetch listings on parameter change
  const fetchListings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (minPrice) query.append('minPrice', minPrice);
      if (maxPrice) query.append('maxPrice', maxPrice);
      query.append('page', page);
      query.append('limit', 8);

      const res = await fetch(`http://localhost:3000/api/listings?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setPagination(data.pagination);
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
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams, page, isAuthenticated, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
    const params = { page: 1 };
    if (search) params.search = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      const params = Object.fromEntries(searchParams.entries());
      params.page = newPage;
      setSearchParams(params);
    }
  };

  const handleToggleFavSuccess = (listingId, isFav) => {
    if (isFav) {
      setFavIds(prev => [...prev, listingId]);
    } else {
      setFavIds(prev => prev.filter(id => id !== listingId));
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-7xl mt-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight">Explore Stays</h1>
        <p className="text-neutral-500 text-sm mt-1">Book unique places to stay and things to do.</p>
      </div>

      {/* Filter and Search Panel */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Location Search */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Where</label>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>
          </div>

          {/* Min Price */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Min Price (Rs)</label>
            <input
              type="number"
              placeholder="Any"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          {/* Max Price */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Max Price (Rs)</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          {/* Search Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md shadow-rose-500/20 transition cursor-pointer text-center"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-200/60 rounded-3xl shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-house-chimney-crack text-2xl text-neutral-400"></i>
          </div>
          <h3 className="text-xl font-bold text-neutral-800">No stays found</h3>
          <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            We couldn't find any stays matching your criteria. Try adjusting your search query, price limits, or clear filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-6 inline-block bg-rose-500 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-rose-600 transition shadow-md shadow-rose-500/20 cursor-pointer"
          >
            Show All Listings
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard
                key={listing._id}
                listing={listing}
                isFavouritedInitial={favIds.includes(listing._id)}
                onToggleFavSuccess={handleToggleFavSuccess}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left text-sm text-neutral-600"></i>
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition cursor-pointer ${
                      page === pageNum
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'border border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <i className="fa-solid fa-chevron-right text-sm text-neutral-600"></i>
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Listings;
