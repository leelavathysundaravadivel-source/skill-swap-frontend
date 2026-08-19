import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const MySwaps = () => {
  const { user, proposals, loadingProposals, updateProposalStatus } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('inbound');
  const [updatingId, setUpdatingId] = useState(null);

  const isLoggedIn = Boolean(user && user.name);
  const isAdmin = user?.role === 'admin';

  // 1. GUEST USER VIEW
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 max-w-lg w-full text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-[#4f46e5] rounded-3xl flex items-center justify-center text-3xl mx-auto font-black shadow-inner">
            🤝
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Log In to Start Swapping
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Please sign in to your SkillSwap account to manage incoming swap requests, track handshakes, and schedule collaborative learning sessions.
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

  // ⚡ 2. ADMIN VIEW: GLOBAL AUDIT MONITOR
  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-[calc(100vh-160px)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-wider mb-2">
            🛡️ Admin Control Panel
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Swaps Monitor & Global Audit
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time audit log of all peer-to-peer skill swap transactions across the network.
          </p>
        </div>

        {loadingProposals ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 mt-3">Fetching swap ledger...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs">
            <p className="text-xs font-bold text-slate-400">No swap transactions recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Exchange Skill</th>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Synergy</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {proposals.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {p.targetSkill?.title || 'Unknown Post'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{p.requester?.name || 'User'}</span>
                        <span className="text-[11px] text-slate-400">{p.requester?.email || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{p.targetProvider?.name || 'User'}</span>
                        <span className="text-[11px] text-slate-400">{p.targetProvider?.email || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-[#4f46e5]">{p.synergyScore || 50}%</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ⚡ 3. STANDARD LOGGED-IN PEER USER VIEW
  const inboundList = proposals.filter((p) => {
    const providerId = (typeof p.targetProvider === 'object' ? p.targetProvider?._id : p.targetProvider)?.toString();
    return providerId === (user._id || user.id)?.toString();
  });

  const outboundList = proposals.filter((p) => {
    const requesterId = (typeof p.requester === 'object' ? p.requester?._id : p.requester)?.toString();
    return requesterId === (user._id || user.id)?.toString();
  });

  const handleStatusChange = async (proposalId, status) => {
    setUpdatingId(proposalId);
    await updateProposalStatus(proposalId, status);
    setUpdatingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-[calc(100vh-160px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Skill Swaps</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage incoming peer handshakes and accepted sessions.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab('inbound')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'inbound'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inbound Requests ({inboundList.length})
          </button>
          <button
            onClick={() => setActiveTab('outbound')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'outbound'
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Outbound Requests ({outboundList.length})
          </button>
        </div>
      </div>

      {/* Cards List */}
      {loadingProposals ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 mt-3">Loading swaps...</p>
        </div>
      ) : (activeTab === 'inbound' ? inboundList : outboundList).length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs space-y-3">
          <span className="text-4xl">{activeTab === 'inbound' ? '🤝' : '📤'}</span>
          <h3 className="text-base font-extrabold text-slate-800">
            {activeTab === 'inbound' ? 'No Incoming Swaps Found' : 'No Sent Proposals Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'inbound'
              ? 'When other peer learners request a swap with your posted skills, they will appear here.'
              : 'Browse Explore Hub to find peer skills and initiate your first mutual swap!'}
          </p>
          {activeTab === 'outbound' && (
            <Link
              to="/explore"
              className="inline-block bg-[#4f46e5] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#4338ca] transition mt-2"
            >
              Explore Skill Hub
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === 'inbound' ? inboundList : outboundList).map((item) => {
            const isAccepted = item.status === 'Accepted';
            const isCancelled = item.status === 'Cancelled';
            const peer = activeTab === 'inbound' ? item.requester : item.targetProvider;
            const skillTitle = item.targetSkill?.title || 'Skill Exchange';

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#eef2ff] text-[#4f46e5] text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      Synergy: {item.synergyScore || 50}%
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{skillTitle}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {activeTab === 'inbound' ? 'Requested by:' : 'Target Mentor:'}{' '}
                      <span className="text-slate-900 font-bold">{peer?.name || 'Peer Member'}</span>
                    </p>
                  </div>

                  {/* Contact Unlocked on Acceptance */}
                  {isAccepted && peer?.email && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">Direct Email:</span>
                        <a href={`mailto:${peer.email}`} className="font-extrabold text-emerald-700 hover:underline">
                          {peer.email}
                        </a>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <a
                          href="https://meet.google.com/new"
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded-lg text-center transition"
                        >
                          📹 Meet
                        </a>
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                            skillTitle
                          )}&add=${peer.email}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[11px] font-bold py-1.5 rounded-lg text-center transition"
                        >
                          📅 Calendar
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Moderation Cancelled Banner */}
                  {isCancelled && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs space-y-1">
                      <strong className="text-rose-800 font-black">⚠️ Request Cancelled</strong>
                      <p className="text-rose-700 text-[11px]">{item.cancellationReason || 'Skill post was removed by platform moderation.'}</p>
                    </div>
                  )}
                </div>

                {/* Inbound Action Controls */}
                {activeTab === 'inbound' && item.status === 'Transmitted' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleStatusChange(item._id, 'Accepted')}
                      disabled={updatingId === item._id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {updatingId === item._id ? 'Accepting...' : '✓ Accept Swap'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(item._id, 'Declined')}
                      disabled={updatingId === item._id}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySwaps;