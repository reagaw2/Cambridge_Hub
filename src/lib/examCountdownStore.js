/**
 * examCountdownStore.js — Canvas exam countdown.
 * Uses allorigins.win proxy which handles Canvas's SSL certificate.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const CANVAS_BASE = "https://africanleadershipacademy.instructure.com";
const TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

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

function classifyTitle(title) {
  const lower = (title ?? "").toLowerCase();
  if (lower.includes("exam") || lower.includes("paper")) return "Exam";
  if (lower.includes("test") || lower.includes("quiz")) return "Internal Test";
  return "Assignment";
}

async function proxyFetch(canvasUrl) {
  // allorigins returns { status: { url, content_type }, contents: "..." }
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(canvasUrl)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`allorigins ${res.status}`);
  const wrapper = await res.json();
  if (!wrapper.contents) return [];
  const data = JSON.parse(wrapper.contents);
  return Array.isArray(data) ? data : [];
}

export async function fetchExamEvents() {
  const start = new Date();
  start.setDate(start.getDate() - 60);
  const end = new Date();
  end.setDate(end.getDate() + 365);
  const s = start.toISOString();
  const e = end.toISOString();
  const tok = TOKEN;

  const urls = [
    `${CANVAS_BASE}/api/v1/users/self/calendar_events?type=event&start_date=${s}&end_date=${e}&access_token=${tok}&per_page=100`,
    `${CANVAS_BASE}/api/v1/users/self/upcoming_events?access_token=${tok}&per_page=100`,
    `${CANVAS_BASE}/api/v1/users/self/calendar_events?type=assignment&start_date=${s}&end_date=${e}&access_token=${tok}&per_page=100`,
  ];

  const results = await Promise.allSettled(urls.map(proxyFetch));
  const [calEvents, upcomingEvents, calAssignments] = results.map(r =>
    r.status === "fulfilled" ? r.value : []
  );

  const all = [];

  for (const ev of calEvents) {
    const title = ev.title ?? ev.description ?? "Untitled";
    const due = ev.start_at ?? ev.end_at ?? null;
    if (due) all.push({ id: `cal_${ev.id}`, title, type: classifyTitle(title), due_date: due });
  }

  for (const ev of upcomingEvents) {
    const title = ev.title ?? ev.assignment?.name ?? ev.description ?? "Untitled";
    const due = ev.assignment?.due_at ?? ev.start_at ?? ev.end_at ?? null;
    if (due) all.push({ id: `up_${ev.assignment?.id ?? ev.id}`, title, type: classifyTitle(title), due_date: due });
  }

  for (const ev of calAssignments) {
    const title = ev.title ?? ev.assignment?.name ?? "Untitled";
    const due = ev.assignment?.due_at ?? ev.end_at ?? ev.start_at ?? null;
    if (due) all.push({ id: `asgn_${ev.assignment?.id ?? ev.id}`, title, type: classifyTitle(title), due_date: due });
  }

  all.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const seen = new Set();
  return all.filter(ev => {
    const key = `${(ev.title ?? "").toLowerCase().trim()}__${ev.due_date?.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadExamCountdown(onRefresh) {
  const cached = readCache();

  const apiPromise = fetchExamEvents()
    .then(fresh => {
      writeCache(fresh);
      onRefresh?.(fresh);
      return fresh;
    })
    .catch(err => {
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