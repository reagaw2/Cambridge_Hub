/**
 * p1SyncAll.js — one-shot push of ALL local progress to Supabase.
 * Covers: P1 sessions/notes/stars, written stars (Physics + CS), topical workings.
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
 * Push all local data to Supabase.
 * Safe to call multiple times — merges, not overwrites.
 */
export async function forceSyncAllLocalToSupabase() {
  const row = await getStudentRow();
  if (!row) throw new Error("No student record found. Make sure you are logged in.");

  // ── P1 paper sessions / notes / stars ────────────────────────────────────
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

  // ── Written stars (topical physics + CS) ─────────────────────────────────
  const writtenStars = {
    physics: readLocal("written_starred_physics_v1") ?? {},
    cs: readLocal("written_starred_cs_v1") ?? {},
  };

  // ── Topical workings (canvas drawings) ───────────────────────────────────
  const topicalWorkings = readLocal("topical_workings_v1") ?? {};

  // ── Question notes (cross-topic) ─────────────────────────────────────────
  const questionNotes = readLocal("hub_question_notes_v1") ?? {};

  // ── Exam countdown events ─────────────────────────────────────────────────
  const examCountdown = readLocal("exam_countdown_events_v3") ?? [];

  const { error } = await supabaseClient
    .from("StudentData")
    .update({
      p1_sessions: sessions,
      p1_notes: notes,
      p1_stars: stars,
      written_stars: writtenStars,
      topical_workings: topicalWorkings,
      question_notes: questionNotes,
      exam_countdown_events: examCountdown,
    })
    .eq("id", row.id);

  if (error) throw new Error(error.message);

  return {
    papersFound: P1_PAPERS.length,
    sessionsSync: Object.keys(sessions).length,
    notesSync: Object.keys(notes).length,
    starsSync: Object.keys(stars).length,
    writtenStarsPhysics: Object.keys(writtenStars.physics).length,
    writtenStarsCS: Object.keys(writtenStars.cs).length,
    topicalWorkings: Object.keys(topicalWorkings).length,
    questionNotes: Object.keys(questionNotes).length,
  };
}