/**
 * Gravitational Fields written question bank
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

export const GRAVITATIONAL_QUESTIONS = [
  {
    id: "w25_44_Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Gravitational Fields",
    topic_key: "gravitational_fields",
    text: "State Newton's law of gravitation.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State Newton's law of gravitation.
Mark scheme:
- B1 mark 1: gravitational force is directly proportional to the product of the masses
- B1 mark 2: force between point masses is inversely proportional to the square of their separation
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "proportional to product of masses", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "inversely proportional to square of separation", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_006",
    label: "Question 3(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Gravitational Fields",
    topic_key: "gravitational_fields",
    text: "Define gravitational field at a point.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define gravitational field at a point.
Mark scheme:
- B1 mark 1: force per unit mass (at that point)
Examiner insight: Generally well answered. Must be expressed as a ratio — force per unit mass — not just force on a mass.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force per unit mass", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "Q_9702_41_N25_007",
    label: "Question 3(b)(iii)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Gravitational Fields",
    topic_key: "gravitational_fields",
    text: "Point Q is at distance x/2 from a point mass, on the opposite side of the mass from point P which is at distance x. Compare the gravitational field at Q with that at P.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Point Q is at distance x/2 from a point mass, on the opposite side of the mass from point P which is at distance x. Compare the gravitational field at Q with that at P.
Mark scheme:
- B1 mark 1: fields are in opposite directions
- B1 mark 2: field strength at Q is four times the field strength at P
Examiner insight: Most candidates identified the factor-of-four difference using the inverse-square law. Fewer also noted that the fields point in opposite directions — both comparisons are required for full marks.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "fields are in opposite directions", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "field strength at Q is four times the field strength at P", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_gravitational_progress";

export function getNextGravitationalQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = GRAVITATIONAL_QUESTIONS[idx % GRAVITATIONAL_QUESTIONS.length];
  return { question, idx, total: GRAVITATIONAL_QUESTIONS.length };
}

export function advanceGravitationalIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % GRAVITATIONAL_QUESTIONS.length));
}

export function getGravitationalQuestionById(id) {
  return GRAVITATIONAL_QUESTIONS.find(q => q.id === id) ?? null;
}