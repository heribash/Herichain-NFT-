import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import PreLoginModal from '@/components/PreLoginModal';
import PersonalHeirsPage from '@/components/PersonalHeirsPage';
import Marketplace from '@/components/Marketplace';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPreLoginModal, setShowPreLoginModal] = useState(false);
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referralCode', refCode);
    }
    
    const savedUser = localStorage.getItem('herichain_user');
    const hasSeenModal = sessionStorage.getItem('herichain_has_seen_modal');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (!hasSeenModal && location.pathname === '/') {
      setShowPreLoginModal(true);
    }
  }, [location.pathname]);

  const updateUser = (updatedData) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('herichain_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  useEffect(() => {
    if (account && user && user.walletAddress !== account.address) {
      updateUser({ walletAddress: account.address });
    } else if (account && !user) {
      const userData = {
        id: account.address,
        name: account.address.slice(0, 6),
        email: `wallet-user-${account.address.slice(0, 6)}@herichain.io`,
        walletAddress: account.address,
        joinDate: new Date().toISOString()
      };
      handleLogin(userData);
      setShowPreLoginModal(false); // Hide modal on wallet connect
    }
  }, [account, user]);

  const handleLogin = (userData) => {
    const referralCode = sessionStorage.getItem('referralCode');
    const isReferred = !!referralCode;

    const isNewUser = !localStorage.getItem('herichain_user') || JSON.parse(localStorage.getItem('herichain_user')).id !== userData.id;

    let finalUser;

    if (isNewUser) {
       finalUser = {
        ...userData,
        referralCode: userData.referralCode || `herichain-${uuidv4().slice(0, 8)}`,
        mintsRemaining: 10, // New users always get 10 mints
        referredBy: referralCode || null,
      };
      if (isReferred) {
        // In a real app, you'd call a backend function here to credit the referrer.
        // For now, we'll simulate it with a toast message.
        console.log(`Referral successful! User with code ${referralCode} should be credited 30 mints.`);
        toast({
          title: "Referral Success! 🎉",
          description: "Your friend has joined! The sender has been credited with 30 bonus mints.",
        });
      }
    } else {
      const existingUser = JSON.parse(localStorage.getItem('herichain_user'));
      finalUser = { ...existingUser, ...userData };
    }
    
    setUser(finalUser);
    localStorage.setItem('herichain_user', JSON.stringify(finalUser));
    sessionStorage.removeItem('referralCode');
    setShowAuthModal(false);
    setShowPreLoginModal(false);
  };

  const handleLogout = async () => {
    if (activeWallet) {
      await disconnect(activeWallet);
    }
    setUser(null);
    localStorage.removeItem('herichain_user');
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowPreLoginModal(false);
  };

  const handlePreLoginClose = () => {
    setShowPreLoginModal(false);
    sessionStorage.setItem('herichain_has_seen_modal', 'true');
  };

  const MainContent = () => (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex-grow"
        >
          <Dashboard user={user} onUpdateUser={updateUser} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex-grow"
        >
          <LandingPage onGetStarted={() => openAuth('signup')} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        <AnimatePresence>
          {showPreLoginModal && location.pathname === '/' && (
            <PreLoginModal 
              onClose={handlePreLoginClose} 
              onGetStarted={() => openAuth('signup')} 
            />
          )}
        </AnimatePresence>

        <Header 
          user={user} 
          onLogin={() => openAuth('login')} 
          onSignup={() => openAuth('signup')} 
          onLogout={handleLogout} 
        />
        
        <main className="flex flex-col flex-grow">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/heirs" element={<PersonalHeirsPage />} />
            <Route path="/marketplace" element={<Marketplace user={user} onUpdateUser={updateUser} />} />
          </Routes>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onLogin={handleLogin}
          onSwitchMode={setAuthMode}
        />

        <Toaster />
      </div>
    </>
  );
}

export default App;