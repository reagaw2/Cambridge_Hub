import { supabaseClient } from "@/api/base44Client";
import { getSessionUserId } from "@/lib/userSession";

function localKey(paperId) {
  return `p1_session_${getSessionUserId()}_${(paperId ?? "default").replace(/\//g, "_")}`;
}

function readLocal(paperId) {
  try { return JSON.parse(localStorage.getItem(localKey(paperId)) ?? "null"); } catch { return null; }
}

function writeLocal(paperId, data) {
  try { localStorage.setItem(localKey(paperId), JSON.stringify(data)); } catch {}
}

/** Synchronous read — used by p1SyncAll */
export function getLocalSession(paperId) {
  return readLocal(paperId);
}

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

export async function loadP1Session(paperId) {
  const empty = { answers: {}, currentIdx: 0 };
  let local = empty;
  try {
    const raw = readLocal(paperId);
    if (raw) local = raw;
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
    writeLocal(paperId, merged);
    return merged;
  } catch {
    return local;
  }
}

export function saveP1Session(paperId, answers, currentIdx) {
  const data = { answers, currentIdx, updatedAt: new Date().toISOString() };
  writeLocal(paperId, data);
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

export async function clearP1Session(paperId) {
  try { localStorage.removeItem(localKey(paperId)); } catch {}
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