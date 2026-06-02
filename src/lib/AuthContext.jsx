import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { preloadStore } from '@/lib/topicStore';
import { preloadCSStore } from '@/lib/csTopicStore';
import { loadAllNotes } from '@/lib/questionNotesStore';
import { setSessionUserId } from '@/lib/userSession';

const UID_KEY = 'cambridge_hub_current_uid';

function applyColorScheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout(promise, ms) {
  return Promise.race([promise, timeout(ms)]);
}

function buildUser(supabaseUser) {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: meta.full_name ?? meta.name ?? null,
    preferred_name: meta.preferred_name ?? null,
    onboarding_completed: meta.onboarding_completed ?? true,
  };
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [authError] = useState(null);

  const currentUserIdRef = useRef(null);

  useEffect(() => {
    const { data: { subscription } } = base44.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] event:', event);

      if (event === 'USER_UPDATED' && session?.user) {
        const mappedUser = buildUser(session.user);
        if (mappedUser.preferred_name) {
          localStorage.setItem(`cambridge_hub_preferred_name_${mappedUser.id}`, mappedUser.preferred_name);
        }
        setUser(mappedUser);
        return;
      }

      if (event === 'TOKEN_REFRESHED') return;

      const incomingUserId = session?.user?.id ?? null;

      // ── Write user ID to localStorage IMMEDIATELY ─────────────────────────
      // This is the key fix: p1PaperMode reads 'cambridge_hub_current_uid'
      // synchronously during render. It must already be set by the time
      // any dashboard component calls getPaperMode() or isPaperFresh().
      if (incomingUserId) {
        try { localStorage.setItem(UID_KEY, incomingUserId); } catch {}
      } else {
        // Signed out — remove so the next user doesn't inherit this value
        try { localStorage.removeItem(UID_KEY); } catch {}
        // Also clear the anon session ID so the next user starts fresh
        try { sessionStorage.removeItem('cambridge_hub_anon_uid'); } catch {}
      }

      // Also update the module-level variable for other stores
      setSessionUserId(incomingUserId);

      if (incomingUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = incomingUserId;
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(true);
        if (incomingUserId) setIsLoadingProgress(true);
      }

      if (session?.user) {
        const mappedUser = buildUser(session.user);

        if (mappedUser.preferred_name) {
          localStorage.setItem(`cambridge_hub_preferred_name_${mappedUser.id}`, mappedUser.preferred_name);
        }

        const userEmail = session.user.email;
        const userId = session.user.id;

        try {
          await Promise.all([
            withTimeout(preloadStore(userEmail, userId), 8000),
            withTimeout(preloadCSStore(userEmail, userId), 8000),
          ]);
          console.log('[Auth] ✓ progress loaded');
        } catch (err) {
          console.warn('[Auth] progress load error (continuing anyway):', err);
        }

        loadAllNotes().then(notes => {
          console.log('[Auth] ✓ notes synced:', Object.keys(notes).length);
        }).catch(() => {});

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
    setSessionUserId(null);
    try { localStorage.removeItem(UID_KEY); } catch {}
    try { sessionStorage.removeItem('cambridge_hub_anon_uid'); } catch {}
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};