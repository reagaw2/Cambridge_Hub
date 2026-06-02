import { supabaseClient } from "@/api/base44Client";
import { getSessionUserId } from "@/lib/userSession";

function localKey() {
  return `p1_exam_results_v1_${getSessionUserId()}`;
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(localKey()) ?? "[]"); } catch { return []; }
}

function writeLocal(results) {
  try { localStorage.setItem(localKey(), JSON.stringify(results)); } catch {}
}

async function getStudentRow() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;
  const { data: rows } = await supabaseClient
    .from("StudentData")
    .select("id, p1_exam_results")
    .eq("user_id", user.id);
  return rows?.[0] ?? null;
}

async function pushToSupabase(results) {
  try {
    const row = await getStudentRow();
    if (!row) return;
    await supabaseClient
      .from("StudentData")
      .update({ p1_exam_results: results })
      .eq("id", row.id);
  } catch (e) {
    console.warn("[p1ExamResultsStore] push failed:", e?.message ?? e);
  }
}

export async function loadExamResults() {
  const local = readLocal();
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const remote = Array.isArray(row.p1_exam_results) ? row.p1_exam_results : [];
    const remoteIds = new Set(remote.map(r => r.resultId));
    const localOnly = local.filter(r => !remoteIds.has(r.resultId));
    const merged = [...remote, ...localOnly].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function saveExamResult({ paperId, paperLabel, answers = {}, questions = [] }) {
  const score    = Object.values(answers).filter(a => a.correct && !a.flagged_as_guess).length;
  const guessed  = Object.values(answers).filter(a => a.flagged_as_guess).length;
  const incorrect = Object.values(answers).filter(a => !a.correct && !a.flagged_as_guess).length;
  const unanswered = questions.length - Object.keys(answers).length;
  const total    = questions.length;
  const pct      = total > 0 ? Math.round((score / total) * 100) : 0;

  const result = {
    resultId: `${paperId}_${Date.now()}`,
    paperId, paperLabel,
    date: new Date().toISOString(),
    score, guessed, incorrect, unanswered, total, pct,
    answerSummary: Object.fromEntries(
      Object.entries(answers).map(([qId, a]) => [qId, {
        chosen: a.chosen,
        correct: a.correct,
        flagged_as_guess: a.flagged_as_guess ?? false,
      }])
    ),
  };

  const existing = readLocal();
  const updated = [result, ...existing].slice(0, 100);
  writeLocal(updated);
  pushToSupabase(updated).catch(() => {});
  return result;
}

export function getExamResults() { return readLocal(); }

export function getResultsForPaper(paperId) {
  return readLocal().filter(r => r.paperId === paperId);
}