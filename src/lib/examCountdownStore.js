import { supabaseClient } from "@/api/base44Client";

const LOCAL_KEY = "exam_countdown_events_v3";

export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(isoDate);
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.floor((targetMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? []; } catch { return []; }
}

function writeLocal(events) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(events)); } catch {}
}

async function getUserAndRow() {
  const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !user) return { user: null, row: null };

  const { data: rows, error } = await supabaseClient
    .from("StudentData")
    .select("id, exam_countdown_events")
    .eq("user_id", user.id);

  if (error) {
    console.error("[examCountdownStore] fetch error:", error.message);
    return { user, row: null };
  }

  return { user, row: rows?.[0] ?? null };
}

async function pushToSupabase(events) {
  const { user, row } = await getUserAndRow();
  if (!user || !row) {
    console.warn("[examCountdownStore] No user or row — cannot push to Supabase");
    return false;
  }

  const { error } = await supabaseClient
    .from("StudentData")
    .update({ exam_countdown_events: events })
    .eq("id", row.id);

  if (error) {
    console.error("[examCountdownStore] update error:", error.message);
    return false;
  }

  console.log("[examCountdownStore] ✓ pushed", events.length, "events to Supabase");
  return true;
}

export function daysUntilLabel(isoDate) {
  const d = daysUntil(isoDate);
  if (d === null) return null;
  if (d === 0) return "Today";
  if (d < 0) return `${Math.abs(d)} day${Math.abs(d) !== 1 ? "s" : ""} ago`;
  return `${d} day${d !== 1 ? "s" : ""}`;
}

/** Load events from Supabase — refreshes local cache. Returns local cache on failure. */
export async function loadEvents() {
  const { row } = await getUserAndRow();
  if (row) {
    const events = Array.isArray(row.exam_countdown_events) ? row.exam_countdown_events : [];
    writeLocal(events);
    return events;
  }
  return readLocal();
}

/** Force-push whatever is in localStorage up to Supabase right now. */
export async function forceSyncToSupabase() {
  const local = readLocal();
  return pushToSupabase(local);
}

export function getManualEvents() {
  return readLocal();
}

export function saveManualEvents(events) {
  writeLocal(events);
  pushToSupabase(events).catch(e => console.warn("[examCountdownStore] bg sync failed:", e));
}

export function addManualEvent({ title, type, due_date }) {
  const events = readLocal();
  const newEvent = {
    id: `manual_${Date.now()}`,
    title: title.trim(),
    type: type || "Assignment",
    due_date,
    completed: false,
    completedAt: null,
    overdueStatus: null,
  };
  const updated = [...events, newEvent].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  saveManualEvents(updated);
  return updated;
}

export function deleteManualEvent(id) {
  const events = readLocal().filter(e => e.id !== id);
  saveManualEvents(events);
  return events;
}

export function markEventComplete(id) {
  const events = readLocal();
  const updated = events.map(e =>
    e.id === id
      ? { ...e, completed: true, completedAt: new Date().toISOString(), overdueStatus: null }
      : e
  );
  saveManualEvents(updated);
  return updated;
}

export function unmarkEventComplete(id) {
  const events = readLocal();
  const updated = events.map(e =>
    e.id === id
      ? { ...e, completed: false, completedAt: null }
      : e
  );
  saveManualEvents(updated);
  return updated;
}

export function setOverdueStatus(id, status) {
  const events = readLocal();
  const updated = events.map(e =>
    e.id === id ? { ...e, overdueStatus: status } : e
  );
  saveManualEvents(updated);
  return updated;
}

export function updateManualEvent(id, { title, type, due_date }) {
  const events = readLocal();
  const updated = events
    .map(e => e.id === id ? { ...e, title: title.trim(), type, due_date } : e)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  saveManualEvents(updated);
  return updated;
}