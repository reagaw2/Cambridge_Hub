/**
 * useStreamingFeedback — streams directly from Anthropic's API in the browser.
 * Uses the SSE stream=true API and reads chunks as they arrive.
 */
import { useState, useRef, useCallback } from "react";

export function useStreamingFeedback() {
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const startStream = useCallback(async ({ prompt, response_json_schema }) => {
    setStreamText("");
    setFeedback(null);
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    let accumulated = "";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
          stream: true,
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(response_json_schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Anthropic API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process all complete SSE lines in the buffer
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              accumulated += event.delta.text;
              setStreamText(accumulated);
            }

            if (event.type === "message_stop") {
              // Parse the final accumulated JSON
              let jsonText = accumulated.trim();
              const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (match) jsonText = match[1].trim();
              try {
                setFeedback(JSON.parse(jsonText));
              } catch {
                // Try finding JSON object in the text
                const objMatch = jsonText.match(/\{[\s\S]*\}/);
                if (objMatch) setFeedback(JSON.parse(objMatch[0]));
                else setError("Could not parse feedback. Please try again.");
              }
            }
          } catch {
            // skip malformed event lines
          }
        }
      }

      // Fallback: if message_stop never fired but we have text
      if (!feedback && accumulated.trim()) {
        let jsonText = accumulated.trim();
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonText = match[1].trim();
        try {
          setFeedback(JSON.parse(jsonText));
        } catch {
          const objMatch = jsonText.match(/\{[\s\S]*\}/);
          if (objMatch) {
            try { setFeedback(JSON.parse(objMatch[0])); } catch { setError("Could not parse feedback."); }
          } else {
            setError("Could not parse feedback. Please try again.");
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("[useStreamingFeedback] error:", err);
      setError("Something went wrong. Please try again.");
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