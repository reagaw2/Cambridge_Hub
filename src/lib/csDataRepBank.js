/**
 * csDataRepBank.js — Data Representation question bank
 * CS data store only — completely separate from Physics.
 */

const MARK_SCHEMA_1 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

export const DATA_REP_QUESTIONS = [
  {
    id: "9618-s23-qp11-Q3d-i",
    label: "Question 3(d)(i)",
    paper_ref: "9618/11 · May/Jun 2023",
    topic: "Data Representation",
    topic_key: "data_representation",
    text: "State the difference between a kibibyte and a kilobyte.",
    total_marks: 1,
    response_schema: MARK_SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State the difference between a kibibyte and a kilobyte.

Mark scheme:
- B1 mark 1: kibibyte is 1024 bytes and kilobyte is 1000 bytes OR kibibyte is a binary prefix and kilobyte is a denary prefix

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "kibibyte is 1024 bytes and kilobyte is 1000 bytes / kibibyte binary prefix and kilobyte denary prefix", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "Q_9618_13_N25_001",
    label: "Question 1(b)",
    paper_ref: "9618/13 · Oct/Nov 2025",
    topic: "Data Representation",
    topic_key: "data_representation",
    text: "Explain how text is represented by the ASCII character set.",
    total_marks: 2,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
      required: ["marks_earned","mark_1","cambridge_insight","next_step"],
    },
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how text is represented by the ASCII character set.

Mark scheme:
- B1 mark 1: each character has a unique code
- B1 mark 2: each character in the text is replaced sequentially by its code

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "each character has a unique code", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "each character in the text is replaced sequentially by its code", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "Q_9618_13_N25_002",
    label: "Question 1(c)",
    paper_ref: "9618/13 · Oct/Nov 2025",
    topic: "Data Representation",
    topic_key: "data_representation",
    text: "Give two differences between the ASCII and UNICODE character sets.",
    total_marks: 2,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
      required: ["marks_earned","mark_1","cambridge_insight","next_step"],
    },
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two differences between the ASCII and UNICODE character sets.

Mark scheme:
- B1 mark 1: ASCII uses 7/8 bits — Unicode can use many more, up to 32 bits
- B1 mark 2: Unicode can represent a wider range of characters including different languages

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Each difference must be comparative — stating a fact about one without referencing the other earns no credit. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "ASCII uses 7/8 bits whereas Unicode uses more bits (up to 32)", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "Unicode represents a wider range of characters including different languages", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_data_rep_question_index";

export function getNextDataRepQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % DATA_REP_QUESTIONS.length;
  return { question: DATA_REP_QUESTIONS[idx], idx, total: DATA_REP_QUESTIONS.length };
}

export function advanceDataRepIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}