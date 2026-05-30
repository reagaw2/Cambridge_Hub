/**
 * writtenStarStore.js — star written questions for teacher review.
 * Mirrors the P1 star store but for topical written questions.
 */

const KEY = "written_starred_questions_v1";

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function writeAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function isStarred(questionId) {
  return !!readAll()[questionId];
}

export function toggleStar(questionId, { topic = "", questionText = "", markScheme = "", feedback = null, answer = "" } = {}) {
  const all = readAll();
  if (all[questionId]) {
    delete all[questionId];
    writeAll(all);
    return false;
  }
  all[questionId] = {
    questionId,
    topic,
    questionText,
    markScheme,
    feedback,
    answer,
    starredAt: new Date().toISOString(),
  };
  writeAll(all);
  return true;
}

export function saveTeacherNote(questionId, note) {
  const all = readAll();
  if (all[questionId]) {
    all[questionId].teacherNote = note;
    writeAll(all);
  }
}

export function getAllStarred() {
  return Object.values(readAll());
}