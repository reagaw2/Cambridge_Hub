/**
 * mistakeDna.js — Mistake DNA Classification Engine
 *
 * Each entry now includes `student_response` — the raw text the student typed.
 *
 * {
 *   mark_type:        "B1" | "M1" | "A1" | "C1"
 *   error_category:   string
 *   concept_node:     string — the exact keyword or phrase that was missed
 *   student_response: string — the raw text the student submitted
 *   question_id:      string
 *   topic:            string
 *   subject:          "physics" | "cs"
 *   date:             ISO date string
 *   session_score:    number  (marks_earned / total_marks as a ratio 0–1)
 * }
 */

const PRECISION_SIGNALS = [
  "per unit", "proportional", "inversely", "directly", "rate of",
  "magnitude", "direction", "towards", "away", "negative", "positive",
  "at that point", "in that region", "between", "difference",
];

const CONCEPTUAL_SIGNALS = [
  "principle", "law", "effect", "phenomenon", "theory", "conservation",
  "kinetic", "potential", "thermal", "wave", "field", "force",
  "momentum", "energy", "charge", "current", "voltage", "resistance",
  "algorithm", "protocol", "process", "architecture", "compression",
  "encryption", "checksum", "parity", "validation", "verification",
];

const DEFINITION_SIGNALS = [
  "define", "state what is meant", "meaning of", "is defined as",
  "refers to", "represents", "what is meant by",
];

const UNIT_SIGNALS = [
  "unit", "si unit", "base unit", "derived unit", "symbol",
  "notation", "dimension",
];

const QUALIFIER_SIGNALS = [
  "at constant", "under", "assuming", "provided", "when", "only if",
  "thermodynamic", "absolute", "per unit mass", "per unit charge",
  "from infinity", "at infinity", "at rest", "in vacuum",
];

const SIGN_SIGNALS = [
  "negative", "positive", "opposite direction", "towards centre",
  "directed towards", "directed away", "decreasing", "increasing",
];

function classifyError(keyword, feedbackText) {
  const kw = (keyword ?? "").toLowerCase();
  const fb = (feedbackText ?? "").toLowerCase();
  const combined = `${kw} ${fb}`;

  if (UNIT_SIGNALS.some(s => combined.includes(s))) return "Unit / Notation Error";
  if (SIGN_SIGNALS.some(s => combined.includes(s))) return "Wrong Direction / Sign";
  if (QUALIFIER_SIGNALS.some(s => combined.includes(s))) return "Omitted Qualifying Condition";
  if (DEFINITION_SIGNALS.some(s => combined.includes(s))) return "Incomplete Definition";
  if (PRECISION_SIGNALS.some(s => combined.includes(s))) return "Precision Phrasing Flaw";
  if (CONCEPTUAL_SIGNALS.some(s => combined.includes(s))) return "Conceptual Misunderstanding";

  if (kw.split(" ").length <= 4) return "Missing Keyword";
  return "Logical Gap";
}

function inferMarkType(markKey, feedbackObj) {
  const idx = parseInt((markKey ?? "").replace("mark_", ""), 10);
  const kw = ((feedbackObj[markKey] ?? {}).keyword ?? "").toLowerCase();
  if (kw.startsWith("m1") || kw.includes("mandatory")) return "M1";
  if (kw.startsWith("a1") || kw.includes("accuracy")) return "A1";
  if (kw.startsWith("c1") || kw.includes("communication")) return "C1";
  const insight = (feedbackObj.cambridge_insight ?? "").toLowerCase();
  if (idx === 1 && insight.includes("m1")) return "M1";
  if (idx === 2 && insight.includes("a1")) return "A1";
  return "B1";
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * buildMistakeDna
 *
 * @param {object} feedback        — full Claude response object
 * @param {string} questionId
 * @param {string} topic
 * @param {string} subject         — "physics" | "cs"
 * @param {number} marksEarned
 * @param {number} totalMarks
 * @param {string} studentResponse — the raw text the student submitted
 * @returns {Array}                — array of DNA entry objects (only missed marks)
 */
export function buildMistakeDna(feedback, questionId, topic, subject, marksEarned, totalMarks, studentResponse = "") {
  if (!feedback) return [];

  const date = new Date().toISOString();
  const sessionScore = totalMarks > 0 ? marksEarned / totalMarks : 0;
  // Cap stored response at 600 chars to keep payloads lean
  const responseText = (studentResponse ?? "").trim().slice(0, 600);
  const dna = [];

  // ── Source A: pulse_layer_2_marks (structured) ────────────────────────
  if (Array.isArray(feedback.pulse_layer_2_marks) && feedback.pulse_layer_2_marks.length > 0) {
    for (const m of feedback.pulse_layer_2_marks) {
      if (m.earned) continue;
      dna.push({
        mark_type: m.notation ?? "B1",
        error_category: classifyError(m.description, m.examiner_note),
        concept_node: (m.description ?? m.keyword ?? "").trim(),
        student_response: responseText,
        question_id: questionId,
        topic: topic ?? "Unknown",
        subject: subject ?? "physics",
        date,
        session_score: sessionScore,
      });
    }
    return dna;
  }

  // ── Source B: flat mark_1, mark_2, … keys ────────────────────────────
  const markEntries = Object.entries(feedback)
    .filter(([k]) => /^mark_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]));

  for (const [key, val] of markEntries) {
    if (!val || val.earned) continue;
    dna.push({
      mark_type: inferMarkType(key, feedback),
      error_category: classifyError(val.keyword, val.feedback),
      concept_node: (val.keyword ?? "").trim(),
      student_response: responseText,
      question_id: questionId,
      topic: topic ?? "Unknown",
      subject: subject ?? "physics",
      date,
      session_score: sessionScore,
    });
  }

  return dna;
}

/**
 * mergeMistakeDna
 *
 * Merges new DNA entries into an existing array stored in Supabase.
 * Caps at 500 entries total (oldest removed first).
 * Deduplicates within the same session (same question_id + concept_node + date day).
 */
export function mergeMistakeDna(existing = [], incoming = []) {
  if (!incoming.length) return existing;

  const existingSet = new Set(
    existing.map(e => `${e.question_id}__${e.concept_node}__${(e.date ?? "").slice(0, 10)}`)
  );

  const filtered = incoming.filter(e => {
    const key = `${e.question_id}__${e.concept_node}__${(e.date ?? "").slice(0, 10)}`;
    return !existingSet.has(key);
  });

  const merged = [...existing, ...filtered];
  if (merged.length > 500) return merged.slice(merged.length - 500);
  return merged;
}

/**
 * getWeakestConcepts
 */
export function getWeakestConcepts(mistakeDna = [], topN = 10) {
  const freq = {};
  for (const entry of mistakeDna) {
    const key = `${entry.concept_node}__${entry.topic}`;
    freq[key] = (freq[key] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([key, count]) => {
      const [concept_node, topic] = key.split("__");
      return { concept_node, topic, count };
    });
}

/**
 * getMistakeDnaForTopic
 */
export function getMistakeDnaForTopic(mistakeDna = [], topicKey, subject) {
  return mistakeDna.filter(e => {
    const topicMatch = !topicKey || (e.topic ?? "").toLowerCase().replace(/\s+/g, "_") === topicKey;
    const subjectMatch = !subject || e.subject === subject;
    return topicMatch && subjectMatch;
  });
}