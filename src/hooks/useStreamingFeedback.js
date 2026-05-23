import { useState, useRef, useCallback } from "react";

// Yield to the browser event loop so React can flush the render
function yieldToBrowser() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export function useStreamingFeedback() {
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  // Use a ref to accumulate without stale closures
  const accumulatedRef = useRef("");

  const startStream = useCallback(async ({ prompt, response_json_schema }) => {
    setStreamText("");
    setFeedback(null);
    setError(null);
    setIsStreaming(true);
    accumulatedRef.current = "";

    const controller = new AbortController();
    abortRef.current = controller;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

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
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let gotText = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              accumulatedRef.current += event.delta.text;
              gotText = true;
              chunkCount++;
            }
          } catch {
            // skip malformed lines
          }
        }

        // Only update state + yield when we actually got text in this read()
        if (gotText) {
          setStreamText(accumulatedRef.current);
          // Yield to browser so React flushes the state update and repaints
          await yieldToBrowser();
        }
      }

      console.log(`[streaming] done. total chunks: ${chunkCount}, total chars: ${accumulatedRef.current.length}`);

      // Stream fully consumed — now parse JSON once
      const raw = accumulatedRef.current.trim();
      if (!raw) {
        setError("No response received. Please try again.");
        return;
      }

      let jsonText = raw;
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonText = match[1].trim();

      try {
        setFeedback(JSON.parse(jsonText));
      } catch {
        // Try to find a JSON object in the text
        const objMatch = jsonText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          try {
            setFeedback(JSON.parse(objMatch[0]));
          } catch {
            setError("Could not parse feedback. Please try again.");
          }
        } else {
          setError("Could not parse feedback. Please try again.");
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("[useStreamingFeedback] error:", err);
      setError(`Error: ${err.message}`);
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