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
  // ── 9702/41/O/N/25 questions ───────────────────────────────────────────
  {
    id: "Q_9702_41_N25_016",
    label: "Question 10(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Medical Imaging",
    topic_key: "medical_imaging",
    text: "Define specific acoustic impedance.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define specific acoustic impedance.
Mark scheme:
- M1 mark 1: product of density and speed — mandatory mark
- A1 mark 2: where the speed is the speed of sound within that medium
Examiner insight: Generally defined correctly. The most common loss of marks was being vague about which speed — it must be explicitly identified as the speed of sound within the specific medium.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "product of density and speed", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "speed is the speed of sound within that medium", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_017",
    label: "Question 10(b)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Medical Imaging",
    topic_key: "medical_imaging",
    text: "Explain how ultrasound waves are detected by a piezoelectric crystal.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain how ultrasound waves are detected by a piezoelectric crystal.
Mark scheme:
- B1 mark 1: ultrasound waves cause the crystal to vibrate
- B1 mark 2: vibrations of the crystal cause an induced e.m.f. across the crystal
Examiner insight: A significant number of candidates described how ultrasound is produced rather than detected — this gained no credit. Of those who addressed detection correctly, most described the crystal vibrating but fewer linked those vibrations to an induced e.m.f. Both steps are required.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "ultrasound waves cause the crystal to vibrate", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "vibrations of the crystal cause an induced e.m.f. across the crystal", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_018",
    label: "Question 10(c)(ii)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Medical Imaging",
    topic_key: "medical_imaging",
    text: "Explain, without calculation, what is likely to happen when ultrasound is incident on a body tissue–water boundary.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain, without calculation, what is likely to happen when ultrasound is incident on a body tissue–water boundary.
Mark scheme:
- B1 mark 1: the specific acoustic impedance values of body tissue and water are very similar
- B1 mark 2: almost all the ultrasound will be transmitted / almost none will be reflected
Examiner insight: Vague language such as 'most' or 'quite a lot' was penalised. Full marks required precise wording: Z values are very similar, therefore almost all ultrasound is transmitted. Precision of language is the differentiator on this question.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "specific acoustic impedance values of body tissue and water are very similar", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "almost all the ultrasound will be transmitted / almost none will be reflected", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
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