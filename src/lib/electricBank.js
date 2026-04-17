/**
 * Electric Fields written question bank
 * Questions served in order, looping back when exhausted.
 */

export const ELECTRIC_QUESTIONS = [
  // ── Existing question ──────────────────────────────────────────────────
  {
    id: "w25_44_Q5a",
    label: "Question 5(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "Explain why the electric potential near an isolated proton is positive.",
    total_marks: 3,
    mark_scheme: "B1: potential defined as zero at infinity. B1: proton has positive charge and repels another positive charge. B1: work done moving positive charges together.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the electric potential near an isolated proton is positive.
Mark scheme:
- B1 mark 1: potential is defined as zero at infinity
- B1 mark 2: proton has a positive charge and so repels another positive charge
- B1 mark 3: work is done on two positive charges to move them towards each other, or work is done by two positive charges as they move apart from each other
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 3],
  "mark_1": { "earned": true or false, "keyword": "potential defined as zero at infinity", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "proton has positive charge and repels another positive charge", "found": true or false, "feedback": "one sentence explanation" },
  "mark_3": { "earned": true or false, "keyword": "work done moving positive charges together", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
  "next_step": "one sentence telling the student exactly what to focus on in their next attempt"
}`,
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
  // ── 15 new questions ───────────────────────────────────────────────────
  {
    id: "9702-23-S17-Q3a",
    label: "Question 3(a)",
    paper_ref: "9702/23 · May/Jun 2017",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "Define electric field strength.",
    total_marks: 1,
    mark_scheme: "B1: force per unit positive charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define electric field strength.
Mark scheme:
- B1 mark 1: force per unit positive charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force per unit positive charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-S17-Q3c",
    label: "Question 3(c)",
    paper_ref: "9702/23 · May/Jun 2017",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "An α-particle moves from A to B in the electric field. Describe and explain how the change in the kinetic energy of the α-particle compares with that of the electron. Numerical values are not required.",
    total_marks: 3,
    mark_scheme: "B1: charge on alpha is opposite to that of the electron. B1: KE change of alpha is negative / alpha KE is reduced. B1: charge of alpha is greater / twice that of electron so larger / twice the change in KE.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe and explain how the change in kinetic energy of an alpha particle moving from A to B compares with that of an electron moving the same path.
Mark scheme:
- B1 mark 1: charge on alpha particle is opposite to that of the electron OR charge on alpha is positive
- B1 mark 2: kinetic energy change of alpha is negative OR kinetic energy of alpha is reduced
- B1 mark 3: charge of alpha is greater OR twice that of electron so causes larger OR twice the change in kinetic energy in magnitude
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "charge on alpha is opposite to electron / alpha charge is positive", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "KE change of alpha is negative / KE of alpha is reduced", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "charge of alpha greater / twice that of electron so larger / twice the change in KE", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-W19-Q3a-i",
    label: "Question 3(a)(i)",
    paper_ref: "9702/23 · Oct/Nov 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "State the property of an object that experiences a force when the object is placed in a gravitational field.",
    total_marks: 1,
    mark_scheme: "B1: mass.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the property of an object that experiences a force when the object is placed in a gravitational field.
Mark scheme:
- B1 mark 1: mass
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "mass", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-W19-Q3a-ii",
    label: "Question 3(a)(ii)",
    paper_ref: "9702/23 · Oct/Nov 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "State the property of an object that experiences a force when the object is placed in an electric field.",
    total_marks: 1,
    mark_scheme: "B1: charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the property of an object that experiences a force when the object is placed in an electric field.
Mark scheme:
- B1 mark 1: charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-W18-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/23 · Oct/Nov 2018",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "Define the coulomb.",
    total_marks: 1,
    mark_scheme: "B1: the coulomb is an ampere second.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define the coulomb.
Mark scheme:
- B1 mark 1: the coulomb is an ampere second
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "ampere second", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-S18-Q7c",
    label: "Question 7(c)",
    paper_ref: "9702/21 · May/Jun 2018",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "Other β⁻ particles from the same radioactive source travel outside the electric field along the same incident path. State and briefly explain whether those β⁻ particles will all follow the same path inside the electric field.",
    total_marks: 2,
    mark_scheme: "M1: beta minus particles have a range of different speeds / velocities / momenta / energies. A1: so they follow different paths.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State and briefly explain whether beta minus particles from the same source travelling along the same incident path will all follow the same path inside the electric field.
Mark scheme:
- M1 mark 1: beta minus particles have a range of different speeds or velocities or momenta or energies
- A1 mark 2: so they follow different paths
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "beta particles have range of different speeds / momenta / energies", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "so they follow different paths", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-W17-Q5a",
    label: "Question 5(a)",
    paper_ref: "9702/23 · Oct/Nov 2017",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "Define electric field strength.",
    total_marks: 1,
    mark_scheme: "B1: force per unit positive charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define electric field strength.
Mark scheme:
- B1 mark 1: force per unit positive charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force per unit positive charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-23-W21-Q4f-ii",
    label: "Question 4(f)(ii)",
    paper_ref: "9702/23 · Oct/Nov 2021",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "State and explain the differences between the electric force on the β⁻ particle in the electric field and the electric force on the α-particle in the electric field.",
    total_marks: 3,
    mark_scheme: "B1: particles have opposite charges. B1: forces are in opposite directions. B1: beta has less charge / half the charge so less / half the force.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State and explain the differences between the electric force on the beta minus particle and the electric force on the alpha particle in the same electric field.
Mark scheme:
- B1 mark 1: the particles have opposite charges
- B1 mark 2: so the forces on the charges are in opposite directions
- B1 mark 3: the beta minus particle has less charge or half the charge of the alpha so experiences less or half the force
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "particles have opposite charges", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "forces are in opposite directions", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "beta has less charge so less force / half the charge so half the force", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-W17-Q5a",
    label: "Question 5(a)",
    paper_ref: "9702/22 · Oct/Nov 2017",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "Define the coulomb.",
    total_marks: 1,
    mark_scheme: "B1: the coulomb is an ampere second.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define the coulomb.
Mark scheme:
- B1 mark 1: the coulomb is an ampere second
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "ampere second", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-S19-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/22 · May/Jun 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "State what is meant by a field line in an electric field.",
    total_marks: 1,
    mark_scheme: "B1: the path or direction in which a free positive charge will move.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by a field line in an electric field.
Mark scheme:
- B1 mark 1: the path or direction in which a free positive charge will move
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "path / direction in which a free positive charge will move", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-S19-Q6b",
    label: "Question 6(b)",
    paper_ref: "9702/22 · May/Jun 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "An electric field has two different regions X and Y. The field strength in X is less than that in Y. Describe a difference between the pattern of field lines in X and in Y.",
    total_marks: 1,
    mark_scheme: "B1: field lines are closer together in Y or further apart in X.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: An electric field has two regions X and Y where field strength in X is less than in Y. Describe a difference between the pattern of field lines in X and Y.
Mark scheme:
- B1 mark 1: field lines are closer together in Y or further apart in X
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "lines closer together in Y / further apart in X", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-W18-Q5a",
    label: "Question 5(a)",
    paper_ref: "9702/21 · Oct/Nov 2018",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "State what is meant by an electric field.",
    total_marks: 1,
    mark_scheme: "B1: a region of space where a force acts on a stationary charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by an electric field.
Mark scheme:
- B1 mark 1: a region of space where a force acts on a stationary charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "region of space where a force acts on a stationary charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-W17-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/21 · Oct/Nov 2017",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "Define electric field strength.",
    total_marks: 1,
    mark_scheme: "B1: force per unit positive charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define electric field strength.
Mark scheme:
- B1 mark 1: force per unit positive charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force per unit positive charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-21-W19-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/21 · Oct/Nov 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "hard",
    text: "Define electric potential difference.",
    total_marks: 1,
    mark_scheme: "B1: work done per unit charge OR energy transferred from electrical to other forms per unit charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define electric potential difference.
Mark scheme:
- B1 mark 1: work done per unit charge OR energy transferred from electrical to other forms per unit charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "work done per unit charge / energy transferred per unit charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    id: "9702-22-M19-Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/22 · Feb/Mar 2019",
    topic: "Electric Fields",
    topic_key: "electric_fields",
    difficulty: "medium",
    text: "Define electric field strength.",
    total_marks: 1,
    mark_scheme: "B1: force per unit positive charge.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define electric field strength.
Mark scheme:
- B1 mark 1: force per unit positive charge
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "force per unit positive charge", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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

const PROGRESS_KEY = "ala_hub_electric_progress";

export function getNextElectricQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = ELECTRIC_QUESTIONS[idx % ELECTRIC_QUESTIONS.length];
  return { question, idx, total: ELECTRIC_QUESTIONS.length };
}

export function advanceElectricIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % ELECTRIC_QUESTIONS.length));
}

export function getElectricQuestionById(id) {
  return ELECTRIC_QUESTIONS.find(q => q.id === id) ?? null;
}