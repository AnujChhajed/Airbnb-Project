import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Form step: 'email' or 'reset'
  const [step, setStep] = useState('email'); 
  
  // Input fields
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devResetCode, setDevResetCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('A password reset code has been sent to your email. Check your inbox (or development console).');
        if (data.resetCode) {
          setDevResetCode(data.resetCode); // Storing the code directly for easy developer testing!
        }
        setStep('reset');
      } else {
        setError(data.message || 'Email address not found.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Password reset successfully! You will now be redirected to the login page.');
        navigate('/login');
      } else {
        setError(data.message || 'Verification failed. Please check the code.');
      }
    } catch (err) {
      setError('Network error. Reset failed.');
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
          <h1 className="text-xl font-bold text-neutral-800">Reset Password</h1>
          <p className="text-neutral-500 text-xs mt-1">Recover access to your account.</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-xs flex gap-2 items-center">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold text-xs flex gap-2 items-center">
            <i className="fa-solid fa-circle-check text-base"></i>
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-center text-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {devResetCode && (
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-600">
                🔧 Dev Debug Code: <span className="text-rose-600 font-black">{devResetCode}</span>
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Verification Code</label>
              <input
                type="text"
                placeholder="6-digit code"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-center font-bold tracking-widest transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-center text-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Resetting...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* Bottom Link */}
        <div className="text-center mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-500 font-semibold">
          Remembered your password?{' '}
          <Link to="/login" className="text-rose-600 hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </main>
  );
};

export default ForgotPassword;
