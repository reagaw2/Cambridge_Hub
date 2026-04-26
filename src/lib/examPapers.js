/**
 * examPapers.js — metadata for past papers available in Exam Mode.
 * Questions are stubs pointing to the same prompt/schema as practice mode.
 * Extend PAPERS to add more sessions/variants.
 */

export const EXAM_DURATION_SECONDS = 7200; // 2 hours

// Paper registry — add real question content here as papers are authored
export const PAPERS = [
  {
    id: "9702/41/O/N/25",
    subject: "physics",
    session: "Nov 2025",
    variant: "41",
    code: "9702",
    displayName: "9702/41 · Nov 2025",
    estimatedHours: 2,
    questions: [
      { id: "w25_44_Q1a",  topic: "Gravitational Fields",      text: "Define gravitational field strength.", total_marks: 1, mark_scheme: "Force per unit mass at a point in the field." },
      { id: "w25_44_Q3a",  topic: "Thermal Physics",           text: "State what is meant by internal energy of a system.", total_marks: 2, mark_scheme: "Sum of kinetic and potential energies of all molecules in the system." },
      { id: "w25_44_Q4a",  topic: "Oscillations",              text: "Define simple harmonic motion.", total_marks: 2, mark_scheme: "Acceleration proportional to displacement; directed towards equilibrium." },
      { id: "w25_44_Q5a",  topic: "Electric Fields",           text: "Define electric field strength.", total_marks: 1, mark_scheme: "Force per unit positive charge at a point." },
      { id: "w25_44_Q6ai", topic: "Capacitance",               text: "Define capacitance.", total_marks: 1, mark_scheme: "Charge stored per unit potential difference across the capacitor." },
      { id: "w25_44_Q7a",  topic: "Electromagnetic Induction", text: "State Faraday's law of electromagnetic induction.", total_marks: 2, mark_scheme: "EMF induced is proportional to the rate of change of flux linkage." },
      { id: "w25_44_Q9a",  topic: "Quantum Physics",           text: "State what is meant by the wave-particle duality of electrons.", total_marks: 2, mark_scheme: "Electrons exhibit both wave and particle properties depending on the experiment." },
      { id: "w25_44_Q10a", topic: "Astrophysics",              text: "State what is meant by a black body radiator.", total_marks: 2, mark_scheme: "A body that absorbs and emits all wavelengths of radiation." },
      { id: "w25_44_Q8a",  topic: "Nuclear Physics",           text: "Define the decay constant of a radioactive nuclide.", total_marks: 2, mark_scheme: "Probability of decay per unit time of a nucleus." },
    ],
  },
  {
    id: "9702/42/O/N/25",
    subject: "physics",
    session: "Nov 2025",
    variant: "42",
    code: "9702",
    displayName: "9702/42 · Nov 2025",
    estimatedHours: 2,
    questions: [
      { id: "9702-42-W23-Q8a",   topic: "Quantum Physics",    text: "State what is meant by the photoelectric effect.", total_marks: 2, mark_scheme: "Emission of electrons from a metal surface when illuminated by light above threshold frequency." },
      { id: "9702-42-W23-Q8bi",  topic: "Quantum Physics",    text: "Define the threshold frequency.", total_marks: 1, mark_scheme: "Minimum frequency of incident radiation to cause emission of a photoelectron." },
      { id: "9702-42-W23-Q8bii", topic: "Quantum Physics",    text: "State what is meant by work function energy.", total_marks: 1, mark_scheme: "Minimum energy required to remove an electron from the surface of a metal." },
      { id: "9702-43-W24-Q3ai",  topic: "Thermal Physics",    text: "Explain what is meant by the internal energy of an ideal gas.", total_marks: 2, mark_scheme: "Sum of kinetic energies of all molecules; no potential energy for ideal gas." },
      { id: "9702-43-W24-Q10a",  topic: "Astrophysics",       text: "State the Stefan-Boltzmann law.", total_marks: 2, mark_scheme: "Power radiated is proportional to surface area and T to the power 4." },
    ],
  },
  {
    id: "9702/41/O/N/24",
    subject: "physics",
    session: "Nov 2024",
    variant: "41",
    code: "9702",
    displayName: "9702/41 · Nov 2024",
    estimatedHours: 2,
    questions: [
      { id: "9702-41-ALA26-Q1a",  topic: "Gravitational Fields", text: "Define gravitational potential at a point.", total_marks: 2, mark_scheme: "Work done per unit mass to move a small test mass from infinity to the point." },
      { id: "9702-41-ALA26-Q1bi", topic: "Gravitational Fields", text: "Explain why gravitational potential is always negative.", total_marks: 2, mark_scheme: "Work done against gravity is negative; potential at infinity is zero." },
      { id: "9702-41-ALA26-Q2a",  topic: "Thermal Physics",      text: "Explain what is meant by an ideal gas.", total_marks: 3, mark_scheme: "Obeys pV=nRT; molecules have no intermolecular forces; elastic collisions; negligible molecular volume." },
      { id: "9702-41-ALA26-Q4a",  topic: "Oscillations",         text: "State the conditions necessary for simple harmonic motion.", total_marks: 2, mark_scheme: "Acceleration proportional to displacement and directed towards equilibrium." },
      { id: "9702-41-ALA26-Q5a",  topic: "Electric Fields",      text: "State Coulomb's law.", total_marks: 2, mark_scheme: "Force between two point charges proportional to product of charges and inversely proportional to square of separation." },
      { id: "9702-41-ALA26-Q9a",  topic: "Nuclear Physics",      text: "Define nuclear binding energy.", total_marks: 2, mark_scheme: "Energy required to completely separate all nucleons in a nucleus." },
    ],
  },
  {
    id: "9702/42/O/N/24",
    subject: "physics",
    session: "Nov 2024",
    variant: "42",
    code: "9702",
    displayName: "9702/42 · Nov 2024",
    estimatedHours: 2,
    questions: [
      { id: "9702-42-W24-Q9a", topic: "Quantum Physics", text: "Describe the evidence from the photoelectric effect that electromagnetic radiation has a particulate nature.", total_marks: 3, mark_scheme: "Emission is instantaneous; max KE depends on frequency not intensity; threshold frequency exists." },
      { id: "9702-42-W24-Q9c", topic: "Quantum Physics", text: "Explain why the existence of a threshold frequency supports the photon model.", total_marks: 2, mark_scheme: "Each photon has energy hf; photon energy must exceed work function; wave theory predicts emission at any frequency." },
      { id: "9702-42-W22-Q3a",  topic: "Thermal Physics", text: "State the first law of thermodynamics.", total_marks: 2, mark_scheme: "Increase in internal energy equals heat added to system plus work done on system." },
    ],
  },
  {
    id: "9702/43/O/N/24",
    subject: "physics",
    session: "Nov 2024",
    variant: "43",
    code: "9702",
    displayName: "9702/43 · Nov 2024",
    estimatedHours: 2,
    questions: [
      { id: "9702-43-W24-Q3ai",  topic: "Thermal Physics", text: "Define internal energy.", total_marks: 2, mark_scheme: "Sum of random kinetic and potential energies of all molecules." },
      { id: "9702-43-W24-Q3aii", topic: "Thermal Physics", text: "Explain why the internal energy of an ideal gas consists only of kinetic energy.", total_marks: 2, mark_scheme: "Ideal gas molecules have no intermolecular forces, hence no potential energy." },
      { id: "9702-43-S23-Q4a",   topic: "Thermal Physics", text: "Explain what is meant by absolute zero of temperature.", total_marks: 2, mark_scheme: "Temperature at which all substances have minimum internal energy; molecules have minimum kinetic energy." },
    ],
  },
];

