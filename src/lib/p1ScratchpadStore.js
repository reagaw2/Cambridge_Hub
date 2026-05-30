/**
 * p1ScratchpadStore.js — per-question scratchpad strokes.
 * Intentionally localStorage-only: workings are ephemeral scratch work
 * with no revision value, and stroke arrays are too large to sync efficiently.
 *
 * Session progress, notes, and starred questions sync via their own stores.
 */

function localKey(paperId) {
  return `p1_scratch_${(paperId ?? "").replace(/[\/\s]/g, "_")}`;
}

function readLocal(paperId) {
  try { return JSON.parse(localStorage.getItem(localKey(paperId)) ?? "{}"); } catch { return {}; }
}

function writeLocal(paperId, data) {
  try { localStorage.setItem(localKey(paperId), JSON.stringify(data)); } catch {}
}

/**
 * No-op preload kept so P1Session.jsx doesn't need changing.
 * In the future this could warm the cache from IndexedDB.
 */
export async function loadScratchpadForPaper(paperId) {
  // No remote sync — strokes already in localStorage from last session
}

/** Synchronous read — always returns from localStorage */
export function getStrokesForQuestion(paperId, questionId, side) {
  const paperData = readLocal(paperId);
  return paperData?.[questionId]?.[side] ?? [];
}

/** Save strokes to localStorage immediately */
export function saveStrokes(paperId, questionId, side, strokes) {
  const paperData = readLocal(paperId);
  if (!paperData[questionId]) paperData[questionId] = {};
  paperData[questionId][side] = strokes;
  writeLocal(paperId, paperData);
}