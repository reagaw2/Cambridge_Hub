import { useCallback, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMarkNodes, buildNodeAwarePrompt, validateMandatoryChain } from "@/lib/schemeWhisperer";

const PULSE_EXTENSION = `
Also include these concise fields (1-2 sentences each):
"step1_system": what concept is tested,
"step2_phrase_breakdown": hidden meaning in key question words,
"step3_tipping_point": the logical boundary that determines the answer,
"step4_math_visual": key calculation or diagram description,
"step5_edge_case": what changes if you flip the main variable,
"step6_takeaway": reusable rule max 15 words,
"pulse_layer_1": same as step6_takeaway,
"pulse_layer_2_marks": array of {notation, description, earned:bool, examiner_note},
"pulse_layer_3": one sentence combining steps 4 and 5.`;

// How long to wait before retrying with the stripped-down prompt
const FULL_TIMEOUT_MS = 10_000;

/**
 * Race a promise against a timeout. Resolves with { timedOut: true } on timeout.
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve({ timedOut: true }), ms)),
  ]);
}

/**
 * Fast fallback prompt — marks only, no 6-step protocol.
 * Used when the full call times out.
 */
function buildFastPrompt(question, answer) {
  return question.prompt(answer);
}

export function useNodeAwareSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  const submit = useCallback(async (question, answer) => {
    setLoading(true);
    setError(null);
    setTimedOut(false);

    // 1. Fetch atomic nodes (non-blocking — skip on error)
    let nodes = [];
    try {
      nodes = await Promise.race([
        getMarkNodes(question.id),
        new Promise(resolve => setTimeout(() => resolve([]), 3000)),
      ]);
    } catch {
      // silently skip
    }

    // 2. Build full prompt
    const basePrompt = question.prompt(answer);
    const nodePrompt = nodes.length > 0 ? buildNodeAwarePrompt(basePrompt, nodes) : basePrompt;
    const fullPrompt = nodePrompt + PULSE_EXTENSION;

    const pulseSchema = {
      ...question.response_schema,
      properties: {
        ...(question.response_schema?.properties ?? {}),
        step1_system: { type: "string" },
        step2_phrase_breakdown: { type: "string" },
        step3_tipping_point: { type: "string" },
        step4_math_visual: { type: "string" },
        step5_edge_case: { type: "string" },
        step6_takeaway: { type: "string" },
        pulse_layer_1: { type: "string" },
        pulse_layer_2_marks: { type: "array", items: { type: "object" } },
        pulse_layer_3: { type: "string" },
      },
    };

    // 3. Try full call with timeout
    const fullCallPromise = base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: "claude_sonnet_4_6",
      response_json_schema: pulseSchema,
    }).then(r => r?.response ?? r).catch(() => null);

    const fullResult = await withTimeout(fullCallPromise, FULL_TIMEOUT_MS);

    // 4. If full call succeeded in time, use it
    if (fullResult && !fullResult.timedOut && fullResult.marks_earned !== undefined) {
      const feedback = nodes.length > 0
        ? validateMandatoryChain(fullResult, nodes)
        : fullResult;
      setLoading(false);
      return feedback;
    }

    // 5. Timed out — fall back to fast marks-only call
    setTimedOut(true);

    const fastResult = await base44.integrations.Core.InvokeLLM({
      prompt: buildFastPrompt(question, answer),
      model: "claude_sonnet_4_6",
      response_json_schema: question.response_schema,
    }).then(r => r?.response ?? r).catch(() => null);

    setLoading(false);
    setTimedOut(false);

    if (!fastResult) {
      setError("Could not get feedback. Please try again.");
      return null;
    }

    const feedback = nodes.length > 0
      ? validateMandatoryChain(fastResult, nodes)
      : fastResult;

    return feedback;
  }, []);

  return { submit, loading, error, timedOut, setError };
}