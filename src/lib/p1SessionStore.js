/**
 * p1SessionStore.js — cross-device persistence for the 9702/12/F/M/25 P1 session.
 * Saves/loads to the `p1_sessions` JSONB column on the StudentData row.
 * Falls back gracefully to localStorage when offline or unauthenticated.
 */

import { supabaseClient } from "@/api/base44Client";

const LOCAL_KEY = "p1_session_9702_12_FM25";
const PAPER_KEY = "9702_12_FM25"; // key inside p1_sessions object

// ── Local helpers ─────────────────────────────────────────────────────────────

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : { answers: {}, currentIdx: 0 };
  } catch {
    return { answers: {}, currentIdx: 0 };
  }
}

function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
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
 * Load session — tries Supabase first, merges with local cache.
 * Returns { answers, currentIdx }.
 */
export async function loadP1Session() {
  const local = readLocal();

  try {
    const row = await getStudentRow();
    if (!row) return local;

    const remote = row.p1_sessions?.[PAPER_KEY];
    if (!remote) return local;

    // Merge: remote is source of truth for answers; keep local currentIdx if more recent
    const merged = {
      answers: { ...local.answers, ...remote.answers },
      currentIdx: remote.currentIdx ?? local.currentIdx ?? 0,
    };
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
}

/**
 * Save session — writes to localStorage immediately (sync) and
 * pushes to Supabase in the background (async, fire-and-forget).
 */
export function saveP1Session(answers, currentIdx) {
  const data = { answers, currentIdx, updatedAt: new Date().toISOString() };
  writeLocal(data);
  pushToSupabase(data).catch(e => console.warn("[p1SessionStore] bg sync failed:", e));
}

async function pushToSupabase(data) {
  const row = await getStudentRow();
  if (!row) return;

  const existing = row.p1_sessions ?? {};
  const updated = { ...existing, [PAPER_KEY]: data };

  const { error } = await supabaseClient
    .from("StudentData")
    .update({ p1_sessions: updated })
    .eq("id", row.id);

  if (error) console.error("[p1SessionStore] Supabase update error:", error.message);
}

/**
 * Clear session — wipes localStorage and Supabase entry.
 */
export async function clearP1Session() {
  localStorage.removeItem(LOCAL_KEY);
  try {
    const row = await getStudentRow();
    if (!row) return;
    const existing = row.p1_sessions ?? {};
    const { [PAPER_KEY]: _, ...rest } = existing;
    await supabaseClient
      .from("StudentData")
      .update({ p1_sessions: rest })
      .eq("id", row.id);
  } catch {}
}