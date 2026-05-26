/**
 * examCountdownStore.js — exam event entry, synced to Supabase.
 * localStorage is used as a fast local cache only.
 */

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

// ── Local cache helpers ────────────────────────────────────────────────────

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? []; } catch { return []; }
}

function writeLocal(events) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(events)); } catch {}
}

// ── Supabase helpers ───────────────────────────────────────────────────────

async function getStudentRow() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id, exam_countdown_events")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(events) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id")
    .eq("user_id", user.id);
  if (!rows?.[0]) return;
  await supabaseClient
    .from("StudentData")
    .update({ exam_countdown_events: events })
    .eq("id", rows[0].id);
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Load events from Supabase (and refresh local cache). Falls back to localStorage. */
export async function loadEvents() {
  try {
    const row = await getStudentRow();
    if (row) {
      const events = row.exam_countdown_events ?? [];
      writeLocal(events);
      return events;
    }
  } catch (e) {
    console.warn("[examCountdownStore] Supabase load failed, using local cache:", e);
  }
  return readLocal();
}

/** Returns the locally cached events (for instant render before async load). */
export function getManualEvents() {
  return readLocal();
}

export function saveManualEvents(events) {
  writeLocal(events);
  pushToSupabase(events).catch(e => console.warn("[examCountdownStore] sync failed:", e));
}

export function addManualEvent({ title, type, due_date }) {
  const events = readLocal();
  const newEvent = {
    id: `manual_${Date.now()}`,
    title: title.trim(),
    type: type || "Assignment",
    due_date,
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