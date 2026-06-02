import { getSessionUserId } from "@/lib/userSession";

/**
 * p1PaperMode.js — tracks whether each P1 paper has been attempted and in what mode.
 * Keys are scoped by user ID so each account has its own independent state.
 */

function key(paperId) {
  const uid = getSessionUserId();
  return `p1_paper_mode_${uid}_${(paperId ?? "").replace(/\//g, "_")}`;
}

/**
 * Returns "practice" | "exam" | null
 * null = never attempted at all → both modes available
 */
export function getPaperMode(paperId) {
  try { return localStorage.getItem(key(paperId)) ?? null; } catch { return null; }
}

/**
 * Record that a paper has been started in a given mode.
 */
export function setPaperMode(paperId, mode) {
  try { localStorage.setItem(key(paperId), mode); } catch {}
}

/**
 * Returns true if the paper has never been attempted (exam mode available).
 */
export function isPaperFresh(paperId) {
  return getPaperMode(paperId) === null;
}
</thinking>

The fix is one line — `key()` now includes the user ID: `p1_paper_mode_<userId>_<paperId>` instead of `p1_paper_mode_<paperId>`. When a different user logs in their `getSessionUserId()` returns a different value, so they get a completely fresh set of paper mode entries and all papers show as unattempted.

<dyad-chat-summary>Fixed paper mode (Practice/Exam badge) leaking across user accounts by scoping localStorage key by user ID</dyad-chat-summary><dyad-write path="src/lib/p1PaperMode.js" description="Scope paper mode localStorage keys by user ID to prevent cross-account leakage">
import { getSessionUserId } from "@/lib/userSession";

/**
 * p1PaperMode.js — tracks whether each P1 paper has been attempted and in what mode.
 * Keys are scoped by user ID so each account has its own independent state.
 * Once a paper is attempted (in any mode), it is locked to Practice mode going forward.
 * Exam mode is only available for completely fresh, never-attempted papers.
 */

function key(paperId) {
  const uid = getSessionUserId();
  return `p1_paper_mode_${uid}_${(paperId ?? "").replace(/\//g, "_")}`;
}

/**
 * Returns "practice" | "exam" | null
 * null = never attempted at all → both modes available
 * "practice" or "exam" → paper has been attempted → lock to practice
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
 * Returns true if the paper has never been attempted (exam mode available).
 */
export function isPaperFresh(paperId) {
  return getPaperMode(paperId) === null;
}