// Lookup helpers
export function getPaper(paperId) {
  return PAPERS.find(p => p.id === paperId) ?? null;
}

export function getPapersForSubjectAndSession(subject, session) {
  return PAPERS.filter(p => p.subject === subject && p.session === session);
}

export const SESSIONS = ["Nov 2025", "Nov 2024", "Nov 2023", "Nov 2022", "Nov 2021"];
export const PHYSICS_VARIANTS = ["41", "42", "43"];
// CS variants are managed dynamically in csPapers.js — this legacy export is kept for compatibility
export const CS_VARIANTS = ["21", "22", "23"];

// Generate a generic AI prompt for exam mode questions
export function buildExamPrompt(question, answer) {
  return `You are a Cambridge A Level examiner marking a student's answer under exam conditions.

Question: "${question.text}"
Topic: ${question.topic}
Total marks available: ${question.total_marks}
Mark scheme: ${question.mark_scheme}

Student's answer: "${answer}"

Mark the student's answer against the mark scheme. Be rigorous but fair — award marks only for points that match the mark scheme. Respond in the following JSON format only:

{
  "marks_earned": [number, 0 to ${question.total_marks}],
  "mark_breakdown": [
    { "point": "mark scheme point", "awarded": true or false, "comment": "one sentence" }
  ],
  "cambridge_insight": "two to three sentences explaining what Cambridge wants and where marks were lost or gained",
  "examiner_comment": "one sentence of actionable advice"
}`;
}

export function buildExamResponseSchema(totalMarks) {
  return {
    type: "object",
    properties: {
      marks_earned: { type: "number" },
      mark_breakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            point: { type: "string" },
            awarded: { type: "boolean" },
            comment: { type: "string" },
          }
        }
      },
      cambridge_insight: { type: "string" },
      examiner_comment: { type: "string" },
    }
  };
}