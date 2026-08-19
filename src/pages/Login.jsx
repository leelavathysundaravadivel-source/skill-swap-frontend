import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    // 1. Check for empty or whitespace-only fields
    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('⚠️ All fields are mandatory. Please fill in all details before submitting.');
      return;
    }

    // 2. Validate email format with regex
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('⚠️ Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail.toLowerCase(),
          password: cleanPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('skillswap_token', data.token);
        if (login) login(data.user);
        navigate('/home');
      } else {
        setErrorMessage(data.message || 'Invalid email or password credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Unable to connect to the backend server. Please verify backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-[#4f46e5] rounded-2xl flex items-center justify-center text-xl mx-auto font-black shadow-inner">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 font-medium">
            Log in to manage your skill swaps and handshakes.
          </p>
        </div>

        {/* Validation / Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl animate-in fade-in flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block mb-1.5 text-slate-800 font-bold">Email Address</label>
            <input
              type="text"
              name="email"
              placeholder="e.g. yourname@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-slate-800 font-bold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#4f46e5] font-extrabold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;