import { supabaseClient } from "@/api/base44Client";
import { getSessionUserId } from "@/lib/userSession";

function localKey() {
  return `hub_question_notes_v1_${getSessionUserId()}`;
}

function readAll() {
  try { return JSON.parse(localStorage.getItem(localKey()) ?? "{}"); } catch { return {}; }
}

function writeAll(data) {
  try { localStorage.setItem(localKey(), JSON.stringify(data)); } catch {}
}

async function getStudentRow() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData").select("id, question_notes").eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(data) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    await supabaseClient.from("StudentData").update({ question_notes: data }).eq("id", row.id);
  } catch (e) { console.warn("[questionNotesStore] push failed:", e?.message); }
}

export async function loadAllNotes() {
  const local = readAll();
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const remote = row.question_notes ?? {};
    const merged = { ...local, ...remote };
    writeAll(merged);
    return merged;
  } catch { return local; }
}

export function getNote(questionId) { return readAll()[questionId] ?? null; }

export function saveNote(questionId, text, meta = {}) {
  const all = readAll();
  if (text.trim()) {
    all[questionId] = { text: text.trim(), savedAt: new Date().toISOString(), ...meta };
  } else {
    delete all[questionId];
  }
  writeAll(all);
  pushToSupabase(all).catch(() => {});
  return all[questionId] ?? null;
}

export function deleteNote(questionId) {
  const all = readAll();
  delete all[questionId];
  writeAll(all);
  pushToSupabase(all).catch(() => {});
}

export function getAllNotes() { return readAll(); }