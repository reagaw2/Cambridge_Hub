/**
 * examCountdownStore.js — Canvas exam countdown state.
 * Cache-first: loads from localStorage instantly, then refreshes from the API.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Hardcoded Canvas credentials
const CANVAS_BASE_URL = "https://africanleadershipacademy.instructure.com";
const CANVAS_TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

/** Returns integer days remaining. 0 if today or past. null if no date. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

function canvasUrl(path) {
  const sep = path.includes("?") ? "&" : "?";
  return `${CANVAS_BASE_URL}${path}${sep}access_token=${CANVAS_TOKEN}&per_page=100`;
}

async function fetchWithProxy(url) {
  const proxies = [
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
  ];

  for (const makeProxy of proxies) {
    try {
      const res = await fetch(makeProxy(url), { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const text = await res.text();
        if (!text.trim()) return [];
        return JSON.parse(text);
      }
    } catch {
      // try next proxy
    }
  }
  return [];
}

export async function fetchExamEvents() {
  // Go back 30 days so we catch any events added recently
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const start = startDate.toISOString();

  // Look 365 days ahead
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);
  const end = endDate.toISOString();

  const [calData, upcomingData, assignData] = await Promise.all([
    fetchWithProxy(canvasUrl(`/api/v1/users/self/calendar_events?type=event&start_date=${start}&end_date=${end}`)),
    fetchWithProxy(canvasUrl(`/api/v1/users/self/upcoming_events`)),
    fetchWithProxy(canvasUrl(`/api/v1/users/self/calendar_events?type=assignment&start_date=${start}&end_date=${end}`)),
  ]);

  const ensureArray = (d) => (Array.isArray(d) ? d : []);

  const all = [
    ...ensureArray(calData).map((e) => ({
      id: `cal_${e.id}`,
      title: e.title ?? e.description ?? "Untitled",
      type: classifyTitle(e.title),
      due_date: e.start_at ?? e.end_at ?? null,
    })),
    ...ensureArray(upcomingData).map((e) => ({
      id: `up_${e.assignment?.id ?? e.id}`,
      title: e.title ?? e.assignment?.name ?? "Untitled",
      type: classifyTitle(e.title ?? e.assignment?.name),
      due_date: e.assignment?.due_at ?? e.start_at ?? null,
    })),
    ...ensureArray(assignData).map((e) => ({
      id: `asgn_${e.id}`,
      title: e.title ?? "Untitled",
      type: classifyTitle(e.title),
      due_date: e.end_at ?? e.start_at ?? null,
    })),
  ]
    .filter((e) => !!e.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Deduplicate by title + date
  const seen = new Set();
  return all.filter((e) => {
    const key = `${e.title}__${e.due_date?.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
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
    apiPromise.catch(() => {});
    return { events: cached, fromCache: true };
  }

  const fresh = await apiPromise;
  return { events: fresh ?? [], fromCache: false };
}