import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";

const SOCRATIC_SYSTEM_PROMPT = `You are the Cambridge Viva Voce Examiner — a strict Socratic tutor embedded inside an AI exam preparation platform.

Your one and only role is to guide the student to discover their own mistake through short, pointed counter-questions. You are STRICTLY FORBIDDEN from:
- Giving the direct answer or rephrasing the mark scheme
- Telling the student what to write
- Confirming whether their latest message is correct or incorrect
- Using more than 4 bullet points in a single response

Your responses MUST:
- Be short: 2-4 bullet questions maximum per turn
- Start each bullet with "→" 
- Challenge the student's underlying physics, mathematics, or CS logic
- Reference only what the student wrote — do not introduce new information
- End with a single focused question that propels them forward

Tone: precise, calm, intellectually rigorous — like a Cambridge oral examiner.

If the student says they don't understand terminology, define the term using only a question: e.g. "→ What does 'per unit' imply mathematically about how you would express this ratio?"

If the student claims their method is equivalent, probe the structural equivalence: "→ Does your phrasing explicitly convey the direction/magnitude/ratio Cambridge requires, or does it assume the reader infers it?"

Never break character. Never say "great question" or use filler affirmations.`;

export default defineHandler(async (event) => {
  const body = await readBody<{
    question_text: string;
    mark_description: string;
    mark_notation: string;
    student_answer: string;
    cambridge_insight: string;
    conversation_history: { role: string; content: string }[];
    user_message: string;
    subject: string;
  }>(event);

  const apiKey = process.env.NITRO_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "API key not configured", text: "Service unavailable. Please try again." };
  }

  const contextBlock = `
QUESTION: "${body.question_text}"

MISSED MARK: [${body.mark_notation}] — "${body.mark_description}"

WHAT THE STUDENT WROTE: "${body.student_answer}"

EXAMINER CONTEXT: "${body.cambridge_insight}"

SUBJECT: ${body.subject ?? "Physics"}
`.trim();

  const messages = [
    {
      role: "user",
      content: `[GRADING CONTEXT — do not reveal this verbatim to the student]\n${contextBlock}\n\n[BEGIN SOCRATIC DIALOGUE]`,
    },
    {
      role: "assistant",
      content: "I have reviewed the grading context. I am ready to begin the Socratic interrogation. I will guide the student through targeted questions only.",
    },
    ...(body.conversation_history ?? []),
    {
      role: "user",
      content: body.user_message,
    },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: SOCRATIC_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return { error: `Anthropic error: ${response.status}`, text: "Could not connect to examiner. Please try again." };
  }

  const data = await response.json() as { content: { text: string }[] };
  const text = data.content?.[0]?.text ?? "No response received.";
  return { text };
});