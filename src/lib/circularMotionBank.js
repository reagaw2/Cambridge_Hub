/**
 * Circular Motion written question bank
 * Questions served in order, looping back when exhausted.
 */

export const CIRCULAR_MOTION_QUESTIONS = [
  {
    id: "9702-41-S10-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/41 · May/Jun 2010",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "Define the radian.",
    total_marks: 2,
    mark_scheme: "B1: angle subtended at the centre of a circle. B1: by an arc equal in length to the radius.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define the radian.
Mark scheme:
- B1 mark 1: angle subtended at the centre of a circle
- B1 mark 2: by an arc equal in length to the radius
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "angle subtended at centre of circle", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "arc equal in length to radius", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-43-W10-Q1a-i",
    label: "Question 1(a)(i)",
    paper_ref: "9702/43 · Oct/Nov 2010",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "medium",
    text: "State what is meant by angular velocity.",
    total_marks: 2,
    mark_scheme: "M1: rate of change of angle OR angular displacement per unit time. A1: complete correct definition.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by angular velocity.
Mark scheme:
- M1 mark 1: rate of change of angle OR angular displacement swept out by radius per unit time
- A1 mark 2: complete and correct definition including reference to angle per unit time
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "rate of change of angle / angular displacement per unit time", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "complete correct definition with angle and time", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-43-W10-Q1a-ii",
    label: "Question 1(a)(ii)",
    paper_ref: "9702/43 · Oct/Nov 2010",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "medium",
    text: "State the relation between angular velocity ω and period T.",
    total_marks: 1,
    mark_scheme: "B1: ω × T = 2π.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the relation between angular velocity ω and period T.
Mark scheme:
- B1 mark 1: ω × T = 2π
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "ω × T = 2π", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-41-W14-Q2a-ii",
    label: "Question 2(a)(ii)",
    paper_ref: "9702/41 · Oct/Nov 2014",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "medium",
    text: "State the significance of the force F for the motion of the ball in the bowl.",
    total_marks: 1,
    mark_scheme: "B1: the force F provides the centripetal force.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the significance of the force F for the motion of the ball in the bowl.
Mark scheme:
- B1 mark 1: the force F provides the centripetal force
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "provides the centripetal force", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-43-W21-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/43 · Oct/Nov 2021",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "medium",
    text: "With reference to velocity and acceleration, describe uniform circular motion.",
    total_marks: 2,
    mark_scheme: "B1: constant speed / constant magnitude of velocity. B1: acceleration is always perpendicular to velocity.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: With reference to velocity and acceleration, describe uniform circular motion.
Mark scheme:
- B1 mark 1: constant speed OR constant magnitude of velocity
- B1 mark 2: acceleration is always perpendicular to velocity
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "constant speed / constant magnitude of velocity", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "acceleration always perpendicular to velocity", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-42-W21-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "State what is meant by centripetal acceleration.",
    total_marks: 1,
    mark_scheme: "B1: acceleration directed perpendicular to velocity OR acceleration directed towards the centre of the circle.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by centripetal acceleration.
Mark scheme:
- B1 mark 1: acceleration directed perpendicular to velocity OR acceleration directed towards the centre of the circle
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "acceleration perpendicular to velocity / directed towards centre of circle", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-42-W21-Q1b-i",
    label: "Question 1(b)(i)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "State what happens to the magnitude of the centripetal acceleration of the car as it moves around the loop from X to Y.",
    total_marks: 1,
    mark_scheme: "B1: the magnitude of centripetal acceleration decreases.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what happens to the magnitude of the centripetal acceleration of the car as it moves around the loop from X to Y.
Mark scheme:
- B1 mark 1: the magnitude of centripetal acceleration decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-42-W21-Q1b-ii",
    label: "Question 1(b)(ii)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "Explain, if the car remains in contact with the track, why the centripetal acceleration of the car at point Y must be greater than 9.8 m s⁻².",
    total_marks: 2,
    mark_scheme: "B1: 9.8 m/s² caused by weight alone / centripetal force must exceed weight. B1: greater acceleration requires contact force from track.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the centripetal acceleration of the car at point Y must be greater than 9.8 m s⁻² if the car remains in contact with the track at that point.
Mark scheme:
- B1 mark 1: acceleration of 9.8 m s⁻² is caused by the weight of the car alone OR centripetal force must be greater than the weight of the car
- B1 mark 2: acceleration greater than 9.8 m s⁻² requires a contact force from the track OR centripetal force greater than weight requires a contact force from the track
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "9.8 m/s² caused by weight alone / centripetal force must exceed weight", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "greater acceleration requires contact force from track", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-42-W21-Q1d",
    label: "Question 1(d)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "Suggest, with a reason but without calculation, whether the conclusion about whether the car stays on the track would be different for a car of mass 460 g moving with the same initial speed.",
    total_marks: 1,
    mark_scheme: "B1: acceleration is independent of mass so makes no difference OR mass cancels in the equation so makes no difference.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Suggest with a reason whether the conclusion about whether the car stays on the track would be different for a car of a different mass moving with the same initial speed.
Mark scheme:
- B1 mark 1: acceleration is independent of mass so makes no difference OR mass cancels in the equation so makes no difference
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "acceleration independent of mass / mass cancels so makes no difference", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-43-S23-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/43 · May/Jun 2023",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "Explain, with reference to the forces acting on the sphere, why the length of the spring when the system is rotating is greater than when the system is stationary.",
    total_marks: 3,
    mark_scheme: "B1: horizontal force causes centripetal acceleration. B1: components combine to give greater tension in spring. B1: greater tension so greater extension / greater length.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain with reference to the forces acting on the sphere why the length of the spring when the system is rotating is greater than when stationary.
Mark scheme:
- B1 mark 1: horizontal force on sphere causes centripetal acceleration
- B1 mark 2: weight of sphere is now equal to vertical component of tension OR horizontal and vertical components of force now combine to give greater tension in spring
- B1 mark 3: greater tension in spring so greater extension and greater length of spring
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "horizontal force causes centripetal acceleration", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "components combine to give greater tension in spring", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "greater tension so greater extension / greater length", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
  // ── 9702/41/O/N/25 questions ───────────────────────────────────────────
  {
    id: "Q_9702_41_N25_001",
    label: "Question 1(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "medium",
    text: "In terms of velocity and acceleration, describe uniform circular motion of an object.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: In terms of velocity and acceleration, describe uniform circular motion of an object.
Mark scheme:
- B1 mark 1: velocity and acceleration both have constant magnitude
- B1 mark 2: velocity is always perpendicular to acceleration
Examiner insight: Most candidates knew velocity and acceleration were perpendicular. Far fewer noted that the magnitude of both remains constant — this second point was frequently missed.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "velocity and acceleration both have constant magnitude", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "velocity is always perpendicular to acceleration", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "Q_9702_41_N25_002",
    label: "Question 1(c)(iv)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Circular Motion",
    topic_key: "circular_motion",
    difficulty: "hard",
    text: "Explain, with reference to the equation x = R sin ωt, why the motion of the shadow of the ball on the screen may be modelled as simple harmonic.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain, with reference to the equation x = R sin ωt, why the motion of the shadow of the ball on the screen may be modelled as simple harmonic.
Mark scheme:
- B1 mark 1: the equation is of the form x = x₀ sin ωt, which is the defining equation for simple harmonic motion
Examiner insight: Many candidates ignored the instruction to reference the given equation and instead wrote general statements about acceleration being proportional and opposite to displacement. Always address the specific equation provided.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "equation is of form x = x₀ sin ωt which is the defining equation for SHM", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
];

const PROGRESS_KEY = "ala_hub_circular_motion_progress";

export function getNextCircularMotionQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = CIRCULAR_MOTION_QUESTIONS[idx % CIRCULAR_MOTION_QUESTIONS.length];
  return { question, idx, total: CIRCULAR_MOTION_QUESTIONS.length };
}

export function advanceCircularMotionIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % CIRCULAR_MOTION_QUESTIONS.length));
}

export function getCircularMotionQuestionById(id) {
  return CIRCULAR_MOTION_QUESTIONS.find(q => q.id === id) ?? null;
}