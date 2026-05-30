/**
 * topicalWorkingsStore.js — stores canvas drawings per question for topical practice pages.
 * Separate from p1WorkingsStore which is P1 paper-specific.
 */

const KEY = "topical_workings_v1";

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function writeAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function getWorking(questionId) {
  return readAll()[questionId] ?? null;
}

export function saveWorking(questionId, imageData) {
  const all = readAll();
  all[questionId] = { imageData, savedAt: new Date().toISOString() };
  writeAll(all);
}

export function deleteWorking(questionId) {
  const all = readAll();
  delete all[questionId];
  writeAll(all);
}

export function getAllWorkings() {
  return readAll();
}