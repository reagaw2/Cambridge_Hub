/**
 * Astrophysics written question bank
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

export const ASTROPHYSICS_QUESTIONS = [
  {
    id: "w25_44_Q10a",
    label: "Question 10(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "State what is meant by redshift.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by redshift.
Mark scheme:
- B1 mark 1: recession of a galaxy from the observer causes emitted light to have
- B1 mark 2: an increase in observed wavelength or a decrease in observed frequency
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "recession of galaxy causes emitted light to shift", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "increase in observed wavelength or decrease in observed frequency", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "w25_44_Q10b",
    label: "Question 10(b)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "Explain how observations of redshift lead to the idea that the universe is expanding.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain how observations of redshift lead to the idea that the universe is expanding.
Mark scheme:
- B1 mark 1: distant galaxies show redshift so galaxies are moving apart
- B1 mark 2: galaxies moving apart means universe is expanding
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "distant galaxies show redshift so galaxies are moving apart", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "galaxies moving apart means universe is expanding", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why", "next_step": "one sentence telling the student exactly what to focus on" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "w25_44_Q10c",
    label: "Question 10(c)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "Explain how Hubble's law leads to the Big Bang theory of the origin of the universe.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain how Hubble's law leads to the Big Bang theory of the origin of the universe.
Mark scheme:
- B1 mark 1: speed of recession proportional to distance
- B1 mark 2: more distant galaxies represent further back in time OR all matter was once very close together
- B1 mark 3: all matter was once moving apart very fast from a single point (Big Bang)
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "speed of recession proportional to distance", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "more distant galaxies represent further back in time / all matter once close together", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "all matter once moving apart very fast from single point", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-41-ALA26-Q8ai",
    label: "Question 8(a)(i)",
    paper_ref: "9702/41 · A Level Apr 2026",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "A distant galaxy is moving away from the Earth. Explain how the positions of the lines in the emission spectrum seen by an observer on the Earth differ from the original positions.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A distant galaxy is moving away from the Earth. Explain how the positions of the lines in the emission spectrum seen by an observer on the Earth differ from the original positions.
Mark scheme:
- B1 mark 1: movement causes change in observed frequency / redshift
- B1 mark 2: observed frequency lower / lines shift to longer wavelength
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "movement causes change in observed frequency / redshift", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "observed frequency lower / lines shift to longer wavelength", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-41-ALA26-Q11a",
    label: "Question 11(a)",
    paper_ref: "9702/41 · A Level Apr 2026",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "State what is meant by the luminosity of a star.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by the luminosity of a star.
Mark scheme:
- B1 mark 1: total power of radiation emitted by the star
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "total power of radiation emitted by the star", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-43-W24-Q10a",
    label: "Question 10(a)",
    paper_ref: "9702/43 · Oct/Nov 2024",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "Explain how redshift leads to the idea that the Universe is expanding.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain how redshift leads to the idea that the Universe is expanding.
Mark scheme — any three of the following:
- B1: redshift is the increase in observed wavelength or decrease in observed frequency caused by the Doppler effect
- B1: radiation from distant galaxies is observed to be redshifted OR redshift provides evidence that galaxies are moving apart
- B1: galaxies moving apart means the Universe must be expanding
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "redshift is increase in observed wavelength / decrease in frequency from Doppler effect", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "radiation from distant galaxies is redshifted / galaxies moving apart", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "galaxies moving apart means Universe is expanding", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-42-S24-Q8ai",
    label: "Question 8(a)(i)",
    paper_ref: "9702/42 · May/Jun 2024",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "A star is moving away from the Earth. Explain how the positions of the lines in the emission spectrum seen by an observer on the Earth differ from the positions in the original spectrum.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A star is moving away from Earth. Explain how the positions of the emission spectrum lines seen by an observer on Earth differ from those in the original spectrum.
Mark scheme:
- B1 mark 1: movement of star causes change in observed frequency OR movement of star causes redshift
- B1 mark 2: observed frequency is lower than emitted frequency
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "movement of star causes change in observed frequency / redshift", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "observed frequency is lower than emitted frequency", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  // ── 9702/41/O/N/25 questions ───────────────────────────────────────────
  {
    id: "Q_9702_41_N25_014",
    label: "Question 9(a)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "State Wien's displacement law.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State Wien's displacement law.
Mark scheme:
- M1 mark 1: the thermodynamic surface temperature of a star is inversely proportional to the wavelength — mandatory mark
- A1 mark 2: at which the maximum emission rate from the star occurs
Examiner insight: Common omissions: not specifying surface temperature, and not clarifying that it is the wavelength at peak (maximum) emission. Both qualifications are necessary for full marks.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "thermodynamic surface temperature inversely proportional to wavelength", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "wavelength at which maximum emission rate occurs", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "Q_9702_41_N25_015",
    label: "Question 9(c)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Astrophysics",
    topic_key: "astrophysics",
    text: "Star X is in a galaxy that is moving away from the Earth. Suggest, with a reason, how the emission spectrum line for star X would appear differently if it had been obtained from data measured on the Earth.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Star X is in a galaxy moving away from Earth. Suggest with a reason how its emission spectrum line would appear differently when measured from Earth.
Mark scheme:
- B1 mark 1: the light from star X is redshifted
- B1 mark 2: the wavelength of peak emission rate would be greater when measured from Earth
Examiner insight: Candidates more readily identified the visible change (peak shifts to longer wavelength) than correctly naming redshift as the cause. A minority incorrectly described the star itself as being redshifted rather than the light from it.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "light from star X is redshifted", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "wavelength of peak emission rate would be greater when measured from Earth", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_astrophysics_progress";

export function getNextAstrophysicsQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = ASTROPHYSICS_QUESTIONS[idx % ASTROPHYSICS_QUESTIONS.length];
  return { question, idx, total: ASTROPHYSICS_QUESTIONS.length };
}

export function advanceAstrophysicsIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % ASTROPHYSICS_QUESTIONS.length));
}