/**
 * examCountdownStore.js — Canvas exam countdown state.
 * Fetches via our server-side API route to avoid CORS/SSL issues.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Returns integer days remaining. Negative = past. 0 = today. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(isoDate);
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.floor((targetMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export async function fetchExamEvents() {
  // Call our own Nitro server route — no CORS or SSL issues
  const res = await fetch("/api/canvas", { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function loadExamCountdown(onRefresh) {
  const cached = readCache();

  const apiPromise = fetchExamEvents()
    .then((fresh) => {
      writeCache(fresh);
      onRefresh?.(fresh);
      return fresh;
    })
    .catch((err) => {
      console.warn("[examCountdown] fetch failed:", err.message);
      return null;
    });

  if (cached) {
    apiPromise.catch(() => {});
    return { events: cached, fromCache: true };
  }

  const fresh = await apiPromise;
  return { events: fresh ?? [], fromCache: false };
}