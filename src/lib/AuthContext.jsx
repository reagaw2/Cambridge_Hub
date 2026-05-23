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
  // Start false — Supabase fires onAuthStateChange synchronously for cached
  // sessions, so we never need to pre-spin a loading state here.
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [authError] = useState(null); // kept for API compatibility

  useEffect(() => {
    // Supabase fires this immediately (INITIAL_SESSION or SIGNED_OUT) for the
    // current tab, so isLoadingAuth is resolved on the very first event.
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

        if (session.user.email) {
          setIsLoadingProgress(true);
          try {
            await preloadStore(session.user.email);
            await preloadCSStore(session.user.email);
          } catch (err) {
            console.error('[Auth] Failed to preload progress:', err);
          }
          setIsLoadingProgress(false);
        }
      } else {
        // No session (SIGNED_OUT or no cached token) — stop loading immediately.
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
      }
    });

    // Sync dark mode with OS preference
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

  // Kept for backward compatibility — no-op since we no longer have
  // a Base44 platform login flow.
  const navigateToLogin = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAppState = async () => {
    // no-op — retained so pages that call it don't crash
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false, // always resolved — no Base44 platform check
      isLoadingProgress,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState,
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
