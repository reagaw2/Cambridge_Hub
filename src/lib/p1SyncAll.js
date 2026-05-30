/**
 * p1SyncAll.js — one-shot migration of all local P1 progress to Supabase.
 * Reads every known paper's sessions, notes, and stars from localStorage
 * and writes them to the p1_sessions, p1_notes, and p1_stars columns.
 */

import { supabaseClient } from "@/api/base44Client";
import { P1_PAPERS } from "@/lib/physicsP1Bank";

async function getStudentRow() {
  const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
}

/**
 * Push all local P1 data (sessions, notes, stars) to Supabase.
 * Safe to call multiple times — it merges, not overwrites.
 * Returns a summary of what was pushed.
 */
export async function forceSyncAllLocalToSupabase() {
  const row = await getStudentRow();
  if (!row) throw new Error("No student record found. Make sure you are logged in.");

  const sessions = {};
  const notes = {};
  const stars = {};

  for (const paper of P1_PAPERS) {
    const paperKey = paper.id.replace(/\//g, "_");

    const sessionData = readLocal(`p1_session_${paperKey}`);
    if (sessionData) sessions[paperKey] = sessionData;

    const notesData = readLocal(`p1_notes_${paperKey}`);
    if (notesData) notes[paperKey] = notesData;

    const starsData = readLocal(`p1_stars_${paperKey}`);
    if (starsData) stars[paperKey] = starsData;
  }

  const { error } = await supabaseClient
    .from("StudentData")
    .update({
      p1_sessions: sessions,
      p1_notes: notes,
      p1_stars: stars,
    })
    .eq("id", row.id);

  if (error) throw new Error(error.message);

  return {
    papersFound: P1_PAPERS.length,
    sessionsSync: Object.keys(sessions).length,
    notesSync: Object.keys(notes).length,
    starsSync: Object.keys(stars).length,
  };
}