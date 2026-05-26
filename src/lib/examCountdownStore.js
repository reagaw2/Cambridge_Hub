/**
 * examCountdownStore.js — Canvas exam countdown state.
 * Cache-first: loads from localStorage instantly, then refreshes from the API.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Returns integer days remaining. 0 if today or past. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  // Strip time — compare calendar days only
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/** Read the cache from localStorage. Returns null if expired or missing. */
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

/** Write data to the cache. */
function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

/** Fetch from our Nitro proxy route. */
export async function fetchExamEvents() {
  const res = await fetch("/api/canvas");
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  return res.json();
}

/**
 * loadExamCountdown — cache-first loader.
 * Returns { events, fromCache } immediately if cache exists,
 * then calls onRefresh with fresh data once the API responds.
 *
 * Usage:
 *   const { events, fromCache } = await loadExamCountdown(freshEvents => setEvents(freshEvents));
 */
export async function loadExamCountdown(onRefresh) {
  const cached = readCache();

  // Kick off the API call in background regardless
  const apiPromise = fetchExamEvents()
    .then((fresh) => {
      writeCache(fresh);
      onRefresh?.(fresh);
      return fresh;
    })
    .catch((err) => {
      console.warn("[examCountdown] API fetch failed:", err.message);
      return null;
    });

  if (cached) {
    // Return cache immediately; API will call onRefresh when done
    return { events: cached, fromCache: true };
  }

  // No cache — wait for API
  const fresh = await apiPromise;
  return { events: fresh ?? [], fromCache: false };
}