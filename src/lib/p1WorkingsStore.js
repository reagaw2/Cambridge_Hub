/**
 * p1WorkingsStore.js — stores canvas snapshots per question per paper.
 * Each entry: { sides: { left?: base64, right?: base64 }, savedAt, questionNumber, topic, questionText }
 * Syncs to Supabase p1_workings column on StudentData.
 */

import { supabaseClient } from "@/api/base44Client";

function localKey(paperId) {
  return `p1_workings_${(paperId ?? "default").replace(/[\/\s]/g, "_")}`;
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
    .select("id, p1_workings")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(paperId, data) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    const paperKey = (paperId ?? "default").replace(/[\/\s]/g, "_");
    const existing = row.p1_workings ?? {};
    const updated = { ...existing, [paperKey]: data };
    await supabaseClient
      .from("StudentData")
      .update({ p1_workings: updated })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[p1WorkingsStore] Supabase push failed:", e?.message ?? e);
  }
}

/**
 * Load workings for a paper — checks Supabase first, falls back to localStorage.
 */
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
  } catch {
    return local;
  }
}

/** Synchronous read from localStorage — use after loadWorkings() has run */
export function getWorkings(paperId) {
  return readLocal(paperId);
}

/**
 * Save a canvas snapshot for one side of a question.
 * @param side - "left" | "right"
 * @param imageData - base64 PNG data URL
 * @param meta - { questionNumber, topic, questionText }
 */
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

/** Remove a saved working for a question entirely */
export function deleteWorking(paperId, questionId) {
  const data = readLocal(paperId);
  delete data[questionId];
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

/** Remove just one side of a saved working */
export function deleteWorkingSide(paperId, questionId, side) {
  const data = readLocal(paperId);
  if (!data[questionId]) return data;
  delete data[questionId].sides[side];
  if (Object.keys(data[questionId].sides).length === 0) {
    delete data[questionId];
  }
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}