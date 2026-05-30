/**
 * p1SyncAll.js — one-shot push of ALL local progress to Supabase.
 * Covers every key stored by every store in the app.
 */

import { supabaseClient } from "@/api/base44Client";
import { P1_PAPERS } from "@/lib/physicsP1Bank";

async function getUserAndRow() {
  const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !user) return { user: null, row: null };
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id")
    .eq("user_id", user.id);
  return { user, row: rows?.[0] ?? null };
}

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
}

/**
 * Push ALL local data to Supabase in one update.
 * Safe to call multiple times — always reads fresh from localStorage.
 */
export async function forceSyncAllLocalToSupabase() {
  const { user, row } = await getUserAndRow();
  if (!user || !row) throw new Error("No student record found. Make sure you are logged in.");

  const email = user.email;

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

  // ── Main Physics topic store ──────────────────────────────────────────────
  // Local key: hub_physics_v4_<email>
  const physicsLocal = readLocal(`hub_physics_v4_${email}`);
  const physicsData = physicsLocal?.data ?? null;

  // ── Main CS topic store ───────────────────────────────────────────────────
  // Local key: hub_cs_v3_<email>
  const csLocal = readLocal(`hub_cs_v3_${email}`);
  const csData = csLocal?.data ?? null;

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

  // ── Build the update payload ──────────────────────────────────────────────
  const payload = {
    p1_sessions:           sessions,
    p1_notes:              notes,
    p1_stars:              stars,
    written_stars:         writtenStars,
    topical_workings:      topicalWorkings,
    question_notes:        questionNotes,
    exam_countdown_events: examCountdown,
  };

  // Only overwrite topic data if we actually have something locally
  if (physicsData) {
    payload.topics               = physicsData.topics               ?? {};
    payload.written_review_bank  = physicsData.written_review_bank  ?? [];
    payload.review_bank_clears   = physicsData.review_bank_clears   ?? 0;
    payload.mcq_attempts         = physicsData.mcq_attempts         ?? [];
    payload.mcq_review_bank      = physicsData.mcq_review_bank      ?? [];
    payload.global_streak        = physicsData.global_streak        ?? 0;
    payload.global_streak_last_date = physicsData.global_streak_last_date ?? null;
    payload.rest_day_passes      = physicsData.rest_day_passes      ?? 0;
    payload.daily_question_count = physicsData.daily_question_count ?? null;
    payload.last_session_time    = physicsData.last_session_time    ?? null;
    payload.mistake_dna          = physicsData.mistake_dna          ?? [];
  }

  if (csData) {
    payload.cs_data = csData;
  }

  const { error } = await supabaseClient
    .from("StudentData")
    .update(payload)
    .eq("id", row.id);

  if (error) throw new Error(error.message);

  return {
    papersFound:           P1_PAPERS.length,
    sessionsSync:          Object.keys(sessions).length,
    notesSync:             Object.keys(notes).length,
    starsSync:             Object.keys(stars).length,
    writtenStarsPhysics:   Object.keys(writtenStars.physics).length,
    writtenStarsCS:        Object.keys(writtenStars.cs).length,
    topicalWorkings:       Object.keys(topicalWorkings).length,
    questionNotes:         Object.keys(questionNotes).length,
    physicsTopics:         physicsData ? Object.keys(physicsData.topics ?? {}).length : 0,
    csTopics:              csData ? Object.keys((csData.topics ?? {})).length : 0,
  };
}