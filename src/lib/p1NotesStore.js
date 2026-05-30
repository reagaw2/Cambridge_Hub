/**
 * p1NotesStore.js — stores mini notes per question per paper.
 * Each note: { text, savedAt }
 */

import { supabaseClient } from "@/api/base44Client";

function localKey(paperId) {
  return `p1_notes_${(paperId ?? "default").replace(/\//g, "_")}`;
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
    .select("id, p1_notes")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(paperId, data) {
  const row = await getStudentRow();
  if (!row) return;
  const paperKey = (paperId ?? "default").replace(/\//g, "_");
  const existing = row.p1_notes ?? {};
  const updated = { ...existing, [paperKey]: data };
  await supabaseClient
    .from("StudentData")
    .update({ p1_notes: updated })
    .eq("id", row.id)
    .catch(e => console.warn("[p1NotesStore] push failed:", e));
}

/**
 * Load notes for a paper — checks Supabase first, falls back to localStorage.
 * Call this on mount instead of the synchronous getNotes().
 */
export async function loadNotes(paperId) {
  const local = readLocal(paperId);

  try {
    const row = await getStudentRow();
    if (!row) return local;
    const paperKey = (paperId ?? "default").replace(/\//g, "_");
    const remote = row.p1_notes?.[paperKey];
    if (!remote) return local;
    // Remote is source of truth — merge over local and update cache
    const merged = { ...local, ...remote };
    writeLocal(paperId, merged);
    return merged;
  } catch {
    return local;
  }
}

/** Synchronous read from localStorage only — use after loadNotes() has run */
export function getNotes(paperId) {
  return readLocal(paperId);
}

export function saveNote(paperId, questionId, text) {
  const data = readLocal(paperId);
  if (text.trim()) {
    data[questionId] = { text: text.trim(), savedAt: new Date().toISOString() };
  } else {
    delete data[questionId];
  }
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

export function deleteNote(paperId, questionId) {
  const data = readLocal(paperId);
  delete data[questionId];
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}