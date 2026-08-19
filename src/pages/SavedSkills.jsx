import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const SavedSkills = () => {
  const { user, savedSkillIds, toggleSaveSkill, proposals, fetchProposals } = useContext(AppContext);

  const [savedSkills, setSavedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [swapModalSkill, setSwapModalSkill] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const isLoggedIn = Boolean(user && user.name);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedSkills();
    } else {
      setLoading(false);
    }
  }, [savedSkillIds, isLoggedIn]);

  const fetchSavedSkills = async () => {
    const token = localStorage.getItem('skillswap_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/skills/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSavedSkills(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching saved skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSynergy = (skill) => {
    if (!user || (!user.offerSkill && !user.offers) || (!user.seekSkill && !user.requests)) return 50;

    const userOffers = (user.offerSkill || user.offers || '').toLowerCase();
    const userSeeks = (user.seekSkill || user.requests || '').toLowerCase();

    const skillOffers = (skill.offers || skill.offeredSkill || skill.title || '').toLowerCase();
    const skillSeeks = (skill.requests || skill.seekingSkill || skill.seekSkill || '').toLowerCase();

    const directMatch = skillOffers.includes(userSeeks) || userOffers.includes(skillSeeks);
    return directMatch ? 100 : 75;
  };

  const handleConfirmSwap = async () => {
    if (!swapModalSkill) return;

    setIsTransmitting(true);
    try {
      const token = localStorage.getItem('skillswap_token');
      const providerId =
        (typeof swapModalSkill.provider === 'object'
          ? (swapModalSkill.provider?._id || swapModalSkill.provider?.id)
          : swapModalSkill.provider) ||
        (typeof swapModalSkill.user === 'object'
          ? (swapModalSkill.user?._id || swapModalSkill.user?.id)
          : swapModalSkill.user) ||
        swapModalSkill.userId ||
        swapModalSkill.providerId;

      const synergyScore = calculateSynergy(swapModalSkill);

      const res = await fetch('http://localhost:5000/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetSkillId: swapModalSkill._id,
          targetProviderId: providerId,
          synergyScore: synergyScore
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSwapSuccess(true);
        if (fetchProposals) fetchProposals();
      } else {
        alert(data.message || 'Failed to initiate swap match.');
      }
    } catch (err) {
      console.error('Swap error:', err);
      alert('Unable to transmit swap request.');
    } finally {
      setIsTransmitting(false);
    }
  };

  // ⚡ 1. GUEST USER VIEW
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 max-w-lg w-full text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-[#4f46e5] rounded-3xl flex items-center justify-center text-3xl mx-auto font-black shadow-inner">
            ★
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Log In to Proceed Further
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Please sign in to access your bookmarked skill offers, manage your personalized learning queue, and propose swaps.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold px-6 py-3 rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              Sign In to Account
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-6 py-3 rounded-xl transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ⚡ 2. LOGGED-IN SAVED SKILLS VIEW
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-[calc(100vh-160px)]">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Skills</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Quickly access your bookmarked skill offers and initiate swaps.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 mt-3">Loading saved skills...</p>
        </div>
      ) : savedSkills.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs space-y-3">
          <span className="text-4xl">★</span>
          <h3 className="text-base font-extrabold text-slate-800">No Saved Skills Yet</h3>
          <p className="text-xs text-slate-500">
            Bookmark interesting skill posts from Explore Hub to review or initiate swaps later.
          </p>
          <Link
            to="/explore"
            className="inline-block bg-[#4f46e5] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#4338ca] transition mt-2"
          >
            Browse Explore Hub
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSkills.map((item) => {
            const existingProposal = proposals.find((p) => {
              const targetSkillId = (
                typeof p.targetSkill === 'object' ? p.targetSkill?._id || p.targetSkill?.id : p.targetSkill
              )?.toString();
              return targetSkillId === item._id?.toString();
            });

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#eef2ff] text-[#4f46e5] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <button
                      onClick={() => toggleSaveSkill(item._id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-200 bg-indigo-50 text-[#4f46e5] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                    >
                      ★ Saved
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Shared by: <span className="text-slate-900 font-bold">{item.providerName || 'Peer Mentor'}</span> ({item.level || 'Intermediate'})
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.description}</p>

                  <div className="bg-[#f8fafc] border border-slate-100 p-3 rounded-xl text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Offers:</span>
                      <span className="font-bold text-slate-900 truncate block">{item.offers}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Seeking:</span>
                      <span className="font-bold text-[#4f46e5] truncate block">{item.requests}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {existingProposal ? (
                    existingProposal.status === 'Accepted' ? (
                      <Link
                        to="/swaps"
                        className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>✅ Handshake Active</span>
                      </Link>
                    ) : (
                      <Link
                        to="/swaps"
                        className="w-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>⏳ Swap Request Pending</span>
                      </Link>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        setSwapSuccess(false);
                        setSwapModalSkill(item);
                      }}
                      className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold py-3 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20"
                    >
                      🤝 Initiate Swap Match
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IN-APP SWAP MODAL */}
      {swapModalSkill &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6">
              {swapSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-3xl flex items-center justify-center text-3xl mx-auto font-black">
                    ⚡
                  </div>
                  <h3 className="text-xl font-black text-white">Swap Handshake Transmitted!</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Your exchange proposal for "{swapModalSkill.title}" was successfully submitted.
                  </p>
                  <div className="pt-4 flex flex-col gap-2">
                    <Link
                      to="/swaps"
                      onClick={() => setSwapModalSkill(null)}
                      className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold py-3.5 rounded-xl text-center"
                    >
                      Track in My Swaps ➔
                    </Link>
                    <button
                      onClick={() => setSwapModalSkill(null)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-black">Initiate Swap Proposal</h3>
                    <button
                      onClick={() => setSwapModalSkill(null)}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">Calculated Synergy</span>
                    <span className="text-2xl font-black text-indigo-400">
                      {calculateSynergy(swapModalSkill)}%
                    </span>
                  </div>
                  <button
                    onClick={handleConfirmSwap}
                    disabled={isTransmitting}
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold py-3.5 rounded-xl transition disabled:opacity-50"
                  >
                    {isTransmitting ? 'Transmitting...' : 'Initiate Swap Match'}
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SavedSkills;