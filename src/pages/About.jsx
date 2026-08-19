import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-indigo-50 text-[#4f46e5] text-xs font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider">
          About Skill Swap
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Democratizing Peer-to-Peer Technical Learning
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
          Skill Swap connects software engineers, designers, and tech enthusiasts worldwide to exchange practical knowledge directly without expensive course fees.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center text-xl font-bold">
            🤝
          </div>
          <h3 className="text-lg font-bold text-slate-900">1-on-1 Skill Exchanges</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Teach what you know best (e.g., Java, React, Cloud) in exchange for hands-on guidance in skills you want to master (e.g., Python, System Design).
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-slate-900">Real-Time Synergy Matching</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
Our smart matrix evaluates mutual supply and demand needs to pair software developers with maximum learning alignment (100% match).          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center text-xl font-bold">
            🌐
          </div>
          <h3 className="text-lg font-bold text-slate-900">Global Tech Community</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Connect with technical peers worldwide, build professional networks, and level up your software engineering career.
          </p>
        </div>
      </div>

      {/* Call to Action for Guests */}
      <div className="bg-[#0b1120] rounded-3xl p-10 sm:p-12 text-center text-white space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Exchange Knowledge?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
          Join thousands of technical community members sharing real-world industry experience today.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/signup"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-6 py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-500/20"
          >
            Join Community
          </Link>
          <Link
            to="/explore"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl text-xs transition border border-slate-700"
          >
            Browse Lessons
          </Link>
        </div>
      </div>

    </div>
  );
};

export default About;