import { supabaseClient } from "@/api/base44Client";

const LOCAL_KEY = "topical_workings_v1";

function readAll() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}"); } catch { return {}; }
}
function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function getStudentRow() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id, topical_workings")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(data) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    await supabaseClient
      .from("StudentData")
      .update({ topical_workings: data })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[topicalWorkingsStore] Supabase push failed:", e?.message ?? e);
  }
}

/**
 * Load topical workings from Supabase.
 * Falls back to localStorage when offline / not authenticated.
 * Call this once on mount.
 */
export async function loadTopicalWorkingsFromCloud() {
  const local = readAll();
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const remote = row.topical_workings ?? {};
    const merged = { ...local, ...remote };
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getWorking(questionId) {
  return readAll()[questionId] ?? null;
}

export function saveWorking(questionId, imageData) {
  const all = readAll();
  all[questionId] = { imageData, savedAt: new Date().toISOString() };
  writeLocal(all);
  pushToSupabase(all).catch(() => {});
}

export function deleteWorking(questionId) {
  const all = readAll();
  delete all[questionId];
  writeLocal(all);
  pushToSupabase(all).catch(() => {});
}

export function getAllWorkings() {
  return readAll();
}