/**
 * p1StarStore.js — persists starred questions per paper.
 * Stores: { [paperId]: { [questionId]: { starred, feedback, question } } }
 */

import { supabaseClient } from "@/api/base44Client";

function localKey(paperId) {
  return `p1_stars_${(paperId ?? "default").replace(/\//g, "_")}`;
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
    .select("id, p1_stars")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(paperId, data) {
  const row = await getStudentRow();
  if (!row) return;
  const paperKey = (paperId ?? "default").replace(/\//g, "_");
  const existing = row.p1_stars ?? {};
  const updated = { ...existing, [paperKey]: data };
  await supabaseClient
    .from("StudentData")
    .update({ p1_stars: updated })
    .eq("id", row.id)
    .catch(e => console.warn("[p1StarStore] push failed:", e));
}

export function getStarredQuestions(paperId) {
  return readLocal(paperId);
}

export function starQuestion(paperId, question, feedback) {
  const data = readLocal(paperId);
  data[question.id] = {
    starred: true,
    questionNumber: question.number,
    questionText: question.text,
    topic: question.topic,
    options: question.options,
    correctAnswer: question.correct,
    explanation: question.explanation,
    feedback,
    starredAt: new Date().toISOString(),
  };
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

export function unstarQuestion(paperId, questionId) {
  const data = readLocal(paperId);
  delete data[questionId];
  writeLocal(paperId, data);
  pushToSupabase(paperId, data);
  return data;
}

export function isQuestionStarred(paperId, questionId) {
  return !!readLocal(paperId)[questionId];
}