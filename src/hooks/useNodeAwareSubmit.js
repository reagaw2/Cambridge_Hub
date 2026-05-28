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

    // 3. Extend schema with pulse fields
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