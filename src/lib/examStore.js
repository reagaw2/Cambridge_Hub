/**
 * examStore.js — persistence layer for Exam Mode sessions.
 * Reads/writes to StudentData.exam_sessions.
 * Does NOT touch any existing StudentData fields.
 */
import { base44 } from "@/api/base44Client";

let _cachedRecord = null; // { id, exam_sessions }

async function loadRecord() {
  if (_cachedRecord) return _cachedRecord;
  const user = await base44.auth.me();
  if (!user) return null;
  const records = await base44.entities.StudentData.filter({ user_email: user.email });
  if (records.length > 0) {
    _cachedRecord = { id: records[0].id, exam_sessions: records[0].exam_sessions ?? [] };
  } else {
    const created = await base44.entities.StudentData.create({ user_email: user.email, exam_sessions: [] });
    _cachedRecord = { id: created.id, exam_sessions: [] };
  }
  return _cachedRecord;
}

async function saveExamSessions(sessions) {
  const record = await loadRecord();
  if (!record) return;
  await base44.entities.StudentData.update(record.id, { exam_sessions: sessions });
  record.exam_sessions = sessions;
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

  const newSession = {
    paper: paperId,
    subject,
    date_started: new Date().toISOString(),
    status: "paused", // will become "completed" on finish
    time_remaining_seconds: 7200,
    current_question_index: 0,
    answers: Array.from({ length: totalQuestions }, (_, i) => ({
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