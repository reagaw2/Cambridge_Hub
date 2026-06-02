/**
 * p1PaperMode.js — tracks whether each P1 paper has been attempted and in what mode.
 * Once a paper is attempted (in any mode), it is locked to Practice mode going forward.
 * Exam mode is only available for completely fresh, never-attempted papers.
 */

function key(paperId) {
  return `p1_paper_mode_${(paperId ?? "").replace(/\//g, "_")}`;
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