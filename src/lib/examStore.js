/**
 * examStore.js — persistence layer for Exam Mode sessions.
 * Reads/writes to the Supabase 'StudentData' table.
 * Only uses UPDATE (never INSERT/upsert) — the StudentData row is always
 * created by topicStore on first login. RLS blocks INSERT from the client.
 */
import { base44 } from "@/api/base44Client";

let _cachedRecord = null; // { id, exam_sessions }

async function loadRecord() {
  if (_cachedRecord) return _cachedRecord;

  const { data: { user }, error: authError } = await base44.auth.getUser();
  if (authError || !user) {
    console.warn("[examStore] No active user:", authError);
    return null;
  }

  try {
    const { data: records, error: fetchError } = await base44
      .from('StudentData')
      .select('id, exam_sessions')
      .eq('user_email', user.email);

    if (fetchError) {
      console.error("[examStore] fetch error:", fetchError);
      return null;
    }

    if (records && records.length > 0) {
      _cachedRecord = {
        id: records[0].id,
        exam_sessions: records[0].exam_sessions ?? [],
      };
    } else {
      // Row doesn't exist — topicStore creates it on login via preloadStore.
      // Never INSERT here; RLS blocks it. Return null and fail gracefully.
      console.warn('[examStore] No StudentData row found — exam sessions will not be saved until login completes.');
      return null;
    }
  } catch (err) {
    console.error("[examStore] unexpected error in loadRecord:", err);
    return null;
  }

  return _cachedRecord;
}

async function saveExamSessions(sessions) {
  const record = await loadRecord();
  if (!record) return;

  try {
    const { error } = await base44
      .from('StudentData')
      .update({ exam_sessions: sessions })
      .eq('id', record.id);

    if (error) {
      console.error("[examStore] update error:", error);
      return;
    }

    record.exam_sessions = sessions;
  } catch (err) {
    console.error("[examStore] unexpected error in saveExamSessions:", err);
  }
}

export function invalidateExamCache() {
  _cachedRecord = null;
}

export async function getPausedSession(paperId) {
  const record = await loadRecord();
  if (!record) return null;
  return record.exam_sessions.find(s => s.paper === paperId && s.status === "paused") ?? null;
}

export async function getAnyPausedSession() {
  const record = await loadRecord();
  if (!record) return null;
  return record.exam_sessions.find(s => s.status === "paused") ?? null;
}

export async function startExamSession(paperId, subject, totalQuestions, totalMarks) {
  const record = await loadRecord();
  if (!record) return null;

  const filtered = record.exam_sessions.filter(s => !(s.paper === paperId && s.status === "paused"));
  const timeAllocated = totalMarks * 105;

  const newSession = {
    paper: paperId,
    subject,
    date_started: new Date().toISOString(),
    status: "paused",
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

export async function saveExamSession(paperId, sessionData) {
  const record = await loadRecord();
  if (!record) return;
  const updated = record.exam_sessions.map(s =>
    (s.paper === paperId && s.status === "paused") ? { ...s, ...sessionData } : s
  );
  await saveExamSessions(updated);
}

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

export async function getCompletedSessions() {
  const record = await loadRecord();
  if (!record) return [];
  return record.exam_sessions.filter(s => s.status === "completed");
}
