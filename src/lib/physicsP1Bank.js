/**
 * physicsP1Bank.js — 9702/12/F/M/25 Paper 1 MCQ bank
 * All 40 questions with correct diagram image URLs.
 */

export const FORMULA_SHEET_URL = "dyad-media://media/Cambridge_Hub/.dyad/media/556ab55fbb4969f2dc0cbd631e7a0f93c3c6a7dad2a1bb2ef1e6a46a561d9565.png";

export const PAPER_META = {
  id: "9702/12/F/M/25",
  title: "Physics A Level — Paper 1 Multiple Choice",
  session: "February/March 2025",
  totalQuestions: 40,
  timeMinutes: 45,
};

export const PHYSICS_P1_QUESTIONS = [
  // ── Q1 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q01",
    number: 1,
    topic: "Physical Quantities & Units",
    text: "Which quantity is a scalar quantity?",
    image_required: false,
    options: { A: "force", B: "momentum", C: "velocity", D: "work" },
    correct: "D",
    explanation: "Work is a scalar — it has magnitude but no direction. Force, momentum and velocity are all vector quantities.",
  },

  // ── Q2 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q02",
    number: 2,
    topic: "Physical Quantities & Units",
    text: "What is the effect of a systematic error on the measurement of a physical quantity?",
    image_required: false,
    options: {
      A: "It limits the precision of the measured value.",
      B: "It limits the range of values obtained in repeated measurements.",
      C: "It results in repeated measurements having different values from each other.",
      D: "It results in the measured value being different from the correct value.",
    },
    correct: "D",
    explanation: "A systematic error causes all measurements to be consistently shifted from the true value. It affects accuracy, not precision.",
  },

  // ── Q3 — velocity-time graph ─────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q03",
    number: 3,
    topic: "Dynamics & Newton's Laws",
    text: "A car is accelerated by a constant resultant force of 300 N for 5.0 s. The variation with time of the velocity, in cm s⁻¹, of the car is shown.\n\nWhat is the mass of the car?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/6f5c20721ebfcef02d0aae8a1df42bf11fcda0bba36516fc3c4cab4cb3222e20.png",
    options: { A: "13 kg", B: "1000 kg", C: "1300 kg", D: "10000 kg" },
    correct: "C",
    explanation: "From the graph, read the gradient (acceleration) in cm s⁻² and convert to m s⁻². F = ma → m = F/a = 300/0.24 ≈ 1300 kg.",
  },

  // ── Q4 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q04",
    number: 4,
    topic: "Kinematics",
    text: "An aircraft, initially stationary on a runway, takes off with a speed of 85 km h⁻¹ in a distance of no more than 1.20 km. What is the minimum constant acceleration necessary for the aircraft?",
    image_required: false,
    options: { A: "0.23 m s⁻²", B: "0.46 m s⁻²", C: "3.0 m s⁻²", D: "6.0 m s⁻²" },
    correct: "A",
    explanation: "Convert: 85 km h⁻¹ = 23.6 m s⁻¹. Use v² = u² + 2as → (23.6)² = 0 + 2×a×1200 → a ≈ 0.23 m s⁻².",
  },

  // ── Q5 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q05",
    number: 5,
    topic: "Kinematics",
    text: "An object is fired upwards from horizontal ground. The object has an initial velocity of 20 m s⁻¹ at an angle of 45° to the horizontal. Air resistance is negligible. Which statement describes the speed of the object after it is fired until immediately before it reaches the ground again?",
    image_required: false,
    options: {
      A: "Its speed decreases to a value greater than zero, then increases to 20 m s⁻¹.",
      B: "Its speed decreases to a value greater than zero, then increases to a value greater than 20 m s⁻¹.",
      C: "Its speed decreases to zero, then increases to 20 m s⁻¹.",
      D: "Its speed decreases to zero, then increases to a value less than 20 m s⁻¹.",
    },
    correct: "A",
    explanation: "The horizontal velocity component (≈14.1 m s⁻¹) persists throughout, so speed never reaches zero. By energy conservation, it returns to ground at 20 m s⁻¹.",
  },

  // ── Q6 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q06",
    number: 6,
    topic: "Dynamics & Newton's Laws",
    text: "What is a statement of the principle of conservation of momentum for a system?",
    image_required: false,
    options: {
      A: "The total momentum and the total kinetic energy are always conserved.",
      B: "The total momentum is conserved only in elastic collisions.",
      C: "The total momentum is conserved provided that no external forces act.",
      D: "The total momentum of each object in the system is the product of its mass and velocity.",
    },
    correct: "C",
    explanation: "Momentum is conserved when no net external force acts. KE is not always conserved (inelastic collisions). Option D is the definition of momentum, not its conservation.",
  },

  // ── Q7 — P and Q objects at 35° ─────────────────────────────────────────
  {
    id: "9702-12-FM25-Q07",
    number: 7,
    topic: "Dynamics & Newton's Laws",
    text: "Objects P and Q form an isolated system. Object P has mass 6.0 kg and is moving at a speed of 3.0 m s⁻¹. Object Q has mass 2.0 kg and is moving at a speed of 4.2 m s⁻¹ at an angle of 35° to the path of P.\n\nObjects P and Q collide and stick together. What is the magnitude of the component of the final momentum of the combined objects in the original direction of P?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/4ea90a7e43498e5c2ea685fe6a91e5372f2d6e92245c71a8ec7055f0f663ee35.png",
    options: { A: "9.6 kg m s⁻¹", B: "11 kg m s⁻¹", C: "13 kg m s⁻¹", D: "25 kg m s⁻¹" },
    correct: "B",
    explanation: "P's momentum in its direction: 6.0 × 3.0 = 18 kg m s⁻¹. Q's component along P's direction: 2.0 × 4.2 × cos35° ≈ 6.9 kg m s⁻¹. From the diagram Q moves at 35° from the opposite side, so total ≈ 18 − 6.9 ≈ 11 kg m s⁻¹.",
  },

  // ── Q8 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q08",
    number: 8,
    topic: "Dynamics & Newton's Laws",
    text: "An astronaut of mass m in a spacecraft experiences a gravitational force F = mg when stationary on the launchpad. What is the gravitational force on the astronaut when the spacecraft is launched vertically upwards with an acceleration of 0.2g?",
    image_required: false,
    options: { A: "1.2mg", B: "mg", C: "0.8mg", D: "0" },
    correct: "B",
    explanation: "Gravitational force depends only on mass and g, which doesn't change near Earth's surface. The launch acceleration changes apparent weight but gravitational force stays mg.",
  },

  // ── Q9 — seesaw with child X and Y ──────────────────────────────────────
  {
    id: "9702-12-FM25-Q09",
    number: 9,
    topic: "Forces & Equilibrium",
    text: "The diagram shows a child X of mass 20 kg and a child Y of mass 15 kg seated on a uniform plank. The plank has a mass of 7.0 kg and has a pivot at its midpoint. The plank is horizontal and in equilibrium.\n\nWhich statement about the weight of the plank is correct?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/8872c1e6ecb63a2535c6250639db62ab08ed272f842bec4552ca2bd88c11a884.png",
    options: {
      A: "The weight of the plank can be considered to be acting at its midpoint.",
      B: "The weight of the plank is causing an anticlockwise moment.",
      C: "The weight of the plank is causing a clockwise moment.",
      D: "The weight of the plank equals the force on the plank from the pivot.",
    },
    correct: "A",
    explanation: "For a uniform plank the weight acts at the midpoint (centre of mass). Since the pivot is also at the midpoint, the weight causes zero moment.",
  },

  // ── Q10 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q10",
    number: 10,
    topic: "Forces & Equilibrium",
    text: "An object is fully submerged in a liquid. A student determines the ratio (upthrust acting on the object) / (weight of the object). Which single change would double the value of this ratio?",
    image_required: false,
    options: {
      A: "Use a different liquid that has twice the density and the same volume as the original liquid.",
      B: "Use a different object that has half the volume and the same density as the original object.",
      C: "Use a different object that has twice the density and the same volume as the original object.",
      D: "Use a different object that has twice the volume and the same density as the original object.",
    },
    correct: "A",
    explanation: "Ratio = ρ_liquid / ρ_object. Doubling ρ_liquid (same object) doubles the ratio. Option A does exactly this.",
  },

  // ── Q11 — wall frame with 75 N sign ─────────────────────────────────────
  {
    id: "9702-12-FM25-Q11",
    number: 11,
    topic: "Forces & Equilibrium",
    text: "A shop sign weighing 75 N hangs from a frame attached to a vertical wall. The frame consists of a horizontal rod XY and a rod YZ that is at an angle of 30° to the horizontal. Rod XY is attached to the wall by a hinge at X and has length 0.50 m. Assume that the weights of the rods are negligible.\n\nWhat is the horizontal force exerted by the wall on rod XY?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/a87d14cc22d08b2cba03db502f3e08f8e8da583450fe863014ac3f3c66fb56ae.png",
    options: { A: "0 N", B: "43 N", C: "130 N", D: "150 N" },
    correct: "C",
    explanation: "T_YZ sin30° = 75 → T_YZ = 150 N. Horizontal component at hinge = T_YZ cos30° = 150 × 0.866 = 130 N.",
  },

  // ── Q12 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q12",
    number: 12,
    topic: "Physical Quantities & Units",
    text: "A student takes measurements to calculate the density of a liquid in a beaker. The height of the liquid in the beaker is 0.20 m ± 2%. The internal diameter of the beaker is 0.05 m ± 3%. The mass of the liquid is 0.36 kg ± 10%. What is the percentage uncertainty in the calculated density of the liquid?",
    image_required: false,
    options: { A: "2%", B: "5%", C: "15%", D: "18%" },
    correct: "D",
    explanation: "% uncertainty = %unc(mass) + 2×%unc(diameter) + %unc(height) = 10 + 2×3 + 2 = 18%.",
  },

  // ── Q13 — plank XY with child ────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q13",
    number: 13,
    topic: "Forces & Equilibrium",
    text: "The diagram shows a uniform plank XY of length 4.0 m and weight 300 N. The plank rests on fixed supports at its ends X and Y. A child of weight 600 N stands in different positions on the plank. The support at end X exerts a force F vertically upwards on the plank.\n\nWhat is the magnitude of F when the child stands at X and when the child stands at Y?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/4e7335ad18d4cf8e0a4100b4ac8a345d996240098890ab963a14a2de924b8cea.png",
    options: {
      A: "F = 600 N (at X),   F = 0 N (at Y)",
      B: "F = 600 N (at X),   F = 150 N (at Y)",
      C: "F = 750 N (at X),   F = 0 N (at Y)",
      D: "F = 750 N (at X),   F = 150 N (at Y)",
    },
    correct: "D",
    explanation: "Child at X: moments about Y → F×4 = 600×4 + 300×2 = 3000 → F = 750 N. Child at Y: moments about Y → F×4 = 300×2 = 600 → F = 150 N.",
  },

  // ── Q14 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q14",
    number: 14,
    topic: "Work, Energy & Power",
    text: "Which relationship is used in the derivation of the equation: power = force × velocity?",
    image_required: false,
    options: {
      A: "displacement = velocity × time",
      B: "force = mass × acceleration",
      C: "momentum = mass × velocity",
      D: "velocity = acceleration × time",
    },
    correct: "A",
    explanation: "P = Fd/t = F × (d/t) = F × v. The substitution uses displacement = velocity × time.",
  },

  // ── Q15 — slope with block ───────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q15",
    number: 15,
    topic: "Work, Energy & Power",
    text: "A block is released from rest at the top of a slope inclined at an angle θ to the horizontal. The slope has length L. There are no resistive forces acting on the block.\n\nWhat is the speed of the block at the bottom of the slope?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/69626090d7286366973608de4395cfc155697b90474355779bd1f74b6d359c1d.png",
    options: {
      A: "4.43 √(L cosθ)",
      B: "4.43 √(L sinθ)",
      C: "19.6 L cosθ",
      D: "19.6 L sinθ",
    },
    correct: "B",
    explanation: "h = L sinθ. Energy conservation: ½mv² = mgL sinθ → v = √(2gL sinθ) = √(19.6 L sinθ) = 4.43 √(L sinθ).",
  },

  // ── Q16 — skateboarder ──────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q16",
    number: 16,
    topic: "Work, Energy & Power",
    text: "A skateboarder and her skateboard have a total mass of 70 kg. She pushes on the ground with her foot to create a forward force F of 25 N on herself and the skateboard, as shown in the diagram.\n\nThe skateboarder and skateboard travel forwards a distance of 0.50 m before the skateboarder lifts her foot from the ground. What is the work done by F on the skateboarder and skateboard?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/2391334aa5ff2f9b023dad401c166eb67f09e6653fa35e348606ffdf95fb072f.png",
    options: { A: "13 J", B: "50 J", C: "340 J", D: "360 J" },
    correct: "A",
    explanation: "F is applied at an angle to the horizontal. The horizontal component of F does work on the skateboarder. Work = F cosθ × d ≈ 13 J.",
  },

  // ── Q17 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q17",
    number: 17,
    topic: "Work, Energy & Power",
    text: "A turbine at a hydroelectric power station is situated at a vertical distance of 30 m below the level of the surface of a large lake. The water passes through the turbine at a rate of 340 m³ per minute. The overall efficiency of the turbine and generator system is 90%. The density of water is 1000 kg m⁻³.\n\nWhat is the useful power output of the power station?",
    image_required: false,
    options: { A: "0.15 MW", B: "1.5 MW", C: "1.7 MW", D: "90 MW" },
    correct: "B",
    explanation: "Mass flow rate = 1000 × 340/60 = 5667 kg s⁻¹. Input power = ṁgh = 5667 × 10 × 30 = 1.7 MW. Useful = 0.90 × 1.7 = 1.5 MW.",
  },

  // ── Q18 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q18",
    number: 18,
    topic: "Work, Energy & Power",
    text: "A projectile is launched at 45° to the horizontal with initial kinetic energy E. Assuming air resistance to be negligible, what will be the kinetic energy of the projectile when it reaches its highest point?",
    image_required: false,
    options: { A: "0.50E", B: "0.71E", C: "0.87E", D: "E" },
    correct: "A",
    explanation: "At the highest point vertical velocity = 0. Horizontal velocity = v cos45° = v/√2. KE = ½m(v/√2)² = E/2 = 0.50E.",
  },

  // ── Q19 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q19",
    number: 19,
    topic: "Deformation of Solids",
    text: "A wire is extended by a tensile force so that its deformation is elastic. What is meant by elastic deformation?",
    image_required: false,
    options: {
      A: "The extension of the wire is proportional to the tensile force.",
      B: "The extension of the wire is not proportional to the tensile force.",
      C: "When the tensile force is removed, the wire does not return to its original length.",
      D: "When the tensile force is removed, the wire returns to its original length.",
    },
    correct: "D",
    explanation: "Elastic deformation means the material returns to its original shape when the force is removed. Proportionality is Hooke's law — a separate concept.",
  },

  // ── Q20 — bolt with diameter 2d and d ───────────────────────────────────
  {
    id: "9702-12-FM25-Q20",
    number: 20,
    topic: "Deformation of Solids",
    text: "A bolt is subjected to a tensile force, as shown. The bolt has a circular cross-section. At end X, the diameter is 2d. At end Y, the diameter is d.\n\nWhat is the ratio (stress at Y) / (stress at X)?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/e3d0f16f3ba24f769c07f8e0a0498253c1625de4b1359c814f0427eb5fcac949.png",
    options: { A: "0.25", B: "0.50", C: "2.0", D: "4.0" },
    correct: "D",
    explanation: "Stress = F/A. Area ∝ d². Area_X = π(2d/2)² = πd². Area_Y = π(d/2)² = πd²/4. Stress_Y/Stress_X = Area_X/Area_Y = 4.0.",
  },

  // ── Q21 — force vs length graph ──────────────────────────────────────────
  {
    id: "9702-12-FM25-Q21",
    number: 21,
    topic: "Deformation of Solids",
    text: "The graph shows the relationship between force acting on a compression spring and change in length of the spring.\n\nOne of these springs is placed in each corner of a horizontal square plate. The axis of each spring is in a vertical direction. These four springs support a total load of 160 N.\n\nWhat is the total elastic potential energy stored in the four springs?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/3456b28347bb2190186fb015aa0a9fd7001545eb4d5c807c43ee0311991faa25.png",
    options: { A: "0.048 J", B: "0.19 J", C: "0.38 J", D: "0.77 J" },
    correct: "B",
    explanation: "Each spring supports 40 N. EPE per spring = ½Fx = area under graph at 40 N. Total = 4 × EPE ≈ 0.19 J.",
  },

  // ── Q22 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q22",
    number: 22,
    topic: "Waves",
    text: "Which row correctly identifies the properties of all electromagnetic waves?\n\n(✓ = property of an electromagnetic wave, × = not a property)\n\nColumns: transverse wave | longitudinal wave | can travel in free space",
    image_required: false,
    options: {
      A: "transverse ✓,  longitudinal ×,  free space ✓",
      B: "transverse ✓,  longitudinal ×,  free space ×",
      C: "transverse ×,  longitudinal ✓,  free space ✓",
      D: "transverse ×,  longitudinal ✓,  free space ×",
    },
    correct: "A",
    explanation: "All EM waves are transverse and can travel through a vacuum (free space).",
  },

  // ── Q23 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q23",
    number: 23,
    topic: "Waves",
    text: "What is the approximate range of wavelengths in free space for infrared radiation?",
    image_required: false,
    options: { A: "100 nm to 400 nm", B: "300 μm to 30 cm", C: "400 nm to 700 nm", D: "800 nm to 1000 μm" },
    correct: "D",
    explanation: "Infrared: ~700 nm to ~1 mm (1000 μm). Option A is UV, C is visible, B is microwave.",
  },

  // ── Q24 — car between P and Q ────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q24",
    number: 24,
    topic: "Waves",
    text: "The diagram shows a car travelling at a constant speed in a straight line between person P and person Q from point X to point Y. The car sounds its horn continuously as it travels. The horn emits sound of constant frequency.\n\nWhich statements about what person P and person Q hear during the motion of the car are correct?\n\n1. Person P hears a sound of increasing frequency.\n2. Person Q hears a sound of decreasing frequency.\n3. Person Q always hears a sound of higher frequency than person P.",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/7c83e475b1deb0fc56ad130815851ae4cdd7b8c784578aec9dac914473a953da.png",
    options: { A: "1, 2 and 3", B: "1 and 2 only", C: "3 only", D: "none of them" },
    correct: "C",
    explanation: "Car moves at constant speed toward Q and away from P — so each hears a constant (not changing) frequency. But Q always hears a higher frequency than P. Statement 3 only is correct.",
  },

  // ── Q25 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q25",
    number: 25,
    topic: "Waves",
    text: "A progressive wave of frequency 300 Hz is travelling with a speed of 600 m s⁻¹. What is the phase difference between two points on the wave that are a distance of 0.50 m apart?",
    image_required: false,
    options: { A: "45°", B: "90°", C: "180°", D: "360°" },
    correct: "B",
    explanation: "λ = v/f = 2.0 m. Path difference = 0.50 m = λ/4. Phase difference = (0.50/2.0) × 360° = 90°.",
  },

  // ── Q26 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q26",
    number: 26,
    topic: "Waves",
    text: "A polarised beam of light with intensity I is incident normally on a polarising filter. The transmitted light has intensity I. The filter is rotated about the normal axis through an angle θ. The transmitted light has intensity 0.75I. What is the angle θ?",
    image_required: false,
    options: { A: "30°", B: "42°", C: "49°", D: "60°" },
    correct: "A",
    explanation: "Malus's law: 0.75I = I cos²θ → cosθ = √0.75 = 0.866 → θ = 30°.",
  },

  // ── Q27 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q27",
    number: 27,
    topic: "Waves",
    text: "Light waves are emitted from two sources. What is a necessary condition for observable interference fringes to be produced?",
    image_required: false,
    options: {
      A: "The waves must be polarised.",
      B: "The waves must not be polarised.",
      C: "The waves must be coherent.",
      D: "The waves must have equal amplitudes.",
    },
    correct: "C",
    explanation: "Coherence (constant phase difference and same frequency) is the necessary condition for stable interference fringes.",
  },

  // ── Q28 — wave through barrier gap ──────────────────────────────────────
  {
    id: "9702-12-FM25-Q28",
    number: 28,
    topic: "Waves",
    text: "The diagram shows a water wave in a shallow tank. The wave is diffracted through a gap in a barrier and spreads. The wavelength of the wave is much smaller than the width of the gap.\n\nThe wavelength of the wave and the width of the gap are both changed by a small amount. Which combination of changes must increase the amount of spreading due to diffraction?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/50c15bd664bc93f716348b3132968b22614e1e0a836b362a9a5b2897b70d315e.png",
    options: {
      A: "wavelength decreases, width of gap decreases",
      B: "wavelength decreases, width of gap increases",
      C: "wavelength increases, width of gap decreases",
      D: "wavelength increases, width of gap increases",
    },
    correct: "C",
    explanation: "Spreading ∝ λ / gap width. To increase spreading, increase λ AND decrease gap width — option C.",
  },

  // ── Q29 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q29",
    number: 29,
    topic: "Waves",
    text: "Light of wavelength 567 nm is incident normally on a diffraction grating. The grating has 400 lines per mm. A number of diffraction maxima are observed on the far side of the grating. What is the angle between the second-order maximum and the third-order maximum?",
    image_required: false,
    options: { A: "13.1°", B: "13.9°", C: "15.9°", D: "27.0°" },
    correct: "C",
    explanation: "d = 2.5×10⁻⁶ m. θ₂ = 26.97°, θ₃ = 42.87°. Difference = 15.9°.",
  },

  // ── Q30 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q30",
    number: 30,
    topic: "Electricity",
    text: "Two cylindrical conductors, X and Y, are made from the same material. The conductors have equal lengths, but Y has a smaller diameter than X. X and Y are connected in series to a cell.\n\nWhich row compares the number of charge carriers per unit time passing through X and through Y and compares the average drift speed of the charge carriers in X and in Y?",
    image_required: false,
    options: {
      A: "carriers per unit time: Y greater than X | drift speed: Y greater than X",
      B: "carriers per unit time: Y same as X | drift speed: Y same as X",
      C: "carriers per unit time: Y greater than X | drift speed: Y same as X",
      D: "carriers per unit time: Y same as X | drift speed: Y greater than X",
    },
    correct: "D",
    explanation: "Series → same current → same carriers per unit time. Smaller area in Y → greater drift speed (I = nAvq, same n, q).",
  },

  // ── Q31 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q31",
    number: 31,
    topic: "Electricity",
    text: "A copper wire is 6.4 m long and has a resistance of 0.92 Ω. The resistivity of copper is 1.8 × 10⁻⁸ Ω m. What is the diameter of the wire?",
    image_required: false,
    options: { A: "5.7 × 10⁻⁵ m", B: "1.0 × 10⁻⁴ m", C: "4.0 × 10⁻⁴ m", D: "7.1 × 10⁻⁴ m" },
    correct: "C",
    explanation: "A = ρL/R = 1.252×10⁻⁷ m². d = 2√(A/π) ≈ 4.0×10⁻⁴ m.",
  },

  // ── Q32 — thermistor circuit + graphs ───────────────────────────────────
  {
    id: "9702-12-FM25-Q32",
    number: 32,
    topic: "Electricity",
    text: "A thermistor is connected to a cell with negligible internal resistance.\n\nWhich graph shows the variation with temperature of power, P, dissipated in the thermistor?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/9139dfcfa25796baaaf57115aaf03d7daaa9acebf27a67fef1cb719dccb4cb86.png",
    options: {
      A: "P increases as temperature increases",
      B: "P decreases as temperature increases",
      C: "P is constant as temperature increases",
      D: "P first increases then decreases",
    },
    correct: "A",
    explanation: "NTC thermistor: R decreases as T increases. P = V²/R with constant V → P increases as T increases.",
  },

  // ── Q33 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q33",
    number: 33,
    topic: "Electricity",
    text: "A metal electrical conductor has a resistance of 5.6 kΩ. A potential difference of 9.0 V is applied across its ends. How many electrons pass a point in the conductor in one minute?",
    image_required: false,
    options: { A: "6.0 × 10²⁰", B: "1.0 × 10¹⁹", C: "6.0 × 10¹⁷", D: "1.0 × 10¹⁶" },
    correct: "C",
    explanation: "I = 9.0/5600 = 1.607×10⁻³ A. Q = I×t = 0.0964 C. N = Q/e = 0.0964/1.6×10⁻¹⁹ ≈ 6.0×10¹⁷.",
  },

  // ── Q34 — circuit symbols ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q34",
    number: 34,
    topic: "Electricity",
    text: "Which circuit symbol does not represent an electric component that is designed to emit sound waves?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/41127d47bdb6eb5dc7853821886d68feadae196121cccea75410814ace81946f.png",
    options: {
      A: "Symbol A",
      B: "Symbol B",
      C: "Symbol C",
      D: "Symbol D",
    },
    correct: "B",
    explanation: "Symbol B is a microphone — it converts sound to electrical signal (it receives sound, not emits it). The others are speaker/earphone symbols that emit sound.",
  },

  // ── Q35 — junction P, Q, R ──────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q35",
    number: 35,
    topic: "Electricity",
    text: "The diagram shows a junction in a circuit where three wires, P, Q and R, meet. The currents in P and Q are 1 A and 3 A respectively, in the directions shown.\n\nHow much charge passes a given point in wire R in a time of 5 s?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/429893430f784d8e057f4a78dae81346d29b26c5be1d342f4d814c76a0e075d5.png",
    options: { A: "0.4 C", B: "2 C", C: "10 C", D: "20 C" },
    correct: "C",
    explanation: "From the diagram, 3 A flows in along Q and 1 A flows out along P. By Kirchhoff's first law, current in R = 3 − 1 = 2 A. Charge = 2 × 5 = 10 C.",
  },

  // ── Q36 — cell circuit with switch ──────────────────────────────────────
  {
    id: "9702-12-FM25-Q36",
    number: 36,
    topic: "Electricity",
    text: "A cell of electromotive force E and internal resistance r is connected in series with a switch S and an external resistor of resistance R. The potential difference between P and Q is V.\n\nWhich statement is correct when S is changed from open to closed?",
    image_required: false,
    image_url: "dyad-media://media/Cambridge_Hub/.dyad/media/f2e2a91bef805b4427ef3c741a56497e912f2ba587fd19d4c7db59f345f8fc86.png",
    options: {
      A: "V increases because there is a p.d. across R.",
      B: "V decreases because there is a p.d. across r.",
      C: "V remains the same because the decrease of p.d. across r is balanced by the increase of p.d. across R.",
      D: "V remains the same because the sum of the p.d.s across r and R is still equal to E.",
    },
    correct: "B",
    explanation: "S open: no current, V = E. S closed: current flows, voltage drop across r → V = E − Ir < E. V decreases.",
  },

  // ── Q37 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q37",
    number: 37,
    topic: "Nuclear Physics",
    text: "What is a general description of a baryon?",
    image_required: false,
    options: {
      A: "It consists of three quarks that must all be the same flavour.",
      B: "It consists of three quarks that do not need to be the same flavour.",
      C: "It consists of two quarks that must both be the same flavour.",
      D: "It consists of two quarks that do not need to be the same flavour.",
    },
    correct: "B",
    explanation: "A baryon is made of three quarks — they do not need to be the same flavour (e.g. proton = uud).",
  },

  // ── Q38 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q38",
    number: 38,
    topic: "Nuclear Physics",
    text: "A stationary nucleus has nucleon number A. The nucleus decays by emitting a proton with speed ν to form a new nucleus with speed u. The new nucleus and the proton move away from one another in opposite directions.\n\nWhich equation gives ν in terms of A and u?",
    image_required: false,
    options: { A: "ν = (A/4 – 1)u", B: "ν = (A – 1)u", C: "ν = Au", D: "ν = (A + 1)u" },
    correct: "B",
    explanation: "Conservation of momentum: 1×ν = (A−1)×u → ν = (A−1)u.",
  },

  // ── Q39 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q39",
    number: 39,
    topic: "Nuclear Physics",
    text: "What is the change to the quark composition of a nucleus that takes place during β⁺ decay?",
    image_required: false,
    options: { A: "down to antiup", B: "down to up", C: "up to antidown", D: "up to down" },
    correct: "D",
    explanation: "In β⁺ decay, a proton (uud) → neutron (udd). One up quark changes to a down quark.",
  },

  // ── Q40 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q40",
    number: 40,
    topic: "Nuclear Physics",
    text: "What is the charge, in terms of the elementary charge e, on a charm quark?",
    image_required: false,
    options: { A: "–(2/3)e", B: "–(1/3)e", C: "+(1/3)e", D: "+(2/3)e" },
    correct: "D",
    explanation: "Charm is an up-type quark with charge +(2/3)e.",
  },
];

// Progress tracking
const PROGRESS_KEY = "physics_p1_9702_12_FM25_progress";

export function getP1Progress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}"); } catch { return {}; }
}

export function saveP1Progress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export function resetP1Progress() {
  localStorage.removeItem(PROGRESS_KEY);
}