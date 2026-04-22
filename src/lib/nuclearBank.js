/**
 * Nuclear Physics written question bank
 * Questions served in order, looping back when exhausted.
 */

export const NUCLEAR_QUESTIONS = [
  // ── Existing question ──────────────────────────────────────────────────
  {
    id: "w25_44_Q8a",
    label: "Question 8(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Nuclear Physics",
    topic_key: "nuclear_physics",
    difficulty: "medium",
    text: "State what is meant by a tracer.",
    total_marks: 2,
    mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State what is meant by a tracer.
Mark scheme:
- B1 mark 1: a radioactive substance introduced into the body
- B1 mark 2: substance absorbed by the tissues being studied
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{
  "marks_earned": [number out of 2],
  "mark_1": { "earned": true or false, "keyword": "radioactive substance introduced into the body", "found": true or false, "feedback": "one sentence explanation" },
  "mark_2": { "earned": true or false, "keyword": "absorbed by tissues being studied", "found": true or false, "feedback": "one sentence explanation" },
  "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone",
  "next_step": "one sentence telling the student exactly what to focus on in their next attempt"
}`,
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
    nextFullRoute: "/nuclear/similar-question",
    nextRetryRoute: "/nuclear/question",
  },
  // ── 2 new questions ────────────────────────────────────────────────────
  {
    id: "9702-23-W21-Q4f-iii",
    label: "Question 4(f)(iii)",
    paper_ref: "9702/23 · Oct/Nov 2021",
    topic: "Nuclear Physics",
    topic_key: "nuclear_physics",
    difficulty: "hard",
    text: "The β⁻ particle is produced by the decay of a nucleus. State the name of another lepton that is produced at the same time as the β⁻ particle.",
    total_marks: 1,
    mark_scheme: "B1: electron antineutrino.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: State the name of another lepton that is produced at the same time as the beta minus particle during nuclear decay.
Mark scheme:
- B1 mark 1: electron antineutrino
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "electron antineutrino", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
    nextFullRoute: "/nuclear/question",
    nextRetryRoute: "/nuclear/question",
  },
  // ── 9702/41/O/N/25 questions ───────────────────────────────────────────
  {
    id: "Q_9702_41_N25_012",
    label: "Question 8(b)(iii)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Nuclear Physics",
    topic_key: "nuclear_physics",
    difficulty: "medium",
    text: "In the alpha decay of uranium-238, assume the rebound kinetic energy of the thorium nucleus is not negligible. Explain, without further calculation, how the true wavelength of the gamma radiation emitted compares with the value calculated assuming the rebound energy is negligible.",
    total_marks: 1,
    mark_scheme: "B1: the true energy of the gamma photon is smaller so the true wavelength is larger.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Assume the rebound kinetic energy of the thorium nucleus in alpha decay is not negligible. Explain how the true wavelength of the gamma radiation compares with the value calculated assuming rebound energy is negligible.
Mark scheme:
- B1 mark 1: the true energy of the gamma photon is smaller so the true wavelength is larger
Examiner insight: The key chain: thorium recoil takes some energy → less energy available for the gamma photon → photon energy is smaller → wavelength is larger (since E = hc/λ). Must explicitly link photon energy to wavelength.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "true energy of gamma photon is smaller so true wavelength is larger", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } } },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
    },
    nextFullRoute: "/nuclear/question",
    nextRetryRoute: "/nuclear/question",
  },
  {
    id: "Q_9702_41_N25_013",
    label: "Question 8(c)",
    paper_ref: "9702/41 · Oct/Nov 2025",
    topic: "Nuclear Physics",
    topic_key: "nuclear_physics",
    difficulty: "medium",
    text: "Gamma radiation emitted during the decay of uranium-238 has a single wavelength. Suggest why there is not a single wavelength for the gamma radiation emitted during the decay of a sample of cobalt-60, which decays by beta emission.",
    total_marks: 2,
    mark_scheme: "B1: antineutrinos are emitted during beta decay alongside the beta particle. B1: the particles share the available energy in varying amounts between decays, so the energy of each gamma photon varies.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: Suggest why there is not a single wavelength for the gamma radiation emitted during the beta decay of cobalt-60, unlike the single wavelength gamma from uranium-238 alpha decay.
Mark scheme:
- B1 mark 1: antineutrinos are emitted during beta decay alongside the beta particle
- B1 mark 2: the particles share the available energy in varying amounts between decays, so the energy of each gamma photon varies
Examiner insight: Candidates who named the antineutrino usually also understood the energy-sharing argument. Weaker candidates were unaware that beta decay involves an antineutrino sharing energy with the beta particle.
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "antineutrinos emitted during beta decay alongside beta particle", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "particles share available energy in varying amounts so gamma photon energy varies", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
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
    nextFullRoute: "/nuclear/question",
    nextRetryRoute: "/nuclear/question",
  },
  {
    id: "9702-21-W18-Q5c-ii",
    label: "Question 5(c)(ii)",
    paper_ref: "9702/21 · Oct/Nov 2018",
    topic: "Nuclear Physics",
    topic_key: "nuclear_physics",
    difficulty: "hard",
    text: "The total mass of the plutonium nucleus and the α-particle is less than that of the original nucleus X. Explain this difference in mass.",
    total_marks: 2,
    mark_scheme: "B1: mass-energy is conserved / the mass change is seen as energy. B1: energy released as gamma radiation / kinetic energy of alpha / kinetic energy of plutonium.",
    prompt: (answer) => `You are a Cambridge A Level Physics examiner. A student has answered the following question:
Question: The total mass of the plutonium nucleus and the alpha particle produced in a decay is less than the mass of the original nucleus X. Explain this difference in mass.
Mark scheme:
- B1 mark 1: mass-energy is conserved OR the mass change is seen as energy
- B1 mark 2: energy is released as gamma radiation OR as kinetic energy of the alpha particle OR as kinetic energy of the plutonium nucleus
Student's answer: ${answer}
Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "mass-energy is conserved / mass change is seen as energy", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "energy released as gamma radiation / kinetic energy of alpha / kinetic energy of plutonium", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences", "next_step": "one sentence" }`,
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
    nextFullRoute: "/nuclear/question",
    nextRetryRoute: "/nuclear/question",
  },
];

const PROGRESS_KEY = "ala_hub_nuclear_progress";

export function getNextNuclearQuestion() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  const question = NUCLEAR_QUESTIONS[idx % NUCLEAR_QUESTIONS.length];
  return { question, idx, total: NUCLEAR_QUESTIONS.length };
}

export function advanceNuclearIndex() {
  const idx = parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10);
  localStorage.setItem(PROGRESS_KEY, String((idx + 1) % NUCLEAR_QUESTIONS.length));
}

export function getNuclearQuestionById(id) {
  return NUCLEAR_QUESTIONS.find(q => q.id === id) ?? null;
}