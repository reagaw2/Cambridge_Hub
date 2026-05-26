import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const CANVAS_BASE_URL = "https://africanleadershipacademy.instructure.com";
  const CANVAS_TOKEN = "4000~FwAyNtXQfTxYXachFuaffNRMXwM96CQ3YyfWGycukUN7xFxLQh6NreTPkTJk6h68";

  const headers = {
    Authorization: `Bearer ${CANVAS_TOKEN}`,
    "Content-Type": "application/json",
  };

  // Go back 30 days, look 365 days ahead
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);
  const start = startDate.toISOString();
  const end = endDate.toISOString();

  async function safeFetch(url: string) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      const data = await res.json() as any[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  const [calData, upcomingData, assignData] = await Promise.all([
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=event&start_date=${start}&end_date=${end}&per_page=100`),
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/upcoming_events?per_page=100`),
    safeFetch(`${CANVAS_BASE_URL}/api/v1/users/self/calendar_events?type=assignment&start_date=${start}&end_date=${end}&per_page=100`),
  ]);

  function classifyTitle(title: string): string {
    const lower = (title ?? "").toLowerCase();
    if (lower.includes("exam") || lower.includes("paper")) return "Exam";
    if (lower.includes("test") || lower.includes("quiz")) return "Internal Test";
    return "Assignment";
  }

  const all = [
    ...calData.map((e: any) => ({
      id: `cal_${e.id}`,
      title: e.title ?? e.description ?? "Untitled",
      type: classifyTitle(e.title ?? ""),
      due_date: e.start_at ?? e.end_at ?? null,
    })),
    ...upcomingData.map((e: any) => ({
      id: `up_${e.assignment?.id ?? e.id}`,
      title: e.title ?? e.assignment?.name ?? "Untitled",
      type: classifyTitle(e.title ?? e.assignment?.name ?? ""),
      due_date: e.assignment?.due_at ?? e.start_at ?? null,
    })),
    ...assignData.map((e: any) => ({
      id: `asgn_${e.id}`,
      title: e.title ?? "Untitled",
      type: classifyTitle(e.title ?? ""),
      due_date: e.end_at ?? e.start_at ?? null,
    })),
  ].filter((e) => !!e.due_date);

  // Sort by date
  all.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Deduplicate
  const seen = new Set<string>();
  const unique = all.filter((e) => {
    const key = `${e.title}__${e.due_date?.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique;
});