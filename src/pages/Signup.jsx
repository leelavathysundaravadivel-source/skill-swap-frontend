import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Signup = () => {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    offerSkill: '',
    seekSkill: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Accepts only letters, numbers, spaces, and commas (as delimiter)
  const skillsRegex = /^[a-zA-Z0-9\s,]+$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();
    const cleanOffer = formData.offerSkill.trim();
    const cleanSeek = formData.seekSkill.trim();

    // 1. Mandatory check: empty space / blank verification
    if (!cleanName || !cleanEmail || !cleanPassword || !cleanOffer || !cleanSeek) {
      setErrorMessage('⚠️ All fields are mandatory. Please fill in all details before submitting.');
      return;
    }

    // 2. Email format validation
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('⚠️ Please enter a valid email address.');
      return;
    }

    // 3. Password minimum length check
    if (cleanPassword.length < 6) {
      setErrorMessage('⚠️ Password must contain at least 6 characters.');
      return;
    }

    // 4. Skills delimiters check: Only commas, alphanumeric characters, and spaces allowed
    if (!skillsRegex.test(cleanOffer)) {
      setErrorMessage('⚠️ "Skills You Offer" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    if (!skillsRegex.test(cleanSeek)) {
      setErrorMessage('⚠️ "Skills You Demand" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail.toLowerCase(),
          password: cleanPassword,
          offerSkill: cleanOffer,
          seekSkill: cleanSeek
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('skillswap_token', data.token);
        if (login) login(data.user);
        navigate('/home');
      } else {
        setErrorMessage(data.message || 'Failed to complete registration.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage('Unable to connect to the backend server. Please verify backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-6">
      <div className="max-w-lg w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-[#4f46e5] rounded-2xl flex items-center justify-center text-xl mx-auto font-black shadow-inner">
            🎓
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500 font-medium">
            Join the peer-to-peer barter network and start exchanging skills.
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
            <label className="block mb-1.5 text-slate-800 font-bold">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Priya Sharma"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-slate-800 font-bold">Email Address</label>
              <input
                type="text"
                name="email"
                placeholder="e.g. priya@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-slate-800 font-bold">Password (min 6 chars)</label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-800 font-bold">Skills You Offer</label>
              <span className="text-[10px] text-slate-400 font-medium">Use comma (,) delimiter only</span>
            </div>
            <input
              type="text"
              name="offerSkill"
              placeholder="e.g. Java, Spring Boot, MySQL"
              value={formData.offerSkill}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-800 font-bold">Skills You Demand / Seek</label>
              <span className="text-[10px] text-slate-400 font-medium">Use comma (,) delimiter only</span>
            </div>
            <input
              type="text"
              name="seekSkill"
              placeholder="e.g. Python, Docker, Kubernetes"
              value={formData.seekSkill}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Sign Up'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-[#4f46e5] font-extrabold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;