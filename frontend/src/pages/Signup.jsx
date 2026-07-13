import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial role if toggled from path (e.g. ?role=host)
  const initialRole = searchParams.get('role') || 'user';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [contactNumber, setContactNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Minimal local validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const data = await signup(name, email, password, role, contactNumber);
      if (data.user.role === 'host') {
        navigate('/host');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 mt-10 pb-16">
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-rose-500 font-extrabold text-3xl tracking-tight mb-3">
            <i className="fa-brands fa-airbnb"></i>
          </Link>
          <h1 className="text-xl font-bold text-neutral-800">Create Airbnb Account</h1>
          <p className="text-neutral-500 text-xs mt-1">Join to book stays or start hosting.</p>
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
          
          {/* Role selector (User / Host tabs) */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">I want to...</label>
            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200/40 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 rounded-lg transition duration-200 cursor-pointer ${
                  role === 'user'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Book Vacation Stays
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`py-2 rounded-lg transition duration-200 cursor-pointer ${
                  role === 'host'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Host My Property
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
          </div>

          {role === 'host' && (
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Contact Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Bottom Redirect */}
        <div className="text-center mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-500 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-600 hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </main>
  );
};

export default Signup;
