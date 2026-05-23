import { defineHandler } from "nitro";
import { readBody, setResponseHeaders } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ prompt: string; response_json_schema: object }>(event);

  if (!body?.prompt) {
    event.node.res.statusCode = 400;
    event.node.res.end("prompt is required");
    return;
  }

  const apiKey = process.env.NITRO_ANTHROPIC_API_KEY;
  if (!apiKey) {
    event.node.res.statusCode = 500;
    event.node.res.end("ANTHROPIC_API_KEY not configured");
    return;
  }

  // Set SSE headers
  event.node.res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      stream: true,
      messages: [
        {
          role: "user",
          content: `${body.prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(body.response_json_schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
        },
      ],
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    event.node.res.write(`data: ${JSON.stringify({ error: "Anthropic request failed" })}\n\n`);
    event.node.res.end();
    return;
  }

  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(jsonStr);
          // Forward content_block_delta events which contain the text
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
            event.node.res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
          } else if (parsed.type === "message_stop") {
            event.node.res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (e) {
    event.node.res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`);
  } finally {
    event.node.res.end();
  }
});