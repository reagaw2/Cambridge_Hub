/**
 * pulsePromptBuilder.js — 3-Layer Pulse Answer Engine prompt builder.
 * Enforces a subject-agnostic structured response for all Cambridge subjects.
 */

const SUBJECT_CONFIG = {
  physics: {
    accentLabel: "Physics Hack",
    notation: "B1, M1, A1 marks",
    heuristicExample: 'e.g. "Negligible air resistance = constant horizontal velocity"',
  },
  cs: {
    accentLabel: "CS Hack",
    notation: "B1 marks",
    heuristicExample: 'e.g. "Validation checks reasonableness, verification checks accuracy"',
  },
  math: {
    accentLabel: "Maths Hack",
    notation: "B1, M1, A1, C1 marks",
    heuristicExample: 'e.g. "Modulus = geometric distance — always non-negative"',
  },
};

/**
 * Wraps any existing mark-scheme prompt into the 3-layer Pulse format.
 *
 * @param {string} basePrompt   - The original per-question marking prompt
 * @param {object} schema       - The existing response_json_schema
 * @param {string} subject      - "physics" | "cs" | "math"
 * @returns {{ prompt: string, schema: object }}
 */
export function buildPulsePrompt(basePrompt, schema, subject = "physics") {
  const cfg = SUBJECT_CONFIG[subject] ?? SUBJECT_CONFIG.physics;

  const pulsePrompt = `${basePrompt}

---
IMPORTANT: After completing your normal JSON evaluation above, you MUST also populate THREE additional fields in your JSON response:

"pulse_layer_1": A single punchy sentence of MAXIMUM 20 words that gives the student the core linguistic trap, trick word, or key constraint they must remember for this question type. ${cfg.heuristicExample}. This is the EXAM HACK — make it memorable and direct.

"pulse_layer_2_marks": An array of mark objects already captured in your mark_1, mark_2, etc. fields. Summarise each mark as: { "notation": "${cfg.notation} label", "description": "what was needed", "earned": true/false, "examiner_note": "one precise sentence on what Cambridge looks for here" }.

"pulse_layer_3": An optional 2–4 sentence deep-dive conceptual explanation or derivation for students who want to fully understand the underlying principle. If the question is straightforward, still provide a useful extension insight.

These three fields are MANDATORY. Do not omit them. Respond only in JSON.`;

  // Extend the existing schema with the 3 pulse fields
  const extendedSchema = {
    ...schema,
    properties: {
      ...(schema.properties ?? {}),
      pulse_layer_1: { type: "string" },
      pulse_layer_2_marks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            notation: { type: "string" },
            description: { type: "string" },
            earned: { type: "boolean" },
            examiner_note: { type: "string" },
          },
        },
      },
      pulse_layer_3: { type: "string" },
    },
  };

  return { prompt: pulsePrompt, schema: extendedSchema };
}

/**
 * Detects which subject a topic key / topic label belongs to.
 */
export function detectSubject(topicKey = "") {
  const k = topicKey.toLowerCase();
  if (
    k.includes("operating") || k.includes("network") || k.includes("data_rep") ||
    k.includes("compress") || k.includes("language_trans") || k.includes("ethics") ||
    k.includes("data_sec") || k.includes("data_integ") || k.includes("computers_and")
  ) return "cs";
  if (k.includes("algebra") || k.includes("calculus") || k.includes("statistic") || k.includes("math")) return "math";
  return "physics";
}