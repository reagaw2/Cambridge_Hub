import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const baseUrl = process.env.NITRO_CANVAS_BASE_URL;
  const token = process.env.NITRO_CANVAS_TOKEN;

  if (!baseUrl || !token) {
    throw createError({
      statusCode: 503,
      statusMessage: "Canvas is not configured. Set NITRO_CANVAS_BASE_URL and NITRO_CANVAS_TOKEN.",
    });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const now = new Date().toISOString();

  // Fetch calendar events (exams / tests)
  const calRes = await fetch(
    `${baseUrl}/api/v1/users/self/calendar_events?type=event&start_date=${now}&per_page=50`,
    { headers }
  ).catch(() => null);

  // Fetch upcoming assignment due dates across all courses
  const assignRes = await fetch(
    `${baseUrl}/api/v1/users/self/upcoming_events?per_page=50`,
    { headers }
  ).catch(() => null);

  const calData: any[] = calRes?.ok ? await calRes.json() : [];
  const assignData: any[] = assignRes?.ok ? await assignRes.json() : [];

  // Normalise canvas events into clean objects
  function classifyTitle(title: string): "Exam" | "Internal Test" | "Assignment" {
    const lower = title.toLowerCase();
    if (lower.includes("exam") || lower.includes("paper")) return "Exam";
    if (lower.includes("test") || lower.includes("quiz")) return "Internal Test";
    return "Assignment";
  }

  const events = [
    ...calData.map((e: any) => ({
      id: `cal_${e.id}`,
      title: e.title ?? e.description ?? "Untitled",
      type: classifyTitle(e.title ?? ""),
      due_date: e.start_at ?? e.end_at ?? null,
    })),
    ...assignData.map((e: any) => ({
      id: `assign_${e.assignment?.id ?? e.id}`,
      title: e.title ?? e.assignment?.name ?? "Untitled",
      type: classifyTitle(e.title ?? e.assignment?.name ?? ""),
      due_date: e.assignment?.due_at ?? e.start_at ?? null,
    })),
  ]
    .filter((e) => !!e.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return unique;
});