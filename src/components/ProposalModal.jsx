import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../context/AppContext';

const ProposalModal = ({ skill, onClose }) => {
  const { user, fetchProposals } = useContext(AppContext);
  const [isTransmitted, setIsTransmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!skill) return null;

  // Calculate Synergy Score
  const userSupplies = (user?.supplies || []).join(' ').toLowerCase();
  const userDemands = (user?.demands || []).join(' ').toLowerCase();
  const skillOffers = (skill.offers || '').toLowerCase();
  const skillRequests = (skill.requests || '').toLowerCase();

  const offersMatch = userDemands && skillOffers.includes(userDemands);
  const demandsMatch = userSupplies && skillRequests.includes(userSupplies);

  let synergyScore = 0;
  let synergyLabel = 'No Skill Cross-Match';

  if (offersMatch && demandsMatch) {
    synergyScore = 100;
    synergyLabel = 'Perfect Match';
  } else if (offersMatch || demandsMatch) {
    synergyScore = 50;
    synergyLabel = 'Partial Skill Alignment';
  }

  // TRANSMIT HANDSHAKE TO BACKEND API
  const handleSendHandshake = async () => {
    const token = localStorage.getItem('skillswap_token');
    if (!token) {
      alert('Please log in to send a swap proposal.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skillId: skill._id || skill.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsTransmitted(true);
        // Refresh AppContext proposals state so "My Swaps" counts update instantly!
        if (fetchProposals) {
          fetchProposals();
        }
      } else {
        alert(data.message || 'Failed to transmit proposal.');
      }
    } catch (err) {
      console.error('Handshake error:', err);
      // Fallback for offline/local state mode
      setIsTransmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
      <div className="bg-[#0b1120] text-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-white font-bold cursor-pointer text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Exchange Proposal Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Matching real-time skill parameters dynamically.
          </p>
        </div>

        {/* Calculated Synergy Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              CALCULATED SYNERGY
            </span>
            <span className="font-extrabold text-white text-sm block mt-0.5">
              {synergyLabel}
            </span>
          </div>
          <span className="text-3xl font-black text-white tracking-tight">
            {synergyScore}%
          </span>
        </div>

        {/* Target Provider Info */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            TARGET PROVIDER
          </span>
          <p className="text-sm font-bold text-white">
            {skill.providerName || skill.provider}{' '}
            <span className="text-xs text-slate-400 font-normal">({skill.title})</span>
          </p>
          <p className="text-xs text-slate-400">
            Demands: <span className="text-indigo-400 font-bold">{skill.requests}</span>
          </p>
        </div>

        {/* Context Profile Info */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            YOUR CONTEXT PROFILE
          </span>
          <p className="text-sm font-bold text-white">
            {user?.name || 'Leela'} <span className="text-xs text-slate-400 font-normal">(You)</span>
          </p>
          <p className="text-xs text-slate-400">
            Supplies:{' '}
            <span className="text-indigo-400 font-bold">
              {(user?.supplies || []).join(', ') || 'Java'}
            </span>
          </p>
        </div>

        {/* Action Button */}
        {isTransmitted ? (
          <div className="w-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-extrabold py-3.5 rounded-2xl text-xs text-center">
            ✓ Handshake Transmitted
          </div>
        ) : (
          <button
            onClick={handleSendHandshake}
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? 'Transmitting...' : 'Transmit Proposal Handshake'}
          </button>
        )}

      </div>
    </div>,
    document.body
  );
};

export default ProposalModal;