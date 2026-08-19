import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Home = () => {
  const { user } = useContext(AppContext);
  const isLoggedIn = Boolean(user && user.name);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-6">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-10 md:p-16 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-wider uppercase">
            ⚡ Direct Knowledge Barter
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Exchange Skills. Master New Tools. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">
              Zero Financial Barrier.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
            Connect with peer engineers, designers, and mentors. Offer what you know, request what you want to learn, and collaborate through verified handshakes.
          </p>

          {/* Dynamic Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/explore"
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black px-6 py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            >
              Browse Explore Hub ➔
            </Link>

            {isLoggedIn ? (
              <Link
                to="/swaps"
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black px-6 py-3.5 rounded-xl transition"
              >
                {isAdmin ? '🛡️ Live Swaps Monitor' : '🤝 Manage My Swaps'}
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-black px-6 py-3.5 rounded-xl transition shadow-md"
              >
                Join Community ➔
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5] text-xl font-black">
            🎯
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Dynamic Synergy Matching</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Our smart matching engine calculates skill cross-matches in real time to find your most complementary peer partners.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-black">
            🤝
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Direct Mutual Handshakes</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Propose swaps with one click. Upon mutual acceptance, contact information and scheduling tools are immediately unlocked.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 text-xl font-black">
            🛡️
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Moderated Quality</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Platform moderators continuously verify skill posts and maintain safety with transparent cascade notifications.
          </p>
        </div>
      </section>

      {/* Bottom Conversion Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-10 md:p-12 border border-slate-800 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {isLoggedIn
              ? `Welcome back, ${user.name}!`
              : 'Ready to Expand Your Technical Repertoire?'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            {isLoggedIn
              ? 'Discover new mentoring opportunities or check your incoming peer swap proposals.'
              : 'Join fellow developers, designers, and students sharing real-world skills today.'}
          </p>
        </div>

        <div className="flex justify-center items-center gap-4">
          <Link
            to="/explore"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black px-6 py-3 rounded-xl transition shadow-md shadow-indigo-500/20"
          >
            Explore Skill Catalog ➔
          </Link>

          {!isLoggedIn && (
            <Link
              to="/signup"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-6 py-3 rounded-xl border border-slate-700 transition"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;