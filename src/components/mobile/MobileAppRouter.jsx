import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mobileAppFlowService } from '../../services/mobileAppFlowService';
import MobileSplash from './MobileSplash';
import MobileWelcome from './MobileWelcome';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * MobileAppRouter manages the startup sequence for the native app.
 * It sits between the standard Router and the pages.
 */
const MobileAppRouter = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 1. Show splash for a minimum time or until auth is ready
    const timer = setTimeout(() => {
      if (!loading) {
        handleStartupLogic();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleStartupLogic = () => {
    const hasSeenIntro = mobileAppFlowService.getHasSeenIntro();

    if (!hasSeenIntro && !isAuthenticated) {
      setShowWelcome(true);
    }

    setShowSplash(false);
    mobileAppFlowService.updateLastOpenedDate();
  };

  if (showSplash) {
    return <MobileSplash />;
  }

  if (showWelcome && location.pathname === '/') {
    return <MobileWelcome onComplete={() => setShowWelcome(false)} />;
  }

  // Handle automatic routing on root '/'
  if (location.pathname === '/') {
    if (isAuthenticated) {
      const onboardingCompleted = mobileAppFlowService.getOnboardingCompleted();
      if (!onboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    } else if (!showWelcome) {
      // Bypassing Login Screen: Go directly to Onboarding if not authenticated
      const onboardingCompleted = mobileAppFlowService.getOnboardingCompleted();
      if (onboardingCompleted) {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <>
      {children}
    </>
  );
};

export default MobileAppRouter;
