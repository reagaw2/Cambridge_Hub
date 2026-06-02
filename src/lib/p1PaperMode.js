/**
 * p1PaperMode.js — tracks whether each P1 paper has been attempted and in what mode.
 * Keys are scoped per-user by reading the user ID directly from Supabase's own
 * localStorage auth cache — this is synchronous and always correct regardless of
 * when the module loads or when AuthContext fires.
 */

/** Reads the current user ID synchronously from Supabase's cached auth token. */
function getCurrentUserId() {
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
  // Absolute fallback — should never happen in practice
  return "anon";
}

function key(paperId) {
  const uid = getCurrentUserId();
  return `p1_paper_mode_${uid}_${(paperId ?? "").replace(/\//g, "_")}`;
}

/**
 * Returns "practice" | "exam" | null
 * null  = never attempted → Exam mode still available
 * "practice" / "exam" = already attempted → locked to Practice mode
 */
export function getPaperMode(paperId) {
  try { return localStorage.getItem(key(paperId)) ?? null; } catch { return null; }
}

/**
 * Record that a paper has been started in a given mode.
 * Call this as soon as the session begins so the lock is set immediately.
 */
export function setPaperMode(paperId, mode) {
  try { localStorage.setItem(key(paperId), mode); } catch {}
}

/**
 * Returns true if the paper has never been attempted (Exam mode available).
 */
export function isPaperFresh(paperId) {
  return getPaperMode(paperId) === null;
}