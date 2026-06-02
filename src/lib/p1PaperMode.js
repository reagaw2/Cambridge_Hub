/**
 * p1PaperMode.js — tracks whether each P1 paper has been attempted and in what mode.
 *
 * Keys are scoped per-user. We use getSessionUserId() (set by AuthContext immediately
 * on login) as the primary source. This is always accurate for authenticated users.
 * The Supabase localStorage cache is a secondary fallback.
 */

import { getSessionUserId } from "@/lib/userSession";

function getCurrentUserId() {
  // 1. Primary: use the module-level session variable set by AuthContext on login.
  //    This is always correct for any authenticated user.
  const uid = getSessionUserId();
  if (uid && uid !== "anon") return uid;

  // 2. Secondary: parse Supabase's own auth-token from localStorage.
  //    Useful during the brief window before AuthContext fires.
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
      if (raw) {
        const authData = JSON.parse(raw);
        const userId = authData?.user?.id;
        if (userId) return userId;
      }
    }
  } catch {}

  // 3. Last resort — should never happen for authenticated pages.
  //    Using a random session key means no cross-user contamination even in this case.
  return `anon_${Math.random().toString(36).slice(2)}`;
}

function key(paperId) {
  const uid = getCurrentUserId();
  return `p1_paper_mode_${uid}_${(paperId ?? "").replace(/\//g, "_")}`;
}

/**
 * Returns "practice" | "exam" | null
 * null  = never attempted by THIS user → Exam mode still available
 * "practice" / "exam" = already attempted by THIS user → locked to Practice mode
 */
export function getPaperMode(paperId) {
  try { return localStorage.getItem(key(paperId)) ?? null; } catch { return null; }
}

/**
 * Record that a paper has been started in a given mode by THIS user.
 */
export function setPaperMode(paperId, mode) {
  try { localStorage.setItem(key(paperId), mode); } catch {}
}

/**
 * Returns true if THIS user has never attempted the paper (Exam mode available).
 */
export function isPaperFresh(paperId) {
  return getPaperMode(paperId) === null;
}
</thinking>

But there's a second problem: old keys written as `p1_paper_mode_anon_...` might already exist in localStorage and interfere. I also need to make sure `setSessionUserId` is called as early as possible in `AuthContext`. Let me check — it already is, but let me make sure it's called **before** the user lands on any page that calls `getPaperMode`:

<dyad-write path="src/lib/AuthContext.jsx" description="Call setSessionUserId immediately when auth state is known, before any async progress loading">
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { preloadStore } from '@/lib/topicStore';
import { preloadCSStore } from '@/lib/csTopicStore';
import { loadAllNotes } from '@/lib/questionNotesStore';
import { setSessionUserId } from '@/lib/userSession';

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

      // ── USER_UPDATED: only refresh metadata, no full reload ────────────────
      if (event === 'USER_UPDATED' && session?.user) {
        const mappedUser = buildUser(session.user);
        if (mappedUser.preferred_name) {
          localStorage.setItem(
            `cambridge_hub_preferred_name_${mappedUser.id}`,
            mappedUser.preferred_name
          );
        }
        setUser(mappedUser);
        return;
      }

      // ── TOKEN_REFRESHED: same user, nothing to do ─────────────────────────
      if (event === 'TOKEN_REFRESHED') return;

      const incomingUserId = session?.user?.id ?? null;

      // ── Set session user ID IMMEDIATELY — before any async work ───────────
      // This ensures p1PaperMode and all stores read the correct user ID
      // the moment any component renders after auth state changes.
      setSessionUserId(incomingUserId);

      // ── If the user is changing, clear stale state ────────────────────────
      if (incomingUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = incomingUserId;

        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(true);
        if (incomingUserId) {
          setIsLoadingProgress(true);
        }
      }

      // ── Load new user ──────────────────────────────────────────────────────
      if (session?.user) {
        const mappedUser = buildUser(session.user);

        if (mappedUser.preferred_name) {
          localStorage.setItem(
            `cambridge_hub_preferred_name_${mappedUser.id}`,
            mappedUser.preferred_name
          );
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

        // Sync notes in background
        loadAllNotes().then(notes => {
          console.log('[Auth] ✓ notes synced from cloud:', Object.keys(notes).length, 'notes');
        }).catch(e => {
          console.warn('[Auth] notes sync failed (non-blocking):', e);
        });

        setUser(mappedUser);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setIsLoadingProgress(false);
      } else {
        // ── Signed out — clear the session user ID ─────────────────────────
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
    // Clear session user ID immediately on logout
    setSessionUserId(null);
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