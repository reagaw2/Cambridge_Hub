/**
 * schemeWhisperer.js — Scheme Whisperer
 *
 * Two responsibilities:
 *   1. INGEST  — parse existing question bank objects and upsert into
 *                `questions` + `mark_scheme_nodes` tables in Supabase.
 *   2. LOOKUP  — fetch atomic nodes for a question_id at grading time
 *                (replaces the hardcoded prompt-only approach).
 */

import { supabaseClient } from "@/api/base44Client";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Detect mark type from a keyword string.
 * Heuristic: keywords that start with "M1" / contain "mandatory" → M1
 *            keywords that start with "A1" / contain "accuracy"  → A1
 *            keywords that start with "C1"                        → C1
 *            everything else                                      → B1
 */
function inferMarkType(keyword = "", idx = 0, total = 1) {
  const kw = keyword.toLowerCase();
  if (kw.startsWith("m1") || kw.includes("mandatory")) return "M1";
  if (kw.startsWith("a1") || kw.includes("accuracy") || kw.includes("consequential")) return "A1";
  if (kw.startsWith("c1") || kw.includes("communication")) return "C1";
  // First mark of a 2-mark question where the prompt says M1 → infer
  return "B1";
}

/**
 * Parse the `response_schema` of a question bank entry to extract
 * mark nodes. Returns an array of node objects ready for upsert.
 */
function parseMarkNodes(question) {
  const nodes = [];
  const schema = question.response_schema?.properties ?? {};
  const markKeys = Object.keys(schema)
    .filter(k => /^mark_\d+$/.test(k))
    .sort((a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]));

  // Try to extract keyword hints from the prompt string
  const promptStr = typeof question.prompt === "function"
    ? question.prompt("__SAMPLE__")
    : "";

  markKeys.forEach((key, i) => {
    const idx = parseInt(key.split("_")[1], 10) - 1;
    // Pull keyword from mark_scheme string if available
    const keyword = extractKeywordForMark(question, i + 1, promptStr);
    const markType = inferMarkType(keyword, i, markKeys.length);
    const isMandatory = markType === "M1";
    const dependentOn = markType === "A1" && i > 0 ? i - 1 : null;

    nodes.push({
      node_index: idx,
      mark_type: markType,
      keyword: keyword || `Mark ${i + 1}`,
      aliases: [],
      is_mandatory: isMandatory,
      dependent_on: dependentOn,
      max_marks: 1,
    });
  });

  return nodes;
}

/**
 * Extract the keyword for mark N from the question's prompt string.
 * Looks for patterns like:
 *   "keyword": "force per unit positive charge"
 *   - B1 mark 1: force per unit positive charge
 */
function extractKeywordForMark(question, markNum, promptStr) {
  // Try mark_scheme field first
  if (question.mark_scheme) {
    const lines = question.mark_scheme.split(/\n|\. |; /);
    const line = lines[markNum - 1];
    if (line) {
      // Strip leading "B1:", "M1:", "A1:" prefixes
      return line.replace(/^[BMAb][1-9]\s*mark\s*\d+\s*:\s*/i, "")
                 .replace(/^[BMAb][1-9]\s*:\s*/i, "")
                 .trim();
    }
  }

  // Fallback: parse from prompt string
  const keywordPattern = new RegExp(
    `"keyword"\\s*:\\s*"([^"]+)"`,
    "g"
  );
  const matches = [...promptStr.matchAll(keywordPattern)];
  if (matches[markNum - 1]) {
    return matches[markNum - 1][1];
  }

  return "";
}

// ── INGEST ─────────────────────────────────────────────────────────────────

/**
 * ingestQuestionBank
 *
 * Upserts a flat array of question-bank objects into `questions` and
 * `mark_scheme_nodes`. Safe to call multiple times (upsert = idempotent).
 *
 * @param {Array}  questions  - array from any *Bank.js file
 * @param {string} subject    - "physics" | "cs"
 * @returns {{ ingested: number, errors: string[] }}
 */
export async function ingestQuestionBank(questions, subject = "physics") {
  const errors = [];
  let ingested = 0;

  for (const q of questions) {
    if (!q.id || !q.text) continue;

    // 1. Upsert into `questions`
    const { error: qError } = await supabaseClient
      .from("questions")
      .upsert({
        id: q.id,
        topic: q.topic ?? "Unknown",
        topic_key: q.topic_key ?? q.topic?.toLowerCase().replace(/\s+/g, "_") ?? "unknown",
        subject,
        paper_ref: q.paper_ref ?? null,
        label: q.label ?? null,
        question_text: q.text,
        total_marks: q.total_marks ?? 1,
      }, { onConflict: "id" });

    if (qError) {
      errors.push(`questions upsert failed for ${q.id}: ${qError.message}`);
      continue;
    }

    // 2. Parse nodes from schema / mark_scheme / prompt
    const nodes = parseMarkNodes(q);
    if (!nodes.length) continue;

    // 3. Delete existing nodes for this question (clean re-seed)
    await supabaseClient
      .from("mark_scheme_nodes")
      .delete()
      .eq("question_id", q.id);

    // 4. Insert fresh nodes
    const rows = nodes.map(n => ({ ...n, question_id: q.id }));
    const { error: nError } = await supabaseClient
      .from("mark_scheme_nodes")
      .insert(rows);

    if (nError) {
      errors.push(`mark_scheme_nodes insert failed for ${q.id}: ${nError.message}`);
      continue;
    }

    ingested++;
  }

  return { ingested, errors };
}

