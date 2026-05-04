/**
 * mockExamPapers.js — question banks for the Mock Exam mode.
 * Each question is a sub-part (e.g. 1(a), 1(b)(i)) answered one at a time,
 * with AI marking inline after each submission.
 */

export const MOCK_PAPERS = [
  {
    id: "9702/41/O/N/25",
    displayName: "Physics 9702/41 · Oct/Nov 2025",
    subject: "physics",
    estimatedMinutes: 90,
    questions: [
      // ── Q1: Gravitational Fields ──────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q1a",
        question_number: "1(a)",
        topic: "Gravitational Fields",
        question_text: "State Newton's law of gravitation.",
        total_marks: 2,
        mark_scheme: "B1: Force (between two point masses) is proportional to the product of the masses. B1: Force is inversely proportional to the square of the separation between the masses.",
      },
      {
        id: "mock-9702-41-ON25-Q1bi",
        question_number: "1(b)(i)",
        topic: "Gravitational Fields",
        question_text: "Define gravitational field strength at a point.",
        total_marks: 1,
        mark_scheme: "B1: Gravitational force per unit mass at that point.",
      },
      {
        id: "mock-9702-41-ON25-Q1bii",
        question_number: "1(b)(ii)",
        topic: "Gravitational Fields",
        question_text: "Explain why gravitational field strength is always negative when the convention that the potential is zero at infinity is used.",
        total_marks: 2,
        mark_scheme: "B1: Gravitational force is always attractive. B1: Work is done by the field moving mass towards the source, so potential energy decreases from zero — potential is always negative.",
      },

      // ── Q2: Thermal Physics ───────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q2a",
        question_number: "2(a)",
        topic: "Thermal Physics",
        question_text: "State what is meant by an ideal gas.",
        total_marks: 2,
        mark_scheme: "B1: A gas that obeys the equation of state pV = nRT (or pV = NkT) exactly. B1: At all temperatures and pressures (or: molecules have negligible volume and no intermolecular forces).",
      },
      {
        id: "mock-9702-41-ON25-Q2bi",
        question_number: "2(b)(i)",
        topic: "Thermal Physics",
        question_text: "Use the equation pV = NkT to show that the average kinetic energy of a molecule of an ideal gas is proportional to the thermodynamic temperature T.",
        total_marks: 2,
        mark_scheme: "B1: From kinetic theory, pV = (1/3)Nm<c²>. B1: Equating with NkT gives (1/2)m<c²> = (3/2)kT, so mean KE is proportional to T.",
      },
      {
        id: "mock-9702-41-ON25-Q2bii",
        question_number: "2(b)(ii)",
        topic: "Thermal Physics",
        question_text: "State what is meant by the internal energy of an ideal gas.",
        total_marks: 2,
        mark_scheme: "B1: Sum of the (random) kinetic energies of all molecules. B1: There is no potential energy (for an ideal gas) because there are no intermolecular forces.",
      },

      // ── Q3: Oscillations ─────────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q3a",
        question_number: "3(a)",
        topic: "Oscillations",
        question_text: "State the two conditions necessary for a body to be executing simple harmonic motion.",
        total_marks: 2,
        mark_scheme: "B1: The acceleration is proportional to the displacement from the equilibrium position. B1: The acceleration is always directed towards the equilibrium position (opposite direction to displacement).",
      },
      {
        id: "mock-9702-41-ON25-Q3bi",
        question_number: "3(b)(i)",
        topic: "Oscillations",
        question_text: "Define the amplitude of an oscillation.",
        total_marks: 1,
        mark_scheme: "B1: The maximum displacement from the equilibrium position.",
      },
      {
        id: "mock-9702-41-ON25-Q3bii",
        question_number: "3(b)(ii)",
        topic: "Oscillations",
        question_text: "Explain what is meant by resonance in a mechanical system.",
        total_marks: 2,
        mark_scheme: "B1: When the driving frequency equals the natural frequency of the system. B1: The amplitude of oscillation becomes maximum (large).",
      },

      // ── Q4: Electric Fields ───────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q4a",
        question_number: "4(a)",
        topic: "Electric Fields",
        question_text: "Define electric field strength at a point.",
        total_marks: 1,
        mark_scheme: "B1: Force per unit positive charge at that point.",
      },
      {
        id: "mock-9702-41-ON25-Q4bi",
        question_number: "4(b)(i)",
        topic: "Electric Fields",
        question_text: "State what is meant by electric potential at a point.",
        total_marks: 2,
        mark_scheme: "B1: Work done per unit positive charge. B1: In moving a small positive test charge from infinity to that point.",
      },
      {
        id: "mock-9702-41-ON25-Q4bii",
        question_number: "4(b)(ii)",
        topic: "Electric Fields",
        question_text: "Explain why all points on the surface of an isolated charged sphere are at the same potential.",
        total_marks: 2,
        mark_scheme: "B1: The electric field is perpendicular to the surface everywhere. B1: No work is done moving a charge along the surface, so potential is constant.",
      },

      // ── Q5: Capacitance ───────────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q5a",
        question_number: "5(a)",
        topic: "Capacitance",
        question_text: "Define capacitance.",
        total_marks: 1,
        mark_scheme: "B1: Charge stored per unit potential difference (Q/V).",
      },
      {
        id: "mock-9702-41-ON25-Q5bi",
        question_number: "5(b)(i)",
        topic: "Capacitance",
        question_text: "State what is meant by the time constant of a capacitor–resistor circuit.",
        total_marks: 1,
        mark_scheme: "B1: The time for the charge (or voltage) to decrease to 1/e (approximately 37%) of its initial value.",
      },
      {
        id: "mock-9702-41-ON25-Q5bii",
        question_number: "5(b)(ii)",
        topic: "Capacitance",
        question_text: "Explain why, when a capacitor is fully charged in a series RC circuit, the current in the circuit is zero.",
        total_marks: 2,
        mark_scheme: "B1: The p.d. across the capacitor equals the EMF of the supply. B1: So the p.d. across the resistor is zero; by V = IR, the current is zero.",
      },

      // ── Q6: Electromagnetic Induction ─────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q6a",
        question_number: "6(a)",
        topic: "Electromagnetic Induction",
        question_text: "State Faraday's law of electromagnetic induction.",
        total_marks: 2,
        mark_scheme: "B1: The induced e.m.f. is proportional to the rate of change of (magnetic) flux linkage. B1: (Must include 'flux linkage' not just 'flux'.)",
      },
      {
        id: "mock-9702-41-ON25-Q6bi",
        question_number: "6(b)(i)",
        topic: "Electromagnetic Induction",
        question_text: "State Lenz's law.",
        total_marks: 1,
        mark_scheme: "B1: The direction of the induced e.m.f. is such as to oppose the change causing it.",
      },
      {
        id: "mock-9702-41-ON25-Q6bii",
        question_number: "6(b)(ii)",
        topic: "Electromagnetic Induction",
        question_text: "Explain how Lenz's law is consistent with the law of conservation of energy.",
        total_marks: 2,
        mark_scheme: "B1: The induced current produces a force that opposes the motion causing it. B1: Work must be done against this force; this work is converted to electrical energy — energy is conserved.",
      },

      // ── Q7: Quantum Physics ───────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q7a",
        question_number: "7(a)",
        topic: "Quantum Physics",
        question_text: "State what is meant by the photoelectric effect.",
        total_marks: 2,
        mark_scheme: "B1: Emission of electrons from a metal surface. B1: When electromagnetic radiation of sufficient frequency is incident on the surface.",
      },
      {
        id: "mock-9702-41-ON25-Q7bi",
        question_number: "7(b)(i)",
        topic: "Quantum Physics",
        question_text: "Explain why there is a threshold frequency for the photoelectric effect.",
        total_marks: 2,
        mark_scheme: "B1: Each photon interacts with one electron; the photon energy must exceed the work function. B1: Energy of photon E = hf so minimum frequency exists below which emission cannot occur.",
      },
      {
        id: "mock-9702-41-ON25-Q7bii",
        question_number: "7(b)(ii)",
        topic: "Quantum Physics",
        question_text: "Explain why increasing the intensity of radiation below the threshold frequency does not cause emission of electrons.",
        total_marks: 2,
        mark_scheme: "B1: Greater intensity means more photons per unit time, not more energetic photons. B1: Each individual photon still has energy less than the work function, so no electron can be emitted.",
      },

      // ── Q8: Astrophysics ─────────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q8a",
        question_number: "8(a)",
        topic: "Astrophysics",
        question_text: "State what is meant by redshift.",
        total_marks: 2,
        mark_scheme: "B1: An increase in the observed wavelength (decrease in frequency) of radiation from a source. B1: Caused by the source receding from the observer (Doppler effect).",
      },
      {
        id: "mock-9702-41-ON25-Q8bi",
        question_number: "8(b)(i)",
        topic: "Astrophysics",
        question_text: "State Hubble's law.",
        total_marks: 2,
        mark_scheme: "B1: The recession speed of a galaxy is proportional to its distance from Earth. B1: v = H₀d where H₀ is the Hubble constant.",
      },
      {
        id: "mock-9702-41-ON25-Q8bii",
        question_number: "8(b)(ii)",
        topic: "Astrophysics",
        question_text: "Explain how Hubble's law supports the Big Bang model of the universe.",
        total_marks: 3,
        mark_scheme: "B1: Galaxies are all moving apart (universe is expanding). B1: This implies everything originated from a single point / the universe was once extremely dense and hot. B1: The time for expansion gives an estimate for the age of the universe consistent with the Big Bang model.",
      },

      // ── Q9: Nuclear Physics ───────────────────────────────────────────────
      {
        id: "mock-9702-41-ON25-Q9a",
        question_number: "9(a)",
        topic: "Nuclear Physics",
        question_text: "Define the decay constant of a radioactive nuclide.",
        total_marks: 2,
        mark_scheme: "B1: The probability of decay of a nucleus per unit time. B1: (It is a constant for a given nuclide, independent of its history.)",
      },
      {
        id: "mock-9702-41-ON25-Q9bi",
        question_number: "9(b)(i)",
        topic: "Nuclear Physics",
        question_text: "Explain what is meant by radioactive half-life.",
        total_marks: 2,
        mark_scheme: "B1: The time taken for half the nuclei (in a sample) to decay. B1: It is constant and independent of the amount of the radioactive substance present.",
      },
      {
        id: "mock-9702-41-ON25-Q9bii",
        question_number: "9(b)(ii)",
        topic: "Nuclear Physics",
        question_text: "Explain why it is not possible to predict when a particular nucleus will decay.",
        total_marks: 2,
        mark_scheme: "B1: Radioactive decay is a random process. B1: Each nucleus has the same probability of decaying per unit time regardless of age or surroundings; the exact moment cannot be predicted.",
      },
    ],
  },
];

export function getMockPaper(id) {
  return MOCK_PAPERS.find(p => p.id === id) ?? null;
}