import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect page after successful login (default to explore)
  const redirectPath = searchParams.get('redirect') || '/';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      // Redirect based on user role if not custom redirect
      if (redirectPath === '/') {
        if (data.user.role === 'host') {
          navigate('/host');
        } else {
          navigate('/');
        }
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 mt-16 pb-16">
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-rose-500 font-extrabold text-3xl tracking-tight mb-3">
            <i className="fa-brands fa-airbnb"></i>
          </Link>
          <h1 className="text-xl font-bold text-neutral-800">Welcome to Airbnb</h1>
          <p className="text-neutral-500 text-xs mt-1">Log in to manage bookings and stays.</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-xs flex gap-2 items-center">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. guest@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-rose-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-center text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {/* Bottom Redirect */}
        <div className="text-center mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-500 font-semibold">
          Don't have an account?{' '}
          <Link to="/signup" className="text-rose-600 hover:underline">
            Sign up
          </Link>
        </div>

      </div>
    </main>
  );
};

export default Login;
