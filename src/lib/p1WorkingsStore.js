import { supabaseClient } from "@/api/base44Client";
import { getSessionUserId } from "@/lib/userSession";

function localKey(paperId) {
  return `p1_workings_${getSessionUserId()}_${(paperId ?? "default").replace(/[\/\s]/g, "_")}`;
}

function readLocal(paperId) {
  try { return JSON.parse(localStorage.getItem(localKey(paperId)) ?? "{}"); } catch { return {}; }
}

function writeLocal(paperId, data) {
  try { localStorage.setItem(localKey(paperId), JSON.stringify(data)); } catch {}
}

async function getStudentRow() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData").select("id, p1_workings").eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(paperId, data) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    const paperKey = (paperId ?? "default").replace(/[\/\s]/g, "_");
    const existing = row.p1_workings ?? {};
    await supabaseClient.from("StudentData")
      .update({ p1_workings: { ...existing, [paperKey]: data } })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[p1WorkingsStore] Supabase push failed:", e?.message ?? e);
  }
}

export async function loadWorkings(paperId) {
  const local = readLocal(paperId);
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const paperKey = (paperId ?? "default").replace(/[\/\s]/g, "_");
    const remote = row.p1_workings?.[paperKey];
    if (!remote) return local;
    const merged = { ...local, ...remote };
    writeLocal(paperId, merged);
    return merged;
  } catch { return local; }
}

export function getWorkings(paperId) { return readLocal(paperId); }

export function saveWorking(paperId, questionId, side, imageData, meta = {}) {
  const data = readLocal(paperId);
  if (!data[questionId]) data[questionId] = { sides: {}, savedAt: null };
  data[questionId].sides[side] = imageData;
  data[questionId].savedAt = new Date().toISOString();
  Object.assign(data[questionId], meta);
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

export function deleteWorking(paperId, questionId) {
  const data = readLocal(paperId);
  delete data[questionId];
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

export function deleteWorkingSide(paperId, questionId, side) {
  const data = readLocal(paperId);
  if (!data[questionId]) return data;
  delete data[questionId].sides[side];
  if (Object.keys(data[questionId].sides).length === 0) delete data[questionId];
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}