import { useState, useEffect } from "react";
import { supabaseClient } from "@/api/base44Client";

// Bump this whenever the question bank changes to bust stale caches
const BANK_VERSION = "v2";

/**
 * useSupabaseQuestions
 *
 * Fetches questions from the Supabase `questions` table for a given topic_key.
 * Serves them in order, looping when exhausted. Persists progress in sessionStorage.
 *
 * @param {string} topicKey   - e.g. "data_representation"
 * @param {string} subject    - "cs" | "physics"
 */
export function useSupabaseQuestions(topicKey, subject = "cs") {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const progressKey = `supabase_q_idx_${BANK_VERSION}_${subject}_${topicKey}`;

  // Clear any old-version keys for this topic on mount
  useEffect(() => {
    const oldKey = `supabase_q_idx_${subject}_${topicKey}`;
    if (sessionStorage.getItem(oldKey) !== null) {
      sessionStorage.removeItem(oldKey);
    }
  }, [topicKey, subject]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    supabaseClient
      .from("questions")
      .select(`
        id,
        topic,
        topic_key,
        subject,
        paper_ref,
        label,
        question_text,
        total_marks,
        difficulty,
        mark_scheme_text,
        mark_scheme_nodes ( node_index, mark_type, keyword, aliases, is_mandatory, dependent_on, max_marks )
      `)
      .eq("topic_key", topicKey)
      .eq("subject", subject)
      .order("id", { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) { setError(err.message); setLoading(false); return; }
        setQuestions(data ?? []);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [topicKey, subject]);

  function getCurrentIdx() {
    return parseInt(sessionStorage.getItem(progressKey) ?? "0", 10);
  }

  function getCurrentQuestion() {
    if (!questions.length) return null;
    return questions[getCurrentIdx() % questions.length];
  }

  function advance() {
    const next = (getCurrentIdx() + 1) % questions.length;
    sessionStorage.setItem(progressKey, String(next));
  }

  function getProgress() {
    const idx = getCurrentIdx();
    return { idx: idx % Math.max(questions.length, 1), total: questions.length };
  }

  return { questions, loading, error, getCurrentQuestion, advance, getProgress };
}

/**
 * Build a Claude prompt from a Supabase question row.
 * Uses mark_scheme_nodes if present, otherwise falls back to mark_scheme_text.
 */
export function buildSupabasePrompt(question, answer) {
  const nodes = (question.mark_scheme_nodes ?? [])
    .sort((a, b) => a.node_index - b.node_index);

  let markSchemeBlock = "";
  if (nodes.length > 0) {
    markSchemeBlock = nodes.map((n, i) =>
      `- ${n.mark_type} mark ${i + 1}: ${n.keyword}${n.aliases?.length ? ` (also accept: ${n.aliases.join(", ")})` : ""}${n.is_mandatory ? " [MANDATORY]" : ""}${n.dependent_on !== null ? ` [requires mark ${n.dependent_on + 1}]` : ""}`
    ).join("\n");
  } else {
    markSchemeBlock = question.mark_scheme_text ?? "See mark scheme.";
  }

  const markKeys = nodes.length > 0
    ? nodes.map((_, i) => `"mark_${i + 1}": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence" }`).join(", ")
    : `"mark_1": { "earned": true or false, "keyword": "key phrase", "found": true or false, "feedback": "one sentence" }`;

  const marksTotal = question.total_marks ?? nodes.length ?? 1;

  return `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: "${question.question_text}"
Paper: ${question.paper_ref ?? "9618"}
Total marks: ${marksTotal}

Mark scheme:
${markSchemeBlock}

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of ${marksTotal}], ${markKeys}, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why", "next_step": "one sentence telling the student exactly what to focus on" }`;
}

/**
 * Build a response_json_schema from a Supabase question row.
 */
export function buildSupabaseSchema(question) {
  const nodes = (question.mark_scheme_nodes ?? [])
    .sort((a, b) => a.node_index - b.node_index);
  const count = nodes.length || question.total_marks || 1;

  const markProps = {};
  for (let i = 1; i <= count; i++) {
    markProps[`mark_${i}`] = {
      type: "object",
      properties: {
        earned: { type: "boolean" },
        keyword: { type: "string" },
        found: { type: "boolean" },
        feedback: { type: "string" },
      },
    };
  }

  return {
    type: "object",
    properties: {
      marks_earned: { type: "number" },
      ...markProps,
      cambridge_insight: { type: "string" },
      next_step: { type: "string" },
    },
    required: ["marks_earned", "cambridge_insight", "next_step"],
  };
}