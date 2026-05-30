import { useCallback, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMarkNodes, buildNodeAwarePrompt, validateMandatoryChain } from "@/lib/schemeWhisperer";

// Only request L1 + L2 fields — L3 is fetched on demand in PulseFeedback
const PULSE_EXTENSION = `

Also return these CONCISE additional fields:
"pulse_layer_1": "Identify the single KEY WORD or phrase in the question whose hidden meaning unlocks all similar Cambridge questions. State what it really means to Cambridge in ≤15 words.",
"cambridge_insight": "What Cambridge specifically expects to award full marks. Max 2 sentences.",
"pulse_layer_2_marks": [{"notation":"B1/M1/A1","description":"exact mark criterion","earned":true or false,"examiner_note":"one sentence only"}]`;

export function useNodeAwareSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (question, answer) => {
    setLoading(true);
    setError(null);

    // 1. Fetch atomic nodes
    let nodes = [];
    try {
      nodes = await getMarkNodes(question.id);
    } catch (e) {
      console.warn("[useNodeAwareSubmit] getMarkNodes failed:", e.message);
    }

    // 2. Build prompt — base + node awareness + lean pulse extension
    const basePrompt = question.prompt(answer);
    const nodePrompt = nodes.length > 0 ? buildNodeAwarePrompt(basePrompt, nodes) : basePrompt;
    const prompt = nodePrompt + PULSE_EXTENSION;

    // 3. Extend schema with only L1+L2 pulse fields
    const pulseSchema = {
      ...question.response_schema,
      properties: {
        ...(question.response_schema?.properties ?? {}),
        pulse_layer_1: { type: "string" },
        cambridge_insight: { type: "string" },
        pulse_layer_2_marks: { type: "array", items: { type: "object" } },
      },
    };

    // 4. Call AI
    let rawFeedback = null;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: pulseSchema,
      });
      rawFeedback = result?.response ?? result;
    } catch (e) {
      console.error("[useNodeAwareSubmit] LLM call failed:", e);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return null;
    }

    if (!rawFeedback) {
      setError("No response received. Please try again.");
      setLoading(false);
      return null;
    }

    // 5. Enforce M1 → A1 dependency rules
    const feedback = nodes.length > 0
      ? validateMandatoryChain(rawFeedback, nodes)
      : rawFeedback;

    setLoading(false);
    return feedback;
  }, []);

  return { submit, loading, error, setError };
}