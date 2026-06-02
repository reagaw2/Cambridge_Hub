import { supabaseClient } from "@/api/base44Client";

const LOCAL_KEY = "p1_exam_results_v1";

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"); } catch { return []; }
}

function writeLocal(results) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(results)); } catch {}
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

/**
 * Load exam results from Supabase — falls back to localStorage.
 * Call once on mount of any screen that displays results.
 */
export async function loadExamResults() {
  const local = readLocal();
  try {
    const row = await getStudentRow();
    if (!row) return local;
    const remote = Array.isArray(row.p1_exam_results) ? row.p1_exam_results : [];
    // Merge: remote is source of truth, local fills gaps
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

/**
 * Save a completed exam result.
 * @param {object} params
 */
export async function saveExamResult({
  paperId,
  paperLabel,
  answers = {},
  questions = [],
}) {
  const score = Object.values(answers).filter(a => a.correct && !a.flagged_as_guess).length;
  const guessed = Object.values(answers).filter(a => a.flagged_as_guess).length;
  const incorrect = Object.values(answers).filter(a => !a.correct && !a.flagged_as_guess).length;
  const unanswered = questions.length - Object.keys(answers).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const result = {
    resultId: `${paperId}_${Date.now()}`,
    paperId,
    paperLabel,
    date: new Date().toISOString(),
    score,
    guessed,
    incorrect,
    unanswered,
    total,
    pct,
    // Store a compact answer map (just chosen + correct, not full feedback blobs)
    answerSummary: Object.fromEntries(
      Object.entries(answers).map(([qId, a]) => [qId, {
        chosen: a.chosen,
        correct: a.correct,
        flagged_as_guess: a.flagged_as_guess ?? false,
      }])
    ),
  };

  const existing = readLocal();
  const updated = [result, ...existing].slice(0, 100); // keep last 100 results
  writeLocal(updated);
  pushToSupabase(updated).catch(() => {});
  return result;
}

/**
 * Synchronous read from localStorage — use after loadExamResults() has run.
 */
export function getExamResults() {
  return readLocal();
}

/**
 * Get all results for a specific paper.
 */
export function getResultsForPaper(paperId) {
  return readLocal().filter(r => r.paperId === paperId);
}