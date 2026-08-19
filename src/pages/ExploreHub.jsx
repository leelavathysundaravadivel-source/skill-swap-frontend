import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BsTrash3Fill } from 'react-icons/bs';

const CATEGORIES = [
  'All',
  'Development',
  'Design',
  'Cloud & Infrastructure',
  'Cyber Security',
  'Marketing',
  'Data & Analytics',
  'Business'
];

const ExploreHub = () => {
  const { user, savedSkillIds, toggleSaveSkill, proposals, fetchProposals } = useContext(AppContext);
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [isListening, setIsListening] = useState(false);

  // Swap Modal States
  const [swapModalSkill, setSwapModalSkill] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const isLoggedIn = Boolean(user && user.name);
  const isAdmin = user?.role === 'admin';
  // ⚡ ONLY standard logged-in users can post skills
  const isPeerUser = isLoggedIn && !isAdmin;

  // Post Skill Modal States & Validation
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postErrorMessage, setPostErrorMessage] = useState('');
  const [postFormData, setPostFormData] = useState({
    title: '',
    category: 'Development',
    level: 'Intermediate',
    description: '',
    offers: '',
    requests: ''
  });

  // Edit Skill Modal States
  const [editSkillState, setEditSkillState] = useState(null);
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Development',
    level: 'Intermediate',
    description: '',
    offers: '',
    requests: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation Modal States
  const [deleteModalState, setDeleteModalState] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Validation Regular Expressions
  const skillsRegex = /^[a-zA-Z0-9\s,]+$/;

  // Helper: Count words in text
  const countWords = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  useEffect(() => {
    if (isPostModalOpen || deleteModalState || editSkillState || swapModalSkill) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPostModalOpen, deleteModalState, editSkillState, swapModalSkill]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/skills');
      const data = await res.json();
      if (res.ok) {
        setSkills(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch catalog from database.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Unable to connect to backend server. Make sure skillswap-backend is running.');
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
    if (directMatch) return 100;

    return 75;
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.replace(/[.,!?]+$/, '').trim();
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  // ⚡ HANDLER: Confirm & Transmit Swap Proposal
  const handleConfirmSwap = async () => {
    if (!swapModalSkill) return;

    setIsTransmitting(true);
    try {
      const token = localStorage.getItem('skillswap_token');

      const providerId =
        (typeof swapModalSkill.provider === 'object'
          ? swapModalSkill.provider?._id || swapModalSkill.provider?.id
          : swapModalSkill.provider) ||
        (typeof swapModalSkill.user === 'object'
          ? swapModalSkill.user?._id || swapModalSkill.user?.id
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
          synergyScore
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
      console.error('Swap dispatch error:', err);
      alert('Unable to transmit swap request.');
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCloseSwapModal = () => {
    setSwapModalSkill(null);
    setSwapSuccess(false);
  };

  // ⚡ HANDLER: Post New Skill (With Full Form & Word Limit Validations)
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const cleanTitle = postFormData.title.trim();
    const cleanDescription = postFormData.description.trim();
    const cleanOffers = postFormData.offers.trim();
    const cleanRequests = postFormData.requests.trim();

    // 1. Mandatory & Empty Space Check
    if (!cleanTitle || !cleanDescription || !cleanOffers || !cleanRequests) {
      setPostErrorMessage('⚠️ All fields are mandatory. Please fill in all details before submitting.');
      return;
    }

    // 2. 1000 Words Limit Check
    const wordCount = countWords(cleanDescription);
    if (wordCount > 1000) {
      setPostErrorMessage(`⚠️ Description exceeds the 1000-word limit (current: ${wordCount} words).`);
      return;
    }

    // 3. Comma Delimiter Checks
    if (!skillsRegex.test(cleanOffers)) {
      setPostErrorMessage('⚠️ "Skills You Offer" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    if (!skillsRegex.test(cleanRequests)) {
      setPostErrorMessage('⚠️ "Skills You Seek" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    setIsPosting(true);
    setPostErrorMessage('');
    const token = localStorage.getItem('skillswap_token');

    try {
      const res = await fetch('http://localhost:5000/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: cleanTitle,
          category: postFormData.category,
          level: postFormData.level,
          description: cleanDescription,
          offers: cleanOffers,
          requests: cleanRequests
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSkills((prev) => [data.data, ...prev]);
        setPostSuccess(true);
      } else {
        setPostErrorMessage(data.message || 'Failed to create skill post.');
      }
    } catch (err) {
      console.error('Create post error:', err);
      setPostErrorMessage('Failed to save skill post to database.');
    } finally {
      setIsPosting(false);
    }
  };

  // ⚡ HANDLER: Edit Existing Skill
  const openEditModal = (item) => {
    setEditErrorMessage('');
    setEditSkillState(item);
    setEditFormData({
      title: item.title || '',
      category: item.category || 'Development',
      level: item.level || 'Intermediate',
      description: item.description || '',
      offers: item.offers || '',
      requests: item.requests || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSkillState) return;

    const cleanTitle = editFormData.title.trim();
    const cleanDescription = editFormData.description.trim();
    const cleanOffers = editFormData.offers.trim();
    const cleanRequests = editFormData.requests.trim();

    if (!cleanTitle || !cleanDescription || !cleanOffers || !cleanRequests) {
      setEditErrorMessage('⚠️ All fields are mandatory. Please fill in all details before submitting.');
      return;
    }

    const wordCount = countWords(cleanDescription);
    if (wordCount > 1000) {
      setEditErrorMessage(`⚠️ Description exceeds the 1000-word limit (current: ${wordCount} words).`);
      return;
    }

    if (!skillsRegex.test(cleanOffers)) {
      setEditErrorMessage('⚠️ "Skills You Offer" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    if (!skillsRegex.test(cleanRequests)) {
      setEditErrorMessage('⚠️ "Skills You Seek" accepts only comma (,) as delimiter. Special symbols are not allowed.');
      return;
    }

    setIsUpdating(true);
    setEditErrorMessage('');
    const token = localStorage.getItem('skillswap_token');

    try {
      const res = await fetch(`http://localhost:5000/api/skills/${editSkillState._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: cleanTitle,
          category: editFormData.category,
          level: editFormData.level,
          description: cleanDescription,
          offers: cleanOffers,
          requests: cleanRequests
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSkills((prev) => prev.map((s) => (s._id === editSkillState._id ? data.data : s)));
        setEditSkillState(null);
      } else {
        setEditErrorMessage(data.message || 'Failed to update post.');
      }
    } catch (err) {
      console.error('Update post error:', err);
      setEditErrorMessage('Failed to update skill post.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveClick = (skillId) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    toggleSaveSkill(skillId);
  };

  const handleSwapAction = (item) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setSwapSuccess(false);
    setSwapModalSkill(item);
  };

  const openDeleteModal = (skill, isOwner, isAdmin) => {
    setDeleteReason('');
    setDeleteSuccess(false);
    setDeleteModalState({ skill, isOwner, isAdmin });
  };

  const confirmDeleteSkill = async () => {
    if (!deleteModalState) return;
    const { skill, isOwner } = deleteModalState;

    if (isAdmin && !isOwner && !deleteReason.trim()) {
      alert('Please provide a reason for moderation removal.');
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('skillswap_token');
      const res = await fetch(`http://localhost:5000/api/skills/${skill._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: deleteReason || 'User requested deletion' })
      });

      if (res.ok) {
        setDeleteSuccess(true);
        setSkills((prev) => prev.filter((item) => item._id !== skill._id));
        if (fetchProposals) fetchProposals();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete post.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSkills = skills.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

    const cleanQuery = searchQuery
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .trim();

    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    let matchesSearch = true;
    if (queryWords.length > 0) {
      const cardContent = `${item.title} ${item.description} ${item.category} ${item.providerName || ''} ${item.offers} ${item.requests}`.toLowerCase();
      matchesSearch = queryWords.some((word) => cardContent.includes(word));
    }

    return matchesCategory && matchesSearch;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (selectedSort === 'TitleAsc') return a.title.localeCompare(b.title);
    if (selectedSort === 'TitleDesc') return b.title.localeCompare(a.title);
    return 0;
  });

  // Calculate remaining words for Post modal description
  const postWordsUsed = countWords(postFormData.description);
  const postWordsRemaining = 1000 - postWordsUsed;

  // Calculate remaining words for Edit modal description
  const editWordsUsed = countWords(editFormData.description);
  const editWordsRemaining = 1000 - editWordsUsed;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-[calc(100vh-160px)]">
      
      {/* Header & Post CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Hub</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Discover peer-to-peer technical knowledge exchanges in real time.
          </p>
        </div>

        {/* ⚡ POST SKILL OFFER BUTTON: STRICTLY FOR PEER USERS (NOT ADMIN / NOT GUEST) */}
        {isPeerUser && (
          <button
            onClick={() => {
              setPostSuccess(false);
              setPostErrorMessage('');
              setPostFormData({
                title: '',
                category: 'Development',
                level: 'Intermediate',
                description: '',
                offers: '',
                requests: ''
              });
              setIsPostModalOpen(true);
            }}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Post Skill Offer</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative flex items-center">
          <span className="absolute left-4 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search coding skills, keywords, or tracks..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#4f46e5]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={handleVoiceSearch}
          className={`md:col-span-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
              : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200/80 text-slate-700'
          }`}
        >
          <span>🎙️</span>
          <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
        </button>

        <div className="md:col-span-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Catalog' : cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="Default">Default Catalogue Order</option>
            <option value="TitleAsc">Alphabetical (A - Z)</option>
            <option value="TitleDesc">Alphabetical (Z - A)</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading catalog from MongoDB Atlas...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs font-bold text-rose-700">{error}</p>
          <button onClick={fetchSkills} className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
            Retry Connection
          </button>
        </div>
      ) : sortedSkills.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs">
          <p className="text-xs font-semibold text-slate-400">No matching skill posts found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSkills.map((item) => {
            const isSaved = savedSkillIds?.includes(item._id);

            const currentUserId = (user?._id || user?.id || '').toString().toLowerCase();
            const currentUserName = (user?.name || '').trim().toLowerCase();

            const itemProviderId = (
              typeof item.provider === 'object'
                ? item.provider?._id || item.provider?.id
                : item.provider
            )?.toString().toLowerCase();

            const itemProviderName = (
              item.providerName ||
              (typeof item.provider === 'object' ? item.provider?.name : '') ||
              (typeof item.provider === 'string' ? item.provider : '')
            ).trim().toLowerCase();

            const isOwner = Boolean(
              (currentUserId && itemProviderId && currentUserId === itemProviderId) ||
              (currentUserName && itemProviderName && currentUserName === itemProviderName)
            );

            const canDelete = isOwner || isAdmin;

            const existingProposal = proposals?.find((p) => {
              const targetSkillId = (
                typeof p.targetSkill === 'object' ? p.targetSkill?._id || p.targetSkill?.id : p.targetSkill
              )?.toString();
              return targetSkillId === item._id?.toString();
            });

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="bg-[#eef2ff] text-[#4f46e5] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSaveClick(item._id)}
                      className={`border text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isSaved && isLoggedIn
                          ? 'bg-indigo-50 border-indigo-300 text-[#4f46e5]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ★ {isSaved && isLoggedIn ? 'Saved' : 'Save'}
                    </button>

                    {isLoggedIn && isOwner && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    )}

                    {isLoggedIn && canDelete && (
                      <button
                        onClick={() => openDeleteModal(item, isOwner, isAdmin)}
                        className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                        title={isAdmin && !isOwner ? 'Admin Moderation Remove' : 'Delete Skill Post'}
                      >
                        <BsTrash3Fill className="text-rose-600 text-sm" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Shared by: <span className="text-slate-900 font-bold">{item.providerName || 'User'}</span> ({item.level || 'Intermediate'})
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="bg-[#f8fafc] border border-slate-100 p-3.5 rounded-xl text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">OFFERS:</span>
                    <span className="font-bold text-slate-900 block leading-tight">{item.offers}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SEEKING:</span>
                    <span className="font-bold text-[#4f46e5] block leading-tight">{item.requests}</span>
                  </div>
                </div>

                {/* ⚡ SWAP ACTION CTA */}
                {!isOwner && !isAdmin && (
                  <div>
                    {!isLoggedIn ? (
                      <Link
                        to="/login"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <span>🔑 Log In to Start SkillSwap</span>
                      </Link>
                    ) : existingProposal ? (
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
                        onClick={() => handleSwapAction(item)}
                        className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold py-3 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <span>🤝 Initiate Swap Match</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ⚡ MODAL 1: POST SKILL (WITH LIVE 1000-WORD COUNTER & STRICT VALIDATIONS) */}
      {isPostModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 my-auto">
              
              {postSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto font-black shadow-inner">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Skill Published Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
                      Your skill offer <strong>"{postFormData.title}"</strong> is now live on Explore Hub.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPostModalOpen(false);
                      setPostSuccess(false);
                    }}
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold py-3.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    Done & View Catalog
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsPostModalOpen(false)}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer transition"
                  >
                    ✕
                  </button>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Publish a Skill Offer
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Broadcast your expertise to the SkillSwap community.
                    </p>
                  </div>

                  {/* Validation Error Banner */}
                  {postErrorMessage && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl animate-in fade-in flex items-center gap-2">
                      <span>{postErrorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handlePostSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="block mb-1.5 text-slate-800 font-bold">Offer Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Java 21 & Spring Boot Microservices"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                        value={postFormData.title}
                        onChange={(e) => {
                          setPostFormData({ ...postFormData, title: e.target.value });
                          if (postErrorMessage) setPostErrorMessage('');
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1.5 text-slate-800 font-bold">Category</label>
                        <select
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                          value={postFormData.category}
                          onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                        >
                          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1.5 text-slate-800 font-bold">Experience Level</label>
                        <select
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                          value={postFormData.level}
                          onChange={(e) => setPostFormData({ ...postFormData, level: e.target.value })}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-slate-800 font-bold">Offer Description</label>
                        <span
                          className={`text-[10px] font-extrabold ${
                            postWordsRemaining < 0
                              ? 'text-rose-600'
                              : postWordsRemaining < 50
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {postWordsRemaining >= 0
                            ? `${postWordsRemaining} words remaining`
                            : `${Math.abs(postWordsRemaining)} words over limit`}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Describe what topic or project goals you will teach..."
                        className={`w-full p-3 bg-slate-50 border rounded-xl text-xs font-normal focus:outline-none focus:bg-white ${
                          postWordsRemaining < 0
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#4f46e5]'
                        }`}
                        value={postFormData.description}
                        onChange={(e) => {
                          setPostFormData({ ...postFormData, description: e.target.value });
                          if (postErrorMessage) setPostErrorMessage('');
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-800 font-bold">Skills You Offer</label>
                        <span className="text-[10px] text-slate-400 font-medium">Comma (,) delimiter only</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Java 21, Spring Boot, Microservices"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                        value={postFormData.offers}
                        onChange={(e) => {
                          setPostFormData({ ...postFormData, offers: e.target.value });
                          if (postErrorMessage) setPostErrorMessage('');
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-800 font-bold">Skills You Seek</label>
                        <span className="text-[10px] text-slate-400 font-medium">Comma (,) delimiter only</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. GCP, AWS, Kubernetes"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                        value={postFormData.requests}
                        onChange={(e) => {
                          setPostFormData({ ...postFormData, requests: e.target.value });
                          if (postErrorMessage) setPostErrorMessage('');
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPosting}
                      className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer mt-2 disabled:opacity-50"
                    >
                      {isPosting ? 'Publishing...' : 'Publish Skill Post'}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>,
          document.body
        )}

      {/* ⚡ MODAL 2: EDIT SKILL (WITH VALIDATIONS & WORD COUNTER) */}
      {editSkillState &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 my-auto">
              <button
                onClick={() => setEditSkillState(null)}
                disabled={isUpdating}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer transition"
              >
                ✕
              </button>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Edit Skill Offer
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Update your post details and swap requirements.
                </p>
              </div>

              {editErrorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl animate-in fade-in flex items-center gap-2">
                  <span>{editErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1.5 text-slate-800 font-bold">Offer Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                    value={editFormData.title}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, title: e.target.value });
                      if (editErrorMessage) setEditErrorMessage('');
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5 text-slate-800 font-bold">Category</label>
                    <select
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    >
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-800 font-bold">Experience Level</label>
                    <select
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                      value={editFormData.level}
                      onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-slate-800 font-bold">Offer Description</label>
                    <span
                      className={`text-[10px] font-extrabold ${
                        editWordsRemaining < 0
                          ? 'text-rose-600'
                          : editWordsRemaining < 50
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {editWordsRemaining >= 0
                        ? `${editWordsRemaining} words remaining`
                        : `${Math.abs(editWordsRemaining)} words over limit`}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className={`w-full p-3 bg-slate-50 border rounded-xl text-xs font-normal focus:outline-none focus:bg-white ${
                      editWordsRemaining < 0
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#4f46e5]'
                    }`}
                    value={editFormData.description}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, description: e.target.value });
                      if (editErrorMessage) setEditErrorMessage('');
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-800 font-bold">Skills You Offer</label>
                    <span className="text-[10px] text-slate-400 font-medium">Comma (,) delimiter only</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                    value={editFormData.offers}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, offers: e.target.value });
                      if (editErrorMessage) setEditErrorMessage('');
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-800 font-bold">Skills You Seek</label>
                    <span className="text-[10px] text-slate-400 font-medium">Comma (,) delimiter only</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:bg-white focus:border-[#4f46e5]"
                    value={editFormData.requests}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, requests: e.target.value });
                      if (editErrorMessage) setEditErrorMessage('');
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditSkillState(null)}
                    disabled={isUpdating}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ⚡ MODAL 3: DELETE (WITH IN-APP CONFIRMATION SCREEN) */}
      {deleteModalState &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 my-auto">
              
              {deleteSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center text-3xl mx-auto font-black shadow-inner">
                    🗑️
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Skill Post Removed!
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
                      The post <strong>"{deleteModalState.skill.title}"</strong> has been removed from the catalog.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteModalState(null);
                      setDeleteSuccess(false);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-3.5 rounded-xl transition cursor-pointer"
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setDeleteModalState(null)}
                    disabled={isDeleting}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer transition"
                  >
                    ✕
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {deleteModalState.isAdmin && !deleteModalState.isOwner
                          ? 'Admin Moderation Delete'
                          : 'Delete Skill Post'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        This action is permanent and cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      TARGET POST
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {deleteModalState.skill.title}
                    </p>
                    <p className="text-slate-500 font-medium">
                      Shared by: <span className="font-bold text-slate-800">{deleteModalState.skill.providerName || 'User'}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-slate-800">
                      {deleteModalState.isAdmin && !deleteModalState.isOwner
                        ? 'Reason for Moderation Removal (Required)'
                        : 'Reason for deletion (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        deleteModalState.isAdmin && !deleteModalState.isOwner
                          ? 'e.g. Violation of community guidelines'
                          : 'e.g. Topic no longer available'
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:border-rose-500"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeleteModalState(null)}
                      disabled={isDeleting}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteSkill}
                      disabled={isDeleting}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>,
          document.body
        )}

      {/* ⚡ MODAL 4: INITIATE SWAP */}
      {swapModalSkill &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6">
              
              {swapSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-3xl flex items-center justify-center text-3xl mx-auto font-black shadow-lg shadow-emerald-500/20">
                    ⚡
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Swap Handshake Transmitted!
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                    Your exchange proposal for <strong>"{swapModalSkill.title}"</strong> has been sent to <strong>{swapModalSkill.providerName || 'Mentor'}</strong>.
                  </p>
                  <div className="pt-4 flex flex-col gap-2">
                    <Link
                      to="/swaps"
                      onClick={handleCloseSwapModal}
                      className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-extrabold py-3.5 rounded-xl transition shadow-md shadow-indigo-500/20 text-center"
                    >
                      Track Request in My Swaps ➔
                    </Link>
                    <button
                      onClick={handleCloseSwapModal}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                    >
                      Continue Browsing Catalog
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-black tracking-tight">Initiate Swap Proposal</h3>
                    <button
                      onClick={handleCloseSwapModal}
                      className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                        Calculated Synergy
                      </span>
                      <span className="text-xs font-extrabold text-indigo-400">
                        {calculateSynergy(swapModalSkill) === 100 ? 'Perfect Match' : 'Complementary Match'}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-indigo-400">
                      {calculateSynergy(swapModalSkill)}%
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                      Target Provider
                    </span>
                    <p className="font-extrabold text-white">
                      {swapModalSkill.providerName || swapModalSkill.user?.name || 'Peer Learner'}
                    </p>
                    <p className="text-slate-400">Skill: {swapModalSkill.title}</p>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                      Your Context Profile
                    </span>
                    <p className="font-extrabold text-white">{user?.name} (You)</p>
                    <p className="text-slate-400">Supplies: {user?.offerSkill || user?.offers || 'N/A'}</p>
                  </div>

                  <button
                    onClick={handleConfirmSwap}
                    disabled={isTransmitting}
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold py-3.5 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTransmitting ? 'Transmitting Proposal...' : 'Initiate Swap Match'}
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

export default ExploreHub;