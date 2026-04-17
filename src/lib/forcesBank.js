/**
 * Forces & Equilibrium written question bank
 * Questions served in order, looping back when exhausted.
 */

export const FORCES_QUESTIONS = [
  {
    id: "9702-22-ON19-Q2bi",
    label: "Question 2(b)(i)",
    paper_ref: "9702/22 · Oct/Nov 2019",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Explain why the force due to air resistance acting on the ball may be neglected when calculating the time taken for the ball to reach the beam of light.",
    total_marks: 1,
    mark_scheme: "B1: weight is much greater than force due to air resistance OR air resistance is negligible compared to weight.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the force due to air resistance acting on the ball may be neglected when calculating the time taken for the ball to reach the beam of light.
Mark scheme:
- B1 mark 1: weight is much greater than force due to air resistance OR air resistance is negligible compared to weight
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "weight much greater than air resistance / air resistance negligible compared to weight", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-23-ON19-Q2c",
    label: "Question 2(c)",
    paper_ref: "9702/22 · Oct/Nov 2019",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "A different ball is released from the same position. This ball has the same diameter but a much lower density. The force due to air resistance cannot be neglected as the ball falls. State and explain the change, if any, to the time interval during which the beam of light is broken by the ball.",
    total_marks: 2,
    mark_scheme: "B1: average resultant force or acceleration or speed of the low density ball is less. B1: so time interval is longer.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A ball of lower density falls through a beam of light. Air resistance cannot be neglected. State and explain the change to the time interval during which the beam of light is broken.
Mark scheme:
- B1 mark 1: average resultant force or acceleration or speed of the low density ball is less
- B1 mark 2: so time interval is longer
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "resultant force / acceleration / speed is less", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "time interval is longer", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
  {
    id: "9702-22-ON18-Q1e",
    label: "Question 1(e)",
    paper_ref: "9702/22 · Oct/Nov 2018",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "In practice, significant air resistance acts on the ball. Explain why the actual time taken for the ball to reach maximum height is less than the time calculated when air resistance is assumed to be negligible.",
    total_marks: 1,
    mark_scheme: "B1: air resistance acts in opposite direction to velocity OR average resultant force is larger than weight alone.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the actual time taken for the ball to reach maximum height is less than calculated when air resistance is assumed negligible.
Mark scheme:
- B1 mark 1: air resistance acts in opposite direction to velocity OR average resultant force is larger than weight alone
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "air resistance acts opposite to velocity / resultant force larger than weight", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-23-ON23-Q2b",
    label: "Question 2(b)",
    paper_ref: "9702/23 · Oct/Nov 2023",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "The speed of the ball just after striking the wall is less than its speed just before striking the wall. State what this indicates about the nature of the collision of the ball with the wall.",
    total_marks: 1,
    mark_scheme: "B1: the collision is inelastic.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The speed of the ball just after striking the wall is less than its speed just before striking the wall. State what this indicates about the nature of the collision.
Mark scheme:
- B1 mark 1: the collision is inelastic
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "inelastic", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-21-MJ22-Q1c",
    label: "Question 1(c)",
    paper_ref: "9702/21 · May/Jun 2022",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "hard",
    text: "A planet has an atmosphere that causes a viscous force to act on a moving rock. State and explain the variation, if any, in the resultant force acting on the rock as it moves vertically upwards.",
    total_marks: 2,
    mark_scheme: "B1: speed or velocity decreases so viscous force decreases. B1: viscous force decreases and weight is constant so resultant force decreases.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State and explain the variation in the resultant force acting on the rock as it moves vertically upwards through an atmosphere that causes a viscous force.
Mark scheme:
- B1 mark 1: speed or velocity decreases so viscous force decreases
- B1 mark 2: viscous force decreases and weight is constant so resultant force decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "speed decreases so viscous force decreases", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "viscous force decreases and weight constant so resultant force decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
  {
    id: "9702-23-MJ22-Q2c",
    label: "Question 2(c)",
    paper_ref: "9702/23 · May/Jun 2022",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "hard",
    text: "By considering energy changes, state and explain how the final kinetic energy of the arrow as it hits the target compares with its initial kinetic energy immediately after release. A numerical calculation is not required.",
    total_marks: 2,
    mark_scheme: "M1: gravitational potential energy has decreased. A1: total energy is conserved so kinetic energy has increased.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: By considering energy changes, state and explain how the final kinetic energy of the arrow as it hits the target compares with its initial kinetic energy immediately after release.
Mark scheme:
- M1 mark 1: gravitational potential energy has decreased
- A1 mark 2: total energy is conserved so kinetic energy has increased
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "gravitational potential energy has decreased", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "total energy conserved so kinetic energy has increased", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
  {
    id: "9702-22-FM21-Q1ci",
    label: "Question 1(c)(i)",
    paper_ref: "9702/22 · Feb/Mar 2021",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Define force.",
    total_marks: 1,
    mark_scheme: "B1: force equals rate of change of momentum.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define force.
Mark scheme:
- B1 mark 1: force equals rate of change of momentum
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "rate of change of momentum", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-22-FM24-Q2ci",
    label: "Question 2(c)(i)",
    paper_ref: "9702/22 · Feb/Mar 2024",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Describe and explain the variation of the viscous drag force acting on the diver in the water as he moves downwards.",
    total_marks: 2,
    mark_scheme: "B1: as the diver moves down their speed decreases. B1: so viscous force or drag force decreases.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe and explain the variation of the viscous drag force acting on the diver as he moves downwards in water.
Mark scheme:
- B1 mark 1: as the diver moves down their speed decreases
- B1 mark 2: so viscous force or drag force decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "speed decreases", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "viscous force / drag force decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
  {
    id: "9702-23-MJ21-Q2bi",
    label: "Question 2(b)(i)",
    paper_ref: "9702/23 · May/Jun 2021",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "hard",
    text: "Explain, with reference to forces acting on the stone, the shape of the speed-time curve as the stone falls.",
    total_marks: 3,
    mark_scheme: "B1: air resistance increases with speed or with time. B1: resultant force decreases as speed increases so acceleration decreases. B1: when air resistance equals the weight the speed becomes constant.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain with reference to forces acting on the stone the shape of the speed-time curve as the stone falls.
Mark scheme:
- B1 mark 1: air resistance increases with speed or with time
- B1 mark 2: resultant force decreases as speed increases so acceleration decreases
- B1 mark 3: when air resistance equals the weight the speed becomes constant
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "air resistance increases with speed / with time", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "resultant force decreases so acceleration decreases", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "when air resistance equals weight speed becomes constant", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-21-ON22-Q2ci",
    label: "Question 2(c)(i)",
    paper_ref: "9702/21 · Oct/Nov 2022",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Explain why the polystyrene ball leaves the spring with a greater speed than the steel ball.",
    total_marks: 1,
    mark_scheme: "B1: same elastic potential energy or same initial kinetic energy and polystyrene ball has smaller mass so greater speed OR same average force and smaller mass so greater average acceleration so greater speed.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the polystyrene ball leaves the spring with a greater speed than the steel ball.
Mark scheme:
- B1 mark 1: same elastic potential energy or same initial kinetic energy and polystyrene ball has smaller mass so greater speed OR same average force and smaller mass so greater average acceleration so greater speed
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "same energy / same force and smaller mass so greater speed / acceleration", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-21-ON22-Q2cii",
    label: "Question 2(c)(ii)",
    paper_ref: "9702/21 · Oct/Nov 2022",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Explain why the polystyrene ball takes a longer time to reach the ground than the steel ball.",
    total_marks: 1,
    mark_scheme: "B1: less average vertical acceleration or smaller average vertical component of resultant force so takes longer time to reach ground.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the polystyrene ball takes a longer time to reach the ground than the steel ball.
Mark scheme:
- B1 mark 1: less average vertical acceleration or smaller average vertical component of resultant force so takes longer time to reach ground
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "less average vertical acceleration / smaller resultant force so takes longer", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
  },
  {
    id: "9702-22-MJ24-Q2ci",
    label: "Question 2(c)(i)",
    paper_ref: "9702/22 · May/Jun 2024",
    topic: "Forces & Equilibrium",
    topic_key: "forces_equilibrium",
    difficulty: "medium",
    text: "Describe and explain the variation with time of the magnitude of the acceleration of the skydiver between time t₂ and time t₃.",
    total_marks: 2,
    mark_scheme: "B1: drag force decreases as speed decreases. B1: as speed decreases resultant force decreases so magnitude of acceleration decreases to zero.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe and explain the variation with time of the magnitude of the acceleration of the skydiver between t₂ when the parachute is fully open and t₃ when constant velocity is reached.
Mark scheme:
- B1 mark 1: drag force decreases as speed decreases
- B1 mark 2: as speed decreases resultant force decreases so magnitude of acceleration decreases to zero
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "drag force decreases as speed decreases", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "resultant force decreases so acceleration decreases to zero", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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

const PROGRESS_KEY = "ala_hub_forces_progress";

export function getNextForcesQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = FORCES_QUESTIONS[idx % FORCES_QUESTIONS.length];
  return { question, idx, total: FORCES_QUESTIONS.length };
}

export function advanceForcesIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % FORCES_QUESTIONS.length));
}

export function getForcesQuestionById(id) {
  return FORCES_QUESTIONS.find(q => q.id === id) ?? null;
}