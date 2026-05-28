/**
 * pulsePromptBuilder.js — 6-Step Cambridge Feedback Protocol prompt builder.
 * Kept lean to minimise latency: no verbose field instructions, just concise JSON spec.
 */

/**
 * Wraps any existing mark-scheme prompt into the 6-step protocol format.
 */
export function buildPulsePrompt(basePrompt, schema, subject = "physics") {
  const pulsePrompt = `${basePrompt}

Also populate these six fields (be concise — each is 1-3 sentences max):
"step1_system": What is this question fundamentally testing? One sentence.
"step2_phrase_breakdown": Which specific words in the question carry hidden meaning? 1-2 sentences.
"step3_tipping_point": The exact logical boundary or constraint that determines the correct answer. One sentence.
"step4_math_visual": Key calculation or diagram description that proves the answer. 1-2 sentences.
"step5_edge_case": What if you flipped the key variable — how would the answer change? One sentence.
"step6_takeaway": The reusable rule for any Cambridge variant of this question. Max 15 words.
"pulse_layer_1": Same as step6_takeaway.
"pulse_layer_2_marks": Array of { "notation", "description", "earned": bool, "examiner_note" } — one entry per mark point.
"pulse_layer_3": One sentence combining steps 4 and 5.`;

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