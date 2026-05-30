import { supabaseClient } from "@/api/base44Client";

// In-memory cache: { [paperId]: { [questionId]: { left: [...], right: [...] } } }
const _cache = {};
const _pushTimers = {};

function localKey(paperId) {
  return `p1_scratch_${(paperId ?? "").replace(/[\/\s]/g, "_")}`;
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
    .from("StudentData")
    .select("id, p1_scratchpad")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

/** Call once when entering a paper session — pulls Supabase data into cache */
export async function loadScratchpadForPaper(paperId) {
  const local = readLocal(paperId);
  _cache[paperId] = local;

  try {
    const row = await getStudentRow();
    if (!row) return;
    const remote = row.p1_scratchpad?.[paperId];
    if (!remote) return;
    _cache[paperId] = remote;
    writeLocal(paperId, remote);
  } catch (e) {
    console.warn("[p1ScratchpadStore] load failed:", e);
  }
}

/** Synchronous read — returns from cache (populated after loadScratchpadForPaper) */
export function getStrokesForQuestion(paperId, questionId, side) {
  const paperData = _cache[paperId] ?? readLocal(paperId);
  return paperData?.[questionId]?.[side] ?? [];
}

/** Save strokes immediately to cache+local, push to Supabase after 2.5s debounce */
export function saveStrokes(paperId, questionId, side, strokes) {
  if (!_cache[paperId]) _cache[paperId] = {};
  if (!_cache[paperId][questionId]) _cache[paperId][questionId] = {};
  _cache[paperId][questionId][side] = strokes;
  writeLocal(paperId, _cache[paperId]);

  clearTimeout(_pushTimers[paperId]);
  _pushTimers[paperId] = setTimeout(() => _pushToSupabase(paperId), 2500);
}

async function _pushToSupabase(paperId) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    const existing = row.p1_scratchpad ?? {};
    const updated = { ...existing, [paperId]: _cache[paperId] ?? {} };
    await supabaseClient
      .from("StudentData")
      .update({ p1_scratchpad: updated })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[p1ScratchpadStore] push failed:", e);
  }
}