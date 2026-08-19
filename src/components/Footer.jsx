import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Footer = () => {
  const { user } = useContext(AppContext);
  const isLoggedIn = Boolean(user && user.name);
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="bg-[#060913] text-white border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800/80">
          
          {/* Column 1: Brand Intro */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h2 className="text-lg font-black tracking-tight text-white">Skill Swap</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
              Connecting students worldwide through peer-to-peer learning. Share your skills, discover new passions, and grow together.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Platform
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/explore" className="text-slate-400 hover:text-white transition-colors">
                  Browse Lessons
                </Link>
              </li>
              <li>
                {isLoggedIn ? (
                  <Link to="/swaps" className="text-slate-400 hover:text-white transition-colors">
                    {isAdmin ? 'Audit Swaps' : 'My Swaps'}
                  </Link>
                ) : (
                  <Link to="/signup" className="text-slate-400 hover:text-white transition-colors">
                    Join Community
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Support
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 text-center text-xs text-slate-500 font-medium">
          © 2026 Skill Swap. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;