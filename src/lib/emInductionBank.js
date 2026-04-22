/**
 * Electromagnetic Induction written question bank
 * Questions served in order, looping back when exhausted.
 */

const makeSchema = (marks) => {
  const props = { marks_earned: { type: "number" } };
  for (let i = 1; i <= marks; i++) {
    props[`mark_${i}`] = { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } };
  }
  props.cambridge_insight = { type: "string" };
  props.next_step = { type: "string" };
  return { type: "object", properties: props };
};

export const EM_INDUCTION_QUESTIONS = [
  {
    id: "w25_44_Q7a",
    label: "Question 7(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Electromagnetic Induction",
    topic_key: "electromagnetic_induction",
    text: "State Lenz's law of electromagnetic induction.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State Lenz's law of electromagnetic induction.
Mark scheme:
- M1 mark 1: the direction of the induced e.m.f. — mandatory mark
- A1 mark 2: is such as to produce effects that oppose the change that caused it
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Note that mark 1 is an M1 mandatory mark — if the student does not mention the direction of the induced e.m.f. then mark 2 cannot be awarded even if the rest of the answer is correct. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "direction of induced e.m.f.", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "opposes the change that caused it", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_009",
    label: "Question 7(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Electromagnetic Induction",
    topic_key: "electromagnetic_induction",
    text: "State Faraday's law of electromagnetic induction.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State Faraday's law of electromagnetic induction.
Mark scheme:
- M1 mark 1: induced e.m.f. is directly proportional to rate — mandatory mark
- A1 mark 2: of change of magnetic flux linkage
Examiner insight: Generally recalled accurately. A recurring error was confusing flux linkage with flux density — the word linkage must be present for full credit.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "induced e.m.f. is directly proportional to rate", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "of change of magnetic flux linkage", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_010",
    label: "Question 7(b)(iv)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Electromagnetic Induction",
    topic_key: "electromagnetic_induction",
    text: "An aircraft flies horizontally through the Earth's magnetic field. The vertical component of the Earth's magnetic field is directed towards the ground. Use Lenz's law of electromagnetic induction to explain which of the wingtips P (left) and Q (right) is at the higher induced potential.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: An aircraft flies horizontally through Earth's magnetic field. The vertical component of Earth's field is directed towards the ground. Use Lenz's law to explain which wingtip (P left, Q right) is at higher induced potential.
Mark scheme:
- B1 mark 1: the opposing force on the aircraft due to current in the wings must act backwards (opposing motion)
- B1 mark 2: from Fleming's left-hand rule, the current in the wings must flow from Q to P
- B1 mark 3: current flows from negative to positive inside an e.m.f. source, so P is at higher potential
Examiner insight: Full marks required three logical steps: direction of opposing force → Fleming's left-hand rule for current direction → recognising that inside an e.m.f. source current flows from − to +. Attempting all three steps in order was the mark-winning strategy.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "opposing force on aircraft must act backwards opposing motion", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "Fleming's left-hand rule — current flows from Q to P", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "current flows from − to + inside e.m.f. source so P is at higher potential", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
];

const PROGRESS_KEY = "ala_hub_eminduction_progress";

export function getNextEMInductionQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = EM_INDUCTION_QUESTIONS[idx % EM_INDUCTION_QUESTIONS.length];
  return { question, idx, total: EM_INDUCTION_QUESTIONS.length };
}

export function advanceEMInductionIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % EM_INDUCTION_QUESTIONS.length));
}

export function getEMInductionQuestionById(id) {
  return EM_INDUCTION_QUESTIONS.find(q => q.id === id) ?? null;
}