/**
 * capacitanceBank.js — Capacitance written question bank
 * Questions served in order, looping back when exhausted.
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

export const CAPACITANCE_QUESTIONS = [
  {
    id: "w25_44_Q6ai",
    label: "Question 6(a)(i)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "State what is meant by rectification.",
    total_marks: 1,
    mark_scheme: "B1: conversion of alternating current to direct current.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by rectification.
Mark scheme:
- B1 mark 1: conversion of alternating current to direct current
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "conversion of alternating current to direct current", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "w25_44_Q6aii",
    label: "Question 6(a)(ii)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "State the name of the type of rectification produced by a bridge rectifier circuit.",
    total_marks: 1,
    mark_scheme: "B1: full-wave rectification.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the name of the type of rectification produced by a bridge rectifier circuit.
Mark scheme:
- B1 mark 1: full-wave rectification
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "full-wave rectification", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-41-ALA26-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "Define the capacitance of a parallel-plate capacitor.",
    total_marks: 2,
    mark_scheme: "M1: capacitance = charge divided by potential difference (C = Q/V). A1: charge refers to charge on one plate; potential difference refers to p.d. between the plates.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define the capacitance of a parallel-plate capacitor.
Mark scheme:
- M1 mark 1: capacitance = charge divided by potential difference (C = Q/V) — mandatory mark
- A1 mark 2: charge refers to charge on one plate; potential difference refers to p.d. between the plates
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "capacitance = charge divided by potential difference (C = Q/V)", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "charge on one plate / p.d. between the plates", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-cap-Q-time-constant",
    label: "Question (a)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "Define the time constant of a capacitor-resistor (RC) circuit.",
    total_marks: 1,
    mark_scheme: "B1: the time for the charge (or voltage or current) to decrease to 1/e (approximately 37%) of its initial value; OR the product RC.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Define the time constant of a capacitor-resistor (RC) circuit.
Mark scheme:
- B1 mark 1: the time for the charge (or voltage or current) to decrease to 1/e (approximately 37%) of its initial value; OR the product RC
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "time for charge/voltage to fall to 1/e (37%) of initial value OR product RC", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-cap-Q-energy-stored",
    label: "Question (a)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "A capacitor of capacitance C is charged to a potential difference V. Show that the energy stored in the capacitor is given by W = ½CV².",
    total_marks: 3,
    mark_scheme: "B1: energy = area under Q–V graph. B1: area = ½QV. B1: substituting Q = CV gives W = ½CV².",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Show that the energy stored in a capacitor is W = ½CV².
Mark scheme:
- B1 mark 1: energy equals area under Q–V graph
- B1 mark 2: area equals ½QV (triangle)
- B1 mark 3: substituting Q = CV gives W = ½CV²
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "energy = area under Q–V graph", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "area = ½QV", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "substituting Q = CV gives W = ½CV²", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-cap-Q-charging-explain",
    label: "Question (b)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "A capacitor is charged through a resistor by a battery of e.m.f. E. Explain why the current in the circuit decreases as the capacitor charges.",
    total_marks: 3,
    mark_scheme: "B1: as the capacitor charges, the p.d. across it increases. B1: the p.d. across the resistor = E − V_C decreases. B1: by V = IR, the current decreases.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why the current in the circuit decreases as the capacitor charges.
Mark scheme:
- B1 mark 1: as the capacitor charges, the p.d. across it increases
- B1 mark 2: the p.d. across the resistor = E − V_C, which therefore decreases
- B1 mark 3: by V = IR, as the p.d. across the resistor decreases, the current decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "p.d. across capacitor increases as it charges", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "p.d. across resistor = E − V_C decreases", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "by V = IR current decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-cap-Q-discharge-graph",
    label: "Question (c)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "A capacitor discharges through a resistor. Describe how the rate of discharge changes with time and explain why.",
    total_marks: 2,
    mark_scheme: "B1: the rate of discharge decreases with time. B1: the p.d. across the capacitor (and hence across the resistor) decreases, so the current decreases.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A capacitor discharges through a resistor. Describe how the rate of discharge changes with time and explain why.
Mark scheme:
- B1 mark 1: the rate of discharge decreases with time
- B1 mark 2: the p.d. across the capacitor (and resistor) decreases, so the current decreases
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "rate of discharge decreases with time", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "p.d. across capacitor decreases so current decreases", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-cap-Q-smoothing",
    label: "Question (b)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "Explain how a capacitor connected in parallel with a load resistor produces a smoother d.c. output from a rectifier circuit.",
    total_marks: 3,
    mark_scheme: "B1: the capacitor charges when the rectified voltage rises. B1: the capacitor discharges slowly through the load resistor when the rectified voltage falls below the capacitor voltage. B1: this maintains a more constant (smoothed) output voltage.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain how a capacitor connected in parallel with a load resistor produces a smoother d.c. output from a rectifier circuit.
Mark scheme:
- B1 mark 1: capacitor charges when rectified voltage rises
- B1 mark 2: capacitor discharges slowly through load resistor when rectified voltage falls below capacitor voltage
- B1 mark 3: this maintains a more constant (smoothed) output voltage
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "capacitor charges when rectified voltage rises", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "capacitor discharges slowly through load resistor when rectified voltage falls", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "maintains more constant / smoothed output voltage", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-cap-Q-series-parallel",
    label: "Question (a)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "State what happens to the total capacitance when capacitors are connected (i) in series and (ii) in parallel, compared to a single capacitor of the same value.",
    total_marks: 2,
    mark_scheme: "B1: in series — total capacitance is less than the smallest individual capacitance. B1: in parallel — total capacitance is the sum of all individual capacitances (greater than any individual).",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what happens to the total capacitance when capacitors are connected (i) in series and (ii) in parallel.
Mark scheme:
- B1 mark 1: in series — total capacitance is less than the smallest individual capacitance
- B1 mark 2: in parallel — total capacitance equals the sum of all individual capacitances
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "series: total capacitance less than smallest individual", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "parallel: total capacitance = sum of individual capacitances", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-cap-Q-large-C-smoother",
    label: "Question (c)",
    paper_ref: "9702 · Capacitance",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "Explain why using a larger capacitance in a smoothing circuit produces a smoother output voltage.",
    total_marks: 2,
    mark_scheme: "B1: larger capacitance means a larger time constant (τ = RC). B1: the capacitor discharges more slowly, so the voltage drops less between successive peaks of the rectified supply.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain why using a larger capacitance in a smoothing circuit produces a smoother output voltage.
Mark scheme:
- B1 mark 1: larger capacitance means a larger time constant (τ = RC)
- B1 mark 2: the capacitor discharges more slowly, so the voltage drops less between successive peaks
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "larger capacitance means larger time constant τ = RC", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "capacitor discharges more slowly / voltage drops less between peaks", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_capacitance_progress";

export function getNextCapacitanceQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = CAPACITANCE_QUESTIONS[idx % CAPACITANCE_QUESTIONS.length];
  return { question, idx: idx % CAPACITANCE_QUESTIONS.length, total: CAPACITANCE_QUESTIONS.length };
}

export function advanceCapacitanceIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % CAPACITANCE_QUESTIONS.length));
}

export function getCapacitanceQuestionById(id) {
  return CAPACITANCE_QUESTIONS.find(q => q.id === id) ?? null;
}