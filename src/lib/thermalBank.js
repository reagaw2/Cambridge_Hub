/**
 * Thermal Physics written question bank
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

export const THERMAL_QUESTIONS = [
  {
    id: "w25_44_Q2ai",
    label: "Question 2(a)(i)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "The equation of state for an ideal gas is pV = NkT. State the meaning of each of the symbols p, V, N, k and T.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The equation of state for an ideal gas is pV = NkT. State the meaning of each of the symbols p, V, N, k and T.
Mark scheme:
- B1 mark 1: p = pressure of gas, V = volume of gas, and k = Boltzmann constant — all three must be present for this mark
- B1 mark 2: N = number of molecules in the gas
- B1 mark 3: T = thermodynamic temperature of gas — the word thermodynamic must be present or clearly implied
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "p = pressure, V = volume, k = Boltzmann constant", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "N = number of molecules", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "T = thermodynamic temperature", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "w25_44_Q3a",
    label: "Question 3(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "With reference to molecular kinetic energy and molecular potential energy, explain what is meant by the internal energy of an ideal gas.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: With reference to molecular kinetic energy and molecular potential energy, explain what is meant by the internal energy of an ideal gas.
Mark scheme:
- B1 mark 1: total kinetic energy associated with random motion of molecules
- B1 mark 2: potential energy of molecules is zero for an ideal gas
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "total kinetic energy of random motion of molecules", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "potential energy is zero for ideal gas", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-41-ALA26-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/41 · A Level Apr 2026",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "Use one of the assumptions of the kinetic theory of gases to explain why the potential energy of the molecules of an ideal gas is zero.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Use one of the assumptions of the kinetic theory of gases to explain why the potential energy of the molecules of an ideal gas is zero.
Mark scheme:
- B1 mark 1: no intermolecular forces so no potential energy
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "no intermolecular forces so no potential energy", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-41-ALA26-Q3a",
    label: "Question 3(a)",
    paper_ref: "9702/41 · A Level Apr 2026",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State what is meant by specific latent heat.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by specific latent heat.
Mark scheme:
- B1 mark 1: thermal energy per unit mass to change state
- B1 mark 2: at constant temperature
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "thermal energy per unit mass to change state", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "at constant temperature", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  // ── 13 new questions ───────────────────────────────────────────────────
  {
    id: "9702-41-W19-Q2a",
    label: "Question 2(a)",
    paper_ref: "9702/41 · Oct/Nov 2019",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "The kinetic theory of gases is based on a number of assumptions about the molecules of a gas. State the assumption that is related to the volume of the molecules of the gas.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the assumption of kinetic theory that is related to the volume of the molecules of the gas.
Mark scheme:
- M1 mark 1: the total volume of the molecules is negligible
- A1 mark 2: compared with the volume occupied by the gas
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "volume of molecules is negligible", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "compared with volume occupied by the gas", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-W19-Q2aii",
    label: "Question 2(a)(ii)",
    paper_ref: "9702/42 · Oct/Nov 2019",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "Describe how Brownian motion provides evidence for the nature of the movement of gas molecules.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Describe how Brownian motion provides evidence for the nature of the movement of gas molecules.
Mark scheme:
- M1 mark 1: gas molecules collide with smoke particles OR random motion of the gas molecules
- A1 mark 2: causes the haphazard motion of the smoke particles OR causes the smoke particles to change direction
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "gas molecules collide with smoke particles / random motion of gas molecules", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "causes haphazard motion of smoke particles / causes smoke particles to change direction", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-43-S21-Q2b",
    label: "Question 2(b)",
    paper_ref: "9702/43 · May/Jun 2021",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "Use kinetic theory to explain why, when the piston is moved so that the gas expands, this causes a decrease in the temperature of the gas.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Use kinetic theory to explain why gas expansion causes a decrease in temperature.
Mark scheme:
- B1 mark 1: the speed of a molecule decreases on impact with the moving piston
- B1 mark 2: mean square speed is directly proportional to thermodynamic temperature OR kinetic energy of molecules is directly proportional to thermodynamic temperature
- B1 mark 3: kinetic energy of molecules decreases so temperature decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "speed of molecule decreases on impact with moving piston", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "mean square speed proportional to thermodynamic temperature / KE proportional to temperature", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "kinetic energy decreases so temperature decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-41-S24-Q3ai",
    label: "Question 3(a)(i)",
    paper_ref: "9702/41 · May/Jun 2024",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State what is meant by an ideal gas.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by an ideal gas.
Mark scheme:
- M1 mark 1: a gas for which pV is proportional to T
- A1 mark 2: where T is thermodynamic temperature
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "pV proportional to T", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "T is thermodynamic temperature", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-41-S24-Q3aii",
    label: "Question 3(a)(ii)",
    paper_ref: "9702/41 · May/Jun 2024",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "Use one of the basic assumptions of the kinetic theory to explain what can be deduced about the potential energy associated with the random motion of molecules in an ideal gas.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Use one basic assumption of kinetic theory to explain what can be deduced about the potential energy of molecules in an ideal gas.
Mark scheme:
- B1 mark 1: there are no intermolecular forces
- B1 mark 2: so potential energy is zero
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "no intermolecular forces", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "potential energy is zero", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-43-W24-Q3ai",
    label: "Question 3(a)(i)",
    paper_ref: "9702/43 · Oct/Nov 2024",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State what is meant by the Avogadro constant.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by the Avogadro constant.
Mark scheme:
- B1 mark 1: the number of particles per unit amount of substance
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "number of particles per unit amount of substance", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-43-W24-Q3aii",
    label: "Question 3(a)(ii)",
    paper_ref: "9702/43 · Oct/Nov 2024",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State the relationship between the Avogadro constant NA, the molar gas constant R and the Boltzmann constant k.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the relationship between the Avogadro constant NA, the molar gas constant R and the Boltzmann constant k.
Mark scheme:
- B1 mark 1: NA = R divided by k
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "NA = R/k", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-W21-Q3ai",
    label: "Question 3(a)(i)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State what is meant by an elastic collision.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by an elastic collision.
Mark scheme:
- B1 mark 1: no loss of kinetic energy
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "no loss of kinetic energy", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-W21-Q3aii",
    label: "Question 3(a)(ii)",
    paper_ref: "9702/42 · Oct/Nov 2021",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State two other assumptions of the kinetic theory of gases.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State two assumptions of the kinetic theory of gases.
Mark scheme — any two of the following:
- B1 mark 1: molecules have negligible volume compared with gas or container
- B1 mark 2: no forces between molecules except during collisions
- B1 mark 3: molecules are in random motion
- B1 mark 4: collisions are instantaneous
Student's answer: ${answer}
Award 1 mark for each correct distinct assumption up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid kinetic theory assumption — negligible volume / no intermolecular forces / random motion / instantaneous collisions", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid kinetic theory assumption", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-43-S23-Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/43 · May/Jun 2023",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "State two of the basic assumptions of the kinetic theory of gases.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State two basic assumptions of the kinetic theory of gases.
Mark scheme — any two of the following:
- B1: particles are in continuous random motion
- B1: particles have negligible volume compared with the gas
- B1: no forces between particles except during collisions
- B1: all collisions are perfectly elastic
- B1: time of collision negligible compared with time between collisions
Student's answer: ${answer}
Award 1 mark for each correct distinct assumption up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid kinetic theory assumption — random motion / negligible volume / no forces / elastic collisions / instantaneous collisions", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid kinetic theory assumption", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-43-W23-Q3ai",
    label: "Question 3(a)(i)",
    paper_ref: "9702/43 · Oct/Nov 2023",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "In the equation pV = Nm × (mean square speed) / 3, state the meaning of the symbols N, m and mean square speed.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the meaning of N, m and mean square speed in the equation pV = Nm times mean square speed divided by 3.
Mark scheme:
- B1 mark 1: N is the number of molecules of the gas
- B1 mark 2: m is the mass of one molecule of the gas
- B1 mark 3: mean square speed is the mean square speed of the molecules
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "N is number of molecules", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "m is mass of one molecule", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "mean square speed of molecules", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-43-W23-Q3d",
    label: "Question 3(d)",
    paper_ref: "9702/43 · Oct/Nov 2023",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "The gas at the surface of a star has a very high pressure. Use the basic assumptions of the kinetic theory to suggest why, in practice, a gas at the surface of a star is unlikely to behave as an ideal gas.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Use kinetic theory assumptions to suggest why a gas at very high pressure is unlikely to behave as an ideal gas.
Mark scheme:
- B1 mark 1: very high pressure so molecules are very close together
- B1 mark 2: forces between molecules are not negligible OR volume of molecules is not negligible compared with gas volume
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "very high pressure so molecules are very close together", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "forces between molecules not negligible / volume of molecules not negligible", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-W22-Q3a",
    label: "Question 3(a)",
    paper_ref: "9702/42 · Oct/Nov 2022",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "The equation of state for an ideal gas can be written as pV = NkT. State the meaning of each of the symbols in this equation.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the meaning of each symbol in the equation pV = NkT.
Mark scheme:
- B1 mark 1: p is the pressure of the gas
- B1 mark 2: V is the volume of the gas and k is the Boltzmann constant
- B1 mark 3: N is the number of molecules and T is the thermodynamic temperature
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "p is pressure of gas", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "V is volume and k is Boltzmann constant", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "N is number of molecules and T is thermodynamic temperature", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-42-M23-Q2bii",
    label: "Question 2(b)(ii)",
    paper_ref: "9702/42 · Feb/Mar 2023",
    topic: "Thermal Physics",
    topic_key: "thermal_physics",
    text: "The first law of thermodynamics may be expressed as ΔU = q + W. Use the first law of thermodynamics to explain why the temperature of the helium gas increases when work is done on it.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Use the first law of thermodynamics to explain why the temperature of helium gas increases when work is done on it.
Mark scheme:
- M1 mark 1: work is done on the gas
- A1 mark 2: internal energy increases so temperature increases
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "work is done on the gas", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "internal energy increases so temperature increases", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_thermal_progress";

export function getNextThermalQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = THERMAL_QUESTIONS[idx % THERMAL_QUESTIONS.length];
  return { question, idx, total: THERMAL_QUESTIONS.length };
}

export function advanceThermalIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % THERMAL_QUESTIONS.length));
}