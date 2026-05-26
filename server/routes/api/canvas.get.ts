import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const CANVAS_BASE_URL = "https://africanleadershipacademy.instructure.com";
  const CANVAS_TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

  const headers = {
    Authorization: `Bearer ${CANVAS_TOKEN}`,
    "Content-Type": "application/json",
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);
  const start = startDate.toISOString();
  const end = endDate.toISOString();

  async function safeFetch(url: string): Promise<any[]> {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.log(`[canvas] ${url} → ${res.status}`);
        return [];
      }
      const text = await res.text();
      console.log(`[canvas] ${url} → 200, body: ${text.slice(0, 200)}`);
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(`[canvas] fetch error for ${url}:`, e);
      return [];
    }
  }

  function classifyTitle(title: string): string {
    const lower = (title ?? "").toLowerCase();
    if (lower.includes("exam") || lower.includes("paper") || lower.includes("test")) return "Exam";
    if (lower.includes("quiz")) return "Internal Test";
    return "Assignment";
  }

  // Fetch multiple endpoint types in parallel
  const [calEvents, upcomingEvents, calAssignments] = await Promise.all([
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=event&start_date=${start}&end_date=${end}&per_page=100`),
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/upcoming_events?per_page=100`),
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=assignment&start_date=${start}&end_date=${end}&per_page=100`),
  ]);

  const all: { id: string; title: string; type: string; due_date: string | null }[] = [];

  // Calendar events (type=event)
  for (const e of calEvents) {
    const title = e.title ?? e.description ?? "Untitled";
    const due = e.start_at ?? e.end_at ?? null;
    if (due) all.push({ id: `cal_${e.id}`, title, type: classifyTitle(title), due_date: due });
  }

  // Upcoming events — these can be assignments OR events
  for (const e of upcomingEvents) {
    // Can have: e.title, e.start_at, e.assignment (sub-object), e.assignment.due_at
    const title = e.title ?? e.assignment?.name ?? e.description ?? "Untitled";
    const due = e.assignment?.due_at ?? e.start_at ?? e.end_at ?? null;
    if (due) all.push({ id: `up_${e.assignment?.id ?? e.id}`, title, type: classifyTitle(title), due_date: due });
  }

  // Calendar events (type=assignment)
  for (const e of calAssignments) {
    const title = e.title ?? e.assignment?.name ?? "Untitled";
    // assignment calendar events have assignment sub-object with due_at
    const due = e.assignment?.due_at ?? e.end_at ?? e.start_at ?? null;
    if (due) all.push({ id: `asgn_${e.assignment?.id ?? e.id}`, title, type: classifyTitle(title), due_date: due });
  }

  // Sort by date
  all.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Deduplicate by title + date (day precision)
  const seen = new Set<string>();
  const unique = all.filter((e) => {
    const key = `${(e.title ?? "").toLowerCase().trim()}__${e.due_date?.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[canvas] returning ${unique.length} events`);
  return unique;
});