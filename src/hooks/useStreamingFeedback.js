/**
 * useStreamingFeedback — calls the /api/llm-stream endpoint and streams
 * the response text chunk by chunk, then parses the final JSON.
 *
 * Returns:
 *   streamText   — the raw text built up so far (for display)
 *   isStreaming  — true while stream is active
 *   feedback     — the fully parsed JSON object once complete
 *   error        — error string if something went wrong
 *   startStream  — call this with { prompt, response_json_schema } to begin
 */
import { useState, useRef, useCallback } from "react";

export function useStreamingFeedback() {
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const startStream = useCallback(async ({ prompt, response_json_schema }) => {
    // Reset state
    setStreamText("");
    setFeedback(null);
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    try {
      const res = await fetch("/api/llm-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response_json_schema }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        // Fallback: try the non-streaming endpoint
        throw new Error(`Stream request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamText(accumulated);
            }
            if (parsed.done) {
              // Stream complete — parse the full JSON
              let jsonText = accumulated.trim();
              const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (jsonMatch) jsonText = jsonMatch[1].trim();
              const parsed = JSON.parse(jsonText);
              setFeedback(parsed);
            }
          } catch (parseErr) {
            // skip malformed SSE chunks
          }
        }
      }

      // If we never got a `done` event but accumulated text, try parsing anyway
      if (!feedback && accumulated.trim()) {
        try {
          let jsonText = accumulated.trim();
          const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) jsonText = jsonMatch[1].trim();
          setFeedback(JSON.parse(jsonText));
        } catch {
          setError("Could not parse AI response. Please try again.");
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;

      console.warn("[useStreamingFeedback] stream failed, falling back to /api/llm:", err.message);

      // ── Fallback to non-streaming endpoint ──────────────────────────────
      try {
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("No API key");

        const fallbackRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 4000,
            messages: [{
              role: "user",
              content: `${prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(response_json_schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
            }],
          }),
        });

        const data = await fallbackRes.json();
        const text = data.content?.[0]?.text ?? "";
        let jsonText = text.trim();
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonText = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonText);
        setStreamText(JSON.stringify(parsed, null, 2));
        setFeedback(parsed);
      } catch (fallbackErr) {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { streamText, isStreaming, feedback, error, startStream, abort };
}