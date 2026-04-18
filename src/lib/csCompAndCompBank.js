/**
 * csCompAndCompBank.js — Computers and Components question bank
 * CS data store only — completely separate from Physics.
 */

const MARK_SCHEMA_2 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

export const COMP_QUESTIONS = [
  {
    id: "9618-w22-qp11-Q7d",
    label: "Question 7(d)",
    paper_ref: "9618/11 · Oct/Nov 2022",
    topic: "Computers and Components",
    topic_key: "computers_and_components",
    text: "Explain the reasons why increasing the amount of cache memory can improve the performance of a CPU.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the reasons why increasing the amount of cache memory can improve the performance of a CPU.

Mark scheme — any two of the following:
- B1: cache is fast access memory close to the CPU
- B1: cache stores frequently used instructions or data
- B1: more cache means more instructions or data can be transferred faster
- B1: less swapping between RAM and cache
- B1: prevents the CPU idling while waiting for data

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid cache benefit — fast access memory / stores frequently used data / more data transferred faster / less swapping / prevents CPU idling", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid cache benefit", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-ON22-Q3c",
    label: "Question 3(c)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Computers and Components",
    topic_key: "computers_and_components",
    text: "Embedded systems contain Read Only Memory and Random Access Memory. Explain the reasons why ROM is used in an embedded system.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the reasons why ROM is used in an embedded system.

Mark scheme:
- B1 mark 1: to store data that does not change OR to store boot up instructions or system software or firmware or BIOS
- B1 mark 2: data must be stored even when the device is without power

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "stores data that does not change / boot up instructions / firmware / BIOS", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "data stored even when device has no power", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ25-Q4b",
    label: "Question 4(b)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Computers and Components",
    topic_key: "computers_and_components",
    text: "A smart shelf system uses sensors to identify items taken from a shelf. Identify one type of sensor that can be used in this system. State how the sensor can be used to identify the items taken from a shelf.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify one type of sensor for a smart shelf system and state how it identifies items taken from a shelf.

Mark scheme:
- B1 mark 1: pressure sensor OR infrared sensor
- B1 mark 2: pressure sensor — detects when the pressure of an item is removed from or put back on a shelf OR infrared sensor — detects when the beam is broken for an item removed or added

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "pressure sensor OR infrared sensor", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "pressure — detects weight change / infrared — detects when beam is broken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_comp_question_index";

export function getNextCompQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % COMP_QUESTIONS.length;
  return { question: COMP_QUESTIONS[idx], idx, total: COMP_QUESTIONS.length };
}

export function advanceCompIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}