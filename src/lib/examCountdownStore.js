/**
 * examCountdownStore.js — Canvas exam countdown state.
 * Cache-first: loads from localStorage instantly, then refreshes from the API.
 * Uses a CORS proxy to call Canvas directly from the browser.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Returns integer days remaining. 0 if today or past. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
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

function classifyTitle(title) {
  const lower = (title ?? "").toLowerCase();
  if (lower.includes("exam") || lower.includes("paper")) return "Exam";
  if (lower.includes("test") || lower.includes("quiz")) return "Internal Test";
  return "Assignment";
}

export async function fetchExamEvents() {
  const baseUrl = import.meta.env.VITE_CANVAS_BASE_URL;
  const token = import.meta.env.VITE_CANVAS_TOKEN;

  if (!baseUrl || !token) {
    throw new Error("VITE_CANVAS_BASE_URL and VITE_CANVAS_TOKEN are not set in .env.local");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const now = new Date().toISOString();

  // Canvas requires a CORS proxy for browser-side requests.
  // We use allorigins.win which is a reliable public proxy.
  const proxy = (url) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const [calRes, assignRes] = await Promise.allSettled([
    fetch(proxy(`${baseUrl}/api/v1/users/self/calendar_events?type=event&start_date=${now}&per_page=50`), { headers }),
    fetch(proxy(`${baseUrl}/api/v1/users/self/upcoming_events?per_page=50`), { headers }),
  ]);

  const calData = calRes.status === "fulfilled" && calRes.value.ok
    ? await calRes.value.json().catch(() => [])
    : [];

  const assignData = assignRes.status === "fulfilled" && assignRes.value.ok
    ? await assignRes.value.json().catch(() => [])
    : [];

  const events = [
    ...calData.map((e) => ({
      id: `cal_${e.id}`,
      title: e.title ?? e.description ?? "Untitled",
      type: classifyTitle(e.title),
      due_date: e.start_at ?? e.end_at ?? null,
    })),
    ...assignData.map((e) => ({
      id: `assign_${e.assignment?.id ?? e.id}`,
      title: e.title ?? e.assignment?.name ?? "Untitled",
      type: classifyTitle(e.title ?? e.assignment?.name),
      due_date: e.assignment?.due_at ?? e.start_at ?? null,
    })),
  ]
    .filter((e) => !!e.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Deduplicate
  const seen = new Set();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
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
      console.warn("[examCountdown] API fetch failed:", err.message);
      return null;
    });

  if (cached) {
    return { events: cached, fromCache: true };
  }

  const fresh = await apiPromise;
  return { events: fresh ?? [], fromCache: false };
}