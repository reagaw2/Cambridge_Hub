import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { preloadStore } from '@/lib/topicStore';
import { preloadCSStore } from '@/lib/csTopicStore';

function applyColorScheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
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
        setUser(mappedUser);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);

        const userEmail = session.user.email;
        const userId = session.user.id;

        if (userEmail && userId) {
          const physicsHasCache = !!localStorage.getItem(`hub_student_progress_${userEmail}`);
          const csHasCache = !!localStorage.getItem(`hub_cs_progress_${userEmail}`);

          if (!physicsHasCache || !csHasCache) {
            setIsLoadingProgress(true);
          }

          try {
            await Promise.all([
              preloadStore(userEmail, userId),
              preloadCSStore(userEmail, userId),
            ]);
          } catch (err) {
            console.error('[Auth] Failed to preload progress:', err);
          }
          setIsLoadingProgress(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
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
    if (user?.email) {
      localStorage.removeItem(`hub_student_progress_${user.email}`);
      localStorage.removeItem(`hub_cs_progress_${user.email}`);
    }
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