import { useCallback, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMarkNodes, buildNodeAwarePrompt, validateMandatoryChain } from "@/lib/schemeWhisperer";

/**
 * useNodeAwareSubmit
 *
 * Drop-in replacement for inline base44.integrations.Core.InvokeLLM calls
 * in question attempt pages.
 *
 * Returns:
 *   submit(question, answer) → Promise<feedbackObject | null>
 *   loading: boolean
 *   error: string | null
 */
export function useNodeAwareSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (question, answer) => {
    setLoading(true);
    setError(null);

    let nodes = [];
    try {
      nodes = await getMarkNodes(question.id);
    } catch (e) {
      console.warn("[useNodeAwareSubmit] getMarkNodes failed, falling back to base prompt:", e);
    }

    // Build prompt — enhanced with nodes if available, base prompt otherwise
    const basePrompt = question.prompt(answer);
    const enhancedPrompt = nodes.length > 0
      ? buildNodeAwarePrompt(basePrompt, nodes)
      : basePrompt;

    let rawFeedback = null;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: enhancedPrompt,
        model: "claude_sonnet_4_6",
        response_json_schema: question.response_schema,
      });
      rawFeedback = result?.response ?? result;
    } catch (e) {
      console.error("[useNodeAwareSubmit] LLM call failed:", e);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return null;
    }

    if (!rawFeedback) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return null;
    }

    // Validate mandatory chain — enforces M1→A1 dependencies
    const feedback = nodes.length > 0
      ? validateMandatoryChain(rawFeedback, nodes)
      : rawFeedback;

    setLoading(false);
    return feedback;
  }, []);

  return { submit, loading, error, setError };
}