import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Contact = () => {
  const { user } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate form details if standard user is logged in
  useEffect(() => {
    if (user && user.name && !isAdmin) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user, isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('⚠️ All fields are mandatory. Please fill in all details before submitting.');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || 'Failed to deliver support message.');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setErrorMessage('Unable to connect to backend server.');
    } finally {
      setIsSending(false);
    }
  };

  // ADMIN SPECIAL VIEW (Matches SavedSkills & Profile Admin Governance Mode)
  if (isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 min-h-[calc(100vh-160px)]">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Support</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Administrator View Mode</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto font-bold">
            🛡️
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-extrabold text-slate-900">Administrator Context Active</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              The <strong>Contact Support</strong> intake form is designed for peer learners submitting platform inquiries. As a system administrator, all user support tickets submitted across the platform are dispatched directly to your configured administrator inbox (<strong className="text-slate-800">adminskillswap2026@gmail.com</strong>).
            </p>
          </div>
     
        </div>
      </div>
    );
  }

  /* STANDARD USER CONTACT FORM */
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Support</h1>
        <p className="text-xs text-slate-500 font-medium">
          Have a question or feedback about Skill Swap? Get in touch with our platform team.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
        {submitted ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl">✅</span>
            <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
            <p className="text-xs text-slate-500">
              Thank you for reaching out. An email notification has been dispatched to the platform administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs font-semibold text-slate-700">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block mb-1 text-slate-800 font-bold">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-800 font-bold">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-800 font-bold">Message</label>
              <textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full p-3 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSending ? 'Transmitting Email...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;