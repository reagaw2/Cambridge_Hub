/**
 * p1SessionStore.js — cross-device persistence for P1 sessions.
 * Each paper has its own session slot, keyed by paperId.
 * Saves/loads to the `p1_sessions` JSONB column on the StudentData row.
 * Falls back gracefully to localStorage when offline or unauthenticated.
 */

import { supabaseClient } from "@/api/base44Client";

function localKey(paperId) {
  return `p1_session_${(paperId ?? "default").replace(/\//g, "_")}`;
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function getStudentRow() {
  const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !user) return null;

  const { data: rows, error } = await supabaseClient
    .from("StudentData")
    .select("id, p1_sessions")
    .eq("user_id", user.id);

  if (error || !rows?.length) return null;
  return rows[0];
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load session for a specific paper.
 * Tries Supabase first, falls back to localStorage.
 * @param {string} paperId  e.g. "9702/12/F/M/25"
 */
export async function loadP1Session(paperId) {
  const key = localKey(paperId);
  const empty = { answers: {}, currentIdx: 0 };

  // Read local first for instant render
  let local = empty;
  try {
    const raw = localStorage.getItem(key);
    if (raw) local = JSON.parse(raw);
  } catch {}

  try {
    const row = await getStudentRow();
    if (!row) return local;

    const paperKey = (paperId ?? "default").replace(/\//g, "_");
    const remote = row.p1_sessions?.[paperKey];
    if (!remote) return local;

    const merged = {
      answers: { ...local.answers, ...remote.answers },
      currentIdx: remote.currentIdx ?? local.currentIdx ?? 0,
    };
    localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  } catch {
    return local;
  }
}

/**
 * Save session for a specific paper.
 * Writes to localStorage immediately and pushes to Supabase in background.
 * @param {string} paperId
 */
export function saveP1Session(paperId, answers, currentIdx) {
  const data = { answers, currentIdx, updatedAt: new Date().toISOString() };
  const key = localKey(paperId);
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  pushToSupabase(paperId, data).catch(e => console.warn("[p1SessionStore] bg sync failed:", e));
}

async function pushToSupabase(paperId, data) {
  const row = await getStudentRow();
  if (!row) return;

  const paperKey = (paperId ?? "default").replace(/\//g, "_");
  const existing = row.p1_sessions ?? {};
  const updated = { ...existing, [paperKey]: data };

  const { error } = await supabaseClient
    .from("StudentData")
    .update({ p1_sessions: updated })
    .eq("id", row.id);

  if (error) console.error("[p1SessionStore] Supabase update error:", error.message);
}

/**
 * Clear session for a specific paper.
 */
export async function clearP1Session(paperId) {
  const key = localKey(paperId);
  localStorage.removeItem(key);
  try {
    const row = await getStudentRow();
    if (!row) return;
    const paperKey = (paperId ?? "default").replace(/\//g, "_");
    const existing = row.p1_sessions ?? {};
    const { [paperKey]: _, ...rest } = existing;
    await supabaseClient
      .from("StudentData")
      .update({ p1_sessions: rest })
      .eq("id", row.id);
  } catch {}
}