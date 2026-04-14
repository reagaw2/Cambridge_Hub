// MCQ Question Bank — ALA Hub
// Questions served in id order, looping back when exhausted

export const MCQ_QUESTIONS = [
  // ── Physical Quantities & Units ────────────────────────────────────────
  {
    id: "ala-mock-apr26-q1",
    topic: "Physical Quantities & Units",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "What are the SI base units for the moment of a force?",
    options: {
      A: "kg m⁻¹ s²",
      B: "kg s⁻²",
      C: "kg m s⁻²",
      D: "kg m² s⁻²",
    },
    correct: "D",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q2",
    topic: "Physical Quantities & Units",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Which quantity is not an SI base quantity?",
    options: {
      A: "charge",
      B: "mass",
      C: "temperature",
      D: "time",
    },
    correct: "A",
    has_diagram: false,
  },

  // ── Dynamics & Newton's Laws ───────────────────────────────────────────
  {
    id: "ala-mock-apr26-q6",
    topic: "Dynamics & Newton's Laws",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A projectile is fired from point P with velocity V at an angle θ to the horizontal. It lands at point Q, a horizontal distance R from P, after time T. The acceleration of free fall is g. Air resistance is negligible. Which equation is correct?",
    options: {
      A: "R = VT cos θ",
      B: "R = VT sin θ",
      C: "R = VT cos θ − ½gT²",
      D: "R = VT sin θ − ½gT²",
    },
    correct: "A",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q7",
    topic: "Dynamics & Newton's Laws",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Two blocks of mass 0.20 kg and 0.50 kg are connected by a light inextensible string over a frictionless pulley. The 0.20 kg block rests on a rough horizontal surface; the 0.50 kg block is suspended in air. When released, the system accelerates at 2.0 m s⁻². What is the magnitude of the frictional force between the 0.20 kg block and the surface?",
    options: {
      A: "3.5 N",
      B: "3.9 N",
      C: "4.5 N",
      D: "6.3 N",
    },
    correct: "B",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q9",
    topic: "Dynamics & Newton's Laws",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "An object falls from a stationary helicopter and reaches terminal velocity. What happens to the acceleration of the object between leaving the helicopter and reaching terminal velocity?",
    options: {
      A: "It decreases to 9.81 m s⁻²",
      B: "It decreases to zero",
      C: "It increases to 9.81 m s⁻²",
      D: "It remains constant at 9.81 m s⁻²",
    },
    correct: "B",
    has_diagram: false,
  },

  // ── Momentum & Collisions ─────────────────────────────────────────────
  {
    id: "ala-mock-apr26-q10",
    topic: "Momentum & Collisions",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Particle P travelling at speed v collides perfectly elastically with stationary particle Q of the same mass. Which statement describes the motion of P and Q immediately after the collision?",
    options: {
      A: "P and Q both travel in the same direction with speed ½v",
      B: "P comes to rest and Q acquires speed v",
      C: "P rebounds with speed ½v and Q acquires speed ½v",
      D: "P rebounds with speed v and Q remains stationary",
    },
    correct: "B",
    has_diagram: false,
  },

  // ── Forces, Torques & Equilibrium ─────────────────────────────────────
  {
    id: "ala-mock-apr26-q12",
    topic: "Forces, Torques & Equilibrium",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A couple consists of two forces, each of magnitude F, that act in opposite directions in the same plane. The perpendicular distance between the two forces is d. What is the torque of the couple?",
    options: {
      A: "Fd/2",
      B: "F/d",
      C: "Fd",
      D: "2Fd",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q14",
    topic: "Forces, Torques & Equilibrium",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A rectangular block of lead of density 1.13 × 10⁴ kg m⁻³ has sides of length 12.0 cm, 15.0 cm and 10.0 cm. What is the maximum pressure the block can exert when resting on a table?",
    options: {
      A: "1.13 kPa",
      B: "1.70 kPa",
      C: "11.1 kPa",
      D: "16.6 kPa",
    },
    correct: "D",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q15",
    topic: "Forces, Torques & Equilibrium",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A solid sphere less dense than water is held completely immersed in water and then released. It immediately rises. Which row describes the changes in the magnitudes of the upthrust on the sphere and the resultant force on the sphere as it rises?",
    options: {
      A: "upthrust constant; resultant force decreasing",
      B: "upthrust constant; resultant force increasing",
      C: "upthrust decreasing; resultant force decreasing",
      D: "upthrust decreasing; resultant force increasing",
    },
    correct: "A",
    has_diagram: false,
  },

  // ── Work, Energy & Power ──────────────────────────────────────────────
  {
    id: "ala-mock-apr26-q17",
    topic: "Work, Energy & Power",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "An object travelling at 10 m s⁻¹ has kinetic energy 1500 J. The speed of the object is increased to 40 m s⁻¹. What is the new kinetic energy of the object?",
    options: {
      A: "4500 J",
      B: "6000 J",
      C: "24 000 J",
      D: "1 350 000 J",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q18",
    topic: "Work, Energy & Power",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Which statement about efficiency is correct?",
    options: {
      A: "Efficiency does not have a unit",
      B: "The joule is a unit of efficiency",
      C: "The metre is a unit of efficiency",
      D: "The watt is a unit of efficiency",
    },
    correct: "A",
    has_diagram: false,
  },

  // ── Deformation of Solids ─────────────────────────────────────────────
  {
    id: "ala-mock-apr26-q21",
    topic: "Deformation of Solids",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A wire is stretched by a gradually increasing force. The force–extension graph shows points P (origin region), Q (end of linear section), R (beyond Q), and S (beyond R). Which statement must be correct?",
    options: {
      A: "Point Q is the elastic limit",
      B: "Point R is the limit of proportionality",
      C: "The area under the graph from P to S is the elastic potential energy stored in the wire",
      D: "The area under the graph from P to S is the work done in stretching the wire",
    },
    correct: "D",
    has_diagram: false,
  },

  // ── Waves ─────────────────────────────────────────────────────────────
  {
    id: "ala-mock-apr26-q25",
    topic: "Waves",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "In an experiment, a stationary wave is formed on a string stretched horizontally between two fixed points. Which statement about the experiment is correct?",
    options: {
      A: "At certain times, the string between two nodes is horizontal with all points having zero displacement",
      B: "Each point on the string between two antinodes has an oscillation of the same amplitude",
      C: "The number of nodes is equal to the number of antinodes",
      D: "Two adjacent antinodes oscillate in phase",
    },
    correct: "A",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q26",
    topic: "Waves",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Three different electromagnetic waves P, Q and R have frequencies 3 × 10¹⁰ Hz, 3 × 10¹³ Hz, and 6 × 10¹⁴ Hz respectively. Which row correctly identifies P, Q and R?",
    options: {
      A: "P: infra-red, Q: visible, R: ultraviolet",
      B: "P: microwave, Q: infra-red, R: visible",
      C: "P: ultraviolet, Q: X-ray, R: gamma ray",
      D: "P: visible, Q: ultraviolet, R: X-ray",
    },
    correct: "B",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q27",
    topic: "Waves",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Which row describes the oscillations of two moving particles in a stationary wave that are separated by a distance of half a wavelength?",
    options: {
      A: "phase difference 90°; amplitude different",
      B: "phase difference 90°; amplitude same",
      C: "phase difference 180°; amplitude different",
      D: "phase difference 180°; amplitude same",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q28",
    topic: "Waves",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Waves P and Q have the same amplitude. They meet in phase at point X and interfere to give a resultant wave with intensity I. The amplitude of wave P is then doubled. What is the new intensity of the resultant wave at X, in terms of I?",
    options: {
      A: "0.44I",
      B: "1.5I",
      C: "2.3I",
      D: "3.0I",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q29",
    topic: "Waves",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Radio waves can be polarised, but sound waves cannot be polarised. Which statement gives the reason for this?",
    options: {
      A: "Radio waves are generally of a higher frequency than sound waves",
      B: "Radio waves are transverse waves, but sound waves are longitudinal waves",
      C: "Radio waves can travel through a vacuum, but sound waves cannot travel through a vacuum",
      D: "Radio waves travel at a much higher speed than sound waves",
    },
    correct: "B",
    has_diagram: false,
  },

  // ── Electricity ───────────────────────────────────────────────────────
  {
    id: "ala-mock-apr26-q31",
    topic: "Electricity",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "What is the unit of resistivity?",
    options: {
      A: "Ω m⁻²",
      B: "Ω m⁻¹",
      C: "Ω",
      D: "Ω m",
    },
    correct: "D",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q32",
    topic: "Electricity",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Two lamps X and Y are each connected to separate cells. Lamp X: current 0.50 A, resistance 9.6 Ω. Lamp Y: current 3.0 A, resistance 1.2 Ω. What is the ratio of power in lamp X to power in lamp Y?",
    options: {
      A: "0.22",
      B: "0.75",
      C: "1.3",
      D: "4.5",
    },
    correct: "A",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q35",
    topic: "Electricity",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A circuit contains a cell with negligible internal resistance. The energy transferred per unit charge around the complete circuit is E, and the potential difference across component X is V. The cell is replaced with one of the same EMF but significant internal resistance. What is the effect on E and V?",
    options: {
      A: "E decreases; V decreases",
      B: "E decreases; V increases",
      C: "E no change; V decreases",
      D: "E no change; V increases",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q36",
    topic: "Electricity",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Each of Kirchhoff's laws is a statement based on the conservation of a physical quantity. Which quantity is conserved in each law?",
    options: {
      A: "Kirchhoff's first law: charge; Kirchhoff's second law: energy",
      B: "Kirchhoff's first law: energy; Kirchhoff's second law: current",
      C: "Kirchhoff's first law: power; Kirchhoff's second law: charge",
      D: "Kirchhoff's first law: resistance; Kirchhoff's second law: power",
    },
    correct: "A",
    has_diagram: false,
  },

  // ── Nuclear Physics & Particle Physics ────────────────────────────────
  {
    id: "ala-mock-apr26-q37",
    topic: "Nuclear Physics & Particle Physics",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Nuclide X with proton number Z undergoes β⁺ decay to form nuclide Y, according to: X → Y + β⁺ + W. What is the proton number of Y and which particle is represented by W?",
    options: {
      A: "proton number Z − 1; antineutrino",
      B: "proton number Z − 1; neutrino",
      C: "proton number Z + 1; antineutrino",
      D: "proton number Z + 1; neutrino",
    },
    correct: "B",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q38",
    topic: "Nuclear Physics & Particle Physics",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "Which of the following is not a quark flavour?",
    options: {
      A: "charm",
      B: "meson",
      C: "strange",
      D: "up",
    },
    correct: "B",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q39",
    topic: "Nuclear Physics & Particle Physics",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "The unstable nuclide ²¹⁸₈₄X decays through a sequence of α and β⁻ emissions to form the stable nuclide ²¹⁰₈₃Y. How many α and β⁻ particles are emitted during this decay process?",
    options: {
      A: "1 α-particle, 1 β⁻-particle",
      B: "2 α-particles, 1 β⁻-particle",
      C: "2 α-particles, 3 β⁻-particles",
      D: "3 α-particles, 2 β⁻-particles",
    },
    correct: "C",
    has_diagram: false,
  },
  {
    id: "ala-mock-apr26-q40",
    topic: "Nuclear Physics & Particle Physics",
    source: "ALA Mock · 9702/11 · Apr 2026",
    text: "A particular hadron is composed of three quarks and has zero charge. What is a possible quark composition of the hadron?",
    options: {
      A: "down, down, strange",
      B: "up, down, strange",
      C: "up, up, down",
      D: "up, up, strange",
    },
    correct: "A",
    has_diagram: false,
  },
];

/**
 * Returns questions for a given topic, in order by id, looping.
 */
export function getQuestionsForTopic(topic) {
  return MCQ_QUESTIONS.filter((q) => q.topic === topic);
}

/**
 * Returns questions matching an array of question ids.
 */
export function getQuestionsByIds(ids) {
  return MCQ_QUESTIONS.filter((q) => ids.includes(q.id));
}

/**
 * Returns all unique MCQ topic names.
 */
export function getMCQTopics() {
  return [...new Set(MCQ_QUESTIONS.map((q) => q.topic))];
}

// LocalStorage key for tracking which question index to serve next per topic — scoped by user
function mcqProgressKey(userEmail) {
  return `ala_hub_mcq_progress_${userEmail || "anon"}`;
}

function loadProgress(userEmail) {
  try {
    return JSON.parse(localStorage.getItem(mcqProgressKey(userEmail)) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(userEmail, progress) {
  localStorage.setItem(mcqProgressKey(userEmail), JSON.stringify(progress));
}

/**
 * Gets the next question for a topic (loops when exhausted).
 */
export function getNextMCQQuestion(topic, userEmail) {
  const questions = getQuestionsForTopic(topic);
  if (!questions.length) return null;

  const progress = loadProgress(userEmail);
  const idx = (progress[topic] ?? 0) % questions.length;
  return { question: questions[idx], idx, total: questions.length };
}

/**
 * Advances the index for a topic to the next question.
 */
export function advanceMCQIndex(topic, userEmail) {
  const questions = getQuestionsForTopic(topic);
  if (!questions.length) return;
  const progress = loadProgress(userEmail);
  const current = progress[topic] ?? 0;
  progress[topic] = (current + 1) % questions.length;
  saveProgress(userEmail, progress);
}