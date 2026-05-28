import { useCallback, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getMarkNodes, buildNodeAwarePrompt, validateMandatoryChain } from "@/lib/schemeWhisperer";

/**
 * useNodeAwareSubmit
 *
 * Fetches mark nodes from Supabase (fast, cached), builds node-aware prompt,
 * calls Claude, validates mandatory chain, and returns feedback immediately.
 *
 * No artificial delays. Feedback is returned the instant the AI responds.
 */
export function useNodeAwareSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (question, answer) => {
    setLoading(true);
    setError(null);

    // 1. Fetch atomic nodes (non-blocking — falls back gracefully if Supabase is slow)
    let nodes = [];
    try {
      nodes = await getMarkNodes(question.id);
    } catch (e) {
      console.warn("[useNodeAwareSubmit] getMarkNodes failed, using base prompt:", e.message);
    }

    // 2. Build enhanced prompt
    const basePrompt = question.prompt(answer);
    const prompt = nodes.length > 0 ? buildNodeAwarePrompt(basePrompt, nodes) : basePrompt;

    // 3. Call AI
    let rawFeedback = null;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
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
      setError("No response received. Please try again.");
      setLoading(false);
      return null;
    }

    // 4. Enforce M1 → A1 dependency rules
    const feedback = nodes.length > 0
      ? validateMandatoryChain(rawFeedback, nodes)
      : rawFeedback;

    setLoading(false);
    return feedback;
  }, []);

  return { submit, loading, error, setError };
}