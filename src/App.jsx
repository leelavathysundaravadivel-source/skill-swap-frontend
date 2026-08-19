import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import ExploreHub from './pages/ExploreHub';
import SavedSkills from './pages/SavedSkills';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import MySwaps from './pages/MySwaps';
// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('skillswap_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            {/* <Route path="/about" element={<About />} /> */}
            <Route path="/explore" element={<ExploreHub />} />
            <Route path="/saved" element={<SavedSkills />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/swaps" element={<MySwaps />} />
            {/* PROTECTED ROUTES */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;