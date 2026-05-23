import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { preloadStore } from '@/lib/topicStore';
import { preloadCSStore } from '@/lib/csTopicStore';

function applyColorScheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
}

/** Resolves after `ms` milliseconds — used as a race-condition timeout */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Runs a promise but never hangs longer than `ms` ms */
async function withTimeout(promise, ms) {
  return Promise.race([promise, timeout(ms)]);
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [authError] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = base44.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] event:', event);

      if (session?.user) {
        const mappedUser = {
          id: session.user.id,
          email: session.user.email,
          onboarding_completed: session.user.user_metadata?.onboarding_completed ?? true,
        };

        const userEmail = session.user.email;
        const userId = session.user.id;

        setIsLoadingProgress(true);

        try {
          // Race each store against an 8-second timeout so a slow DB never hangs the app
          await Promise.all([
            withTimeout(preloadStore(userEmail, userId), 8000),
            withTimeout(preloadCSStore(userEmail, userId), 8000),
          ]);
          console.log('[Auth] ✓ progress loaded');
        } catch (err) {
          console.warn('[Auth] progress load error (continuing anyway):', err);
        }

        setUser(mappedUser);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setIsLoadingProgress(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setIsLoadingProgress(false);
      }
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyColorScheme(mq.matches);
    const handler = (e) => applyColorScheme(e.matches);
    mq.addEventListener('change', handler);

    return () => {
      subscription.unsubscribe();
      mq.removeEventListener('change', handler);
    };
  }, []);

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await base44.auth.signOut();
    } catch (err) {
      console.error('[Auth] Error signing out:', err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsLoadingAuth(false);
  };

  const navigateToLogin = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      isLoadingProgress,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};