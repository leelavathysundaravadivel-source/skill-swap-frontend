import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Unified Helper Functions for Proposal Filtering
export const isUserInbound = (proposal, user) => {
  if (!proposal || !user) return false;
  const currentId = (user._id || user.id || '').toString().toLowerCase();
  const currentName = (user.name || '').trim().toLowerCase();

  const targetId = (
    typeof proposal.targetProvider === 'object'
      ? (proposal.targetProvider?._id || proposal.targetProvider?.id)
      : proposal.targetProvider
  )?.toString().toLowerCase();

  const targetName = (
    (typeof proposal.targetProvider === 'object' ? proposal.targetProvider?.name : '') ||
    proposal.targetSkill?.providerName ||
    ''
  ).trim().toLowerCase();

  return Boolean(
    (currentId && targetId && currentId === targetId) ||
    (currentName && targetName && currentName === targetName)
  );
};

export const isUserOutbound = (proposal, user) => {
  if (!proposal || !user) return false;
  const currentId = (user._id || user.id || '').toString().toLowerCase();
  const currentName = (user.name || '').trim().toLowerCase();

  const reqId = (
    typeof proposal.requester === 'object'
      ? (proposal.requester?._id || proposal.requester?.id)
      : proposal.requester
  )?.toString().toLowerCase();

  const reqName = (
    typeof proposal.requester === 'object' ? proposal.requester?.name : ''
  )?.trim().toLowerCase();

  return Boolean(
    (currentId && reqId && currentId === reqId) ||
    (currentName && reqName && currentName === reqName)
  );
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('skillswap_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return typeof parsed === 'object' && parsed !== null && parsed.name ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [savedSkillIds, setSavedSkillIds] = useState([]);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('skillswap_token');
    if (token && token.includes('.')) {
      verifyAndLoadSession(token);
    } else {
      logout();
    }
  }, []);

  const verifyAndLoadSession = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.user) {
        const fullUser = { ...data.user, isLoggedIn: true };
        setUser(fullUser);
        localStorage.setItem('skillswap_user', JSON.stringify(fullUser));
        setSavedSkillIds(data.user.savedSkills || []);
        fetchProposals(token);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Session verification error:', err);
    }
  };

  const fetchProposals = async (token) => {
    const authToken = token || localStorage.getItem('skillswap_token');
    if (!authToken || !authToken.includes('.')) return;

    try {
      const res = await fetch('http://localhost:5000/api/swaps', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProposals(data.data || []);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('fetchProposals Error:', err);
    }
  };

  // ASYNC LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      const fullUser = { ...data.user, isLoggedIn: true };
      
      localStorage.setItem('skillswap_token', data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(fullUser));

      setUser(fullUser);
      setSavedSkillIds(data.user?.savedSkills || []);
      fetchProposals(data.token);

      return data;
    } catch (err) {
      console.error('Login Error:', err.message);
      throw err;
    }
  };

  // ADDED MISSING REGISTER FUNCTION
  const register = async (formData) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          offerSkill: formData.offerSkill,
          seekSkill: formData.seekSkill
        })
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.message || 'Registration failed.');
      }

      const fullUser = { ...data.user, isLoggedIn: true };

      localStorage.setItem('skillswap_token', data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(fullUser));

      setUser(fullUser);
      setSavedSkillIds(data.user?.savedSkills || []);
      fetchProposals(data.token);

      return data;
    } catch (err) {
      console.error('Registration Error:', err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    setUser(null);
    setSavedSkillIds([]);
    setProposals([]);
  };

  const toggleSaveSkill = async (skillId) => {
    const token = localStorage.getItem('skillswap_token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/skills/${skillId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSavedSkillIds(data.savedSkills);
      }
    } catch (err) {
      console.error('toggleSaveSkill Error:', err);
    }
  };

  // Compute Unread Count using Unified Helper
  const unreadCount = proposals.filter(
    (p) => isUserInbound(p, user) && p.status === 'Transmitted'
  ).length;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        savedSkillIds,
        proposals,
        unreadCount,
        login,
        register, // EXPOSED REGISTER IN CONTEXT VALUE
        logout,
        toggleSaveSkill,
        fetchProposals
      }}
    >
      {children}
    </AppContext.Provider>
  );
};