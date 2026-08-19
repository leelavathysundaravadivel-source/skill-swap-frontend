import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Profile = () => {
  const { user } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setSuccessMsg('Security credentials updated successfully.');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-400 font-bold text-xs">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 min-h-[calc(100vh-160px)]">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-[#4f46e5] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-indigo-500/20">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block self-center sm:self-auto ${
              isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-indigo-50 text-[#4f46e5]'
            }`}>
              {isAdmin ? '🛡️ System Administrator' : 'Peer Learner'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
        </div>
      </div>

      {/* ADMIN OVERVIEW BANNER (Rendered only for Admin) */}
      {isAdmin ? (
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <span>🛡️ Platform Governance Mode Active</span>
          </div>
          <h2 className="text-xl font-bold">Administrator Account</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            As a System Administrator, skill offers and demand tags are excluded from your profile. You hold full moderation privileges on the <strong>Explore Hub</strong> catalog and live audit controls inside <strong>My Swaps</strong>.
          </p>
        </div>
      ) : (
        /* STANDARD USER: Skill Supply & Demand Section */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">Your Exchange Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                SKILLS YOU SUPPLY / OFFER
              </span>
              <div className="flex flex-wrap gap-2">
                {(user.supplies || ['Java', 'Spring Boot']).map((skill, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                SKILLS YOU DEMAND / SEEK
              </span>
              <div className="flex flex-wrap gap-2">
                {(user.demands || ['GCP', 'AWS']).map((skill, idx) => (
                  <span key={idx} className="bg-indigo-50 border border-indigo-200 text-[#4f46e5] px-3 py-1.5 rounded-xl font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Credentials Update Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Account Security</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Update password credentials for system authentication.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-semibold max-w-md">
          <div>
            <label className="block mb-1 text-slate-700 font-bold">Current Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-bold">New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-bold">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-[#4f46e5]"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;