/**
 * Medical Imaging written question bank
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

export const MEDICAL_IMAGING_QUESTIONS = [
  {
    id: "9702-41-S24-Q8d",
    label: "Question 8(d)",
    paper_ref: "9702/41 · May/Jun 2024",
    topic: "Medical Imaging",
    topic_key: "medical_imaging",
    text: "Explain why X-rays can be used to produce images of internal body structures that have good contrast.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why X-rays can be used to produce images of internal body structures that have good contrast.
Mark scheme:
- B1 mark 1: reference to bone and soft tissue as different structures
- B1 mark 2: bone and soft tissue have different attenuation coefficients OR different penetration or transmission or absorption of X-rays
- B1 mark 3: transmitted intensities through bone and tissue are very different leading to good contrast images
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "reference to bone and soft tissue", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "different attenuation coefficients / different absorption or transmission", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "transmitted intensities very different so good contrast", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(3),
  },
];

const PROGRESS_KEY = "ala_hub_medical_imaging_progress";

export function getNextMedicalImagingQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = MEDICAL_IMAGING_QUESTIONS[idx % MEDICAL_IMAGING_QUESTIONS.length];
  return { question, idx, total: MEDICAL_IMAGING_QUESTIONS.length };
}

export function advanceMedicalImagingIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % MEDICAL_IMAGING_QUESTIONS.length));
}