// ── LOOKUP ─────────────────────────────────────────────────────────────────

/**
 * getMarkNodes
 *
 * Fast lookup of atomic nodes for a question_id.
 * Called by the grading engine at answer-submission time.
 *
 * @param {string} questionId
 * @returns {Array} nodes sorted by node_index
 */
export async function getMarkNodes(questionId) {
  if (!questionId) return [];

  const { data, error } = await supabaseClient
    .from("mark_scheme_nodes")
    .select("*")
    .eq("question_id", questionId)
    .order("node_index", { ascending: true });

  if (error) {
    console.error("[schemeWhisperer] getMarkNodes error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * getMarkNodesForTopic
 *
 * Bulk-fetch all nodes for a topic — useful for pre-warming a cache.
 *
 * @param {string} topicKey
 * @param {string} subject
 * @returns {Array}
 */
export async function getMarkNodesForTopic(topicKey, subject = "physics") {
  const { data, error } = await supabaseClient
    .from("mark_scheme_nodes")
    .select("*, questions!inner(topic_key, subject)")
    .eq("questions.topic_key", topicKey)
    .eq("questions.subject", subject)
    .order("node_index", { ascending: true });

  if (error) {
    console.error("[schemeWhisperer] getMarkNodesForTopic error:", error.message);
    return [];
  }

  return data ?? [];
}

// ── GRADING HELPER ─────────────────────────────────────────────────────────

/**
 * buildNodeAwarePrompt
 *
 * Enhances an existing Claude prompt with structured node data pulled
 * from the database. The AI uses this to produce per-node verdicts.
 *
 * @param {string} basePrompt  - the original question.prompt(answer) output
 * @param {Array}  nodes       - from getMarkNodes()
 * @returns {string}           - enhanced prompt
 */
export function buildNodeAwarePrompt(basePrompt, nodes) {
  if (!nodes.length) return basePrompt;

  const nodeBlock = nodes
    .map(n =>
      `  Node ${n.node_index + 1} [${n.mark_type}${n.is_mandatory ? " MANDATORY" : ""}]: "${n.keyword}"` +
      (n.aliases?.length ? ` (aliases: ${n.aliases.join(", ")})` : "") +
      (n.dependent_on !== null ? ` — requires Node ${n.dependent_on + 1} to be awarded first` : "")
    )
    .join("\n");

  return `${basePrompt}

--- ATOMIC MARK SCHEME NODES (from Scheme Whisperer) ---
${nodeBlock}

When awarding marks, validate each node independently. Mandatory nodes (M1) must be present before their dependent A1 nodes can be awarded.`;
}

/**
 * validateMandatoryChain
 *
 * Post-processes the AI feedback object to enforce M1 → A1 dependency rules.
 * If an M1 mark was not earned, sets all dependent A1 marks to earned=false.
 *
 * @param {object} feedback  - raw AI feedback object (mark_1, mark_2, …)
 * @param {Array}  nodes     - from getMarkNodes()
 * @returns {object}         - corrected feedback object
 */
export function validateMandatoryChain(feedback, nodes) {
  if (!nodes.length) return feedback;
  const corrected = { ...feedback };

  nodes.forEach((node, i) => {
    const markKey = `mark_${node.node_index + 1}`;
    const mark = corrected[markKey];
    if (!mark) return;

    if (node.dependent_on !== null) {
      const parentKey = `mark_${node.dependent_on + 1}`;
      const parent = corrected[parentKey];
      if (parent && !parent.earned) {
        corrected[markKey] = {
          ...mark,
          earned: false,
          feedback: mark.feedback
            ? `${mark.feedback} (Note: cannot be awarded — mandatory prerequisite Mark ${node.dependent_on + 1} was not earned)`
            : `Cannot be awarded — mandatory prerequisite Mark ${node.dependent_on + 1} was not earned`,
        };
      }
    }
  });

  // Recount marks_earned after correction
  const totalEarned = nodes.reduce((sum, node) => {
    const key = `mark_${node.node_index + 1}`;
    return sum + (corrected[key]?.earned ? 1 : 0);
  }, 0);

  corrected.marks_earned = totalEarned;
  return corrected;
}