import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (session cookie check)
  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        // Set credentials to 'include' to pass the session cookie across origins
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role, contactNumber) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, role, contactNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    loading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
