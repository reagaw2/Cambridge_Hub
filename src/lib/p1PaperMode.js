/**
 * p1PaperMode.js — tracks per-user paper mode (exam available vs practice).
 *
 * localStorage is shared across all users on the same device/browser.
 * We scope every key with the authenticated user's ID.
 * The user ID is read from 'cambridge_hub_current_uid' — a key written by
 * AuthContext immediately on every login, before any component renders.
 */

function getUserIdFromSupabaseToken() {
  // Scan every localStorage key for a Supabase auth token
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const data = JSON.parse(raw);
          const uid = data?.user?.id;
          if (uid) return uid;
        }
      }
    }
  } catch {}
  return null;
}

function getCurrentUserId() {
  // 1. Primary: dedicated key written by AuthContext on every login
  try {
    const uid = localStorage.getItem("cambridge_hub_current_uid");
    if (uid) return uid;
  } catch {}

  // 2. Secondary: scan Supabase's own auth token (any project)
  const fromToken = getUserIdFromSupabaseToken();
  if (fromToken) return fromToken;

  // 3. Last resort: session-stable anonymous ID so reads/writes stay
  //    consistent within one browser tab session — prevents cross-user leaks
  //    even in the (theoretically impossible) unauthenticated render case.
  try {
    let anonId = sessionStorage.getItem("cambridge_hub_anon_uid");
    if (!anonId) {
      anonId = `anon_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("cambridge_hub_anon_uid", anonId);
    }
    return anonId;
  } catch {}

  return "anon_unknown";
}

function storageKey(paperId) {
  const uid = getCurrentUserId();
  return `p1_paper_mode_v2_${uid}_${(paperId ?? "").replace(/\//g, "_")}`;
}

/** Returns "practice" | "exam" | null (null = never started = Exam available) */
export function getPaperMode(paperId) {
  try { return localStorage.getItem(storageKey(paperId)) ?? null; } catch { return null; }
}

/** Call this as soon as a session begins to lock in the mode for this user. */
export function setPaperMode(paperId, mode) {
  try { localStorage.setItem(storageKey(paperId), mode); } catch {}
}

/** Returns true if THIS user has never started this paper. */
export function isPaperFresh(paperId) {
  return getPaperMode(paperId) === null;
}