import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Landing = () => {
  const { user } = useContext(AppContext);
  const isLoggedIn = Boolean(user && user.name);

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-16 px-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4f46e5] text-xs font-black tracking-wider uppercase shadow-xs">
          ⚡ Decentralized Learning Ecosystem
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Trade Your Skills. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-indigo-500">
            Learn Without Boundaries.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          SkillSwap connects motivated learners and experts worldwide. Trade programming, cloud engineering, UI design, and language skills through direct peer exchange.
        </p>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isLoggedIn ? (
            <>
              <Link
                to="/home"
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black px-7 py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25"
              >
                Go to Dashboard ➔
              </Link>
              <Link
                to="/explore"
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black px-7 py-3.5 rounded-xl transition shadow-xs"
              >
                Browse Explore Hub
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black px-7 py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25"
              >
                Join Community ➔
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black px-7 py-3.5 rounded-xl transition shadow-xs"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Landing;