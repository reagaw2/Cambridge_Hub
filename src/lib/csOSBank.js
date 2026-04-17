/**
 * csOSBank.js — Operating Systems question bank
 * CS data store only — completely separate from Physics.
 */

const MARK_SCHEMA = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_4: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

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

export const OS_QUESTIONS = [
  {
    id: "9618-w21-qp12-Q7b",
    label: "Question 7(b)",
    paper_ref: "9618/12 · Oct/Nov 2021",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Describe the file management tasks that an Operating System performs.",
    total_marks: 4,
    response_schema: MARK_SCHEMA,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the file management tasks that an Operating System performs.

Mark scheme — any four of the following:
- B1: storage space is divided into file allocation units
- B1: space is allocated to particular files
- B1: maintains or creates directory structures
- B1: specifies the logical method of file storage such as FAT or NTFS
- B1: provides file naming conventions
- B1: controls access or implements access rights or implements password protection or makes file sharing possible
- B1: specifies tasks that can be performed on a file such as open, close, delete, copy, create, move

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "storage space divided into file allocation units", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "space allocated to particular files", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "maintains or creates directory structures", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "controls access or implements access rights or file sharing", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w21-qp12-Q7c",
    label: "Question 7(c)",
    paper_ref: "9618/12 · Oct/Nov 2021",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Identify two utility programs that can be used to improve the performance of a computer and state how they improve the performance.",
    total_marks: 4,
    response_schema: MARK_SCHEMA,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two utility programs that can be used to improve the performance of a computer and state how they improve the performance.

Mark scheme — 1 mark for identifying the program, 1 mark for describing how it improves performance, maximum 2 marks per program:
- B1: defragmentation — less time taken to access files because each one is contiguous so there is less head movement
- B1: virus checker — makes more RAM available for programs to run by removing software that might be taking up memory
- B1: disk repair or disk contents analysis — prevents bad sectors being used because it identifies and marks them
- B1: disk or system clean up — releases storage by removing unwanted or temporary files

Student's answer: ${answer}

Award 1 mark for each correctly identified program and 1 mark for each correct explanation up to 4 total. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "valid utility program named — defragmentation / virus checker / disk repair / disk cleanup", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "correct explanation of how first program improves performance", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "second valid utility program named", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "correct explanation of how second program improves performance", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s23-qp11-Q3a",
    label: "Question 3(a)",
    paper_ref: "9618/11 · May/Jun 2023",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Describe how the Operating System manages the peripheral hardware devices of the computer.",
    total_marks: 4,
    response_schema: MARK_SCHEMA,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how the Operating System manages the peripheral hardware devices of the computer.

Mark scheme — any four of the following:
- B1: installs device drivers to allow communication between peripherals and computer
- B1: sends data and receives data to and from peripherals such as to an output device and from an input device
- B1: handles buffers for transfer of data to ensure smooth transfer between devices that transmit and receive at different speeds
- B1: manages interrupts or signals from the device

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "installs device drivers to allow communication between peripherals and computer", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "sends and receives data to and from peripherals", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "handles buffers for smooth data transfer between devices at different speeds", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "manages interrupts or signals from the device", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s23-qp11-Q3b",
    label: "Question 3(b)",
    paper_ref: "9618/11 · May/Jun 2023",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Hardware management is one key management task carried out by the Operating System. Identify two other key management tasks carried out by the Operating System.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Hardware management is one key management task carried out by the Operating System. Identify two other key management tasks carried out by the Operating System.

Mark scheme — any two of the following:
- B1: memory management
- B1: file management
- B1: security management
- B1: process management
- B1: error checking and recovery

Student's answer: ${answer}

Award 1 mark for each correct distinct task up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid OS management task — memory / file / security / process / error checking", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid OS management task", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s23-qp11-Q3c",
    label: "Question 3(c)",
    paper_ref: "9618/11 · May/Jun 2023",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "The Operating System has utility software including defragmentation software. Explain how defragmentation can improve the performance of the computer.",
    total_marks: 3,
    response_schema: MARK_SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how defragmentation can improve the performance of the computer.

Mark scheme — any three of the following:
- B1: rearranges blocks of individual files on the hard disk drive so they are contiguous or moves the free space together
- B1: accessing each file is faster
- B1: because there is no need to search for the next fragment or block of the file
- B1: so less head movement is needed

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "rearranges file blocks so they are contiguous / moves free space together", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "accessing files is faster / less head movement needed", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "no need to search for next fragment or block of file", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s21-qp13-Q2b",
    label: "Question 2(b)",
    paper_ref: "9618/13 · May/Jun 2021",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Identify four key management tasks that the Operating System will perform.",
    total_marks: 4,
    response_schema: MARK_SCHEMA,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify four key management tasks that the Operating System will perform.

Mark scheme — any four of the following:
- B1: memory management
- B1: file management
- B1: security management
- B1: hardware or device or peripheral or resources management
- B1: input or output management
- B1: process management
- B1: error checking and recovery
- B1: provision of a platform for software
- B1: provision of a user interface

Student's answer: ${answer}

Award 1 mark for each distinct valid task up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "first valid OS management task", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "second valid OS management task", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "third valid OS management task", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "fourth valid OS management task", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp11-Q7b",
    label: "Question 7(b)",
    paper_ref: "9618/11 · Oct/Nov 2022",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Memory management is one of the tasks performed by an Operating System. Describe the ways in which memory management organises and allocates Random Access Memory.",
    total_marks: 2,
    response_schema: MARK_SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the ways in which memory management organises and allocates Random Access Memory.

Mark scheme — any two of the following:
- B1: RAM is assigned into blocks
- B1: dynamic allocation of RAM to programs or processes
- B1: reclaims unused blocks of RAM
- B1: prevents two programs or processes occupying the same area of RAM at the same time
- B1: moves data from secondary storage when needed or manages paging, segmentation and virtual memory

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid memory management action — blocks / dynamic allocation / reclaims unused RAM / prevents overlap / manages paging", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid memory management action", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s24-qp12-Q6",
    label: "Question 6",
    paper_ref: "9618/12 · May/Jun 2024",
    topic: "Operating Systems",
    topic_key: "operating_systems",
    text: "Memory management and process management are two OS tasks. Explain how memory management and process management support multi-tasking.",
    total_marks: 4,
    response_schema: MARK_SCHEMA,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how memory management and process management support multi-tasking.

Mark scheme — maximum 3 marks per management task:
Memory management:
- B1: stores data from all currently running programs concurrently in RAM
- B1: stops the data from overwriting each other in RAM
- B1: decides which processes should be in main memory
- B1: makes efficient use of memory
Process management:
- B1: allows one process to be paused whilst another process can be actioned
- B1: decides which process is to be run next
- B1: switches between processes to allow them to share use of the processor
- B1: identification or description of scheduling

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4 total with maximum 3 from each management task. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "memory management point — stores concurrent program data in RAM / prevents overwriting / decides which processes in memory / efficient use of memory", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "second memory management point", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "process management point — pauses processes / decides next process / switches between processes / scheduling", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "second process management point", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_os_question_index";

export function getNextOSQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % OS_QUESTIONS.length;
  return { question: OS_QUESTIONS[idx], idx, total: OS_QUESTIONS.length };
}

export function advanceOSIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}