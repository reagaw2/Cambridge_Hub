/**
 * oscillationsBank.js — Oscillations written question bank
 */

const makeSchema = (marks) => {
  const props = { marks_earned: { type: "number" } };
  for (let i = 1; i <= marks; i++) {
    props[`mark_${i}`] = {
      type: "object",
      properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } },
    };
  }
  props.cambridge_insight = { type: "string" };
  props.next_step = { type: "string" };
  return { type: "object", properties: props };
};

export const OSCILLATIONS_QUESTIONS = [
  {
    id: "w25_44_Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "State what is meant by the frequency of the oscillations of an oscillating object.",
    total_marks: 1,
    mark_scheme: "B1: number of oscillations per unit time.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by the frequency of the oscillations of an oscillating object.
Mark scheme:
- B1 mark 1: number of oscillations per unit time
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "number of oscillations per unit time", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "w25_44_Q4biv",
    label: "Question 4(b)(iv)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Describe the interchange between kinetic energy and potential energy during the oscillations. Numerical values are not required.",
    total_marks: 3,
    mark_scheme: "B1: kinetic energy is maximum at zero displacement. B1: potential energy is zero at zero displacement. B1: kinetic energy plus potential energy is constant at all times.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe the interchange between kinetic energy and potential energy during the oscillations. Numerical values are not required.
Mark scheme:
- B1 mark 1: kinetic energy is maximum at zero displacement (equilibrium)
- B1 mark 2: potential energy is zero at zero displacement (equilibrium)
- B1 mark 3: kinetic energy plus potential energy is constant at all times (total energy constant)
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "kinetic energy maximum at zero displacement", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "potential energy zero at zero displacement", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "kinetic plus potential energy constant", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-41-ALA26-Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "State, by reference to simple harmonic motion, what is meant by angular frequency.",
    total_marks: 1,
    mark_scheme: "B1: angular frequency ω = 2πf OR ω = 2π/T.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State, by reference to simple harmonic motion, what is meant by angular frequency.
Mark scheme:
- B1 mark 1: angular frequency ω = 2πf OR ω = 2π/T (2π times frequency, or 2π divided by period)
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "ω = 2πf OR ω = 2π/T", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-41-ALA26-Q4bii",
    label: "Question 4(b)(ii)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Show that the load on the metal strip is undergoing simple harmonic motion. The graph shows displacement on the y-axis plotted against acceleration on the x-axis, passing through the origin with a negative gradient.",
    total_marks: 3,
    mark_scheme: "B1: displacement of oscillations is measured from the equilibrium position. B1: the straight-line graph shows acceleration is proportional to displacement. B1: negative gradient shows acceleration and displacement are in opposite directions.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Show that the load on the metal strip is undergoing simple harmonic motion (graph of displacement vs acceleration shows a straight line through origin with negative gradient).
Mark scheme:
- B1 mark 1: displacement is measured from the equilibrium position
- B1 mark 2: straight-line graph shows acceleration is proportional to displacement
- B1 mark 3: negative gradient shows acceleration and displacement are in opposite directions
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "displacement measured from equilibrium position", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "straight line so acceleration proportional to displacement", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "negative gradient: acceleration and displacement in opposite directions", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-osc-Q-shm-definition",
    label: "Question (a)",
    paper_ref: "9702 · Oscillations",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "State the conditions necessary for a body to execute simple harmonic motion.",
    total_marks: 2,
    mark_scheme: "B1: the acceleration is proportional to the displacement from the equilibrium position. B1: the acceleration is directed towards the equilibrium position (opposite direction to displacement).",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the conditions necessary for a body to execute simple harmonic motion.
Mark scheme:
- B1 mark 1: acceleration is proportional to displacement from equilibrium position
- B1 mark 2: acceleration is directed towards the equilibrium position (opposite to displacement)
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "acceleration proportional to displacement from equilibrium", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "acceleration directed towards equilibrium / opposite to displacement", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-osc-Q-resonance",
    label: "Question (b)",
    paper_ref: "9702 · Oscillations",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Explain what is meant by resonance in a mechanical system.",
    total_marks: 2,
    mark_scheme: "B1: when the driving frequency equals the natural frequency of the system. B1: the amplitude of oscillation becomes maximum (large).",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain what is meant by resonance in a mechanical system.
Mark scheme:
- B1 mark 1: when the driving frequency equals the natural frequency of the system
- B1 mark 2: the amplitude of oscillation becomes maximum (large)
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "driving frequency equals natural frequency", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "amplitude becomes maximum / large", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-osc-Q-damping",
    label: "Question (c)",
    paper_ref: "9702 · Oscillations",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Describe what is meant by critical damping.",
    total_marks: 2,
    mark_scheme: "B1: the system returns to its equilibrium position in the shortest possible time. B1: without oscillating about the equilibrium position.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe what is meant by critical damping.
Mark scheme:
- B1 mark 1: the system returns to its equilibrium position in the shortest possible time
- B1 mark 2: without oscillating (overshooting) about the equilibrium position
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "returns to equilibrium in shortest possible time", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "without oscillating about equilibrium", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-osc-Q-amplitude-damped",
    label: "Question (d)",
    paper_ref: "9702 · Oscillations",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "A damped oscillation has a period of 0.40 s. Explain why the period of oscillation does not change significantly when light damping is applied.",
    total_marks: 2,
    mark_scheme: "B1: for light damping the restoring force is much greater than the damping force. B1: so the period is determined almost entirely by the restoring force and is therefore approximately equal to the natural period.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the period of oscillation does not change significantly when light damping is applied.
Mark scheme:
- B1 mark 1: for light damping the restoring force is much greater than the damping force
- B1 mark 2: so the period is determined almost entirely by the restoring force and is approximately equal to the natural period
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "restoring force much greater than damping force", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "period determined by restoring force so approximately equal to natural period", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_001",
    label: "Question 1(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "In terms of velocity and acceleration, describe uniform circular motion of an object.",
    total_marks: 2,
    mark_scheme: "B1: velocity and acceleration both have constant magnitude. B1: velocity is always perpendicular to acceleration.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: In terms of velocity and acceleration, describe uniform circular motion of an object.
Mark scheme:
- B1 mark 1: velocity and acceleration both have constant magnitude
- B1 mark 2: velocity is always perpendicular to acceleration
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "velocity and acceleration both have constant magnitude", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "velocity always perpendicular to acceleration", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_oscillations_progress";

export function getNextOscillationsQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = OSCILLATIONS_QUESTIONS[idx % OSCILLATIONS_QUESTIONS.length];
  return { question, idx: idx % OSCILLATIONS_QUESTIONS.length, total: OSCILLATIONS_QUESTIONS.length };
}

export function advanceOscillationsIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % OSCILLATIONS_QUESTIONS.length));
}

export function getOscillationsQuestionById(id) {
  return OSCILLATIONS_QUESTIONS.find(q => q.id === id) ?? null;
}