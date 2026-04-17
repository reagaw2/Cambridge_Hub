/**
 * Kinematics written question bank
 * Questions served in order, looping back when exhausted.
 */

export const KINEMATICS_QUESTIONS = [
  {
    id: "9702-22-ON19-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/22 · Oct/Nov 2019",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define acceleration.",
    total_marks: 1,
    mark_scheme: "B1: change in velocity divided by time taken.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define acceleration.
Mark scheme:
- B1 mark 1: change in velocity divided by time taken
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "change in velocity / time taken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    id: "9702-23-ON24-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/23 · Oct/Nov 2024",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define acceleration.",
    total_marks: 1,
    mark_scheme: "B1: rate of change of velocity.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define acceleration.
Mark scheme:
- B1 mark 1: rate of change of velocity
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "rate of change of velocity", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-MJ24-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/21 · May/Jun 2024",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define velocity.",
    total_marks: 1,
    mark_scheme: "B1: change in displacement divided by time taken.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define velocity.
Mark scheme:
- B1 mark 1: change in displacement divided by time taken
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "change in displacement / time taken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-MJ24-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/23 · May/Jun 2024",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define displacement from a point.",
    total_marks: 1,
    mark_scheme: "B1: distance from the point in a straight line in a given direction.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define displacement from a point.
Mark scheme:
- B1 mark 1: distance from the point in a straight line in a given direction
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "distance in a straight line in a given direction", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-MJ22-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/21 · May/Jun 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "hard",
    text: "Define velocity.",
    total_marks: 1,
    mark_scheme: "B1: change in displacement divided by time taken.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define velocity.
Mark scheme:
- B1 mark 1: change in displacement divided by time taken
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "change in displacement / time taken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-MJ22-Q3a-v2",
    label: "Question 3(a)",
    paper_ref: "9702/23 · May/Jun 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define velocity.",
    total_marks: 1,
    mark_scheme: "B1: change in displacement divided by time taken.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define velocity.
Mark scheme:
- B1 mark 1: change in displacement divided by time taken
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "change in displacement / time taken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-ON21-Q3a",
    label: "Question 3(a)",
    paper_ref: "9702/23 · Oct/Nov 2021",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "hard",
    text: "Define velocity.",
    total_marks: 1,
    mark_scheme: "B1: change in displacement divided by time taken.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define velocity.
Mark scheme:
- B1 mark 1: change in displacement divided by time taken
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "change in displacement / time taken", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-FM24-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/22 · Feb/Mar 2024",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define acceleration.",
    total_marks: 1,
    mark_scheme: "B1: rate of change of velocity.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define acceleration.
Mark scheme:
- B1 mark 1: rate of change of velocity
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "rate of change of velocity", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-MJ25-Q1a",
    label: "Question 1(a)",
    paper_ref: "9702/21 · May/Jun 2025",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Define acceleration.",
    total_marks: 1,
    mark_scheme: "B1: rate of change of velocity.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define acceleration.
Mark scheme:
- B1 mark 1: rate of change of velocity
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "rate of change of velocity", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-ON23-Q1b",
    label: "Question 1(b)",
    paper_ref: "9702/22 · Oct/Nov 2023",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Under certain conditions, the distance s moved in a straight line by an object in time t is given by s = ½at² where a is the acceleration of the object. State two conditions under which the above expression applies to the motion of the object.",
    total_marks: 2,
    mark_scheme: "B1: initial speed or velocity is zero. B1: acceleration is constant or uniform and in a straight line.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State two conditions under which the expression s = ½at² applies to the motion of the object.
Mark scheme:
- B1 mark 1: initial speed or velocity is zero
- B1 mark 2: acceleration is constant or uniform and in a straight line
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "initial speed / velocity is zero", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "acceleration is constant / uniform", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-ON23-Q1ci",
    label: "Question 1(c)(i)",
    paper_ref: "9702/22 · Oct/Nov 2023",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Compare, qualitatively, the magnitude of the acceleration of the car at time t = 8.0 s and at time t = 14.0 s.",
    total_marks: 1,
    mark_scheme: "B1: magnitude of acceleration at t = 8.0 s is less than that at t = 14.0 s.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Compare qualitatively the magnitude of the acceleration of the car at t = 8.0 s and at t = 14.0 s.
Mark scheme:
- B1 mark 1: magnitude of acceleration at t = 8.0 s is less than that at t = 14.0 s
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "magnitude of acceleration at 8.0 s is less than at 14.0 s", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-ON23-Q1cii-dir",
    label: "Question 1(c)(ii)",
    paper_ref: "9702/22 · Oct/Nov 2023",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Compare, qualitatively, the direction of the acceleration of the car at time t = 8.0 s and at time t = 14.0 s.",
    total_marks: 1,
    mark_scheme: "B1: direction of acceleration at t = 8.0 s is opposite to that at t = 14.0 s.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Compare qualitatively the direction of the acceleration of the car at t = 8.0 s and at t = 14.0 s.
Mark scheme:
- B1 mark 1: direction of acceleration at t = 8.0 s is opposite to that at t = 14.0 s
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "direction of acceleration at 8.0 s is opposite to that at 14.0 s", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-FM22-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/22 · Feb/Mar 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "Explain, briefly, why the horizontal component of the velocity of a droplet of water remains constant as it moves from P to Q.",
    total_marks: 1,
    mark_scheme: "B1: force on droplet of water in horizontal direction is zero.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain briefly why the horizontal component of the velocity of a droplet of water remains constant as it moves from P to Q.
Mark scheme:
- B1 mark 1: force on droplet of water in horizontal direction is zero
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force in horizontal direction is zero", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-FM22-Q2d",
    label: "Question 2(d)",
    paper_ref: "9702/22 · Feb/Mar 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "For the movement of a droplet of water from P to Q, state and explain whether the displacement of the droplet is less than, more than or the same as the distance along its path.",
    total_marks: 1,
    mark_scheme: "B1: displacement is the straight-line distance from P to Q so less than the distance along the path.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State and explain whether the displacement of the droplet is less than, more than or the same as the distance along its path.
Mark scheme:
- B1 mark 1: displacement is the straight-line distance from P to Q so less than the distance along the path
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "displacement is straight-line distance so less than distance along path", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-MJ22-Q3d",
    label: "Question 3(d)",
    paper_ref: "9702/22 · May/Jun 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "hard",
    text: "State what is represented by the gradient of the velocity-time graph.",
    total_marks: 1,
    mark_scheme: "B1: acceleration of the ball.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is represented by the gradient of the velocity-time graph.
Mark scheme:
- B1 mark 1: acceleration of the ball
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "acceleration", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-MJ22-Q3ei",
    label: "Question 3(e)(i)",
    paper_ref: "9702/22 · May/Jun 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "hard",
    text: "A second ball is thrown with the same velocity and from the same height. The mass of the second ball is greater. Assume air resistance is negligible. Compare the magnitudes of the accelerations of the two balls.",
    total_marks: 1,
    mark_scheme: "B1: magnitudes of accelerations are equal or the same.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Compare the magnitudes of the accelerations of two balls of different mass thrown with the same velocity. Air resistance is negligible.
Mark scheme:
- B1 mark 1: magnitudes of accelerations are equal or the same
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "accelerations are equal / the same", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-MJ22-Q3eii",
    label: "Question 3(e)(ii)",
    paper_ref: "9702/22 · May/Jun 2022",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "hard",
    text: "A second ball is thrown with the same velocity and from the same height. The mass of the second ball is greater. Assume air resistance is negligible. Compare the speeds with which the two balls hit the ground.",
    total_marks: 1,
    mark_scheme: "B1: speeds are equal or the same.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Compare the speeds with which two balls of different mass hit the ground when thrown with the same velocity from the same height. Air resistance is negligible.
Mark scheme:
- B1 mark 1: speeds are equal or the same
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "speeds are equal / the same", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-MJ25-Q1cii",
    label: "Question 1(c)(ii)",
    paper_ref: "9702/21 · May/Jun 2025",
    topic: "Kinematics",
    topic_key: "kinematics",
    difficulty: "medium",
    text: "By considering energy, state and explain the effect of the change in release angle on the speed at which the object reaches the ground.",
    total_marks: 2,
    mark_scheme: "B1: the total initial energy is the same. B1: change in gravitational potential energy is the same so speed is the same.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: By considering energy, state and explain the effect of the change in release angle on the speed at which the object reaches the ground.
Mark scheme:
- B1 mark 1: the total initial energy is the same
- B1 mark 2: change in gravitational potential energy is the same so speed is the same
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "total initial energy is the same", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "change in GPE is the same so speed is the same", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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

/**
 * Returns the next question for a Kinematics session.
 * Tracks index in localStorage, loops when exhausted.
 */
const PROGRESS_KEY = "ala_hub_kinematics_progress";

export function getNextKinematicsQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = KINEMATICS_QUESTIONS[idx % KINEMATICS_QUESTIONS.length];
  return { question, idx, total: KINEMATICS_QUESTIONS.length };
}

export function advanceKinematicsIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % KINEMATICS_QUESTIONS.length));
}

export function getKinematicsQuestionById(id) {
  return KINEMATICS_QUESTIONS.find(q => q.id === id) ?? null;
}