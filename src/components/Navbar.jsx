import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, unreadCount } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLoggedIn = user?.isLoggedIn || Boolean(localStorage.getItem('skillswap_token'));
  const isAdmin = user?.role === 'admin'; // Detect Admin role
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (logout) logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110">📖</span>
          <span className="font-black text-2xl tracking-tight text-[#4f46e5]">SKILLSWAP</span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#f8fafc] p-1.5 rounded-2xl border border-slate-200/70 text-xs font-bold text-slate-600">
          <Link to="/" className={`px-4 py-2 rounded-xl transition-all ${isActive('/') ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'hover:text-slate-900'}`}>
            Home
          </Link>
          {/* <Link to="/about" className={`px-4 py-2 rounded-xl transition-all ${isActive('/about') ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'hover:text-slate-900'}`}>
            About
          </Link> */}
          <Link to="/explore" className={`px-4 py-2 rounded-xl transition-all ${isActive('/explore') ? 'bg-[#4f46e5] text-white shadow-xs font-extrabold' : 'hover:text-slate-900'}`}>
            Explore Hub
          </Link>
          
          {/* ⚡ CONDITIONAL LABEL: "Swaps Dashboard" for Admin, "My Swaps" for Peer Learners */}
          <Link to="/swaps" className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${isActive('/swaps') ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'hover:text-slate-900'}`}>
            <span>{isAdmin ? 'Swaps Dashboard' : 'My Swaps'}</span>
            {isLoggedIn && !isAdmin && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to="/saved" className={`px-4 py-2 rounded-xl transition-all ${isActive('/saved') ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'hover:text-slate-900'}`}>
            Saved Skills
          </Link>
        </div>

        {/* User / Profile Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-2.5 bg-[#f8fafc] border border-slate-200/80 text-slate-900 font-bold px-3.5 py-2 rounded-2xl text-xs shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-black text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.name || 'User'}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-semibold text-slate-700 space-y-1">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-extrabold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#4f46e5] px-2 py-0.5 rounded-full">
                      Role: {user?.role || 'user'}
                    </span>
                  </div>
                  
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                    👤 My Profile
                  </Link>
                  
                  {/* ⚡ DROPDOWN CONDITIONAL LABEL */}
                  <Link to="/swaps" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                    🤝 {isAdmin ? 'Swaps Dashboard' : 'My Swaps'}
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-slate-100 pt-2 font-bold"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs font-bold text-slate-700 px-4 py-2.5">
                Log In
              </Link>
              <Link to="/signup" className="bg-[#4f46e5] text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md">
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;