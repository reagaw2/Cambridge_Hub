/**
 * csLTBank.js — Language Translators question bank
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

export const LT_QUESTIONS = [
  {
    id: "9618-w22-qp12-Q1b-i",
    label: "Question 1(b)(i)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Language Translators",
    topic_key: "language_translators",
    text: "State two drawbacks of using a compiler compared to an interpreter during program development.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State two drawbacks of using a compiler compared to an interpreter during program development.

Mark scheme — any two of the following:
- B1: larger amounts of source code take time to compile or slower to produce object code than an interpreter
- B1: code cannot be changed without recompilation
- B1: the program will not run if there are any errors or errors cannot be corrected in real time
- B1: one error may result in other false errors being reported
- B1: cannot easily test specific sections of the source code or cannot easily test unfinished source code

Student's answer: ${answer}

Award 1 mark for each distinct valid drawback up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid compiler drawback — slow compilation / cannot change without recompiling / will not run with errors / false errors / cannot test sections", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid compiler drawback", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp12-Q1b-ii",
    label: "Question 1(b)(ii)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Language Translators",
    topic_key: "language_translators",
    text: "Explain why high-level language programs might be partially compiled and partially interpreted.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain why high-level language programs might be partially compiled and partially interpreted.

Mark scheme:
- B1 mark 1: partially compiled programs can be used on different platforms as they are interpreted when run
- B1 mark 2: code is optimised for the CPU as machine code is generated at run time

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "partially compiled programs can be used on different platforms as they are interpreted when run", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "code optimised for CPU as machine code generated at run time", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp11-Q7a",
    label: "Question 7(a)",
    paper_ref: "9618/11 · Oct/Nov 2022",
    topic: "Language Translators",
    topic_key: "language_translators",
    text: "State two benefits to a programmer of using Dynamic Link Library files.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State two benefits to a programmer of using Dynamic Link Library files.

Mark scheme — any two of the following:
- B1: main memory requirements for the program are reduced as the DLL is loaded only once or when required
- B1: the executable file size is smaller because the executable does not contain all the library routines
- B1: maintenance not needed to be done by the programmer because the DLL is separate from the program
- B1: no need to recompile the main program when changes are made to the DLL because changes or improvements or error correction to the DLL file code are done independently of the main program

Student's answer: ${answer}

Award 1 mark for each distinct valid benefit up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid DLL benefit — reduced memory / smaller executable / no maintenance needed / no recompilation needed", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid DLL benefit", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-qp11-Q8a",
    label: "Question 8(a)",
    paper_ref: "9618/11 · Oct/Nov 2023",
    topic: "Language Translators",
    topic_key: "language_translators",
    text: "Identify the purpose of the first pass of a two-pass assembler.",
    total_marks: 1,
    response_schema: MARK_SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify the purpose of the first pass of a two-pass assembler.

Mark scheme:
- B1 mark 1: to create a symbol table

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "to create a symbol table", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_lt_question_index";

export function getNextLTQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % LT_QUESTIONS.length;
  return { question: LT_QUESTIONS[idx], idx, total: LT_QUESTIONS.length };
}

export function advanceLTIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}