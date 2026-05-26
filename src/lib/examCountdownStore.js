/**
 * examCountdownStore.js — Exam countdown with manual event entry.
 * Canvas API is unreachable from browser due to ALA's SSL cert.
 * Events are entered manually and stored in localStorage.
 */

const EVENTS_KEY = "exam_countdown_manual_events";

/** Returns integer days remaining. Negative = past. 0 = today. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(isoDate);
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.floor((targetMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
}

export function getManualEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveManualEvents(events) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

export function addManualEvent({ title, type, due_date }) {
  const events = getManualEvents();
  const newEvent = {
    id: `manual_${Date.now()}`,
    title: title.trim(),
    type: type || "Assignment",
    due_date: due_date, // ISO string
  };
  const updated = [...events, newEvent].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  saveManualEvents(updated);
  return updated;
}

export function deleteManualEvent(id) {
  const events = getManualEvents().filter(e => e.id !== id);
  saveManualEvents(events);
  return events;
}

// Kept for compatibility with ExamCountdown component
export async function fetchExamEvents() {
  return getManualEvents();
}

export async function loadExamCountdown(onRefresh) {
  const events = getManualEvents();
  return { events, fromCache: false };
}