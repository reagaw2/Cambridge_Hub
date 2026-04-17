/**
 * Physical Quantities & Units written question bank
 * Questions served in order, looping back when exhausted.
 */

export const PHYSICAL_QUANTITIES_QUESTIONS = [
  {
    id: "9702-22-W19-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/22 · Oct/Nov 2019",
    topic: "Physical Quantities & Units",
    topic_key: "physical_quantities_units",
    difficulty: "easy",
    text: "Distinguish between vector and scalar quantities.",
    total_marks: 2,
    mark_scheme: "B1: a scalar quantity has magnitude only. B1: a vector quantity has both magnitude and direction.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Distinguish between vector and scalar quantities.
Mark scheme:
- B1 mark 1: a scalar quantity has magnitude only
- B1 mark 2: a vector quantity has both magnitude and direction
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "scalar has magnitude only", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "vector has magnitude and direction", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
];

const PROGRESS_KEY = "ala_hub_physical_quantities_progress";

export function getNextPhysicalQuantitiesQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = PHYSICAL_QUANTITIES_QUESTIONS[idx % PHYSICAL_QUANTITIES_QUESTIONS.length];
  return { question, idx, total: PHYSICAL_QUANTITIES_QUESTIONS.length };
}

export function advancePhysicalQuantitiesIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % PHYSICAL_QUANTITIES_QUESTIONS.length));
}

export function getPhysicalQuantitiesQuestionById(id) {
  return PHYSICAL_QUANTITIES_QUESTIONS.find(q => q.id === id) ?? null;
}