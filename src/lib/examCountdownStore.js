/**
 * examCountdownStore.js — Canvas exam countdown state.
 * Cache-first: loads from localStorage instantly, then refreshes from the API.
 */

const CACHE_KEY = "exam_countdown_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Canvas credentials — hardcoded for Dyad preview environment
const CANVAS_BASE_URL = "https://africanleadershipacademy.instructure.com";
const CANVAS_TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

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

/** Build a Canvas API URL with the token embedded as a query param */
function canvasUrl(path) {
  return `${CANVAS_BASE_URL}${path}${path.includes("?") ? "&" : "?"}access_token=${CANVAS_TOKEN}&per_page=50`;
}

export async function fetchExamEvents() {
  const now = new Date().toISOString();

  // Use corsproxy.io to bypass CORS
  const proxy = (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`;

  const calendarUrl = canvasUrl(`/api/v1/users/self/calendar_events?type=event&start_date=${now}`);
  const upcomingUrl = canvasUrl(`/api/v1/users/self/upcoming_events`);
  const assignmentsUrl = canvasUrl(`/api/v1/users/self/calendar_events?type=assignment&start_date=${now}`);

  const [calRes, upcomingRes, assignRes] = await Promise.allSettled([
    fetch(proxy(calendarUrl)),
    fetch(proxy(upcomingUrl)),
    fetch(proxy(assignmentsUrl)),
  ]);

  async function safeJson(result) {
    if (result.status !== "fulfilled" || !result.value.ok) return [];
    return result.value.json().catch(() => []);
  }

  const [calData, upcomingData, assignData] = await Promise.all([
    safeJson(calRes),
    safeJson(upcomingRes),
    safeJson(assignRes),
  ]);

  const all = [
    ...calData.map((e) => ({
      id: `cal_${e.id}`,
      title: e.title ?? e.description ?? "Untitled",
      type: classifyTitle(e.title),
      due_date: e.start_at ?? e.end_at ?? null,
    })),
    ...upcomingData.map((e) => ({
      id: `up_${e.assignment?.id ?? e.id}`,
      title: e.title ?? e.assignment?.name ?? "Untitled",
      type: classifyTitle(e.title ?? e.assignment?.name),
      due_date: e.assignment?.due_at ?? e.start_at ?? null,
    })),
    ...assignData.map((e) => ({
      id: `asgn_${e.id}`,
      title: e.title ?? "Untitled",
      type: classifyTitle(e.title),
      due_date: e.end_at ?? e.start_at ?? null,
    })),
  ]
    .filter((e) => !!e.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Deduplicate by normalised title+date
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
    return { events: cached, fromCache: true };
  }

  const fresh = await apiPromise;
  return { events: fresh ?? [], fromCache: false };
}