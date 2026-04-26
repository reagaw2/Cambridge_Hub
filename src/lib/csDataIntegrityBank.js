/**
 * csDataIntegrityBank.js — Data Integrity question bank
 * CS data store only — completely separate from Physics.
 */

const SCHEMA_5 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_4: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_5: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_4 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_4: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_3 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_2 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_1 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

export const DATA_INTEGRITY_QUESTIONS = [
  {
    id: "9618-w21-13-Q2bi",
    label: "Question 2(b)(i)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Describe how data validation helps to protect the integrity of the data. Give an example in your answer.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how data validation helps to protect the integrity of data. Give an example.

Mark scheme:
- B1 mark 1: validation checks that data is reasonable or sensible
- B1 mark 2: example such as checking data is the right number or type of characters

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "validation checks data is reasonable or sensible", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "example of validation — right number or type of characters", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w21-13-Q2bii",
    label: "Question 2(b)(ii)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Describe how data verification helps to protect the integrity of the data. Give an example in your answer.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how data verification helps to protect the integrity of data. Give an example.

Mark scheme:
- B1 mark 1: verification checks that data is the same as the original
- B1 mark 2: example such as double entry

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "verification checks data is the same as the original", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "example of verification — double entry", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-12-Q4a",
    label: "Question 4(a)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "State the difference between data verification and data validation.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State the difference between data verification and data validation.

Mark scheme:
- B1 mark 1: data verification is checking if input data is the same as the original whereas data validation is checking that the data is reasonable or sensible

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "verification checks data same as original / validation checks data is reasonable or sensible", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-12-Q4b",
    label: "Question 4(b)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "A checksum can be used to detect errors during data transmission. Describe how a checksum is used.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how a checksum is used to detect errors during data transmission.

Mark scheme:
- B1 mark 1: checksum value is calculated from the data before transmission
- B1 mark 2: this calculated value is transmitted with the data
- B1 mark 3: the receiving computer recalculates the checksum from the received data and if the checksums match no error has occurred OR if they do not match an error has occurred

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "checksum value calculated from data before transmission", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "calculated value transmitted with the data", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "receiver recalculates checksum and compares — match means no error / mismatch means error", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-12-Q4c",
    label: "Question 4(c)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "One validation method is a presence check. Describe two other validation methods that can be used to validate non-numeric data.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe two validation methods other than a presence check that can validate non-numeric data.

Mark scheme — any two of the following:
- B1: format check — to make sure data is in the required format or only expected characters are allowed
- B1: existence check — to make sure the data is already present in the system
- B1: length check — to make sure the data contains the correct number of characters
- B1: type check — to ensure that non-numeric data is entered

Student's answer: ${answer}

Award 1 mark for each distinct valid method up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "format check / existence check / length check / type check", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid validation method with description", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-13-Q5bi",
    label: "Question 5(b)(i)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Identify and describe one method of data verification that can be used when transferring data from paper to a computer.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify and describe one method of data verification used when transferring data from paper to a computer.

Mark scheme:
- B1 mark 1: visual check OR double entry
- B1 mark 2: visual check — manually compare the data entered with the original document OR double entry — enter the data twice and the system compares them to see if they are the same

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "visual check OR double entry", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "visual — compare with original / double entry — enter twice and system compares", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-13-Q5biii",
    label: "Question 5(b)(iii)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Explain why the data in the system may not be correct even after validating and verifying the data.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain why data in a system may not be correct even after validating and verifying it.

Mark scheme:
- B1 mark 1: validation checks data is reasonable or within bounds but does not check that accurate data has been entered
- B1 mark 2: verification checks if the data matches the data given but does not check if the original data is accurate

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "validation checks data is reasonable but does not check accuracy of data entered", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "verification checks data matches original but does not check if original data is accurate", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s23-13-Q6a",
    label: "Question 6(a)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Explain how a digital signature is used to authenticate a digital document during transmission over a network.",
    total_marks: 5,
    response_schema: SCHEMA_5,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how a digital signature authenticates a digital document during network transmission.

Mark scheme:
- B1 mark 1: the sender hashes the document
- B1 mark 2: to produce a digest
- B1 mark 3: the sender encrypts the digest to create the digital signature
- B1 mark 4: the message and signature are sent to the receiver who decrypts the signature to reproduce the digest and uses the same hashing algorithm on the received document to produce a second digest
- B1 mark 5: the receiver compares both digests and if they are the same the document is authentic

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 5], "mark_1": { "earned": true or false, "keyword": "sender hashes the document", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "to produce a digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "sender encrypts the digest to create the digital signature", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "receiver decrypts signature to reproduce digest / applies same hashing algorithm to produce second digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_5": { "earned": true or false, "keyword": "receiver compares both digests — if same the document is authentic", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-13-Q8a",
    label: "Question 8(a)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Data verification is one method of protecting the integrity of data. Describe one other method of protecting the integrity of data.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe one method other than data verification that protects the integrity of data.

Mark scheme:
- B1 mark 1: validation or a named validation method
- B1 mark 2: protects the data by ensuring that the data is reasonable or sensible and within specified bounds

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "validation or a named validation method", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "ensures data is reasonable or sensible and within specified bounds", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s25-11-Q7b",
    label: "Question 7(b)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "A banker receives confidential data that includes a digital signature. Explain how a digital signature can make sure the data has not been changed during transmission.",
    total_marks: 5,
    response_schema: SCHEMA_5,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how a digital signature ensures data has not been changed during transmission.

Mark scheme:
- B1 mark 1: the sender hashes the document or message to produce a digest
- B1 mark 2: the sender encrypts the digest to create the digital signature
- B1 mark 3: the message and signature are sent to the receiver who decrypts the signature to reproduce the digest
- B1 mark 4: the receiver uses the same hashing algorithm on the received document to produce a second digest
- B1 mark 5: the receiver compares both digests and if they are the same the document has not been changed

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 5], "mark_1": { "earned": true or false, "keyword": "sender hashes document or message to produce a digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "sender encrypts digest to create the digital signature", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "receiver decrypts signature to reproduce the digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "receiver applies same hashing algorithm to received document to produce second digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_5": { "earned": true or false, "keyword": "receiver compares both digests — if same the document has not been changed", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s25-11-Q7c",
    label: "Question 7(c)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "The data that is transferred can also be verified using a checksum. Explain how data can be verified using a checksum.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how data can be verified using a checksum.

Mark scheme:
- B1 mark 1: the data is put through an algorithm to create a checksum value
- B1 mark 2: the data and checksum are sent to the receiver who performs the same algorithm on the data
- B1 mark 3: if both checksums match the data is verified

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "data put through algorithm to create a checksum value", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "data and checksum sent to receiver who performs same algorithm", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "if both checksums match the data is verified", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s21-12-Q8a",
    label: "Question 8(a)",
    paper_ref: "9618/12 · May/Jun 2021",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Describe the difference between the security and privacy of data.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the difference between the security and privacy of data.

Mark scheme:
- B1 mark 1: security protects data against loss
- B1 mark 2: privacy protects data against unauthorised access

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "security protects data against loss", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "privacy protects data against unauthorised access", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-13-Q15c",
    label: "Question 3(c)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "An administrative officer enters a tutor ID into a database system. Explain how data verification can be used when the tutor ID is entered.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how data verification can be used when a tutor ID is entered into a database system.

Mark scheme — any four of the following:
- B1: the administrator completes a visual check
- B1: that the tutor identifier input matches the tutor identifier on the original document
- B1: double entry check OR the administrator or a second person enters the number a second time
- B1: and the system compares it with the first entry

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "administrator completes a visual check", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "input matched against original document", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "double entry check / data entered a second time", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "system compares second entry with first entry", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "Q_9618_13_N25_008",
    label: "Question 7(c)",
    paper_ref: "9618/13 · Oct/Nov 2025",
    topic: "Data Integrity",
    topic_key: "data_integrity",
    text: "Identify and describe one method of data verification that can be used when transferring data from a digital video camera to a server.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify and describe one method of data verification that can be used when transferring data from a digital video camera to a server.

Mark scheme:
- B1 mark 1: correct name — Parity Byte Check / Parity Block Check / Checksum
- B1 mark 2: first part of description — e.g. for Checksum: a calculation is made from the data and transmitted with it
- B1 mark 3: second part of description — e.g. the receiver performs the same calculation and compares with the received checksum to verify a match

Student's answer: ${answer}

Three marks means the name plus a two-part description. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "Parity Byte Check / Parity Block Check / Checksum named", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "calculation made from data and transmitted with it / parity bit added to each byte", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "receiver performs same calculation and compares to verify match / each byte checked on receipt", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_data_integrity_question_index";

export function getNextDataIntegrityQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % DATA_INTEGRITY_QUESTIONS.length;
  return { question: DATA_INTEGRITY_QUESTIONS[idx], idx, total: DATA_INTEGRITY_QUESTIONS.length };
}

export function advanceDataIntegrityIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}