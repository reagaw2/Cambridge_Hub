/**
 * examStore.js — persistence layer for Exam Mode sessions.
 * Reads/writes to the Supabase 'StudentData' table.
 * Does NOT touch any existing fields.
 */
import { base44 } from "@/api/base44Client";

let _cachedRecord = null; // { id, exam_sessions }

async function loadRecord() {
  if (_cachedRecord) return _cachedRecord;

  // 1. Get the current active user session the Supabase way
  const { data: { user }, error: authError } = await base44.auth.getUser();
  if (authError || !user) {
    console.error("No active user found for exam session matching:", authError);
    return null;
  }

  try {
    // 2. Query your Supabase 'StudentData' table using the user's email
    const { data: records, error: fetchError } = await base44
      .from('StudentData')
      .select('id, exam_sessions')
      .eq('user_email', user.email);

    if (fetchError) {
      console.error("Error loading record from Supabase StudentData:", fetchError);
      return null;
    }

    if (records && records.length > 0) {
      _cachedRecord = { 
        id: records[0].id, 
        exam_sessions: records[0].exam_sessions ?? [] 
      };
    } else {
      // If no row exists yet for this student, create a fresh one using safe upsert logic
      const { data: created, error: createError } = await base44
        .from('StudentData')
        .upsert({ user_email: user.email, exam_sessions: [] }, { onConflict: 'user_email' })
        .select();

      if (createError) {
        console.error("Error creating student record row in Supabase:", createError);
        return null;
      }

      if (created && created[0]) {
        _cachedRecord = { 
          id: created[0].id, 
          exam_sessions: [] 
        };
      }
    }
  } catch (err) {
    console.error("Caught unexpected structural exception in loadRecord:", err);
    return null;
  }

  return _cachedRecord;
}

async function saveExamSessions(sessions) {
  const record = await loadRecord();
  if (!record) return;

  try {
    // Update the row inside your Supabase 'StudentData' table safely
    const { error: updateError } = await base44
      .from('StudentData')
      .update({ exam_sessions: sessions })
      .eq('id', record.id);

    if (updateError) {
      console.error("Error updating exam sessions in Supabase:", updateError);
      return;
    }

    record.exam_sessions = sessions;
  } catch (err) {
    console.error("Caught unexpected exception in saveExamSessions:", err);
  }
}

export function invalidateExamCache() {
  _cachedRecord = null;
}

// Returns the paused session for a given paper id, or null
export async function getPausedSession(paperId) {
  const record = await loadRecord();
  if (!record) return null;
  return record.exam_sessions.find(s => s.paper === paperId && s.status === "paused") ?? null;
}

// Returns the active paused session across all papers (only one allowed at a time)
export async function getAnyPausedSession() {
  const record = await loadRecord();
  if (!record) return null;
  return record.exam_sessions.find(s => s.status === "paused") ?? null;
}

// Start a new session — discards any existing paused session for this paper
export async function startExamSession(paperId, subject, totalQuestions, totalMarks) {
  const record = await loadRecord();
  if (!record) return null;

  // Remove old paused session for this paper
  const filtered = record.exam_sessions.filter(s => !(s.paper === paperId && s.status === "paused"));

  const timeAllocated = totalMarks * 105; // spec: total_marks × 105 seconds

  const newSession = {
    paper: paperId,
    subject,
    date_started: new Date().toISOString(),
    status: "paused", // will become "completed" on finish
    time_remaining_seconds: timeAllocated,
    time_allocated_seconds: timeAllocated,
    current_question_index: 0,
    answers: Array.from({ length: totalQuestions }, () => ({
      question_id: "",
      answer_text: "",
      score: 0,
      total_marks: 0,
      skipped: false,
      flagged: false,
      ai_feedback: "",
      mark_scheme: "",
    })),
    total_score: 0,
    total_marks: totalMarks,
  };

  const updated = [...filtered, newSession];
  await saveExamSessions(updated);
  return newSession;
}

// Save a running session state (called on every answer submit + Save & Exit)
export async function saveExamSession(paperId, sessionData) {
  const record = await loadRecord();
  if (!record) return;
  const updated = record.exam_sessions.map(s =>
    (s.paper === paperId && s.status === "paused") ? { ...s, ...sessionData } : s
  );
  await saveExamSessions(updated);
}

// Mark session as completed and store final results
export async function completeExamSession(paperId, sessionData) {
  const record = await loadRecord();
  if (!record) return;
  const updated = record.exam_sessions.map(s =>
    (s.paper === paperId && s.status === "paused")
      ? { ...s, ...sessionData, status: "completed" }
      : s
  );
  await saveExamSessions(updated);
}

// Get all completed sessions
export async function getCompletedSessions() {
  const record = await loadRecord();
  if (!record) return [];
  return record.exam_sessions.filter(s => s.status === "completed");
}