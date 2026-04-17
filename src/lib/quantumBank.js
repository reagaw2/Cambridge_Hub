/**
 * Quantum Physics written question bank
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

export const QUANTUM_QUESTIONS = [
  {
    id: "w25_44_Q9a",
    label: "Question 9(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "State what is meant by the photoelectric effect.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by the photoelectric effect.
Mark scheme:
- M1 mark 1: emission of electrons from a metal surface — this is a mandatory mark, the A1 mark below cannot be awarded without it
- A1 mark 2: when electromagnetic radiation is incident on the surface
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Note that mark 1 is an M1 mandatory mark — if the student does not mention emission of electrons from a metal surface then mark 2 cannot be awarded even if the rest of the answer is correct. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "emission of electrons from a metal surface", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "when electromagnetic radiation is incident on the surface", "found": true or false, "feedback": "one sentence explanation — note this mark cannot be awarded if mark 1 was not earned" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-W23-Q8a",
    label: "Question 8(a)",
    paper_ref: "9702/42 · Oct/Nov 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "State what is meant by a photon.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by a photon.
Mark scheme:
- M1 mark 1: packet or quantum of energy
- A1 mark 2: of electromagnetic radiation
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "packet / quantum of energy", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "of electromagnetic radiation", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-W23-Q8bi",
    label: "Question 8(b)(i)",
    paper_ref: "9702/42 · Oct/Nov 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Electromagnetic radiation is directed at a metal surface and electrons are emitted. State the name of this phenomenon.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Electromagnetic radiation is directed at a metal surface and electrons are emitted. State the name of this phenomenon.
Mark scheme:
- B1 mark 1: photoelectric effect
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "photoelectric effect", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-W23-Q8bii",
    label: "Question 8(b)(ii)",
    paper_ref: "9702/42 · Oct/Nov 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "It is observed that this phenomenon occurs only when the frequency of the electromagnetic radiation is greater than a certain minimum value, regardless of the intensity of the radiation. Explain how this observation provides evidence for the existence of photons.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The photoelectric effect occurs only when frequency exceeds a minimum value regardless of intensity. Explain how this provides evidence for the existence of photons.
Mark scheme — any three of the following:
- B1: electron needs a minimum energy to escape OR electron emitted if energy in packet is enough
- B1: energy must be absorbed in packets that are related to frequency
- B1: intensity relates to number of packets not to energy in packet OR electron absorbs only a single whole packet
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "electron needs minimum energy to escape / emitted if packet energy is enough", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "energy absorbed in packets related to frequency", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "intensity relates to number of packets not energy in packet / electron absorbs one whole packet", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-42-S23-Q8a",
    label: "Question 8(a)",
    paper_ref: "9702/42 · May/Jun 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Electrons in a gas move between energy levels. Explain, with reference to photons, why there is a single frequency of electromagnetic radiation that corresponds to each of these transitions.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain with reference to photons why there is a single frequency of electromagnetic radiation corresponding to each electron transition between energy levels.
Mark scheme:
- B1 mark 1: transition emits one photon with energy equal to the difference in energy between the two levels
- B1 mark 2: frequency of radiation corresponds to energy of photon
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "transition emits one photon with energy equal to difference between energy levels", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "frequency corresponds to energy of photon", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-M24-Q7ci",
    label: "Question 7(c)(i)",
    paper_ref: "9702/42 · Feb/Mar 2024",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Explain the term threshold wavelength.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Explain the term threshold wavelength.
Mark scheme:
- B1 mark 1: the maximum wavelength of electromagnetic radiation that causes electrons to be emitted from the surface of a metal
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "maximum wavelength that causes electron emission from metal surface", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-43-S23-Q7a",
    label: "Question 7(a)",
    paper_ref: "9702/43 · May/Jun 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "State what is meant by the de Broglie wavelength.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by the de Broglie wavelength.
Mark scheme:
- B1 mark 1: the wavelength associated with a moving particle
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "wavelength associated with a moving particle", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-43-S23-Q7bii",
    label: "Question 7(b)(ii)",
    paper_ref: "9702/43 · May/Jun 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "A beam of electrons is directed at a thin crystal and a diffraction pattern is observed on a fluorescent screen. Explain what can be concluded from the pattern about the nature of electrons.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A diffraction pattern is observed when a beam of electrons is directed at a thin crystal. Explain what can be concluded about the nature of electrons.
Mark scheme:
- B1 mark 1: beam spreads out indicating diffraction OR light and dark regions indicate an interference pattern
- B1 mark 2: electron beam is behaving as a wave
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "beam spreads out indicating diffraction / light and dark regions indicate interference", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "electron beam behaving as a wave", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-43-S23-Q7cii",
    label: "Question 7(c)(ii)",
    paper_ref: "9702/43 · May/Jun 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "The potential difference used to accelerate the electrons is increased. Explain, with reference to de Broglie wavelength, the change in the diffraction pattern on the fluorescent screen.",
    total_marks: 3,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The potential difference accelerating electrons is increased. Explain with reference to de Broglie wavelength the change in the diffraction pattern.
Mark scheme:
- B1 mark 1: greater potential difference so electrons have greater momentum
- B1 mark 2: greater momentum so decrease in de Broglie wavelength
- B1 mark 3: lower de Broglie wavelength causes smaller diffraction angle OR smaller angle of intensity maxima OR decrease in fringe spacing
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "greater pd so electrons have greater momentum", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "greater momentum so decrease in de Broglie wavelength", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "lower wavelength causes smaller diffraction angle / decrease in fringe spacing", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(3),
  },
  {
    id: "9702-41-S24-Q8bi",
    label: "Question 8(b)(i)",
    paper_ref: "9702/41 · May/Jun 2024",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Electromagnetic radiation is incident on a metal plate and particles are emitted from the plate. State the name of the particles.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the name of the particles emitted from a metal plate when electromagnetic radiation is incident on it.
Mark scheme:
- B1 mark 1: electrons
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "electrons", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-41-W23-Q8c",
    label: "Question 8(c)",
    paper_ref: "9702/41 · Oct/Nov 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "A beam of red light is replaced with a beam of blue light of the same intensity. Suggest and explain whether the pressure exerted on the mirror by the beam of blue light is less than, the same as, or greater than the pressure exerted by the beam of red light.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A beam of red light is replaced with blue light of the same intensity. Suggest and explain whether the pressure on the mirror is less than, the same as, or greater than that of the red light.
Mark scheme:
- B1 mark 1: photons of blue light have greater momentum OR there are fewer photons per unit time in the blue beam
- B1 mark 2: greater photon momentum but smaller number of photons per unit time so pressure is the same
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "blue photons have greater momentum / fewer photons per unit time", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "greater momentum but fewer photons so pressure is the same", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-M22-Q8a",
    label: "Question 8(a)",
    paper_ref: "9702/42 · Feb/Mar 2022",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "State the formula for the de Broglie wavelength λ of a moving particle. State the meaning of any other symbol used.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the formula for the de Broglie wavelength of a moving particle and state the meaning of any other symbol used.
Mark scheme:
- M1 mark 1: λ = h/p or λ = h/mv
- A1 mark 2: h is the Planck constant AND p is the momentum of the particle OR m is the mass and v is the velocity of the particle
Note: M1 must be awarded before A1 can be given.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "λ = h/p or λ = h/mv", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "h is Planck constant and p is momentum / m is mass and v is velocity", "found": true or false, "feedback": "one sentence explanation — cannot be awarded unless mark 1 is also awarded" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
  {
    id: "9702-42-M22-Q8bi",
    label: "Question 8(b)(i)",
    paper_ref: "9702/42 · Feb/Mar 2022",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "A beam of electrons is directed at a thin crystal. State the name of the phenomenon shown by the electrons at the crystal.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A beam of electrons is directed at a thin crystal. State the name of the phenomenon shown by the electrons.
Mark scheme:
- B1 mark 1: electron diffraction
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "electron diffraction", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-M22-Q8bii",
    label: "Question 8(b)(ii)",
    paper_ref: "9702/42 · Feb/Mar 2022",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "State what this phenomenon shows about the nature of electrons.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what electron diffraction shows about the nature of electrons.
Mark scheme:
- B1 mark 1: moving electrons behave like waves
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "moving electrons behave like waves", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-M22-Q8biii",
    label: "Question 8(b)(iii)",
    paper_ref: "9702/42 · Feb/Mar 2022",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Suggest why a thin crystal causes electron diffraction.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Suggest why a thin crystal causes electron diffraction.
Mark scheme:
- B1 mark 1: spacing between atoms is approximately equal to the wavelength of the electrons OR diameter of atom is approximately equal to wavelength of electrons
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "spacing between atoms approximately equal to wavelength of electrons", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-M23-Q7a",
    label: "Question 7(a)",
    paper_ref: "9702/42 · Feb/Mar 2023",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "A beam of white light passes through a cloud of cool gas. The spectrum of the transmitted light contains a number of dark lines. Explain why these dark lines occur.",
    total_marks: 4,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: A beam of white light passes through cool gas and the spectrum of transmitted light contains dark lines. Explain why these dark lines occur.
Mark scheme:
- B1 mark 1: photon absorbed by electron and electron is excited to higher energy level
- B1 mark 2: photon energy equal to difference in energy of two energy levels
- B1 mark 3: photon energy relates to a single wavelength or single frequency
- B1 mark 4: electron de-excites and emits photon in any direction
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "photon absorbed by electron and electron excited to higher energy level", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "photon energy equal to difference between energy levels", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "photon energy relates to a single wavelength / single frequency", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "electron de-excites and emits photon in any direction", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(4),
  },
  {
    id: "9702-42-W24-Q9a",
    label: "Question 9(a)",
    paper_ref: "9702/42 · Oct/Nov 2024",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "Electrons passing through a thin crystal produce a diffraction pattern. Explain what this observation shows about the nature of electrons.",
    total_marks: 1,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Electrons passing through a thin crystal produce a diffraction pattern. Explain what this shows about the nature of electrons.
Mark scheme:
- B1 mark 1: diffraction is characteristic of wave behaviour so shows that electrons can behave like waves
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "diffraction is wave behaviour so electrons can behave like waves", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(1),
  },
  {
    id: "9702-42-W24-Q9c",
    label: "Question 9(c)",
    paper_ref: "9702/42 · Oct/Nov 2024",
    topic: "Quantum Physics",
    topic_key: "quantum_physics",
    text: "The potential difference through which the electrons are accelerated is now increased. Describe and explain the effect of this change on the interference pattern observed.",
    total_marks: 2,
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The potential difference accelerating electrons is increased. Describe and explain the effect on the interference pattern.
Mark scheme:
- B1 mark 1: electrons have greater momentum so smaller de Broglie wavelength
- B1 mark 2: fringes become closer together
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "greater momentum so smaller de Broglie wavelength", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "fringes become closer together", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: makeSchema(2),
  },
];

const PROGRESS_KEY = "ala_hub_quantum_progress";

export function getNextQuantumQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = QUANTUM_QUESTIONS[idx % QUANTUM_QUESTIONS.length];
  return { question, idx, total: QUANTUM_QUESTIONS.length };
}

export function advanceQuantumIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % QUANTUM_QUESTIONS.length));
}