/**
 * pulsePromptBuilder.js — 6-Step Cambridge Feedback Protocol prompt builder.
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
 * Wraps any existing mark-scheme prompt into the 6-step protocol format.
 */
export function buildPulsePrompt(basePrompt, schema, subject = "physics") {
  const cfg = SUBJECT_CONFIG[subject] ?? SUBJECT_CONFIG.physics;

  const pulsePrompt = `${basePrompt}

---
IMPORTANT: After completing your normal JSON evaluation above, you MUST also populate SIX additional fields following the Cambridge Feedback Protocol:

"step1_system": One to two sentences — state the core question clearly and define what the system is trying to accomplish or measure. What physics/CS engine is running underneath this question?

"step2_phrase_breakdown": Two to four sentences — dissect the text of the question phrase-by-phrase, explaining the hidden mechanics behind specific wording choices. Why did Cambridge phrase it exactly this way?

"step3_tipping_point": One to two sentences — identify the exact boundary or structural constraint where the rules of the system shift. This is the core logic pivot point of the question.

"step4_math_visual": Two to three sentences — run the key mathematical reasoning step-by-step and describe a visual diagram or graph that models the physics/CS engine of this problem. Include numbers where relevant.

"step5_edge_case": Two to three sentences — flip the variables or geometry to show the polar opposite scenario. If the question is about X, show what changes when you invert the key parameter. Map the entire conceptual boundary.

"step6_takeaway": One punchy sentence of MAXIMUM 20 words — a highly optimised, reusable mental script or algorithmic rule deployable across any future Cambridge variant of this problem.

"pulse_layer_1": Same as step6_takeaway — the single most important exam hack.
"pulse_layer_2_marks": Array already captured in mark_1, mark_2, etc. — summarise each as { "notation": "${cfg.notation}", "description": "what was needed", "earned": true/false, "examiner_note": "one precise sentence" }.
"pulse_layer_3": Summary of steps 4 and 5 combined for the deep-dive panel.

ALL NINE fields are MANDATORY. Respond only in JSON.`;

  const extendedSchema = {
    ...schema,
    properties: {
      ...(schema.properties ?? {}),
      step1_system: { type: "string" },
      step2_phrase_breakdown: { type: "string" },
      step3_tipping_point: { type: "string" },
      step4_math_visual: { type: "string" },
      step5_edge_case: { type: "string" },
      step6_takeaway: { type: "string" },
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
 * Detects which subject a topic key belongs to.
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