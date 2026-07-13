import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header class="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-neutral-100 shadow-sm transition-all duration-300">
      <nav class="container mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Logo */}
        <Link to="/" class="flex items-center space-x-2 text-rose-500 font-extrabold text-2xl tracking-tight hover:opacity-90 transition duration-200">
          <i class="fa-brands fa-airbnb text-3xl"></i>
          <span>airbnb</span>
        </Link>

        {/* Navigation Links */}
        <ul class="flex flex-wrap items-center justify-center gap-1 bg-neutral-100/60 p-1 rounded-full border border-neutral-200/40">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-rose-600 font-semibold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                }`
              }
            >
              <i class="fa-solid fa-house text-xs opacity-70"></i> Explore
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/listings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-rose-600 font-semibold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                }`
              }
            >
              <i class="fa-solid fa-list text-xs opacity-70"></i> Listings
            </NavLink>
          </li>

          {/* User role links */}
          {isAuthenticated && user?.role === 'user' && (
            <>
              <li>
                <NavLink
                  to="/dashboard?tab=favourites"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-heart text-xs opacity-70"></i> Favourites
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard?tab=bookings"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-suitcase-rolling text-xs opacity-70"></i> Bookings
                </NavLink>
              </li>
            </>
          )}

          {/* Host role links */}
          {isAuthenticated && user?.role === 'host' && (
            <>
              <li>
                <NavLink
                  to="/host"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-sliders text-xs opacity-70"></i> Host Panel
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/host/add-listing"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-circle-plus text-xs opacity-70"></i> Add Stay
                </NavLink>
              </li>
            </>
          )}

          <div class="h-4 w-px bg-neutral-300 mx-1 hidden sm:block"></div>

          {/* Auth options */}
          {isAuthenticated ? (
            <li>
              <button
                onClick={handleLogout}
                class="flex items-center gap-1.5 py-2 px-4 rounded-full text-sm text-neutral-600 hover:text-neutral-950 hover:bg-white/40 transition-all duration-200 cursor-pointer"
              >
                <i class="fa-solid fa-right-from-bracket text-xs opacity-70"></i> Logout ({user.name})
              </button>
            </li>
          ) : (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-right-to-bracket text-xs opacity-70"></i> Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-rose-600 font-semibold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                    }`
                  }
                >
                  <i class="fa-solid fa-user-plus text-xs opacity-70"></i> Signup
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
