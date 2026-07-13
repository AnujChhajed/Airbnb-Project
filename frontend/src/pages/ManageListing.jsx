import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ManageListing = () => {
  const { id } = useParams(); // Listing ID if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Basic Form States
  const [houseName, setHouseName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Amenities checklist
  const commonAmenities = [
    'High-speed Wi-Fi',
    'Free on-site parking',
    'Central Air Conditioning',
    'Fully equipped modern kitchen',
    'Smart TV with Netflix',
    'Dedicated workspace area',
    'Pool access',
    'Gym facilities',
  ];
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Photos uploads
  const [photoFiles, setPhotoFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Fetch listing for editing
  useEffect(() => {
    if (isEditMode) {
      const fetchListing = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/listings/${id}`);
          if (!res.ok) {
            throw new Error('Listing not found');
          }
          const data = await res.json();
          const l = data.listing;

          setHouseName(l.houseName);
          setPrice(l.price);
          setLocation(l.location);
          setDescription(l.description);
          setSelectedAmenities(l.amenities || []);
          setExistingPhotos(l.photos || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchListing();
    }
  }, [id, isEditMode]);

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleFileChange = (e) => {
    setPhotoFiles(Array.from(e.target.files));
  };

  const handleToggleDeletePhoto = (photoPath) => {
    setPhotosToDelete(prev =>
      prev.includes(photoPath)
        ? prev.filter(p => p !== photoPath)
        : [...prev, photoPath]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form validation
    if (!houseName || !price || !location || !description) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('houseName', houseName);
      formData.append('price', price);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('amenities', JSON.stringify(selectedAmenities));

      // Append new photo files
      photoFiles.forEach(file => {
        formData.append('photos', file);
      });

      // Handle editing extra payloads
      if (isEditMode) {
        formData.append('deletePhotos', JSON.stringify(photosToDelete));
      }

      const url = isEditMode
        ? `http://localhost:3000/api/listings/${id}`
        : 'http://localhost:3000/api/listings';

      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // Pass session cookie
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(isEditMode ? 'Listing updated successfully!' : 'Listing added successfully!');
        navigate('/host');
      } else {
        setError(data.message || 'Operation failed. Please try again.');
      }
    } catch (err) {
      setError('Network connection error. Failed to save stay listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-8 max-w-3xl mt-8">
      {/* Back Link */}
      <Link to="/host" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold text-sm mb-6 transition">
        <i className="fa-solid fa-arrow-left"></i> Cancel and go back
      </Link>

      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-black text-neutral-800 mb-2">
          {isEditMode ? 'Edit Stay Listing' : 'List your Home on Airbnb'}
        </h1>
        <p className="text-neutral-500 text-sm mb-8 border-b border-neutral-100 pb-4">
          Provide complete details about your property to attract vacationers and guests.
        </p>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-sm flex gap-2 items-center">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Name */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">Property Name *</label>
            <input
              type="text"
              placeholder="e.g. Luxury Beachside Villa with Ocean View"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">Location *</label>
              <input
                type="text"
                placeholder="e.g. Malibu, California"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">Price per Night (Rs) *</label>
              <input
                type="number"
                placeholder="e.g. 8500"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">Description *</label>
            <textarea
              placeholder="Provide a detailed, attractive description about the stay, rooms, kitchen, local activities, and amenities..."
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition leading-relaxed"
            ></textarea>
          </div>

          {/* Amenities Checklist */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-3 uppercase tracking-wider">Amenities Offered</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 border border-neutral-100 p-4 rounded-2xl">
              {commonAmenities.map(amenity => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <label key={amenity} className="flex items-center gap-3 text-sm text-neutral-700 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 text-rose-500 border-neutral-300 rounded focus:ring-rose-500 cursor-pointer"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Photo File Uploads */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">
              {isEditMode ? 'Add More Photos' : 'Property Photos *'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              required={!isEditMode}
              className="w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 file:transition cursor-pointer file:cursor-pointer"
            />
            <p className="text-[10px] text-neutral-400 mt-2 font-medium">Select up to 5 high-resolution images (JPEG, PNG, WEBP, max 5MB each).</p>
          </div>

          {/* Manage Existing Photos (Edit Mode) */}
          {isEditMode && existingPhotos.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-3 uppercase tracking-wider">Manage Existing Photos</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 border border-neutral-100 rounded-2xl">
                {existingPhotos.map((photoPath) => {
                  const markedForDelete = photosToDelete.includes(photoPath);
                  return (
                    <div key={photoPath} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm group bg-white border border-neutral-200">
                      <img src={`http://localhost:3000${photoPath}`} className={`w-full h-full object-cover transition ${markedForDelete ? 'opacity-30 blur-sm' : ''}`} />
                      
                      <button
                        type="button"
                        onClick={() => handleToggleDeletePhoto(photoPath)}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition cursor-pointer ${
                          markedForDelete ? 'bg-rose-500 text-white' : 'bg-white/90 text-neutral-600 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        <i className={`fa-solid ${markedForDelete ? 'fa-rotate-left' : 'fa-trash'} text-xs`}></i>
                      </button>

                      {markedForDelete && (
                        <div className="absolute inset-0 flex items-center justify-center bg-rose-500/10 text-rose-600 font-extrabold text-[10px] uppercase tracking-wider">
                          Deleting
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-center text-sm disabled:opacity-50"
          >
            {loading ? 'Saving details...' : isEditMode ? 'Update Listing Details' : 'Publish Property Listing'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ManageListing;
