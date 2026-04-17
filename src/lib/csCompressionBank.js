/**
 * csCompressionBank.js — Compression question bank
 * CS data store only — completely separate from Physics.
 */

const MARK_SCHEMA_3 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

export const COMPRESSION_QUESTIONS = [
  {
    id: "9618-w22-qp11-Q7c",
    label: "Question 7(c)",
    paper_ref: "9618/11 · Oct/Nov 2022",
    topic: "Compression",
    topic_key: "compression",
    text: "An Operating System may include a utility program to compress text files. Describe one appropriate method of compressing a text file.",
    total_marks: 3,
    response_schema: MARK_SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe one appropriate method of compressing a text file.

Mark scheme — any three of the following:
- B1: lossless compression or run length encoding
- B1: repeated sequences of characters are replaced by
- B1: a single copy of the character
- B1: and a counter of the number of characters

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "lossless compression or run length encoding", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "repeated sequences of characters are replaced", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "single copy of character and a counter of the number of characters", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_compression_question_index";

export function getNextCompressionQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % COMPRESSION_QUESTIONS.length;
  return { question: COMPRESSION_QUESTIONS[idx], idx, total: COMPRESSION_QUESTIONS.length };
}

export function advanceCompressionIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}