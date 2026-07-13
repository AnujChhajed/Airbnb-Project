import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

// Page Components
import Explore from './pages/Explore';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import UserDashboard from './pages/UserDashboard';
import HostDashboard from './pages/HostDashboard';
import ManageListing from './pages/ManageListing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user is a host trying to view user pages, or user trying to view host panel, redirect appropriately
    if (user?.role === 'host') {
      return <Navigate to="/host" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Explore />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected User/Guest Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Host/Admin Routes */}
              <Route
                path="/host"
                element={
                  <ProtectedRoute allowedRoles={['host']}>
                    <HostDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/add-listing"
                element={
                  <ProtectedRoute allowedRoles={['host']}>
                    <ManageListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/edit-listing/:id"
                element={
                  <ProtectedRoute allowedRoles={['host']}>
                    <ManageListing />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Premium Footer */}
          <footer className="border-t border-neutral-200/60 bg-white py-6 mt-16 text-center text-xs text-neutral-400 font-semibold tracking-wide">
            <div className="container mx-auto px-4">
              <p>© 2026 Airbnb, Inc. All rights reserved · Privacy · Terms · Sitemap</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
