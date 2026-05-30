import { supabaseClient } from "@/api/base44Client";

// Local storage helpers
function key(subject) {
  return `written_starred_${subject ?? "physics"}_v1`;
}

function readAll(subject) {
  try { return JSON.parse(localStorage.getItem(key(subject)) ?? "{}"); } catch { return {}; }
}
function writeLocal(subject, data) {
  try { localStorage.setItem(key(subject), JSON.stringify(data)); } catch {}
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function getStudentRow() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id, written_stars")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(subject, data) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    // Merge with whatever is already stored for other subjects
    const existing = row.written_stars ?? {};
    await supabaseClient
      .from("StudentData")
      .update({ written_stars: { ...existing, [subject]: data } })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[writtenStarStore] Supabase push failed:", e?.message ?? e);
  }
}

/**
 * Load starred questions for a subject from Supabase.
 * Falls back to localStorage when offline / not authenticated.
 * Call this once on mount of any page that uses starred data.
 */
export async function loadAllStarredFromCloud(subject = "physics") {
  const local = readAll(subject);
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const remote = row.written_stars?.[subject] ?? {};
    // Remote is source of truth — merge and update local cache
    const merged = { ...local, ...remote };
    writeLocal(subject, merged);
    return merged;
  } catch {
    return local;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function isStarred(questionId, subject = "physics") {
  return !!readAll(subject)[questionId];
}

export function starQuestion(questionId, { topic = "", questionText = "", markScheme = "", feedback = null, answer = "" } = {}, subject = "physics") {
  const all = readAll(subject);
  all[questionId] = {
    questionId,
    topic,
    questionText,
    markScheme,
    feedback,
    answer,
    subject,
    teacherQuestion: all[questionId]?.teacherQuestion ?? "",
    teacherResponse: all[questionId]?.teacherResponse ?? "",
    starredAt: new Date().toISOString(),
  };
  writeLocal(subject, all);
  pushToSupabase(subject, all).catch(() => {});
  return all;
}

export function unstarQuestion(questionId, subject = "physics") {
  const all = readAll(subject);
  delete all[questionId];
  writeLocal(subject, all);
  pushToSupabase(subject, all).catch(() => {});
  return all;
}

export function saveTeacherQuestion(questionId, teacherQuestion, subject = "physics") {
  const all = readAll(subject);
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherQuestion };
    writeLocal(subject, all);
    pushToSupabase(subject, all).catch(() => {});
  }
  return all;
}

export function saveTeacherResponse(questionId, teacherResponse, subject = "physics") {
  const all = readAll(subject);
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherResponse };
    writeLocal(subject, all);
    pushToSupabase(subject, all).catch(() => {});
  }
  return all;
}

export function getAllStarred(subject = "physics") {
  return Object.values(readAll(subject)).sort((a, b) => new Date(a.starredAt) - new Date(b.starredAt));
}