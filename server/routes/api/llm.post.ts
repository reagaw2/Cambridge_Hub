import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ prompt: string; schema: object }>(event);

  if (!body?.prompt) {
    throw createError({ statusCode: 400, statusMessage: "prompt is required" });
  }

  const apiKey = process.env.NITRO_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "ANTHROPIC_API_KEY not configured" });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `${body.prompt}\n\nIMPORTANT: Return your response EXACTLY matching this JSON schema: ${JSON.stringify(body.schema)}. Do not include any conversational intro/outro text, only valid JSON.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw createError({ statusCode: response.status, statusMessage: `Anthropic error: ${err}` });
  }

  const data = await response.json() as { content: { text: string }[] };
  const text = data.content?.[0]?.text;

  try {
    return JSON.parse(text);
  } catch {
    throw createError({ statusCode: 502, statusMessage: `Invalid JSON from Anthropic: ${text}` });
  }
});
