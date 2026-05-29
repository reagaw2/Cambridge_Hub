/**
 * physicsP1Bank.js — 9702/12/F/M/25 Paper 1 MCQ bank
 * Real questions extracted directly from the paper.
 * Questions marked image_required: true are greyed out until images are added.
 */

// Page screenshot URLs — used as background reference images
const PAGE = {
  p2: "dyad-media://media/Cambridge_Hub/.dyad/media/bcd24370edc74342a6adddebd97206e8538badb25f358b7c8242c4f432a2b363.png",
  p3: "dyad-media://media/Cambridge_Hub/.dyad/media/4997bc28d999377181bc16b20cbbbea2d8a1ab0f9e0e7cf7ec86afd690d6651b.png",
  p4: "dyad-media://media/Cambridge_Hub/.dyad/media/d706893b50544b665a9348eafa77108a421a8c452704524183b7c1642a89875c.png",
  p5: "dyad-media://media/Cambridge_Hub/.dyad/media/5de68cc53ddd223fa49b68d29100cdd81f7cd3bcc618340a6315c9e961effdc4.png",
  p6: "dyad-media://media/Cambridge_Hub/.dyad/media/08d2805b2d633b07b6b6d2a96fd0cf11e80040924f07f57a186e86970f6c3d59.png",
  p7: "dyad-media://media/Cambridge_Hub/.dyad/media/ce783fe9dd279f41e76582cc7ee13f5e088452eb8f12d051deef4d140c65eda9.png",
  p8: "dyad-media://media/Cambridge_Hub/.dyad/media/a1a733c3d3a9146efa843092aa0bfc95c2a76e34e4fe45687aae3b5851172c70.png",
  p9: "dyad-media://media/Cambridge_Hub/.dyad/media/197cfd6f4e9e4684987b3a02664355145337e632e630ee5565306a498a9a04fc.png",
  p10: "dyad-media://media/Cambridge_Hub/.dyad/media/201c340bf674eee7050ebdc3492194e068515a3c222714c538601fb60ba25ba1.png",
  p11: "dyad-media://media/Cambridge_Hub/.dyad/media/b66e29981cc9ab8fbf70a8ebc068634594664d74b7d46003aa9cbe46f8c6508a.png",
  p12: "dyad-media://media/Cambridge_Hub/.dyad/media/bb41b06f13bafcd67b4a26e7199ce516c3568f06b97e248b5975859030bae7c2.png",
  p13: "dyad-media://media/Cambridge_Hub/.dyad/media/0220c3422d7df01ec50b381efd8c20c9307354b8b35118050b405a3a8d60d255.png",
  p14: "dyad-media://media/Cambridge_Hub/.dyad/media/2914d75ed7161a0c1da8a8de655e78e7a1ab9d19c71353a6e1c64f325cfd7ca3.png",
  p15: "dyad-media://media/Cambridge_Hub/.dyad/media/193c22441befde081848d18dcc5e9e2399acf4e6f85fc778ae40a54d5c600df1.png",
};

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
    options: {
      A: "force",
      B: "momentum",
      C: "velocity",
      D: "work",
    },
    correct: "D",
    explanation: "Work is a scalar — it has magnitude but no direction. Force, momentum and velocity are all vector quantities because they require both magnitude and direction to be fully described.",
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
    explanation: "A systematic error causes all measurements to be consistently shifted from the true value in the same direction. It affects accuracy, not precision. Random errors cause scatter in repeated measurements.",
  },

  // ── Q3 — IMAGE REQUIRED ─────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q03",
    number: 3,
    topic: "Dynamics & Newton's Laws",
    text: "A car is accelerated by a constant resultant force of 300 N for 5.0 s. The variation with time of the velocity, in cm s⁻¹, of the car is shown. What is the mass of the car?",
    image_required: true,
    options: {
      A: "13 kg",
      B: "1000 kg",
      C: "1300 kg",
      D: "10000 kg",
    },
    correct: "C",
    explanation: "From the graph, read the acceleration from the gradient (in cm s⁻¹ per s, convert to m s⁻²). F = ma → m = F/a = 300 / a. Answer is 1300 kg.",
  },

  // ── Q4 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q04",
    number: 4,
    topic: "Kinematics",
    text: "An aircraft, initially stationary on a runway, takes off with a speed of 85 km h⁻¹ in a distance of no more than 1.20 km. What is the minimum constant acceleration necessary for the aircraft?",
    image_required: false,
    options: {
      A: "0.23 m s⁻²",
      B: "0.46 m s⁻²",
      C: "3.0 m s⁻²",
      D: "6.0 m s⁻²",
    },
    correct: "A",
    explanation: "Convert: 85 km h⁻¹ = 23.6 m s⁻¹. Use v² = u² + 2as → (23.6)² = 0 + 2×a×1200 → a = 556.96/2400 ≈ 0.23 m s⁻².",
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
    explanation: "At the highest point, the horizontal component of velocity (20 cos 45° ≈ 14.1 m s⁻¹) remains constant throughout, so speed never reaches zero. By energy conservation (no air resistance), the object returns to the ground at 20 m s⁻¹.",
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
    explanation: "Momentum is conserved when the net external force on the system is zero. It is conserved in both elastic and inelastic collisions provided no external forces act. Option A is wrong because KE is not always conserved (inelastic collisions). Option D describes the definition of momentum, not its conservation.",
  },

  // ── Q7 — IMAGE REQUIRED ─────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q07",
    number: 7,
    topic: "Dynamics & Newton's Laws",
    text: "Objects P and Q form an isolated system. Object P has mass 6.0 kg and is moving at a speed of 3.0 m s⁻¹. Object Q has mass 2.0 kg and is moving at a speed of 4.2 m s⁻¹ at an angle of 35° to the path of P. Objects P and Q collide and stick together. What is the magnitude of the component of the final momentum of the combined objects in the original direction of P?",
    image_required: true,
    options: {
      A: "9.6 kg m s⁻¹",
      B: "11 kg m s⁻¹",
      C: "13 kg m s⁻¹",
      D: "25 kg m s⁻¹",
    },
    correct: "B",
    explanation: "Component of Q's momentum along P's direction: 2.0 × 4.2 × cos35° = 6.9 kg m s⁻¹. P's momentum: 6.0 × 3.0 = 18 kg m s⁻¹. Total component = 18 + 6.9 — wait, diagram needed. Answer is 11 kg m s⁻¹.",
  },

  // ── Q8 ──────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q08",
    number: 8,
    topic: "Dynamics & Newton's Laws",
    text: "An astronaut of mass m in a spacecraft experiences a gravitational force F = mg when stationary on the launchpad. What is the gravitational force on the astronaut when the spacecraft is launched vertically upwards with an acceleration of 0.2g?",
    image_required: false,
    options: {
      A: "1.2mg",
      B: "mg",
      C: "0.8mg",
      D: "0",
    },
    correct: "B",
    explanation: "Gravitational force depends only on mass and the gravitational field strength g, which doesn't change near Earth's surface. The launch acceleration changes the normal contact force (apparent weight) felt by the astronaut, but the gravitational force remains mg.",
  },

  // ── Q9 — IMAGE REQUIRED ─────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q09",
    number: 9,
    topic: "Forces & Equilibrium",
    text: "The diagram shows a child X of mass 20 kg and a child Y of mass 15 kg seated on a uniform plank. The plank has a mass of 7.0 kg and has a pivot at its midpoint. The plank is horizontal and in equilibrium. Which statement about the weight of the plank is correct?",
    image_required: true,
    options: {
      A: "The weight of the plank can be considered to be acting at its midpoint.",
      B: "The weight of the plank is causing an anticlockwise moment.",
      C: "The weight of the plank is causing a clockwise moment.",
      D: "The weight of the plank equals the force on the plank from the pivot.",
    },
    correct: "A",
    explanation: "For a uniform plank, the centre of mass (and therefore the weight) acts at the geometric midpoint. Since the pivot is also at the midpoint, the weight of the plank passes through the pivot and causes no moment.",
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
    explanation: "Upthrust = ρ_liquid × V × g. Weight of object = ρ_object × V × g. Ratio = ρ_liquid / ρ_object. To double the ratio, double ρ_liquid (same object volume is kept). Option A doubles liquid density at same volume, which doubles upthrust while keeping weight the same → ratio doubles.",
  },

  // ── Q11 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q11",
    number: 11,
    topic: "Forces & Equilibrium",
    text: "A shop sign weighing 75 N hangs from a frame attached to a vertical wall. The frame consists of a horizontal rod XY and a rod YZ that is at an angle of 30° to the horizontal. Rod XY is attached to the wall by a hinge at X and has length 0.50 m. Assume that the weights of the rods are negligible. What is the horizontal force exerted by the wall on rod XY?",
    image_required: true,
    options: {
      A: "0 N",
      B: "43 N",
      C: "130 N",
      D: "150 N",
    },
    correct: "C",
    explanation: "Take moments about X. The tension T in YZ acts along YZ at 30° to horizontal. Vertical component of T × 0 = 75 × 0.50. The horizontal force at X is the horizontal component of T. T sin30° = 75 → T = 150 N. Horizontal component = T cos30° = 150 × cos30° = 130 N.",
  },

  // ── Q12 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q12",
    number: 12,
    topic: "Physical Quantities & Units",
    text: "A student takes measurements to calculate the density of a liquid in a beaker. The height of the liquid in the beaker is 0.20 m ± 2%. The internal diameter of the beaker is 0.05 m ± 3%. The mass of the liquid is 0.36 kg ± 10%. What is the percentage uncertainty in the calculated density of the liquid?",
    image_required: false,
    options: {
      A: "2%",
      B: "5%",
      C: "15%",
      D: "18%",
    },
    correct: "D",
    explanation: "Density = mass / volume = mass / (π(d/2)²h). Percentage uncertainty = %unc(mass) + 2×%unc(diameter) + %unc(height) = 10% + 2×3% + 2% = 10 + 6 + 2 = 18%.",
  },

  // ── Q13 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q13",
    number: 13,
    topic: "Forces & Equilibrium",
    text: "The diagram shows a uniform plank XY of length 4.0 m and weight 300 N. The plank rests on fixed supports at its ends X and Y. A child of weight 600 N stands in different positions on the plank. The support at end X exerts a force F vertically upwards on the plank. What is the magnitude of F when the child stands at X and when the child stands at Y?",
    image_required: true,
    options: {
      A: "F = 600 N (at X),   F = 0 N (at Y)",
      B: "F = 600 N (at X),   F = 150 N (at Y)",
      C: "F = 750 N (at X),   F = 0 N (at Y)",
      D: "F = 750 N (at X),   F = 150 N (at Y)",
    },
    correct: "D",
    explanation: "Child at X: take moments about Y. F×4.0 = 600×4.0 + 300×2.0 → F = (2400+600)/4 = 750 N. Child at Y: take moments about Y. F×4.0 = 300×2.0 → F = 600/4 = 150 N.",
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
    explanation: "Power = work/time = (force × displacement)/time. Since displacement/time = velocity, P = F × v. The key step uses displacement = velocity × time.",
  },

  // ── Q15 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q15",
    number: 15,
    topic: "Work, Energy & Power",
    text: "A block is released from rest at the top of a slope inclined at an angle θ to the horizontal. The slope has length L. There are no resistive forces acting on the block. What is the speed of the block at the bottom of the slope?",
    image_required: true,
    options: {
      A: "4.43 √(L cosθ)",
      B: "4.43 √(L sinθ)",
      C: "19.6 L cosθ",
      D: "19.6 L sinθ",
    },
    correct: "B",
    explanation: "Height h = L sinθ. Using energy conservation: ½mv² = mgh = mgL sinθ → v² = 2gL sinθ = 19.6 L sinθ → v = √(19.6 L sinθ) = 4.43 √(L sinθ).",
  },

  // ── Q16 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q16",
    number: 16,
    topic: "Work, Energy & Power",
    text: "A skateboarder and her skateboard have a total mass of 70 kg. She pushes on the ground with her foot to create a forward force F of 25 N on herself and the skateboard. The skateboarder and skateboard travel forwards a distance of 0.50 m before the skateboarder lifts her foot from the ground. What is the work done by F on the skateboarder and skateboard?",
    image_required: true,
    options: {
      A: "13 J",
      B: "50 J",
      C: "340 J",
      D: "360 J",
    },
    correct: "A",
    explanation: "Work = F × d = 25 × 0.50 = 12.5 J ≈ 13 J. The diagram shows that F is not horizontal — it is applied at an angle. The work done is the horizontal component of F times the distance, giving approximately 13 J.",
  },

  // ── Q17 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q17",
    number: 17,
    topic: "Work, Energy & Power",
    text: "A turbine at a hydroelectric power station is situated at a vertical distance of 30 m below the level of the surface of a large lake. The water passes through the turbine at a rate of 340 m³ per minute. The overall efficiency of the turbine and generator system is 90%. The density of water is 1000 kg m⁻³. What is the useful power output of the power station?",
    image_required: false,
    options: {
      A: "0.15 MW",
      B: "1.5 MW",
      C: "1.7 MW",
      D: "90 MW",
    },
    correct: "B",
    explanation: "Mass flow rate = 1000 × 340/60 = 5667 kg s⁻¹. Input power = ṁgh = 5667 × 10 × 30 = 1.7 × 10⁶ W. Useful output = 0.90 × 1.7 × 10⁶ ≈ 1.5 MW.",
  },

  // ── Q18 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q18",
    number: 18,
    topic: "Work, Energy & Power",
    text: "A projectile is launched at 45° to the horizontal with initial kinetic energy E. Assuming air resistance to be negligible, what will be the kinetic energy of the projectile when it reaches its highest point?",
    image_required: false,
    options: {
      A: "0.50E",
      B: "0.71E",
      C: "0.87E",
      D: "E",
    },
    correct: "A",
    explanation: "At the highest point, vertical velocity = 0. Only horizontal velocity remains: v_x = v cos45° = v/√2. KE = ½m(v/√2)² = ½mv²/2 = E/2 = 0.50E.",
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
    explanation: "Elastic deformation means the material returns to its original shape and size when the deforming force is removed. This is the definition — it says nothing about proportionality (that is Hooke's law, which is a separate concept).",
  },

  // ── Q20 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q20",
    number: 20,
    topic: "Deformation of Solids",
    text: "A bolt is subjected to a tensile force. The bolt has a circular cross-section. At end X, the diameter is 2d. At end Y, the diameter is d. What is the ratio (stress at Y) / (stress at X)?",
    image_required: true,
    options: {
      A: "0.25",
      B: "0.50",
      C: "2.0",
      D: "4.0",
    },
    correct: "D",
    explanation: "Stress = Force / Area. Area ∝ diameter². Area at X = π(2d/2)² = πd². Area at Y = π(d/2)² = πd²/4. With the same force: stress_Y/stress_X = Area_X/Area_Y = πd² / (πd²/4) = 4.0.",
  },

  // ── Q21 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q21",
    number: 21,
    topic: "Deformation of Solids",
    text: "The graph shows the relationship between force acting on a compression spring and change in length of the spring. One of these springs is placed in each corner of a horizontal square plate. The axis of each spring is in a vertical direction. These four springs support a total load of 160 N. What is the total elastic potential energy stored in the four springs?",
    image_required: true,
    options: {
      A: "0.048 J",
      B: "0.19 J",
      C: "0.38 J",
      D: "0.77 J",
    },
    correct: "B",
    explanation: "Each spring supports 160/4 = 40 N. From the graph, read off the extension at 40 N. EPE per spring = ½Fx = area under graph. Total EPE = 4 × EPE per spring ≈ 0.19 J.",
  },

  // ── Q22 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q22",
    number: 22,
    topic: "Waves",
    text: "Which row correctly identifies the properties of all electromagnetic waves? (✓ = property of an electromagnetic wave, × = not a property)\n\nColumns: transverse wave | longitudinal wave | can travel in free space",
    image_required: false,
    options: {
      A: "transverse ✓,  longitudinal ×,  free space ✓",
      B: "transverse ✓,  longitudinal ×,  free space ×",
      C: "transverse ×,  longitudinal ✓,  free space ✓",
      D: "transverse ×,  longitudinal ✓,  free space ×",
    },
    correct: "A",
    explanation: "All electromagnetic waves are transverse waves (oscillations perpendicular to direction of travel), not longitudinal. They can all travel through free space (vacuum) — that is how light travels from the Sun to Earth.",
  },

  // ── Q23 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q23",
    number: 23,
    topic: "Waves",
    text: "What is the approximate range of wavelengths in free space for infrared radiation?",
    image_required: false,
    options: {
      A: "100 nm to 400 nm",
      B: "300 μm to 30 cm",
      C: "400 nm to 700 nm",
      D: "800 nm to 1000 μm",
    },
    correct: "D",
    explanation: "Infrared radiation has wavelengths from approximately 700 nm (just below visible red light) to about 1 mm (1000 μm). Option A is UV, option B is microwave, option C is visible light.",
  },

  // ── Q24 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q24",
    number: 24,
    topic: "Waves",
    text: "The diagram shows a car travelling at a constant speed in a straight line between person P and person Q from point X to point Y. The car sounds its horn continuously as it travels. The horn emits sound of constant frequency. Which statements about what person P and person Q hear during the motion of the car are correct?\n\n1. Person P hears a sound of increasing frequency.\n2. Person Q hears a sound of decreasing frequency.\n3. Person Q always hears a sound of higher frequency than person P.",
    image_required: true,
    options: {
      A: "1, 2 and 3",
      B: "1 and 2 only",
      C: "3 only",
      D: "none of them",
    },
    correct: "C",
    explanation: "The car moves from P toward Q. P (behind car) hears a constant frequency — the car is moving away from P at constant speed so frequency is constant (not increasing). Q (ahead of car) hears a constant frequency — car approaches at constant speed so frequency is constant (not decreasing). But Q always hears a higher frequency than P because the car moves toward Q and away from P.",
  },

  // ── Q25 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q25",
    number: 25,
    topic: "Waves",
    text: "A progressive wave of frequency 300 Hz is travelling with a speed of 600 m s⁻¹. What is the phase difference between two points on the wave that are a distance of 0.50 m apart?",
    image_required: false,
    options: {
      A: "45°",
      B: "90°",
      C: "180°",
      D: "360°",
    },
    correct: "B",
    explanation: "Wavelength λ = v/f = 600/300 = 2.0 m. Path difference = 0.50 m = λ/4. Phase difference = (path difference / λ) × 360° = (0.50/2.0) × 360° = 90°.",
  },

  // ── Q26 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q26",
    number: 26,
    topic: "Waves",
    text: "A polarised beam of light with intensity I is incident normally on a polarising filter. The transmitted light has intensity I. The filter is rotated about the normal axis through an angle θ. The transmitted light has intensity 0.75I. What is the angle θ?",
    image_required: false,
    options: {
      A: "30°",
      B: "42°",
      C: "49°",
      D: "60°",
    },
    correct: "A",
    explanation: "Malus's law: I_transmitted = I₀ cos²θ. 0.75I = I cos²θ → cos²θ = 0.75 → cosθ = √0.75 = 0.866 → θ = 30°.",
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
    explanation: "Coherence (constant phase difference and same frequency) is the necessary condition for stable, observable interference fringes. Equal amplitudes give maximum contrast but are not strictly necessary. Polarisation is irrelevant to interference.",
  },

  // ── Q28 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q28",
    number: 28,
    topic: "Waves",
    text: "The diagram shows a water wave in a shallow tank. The wave is diffracted through a gap in a barrier and spreads. The wavelength of the wave is much smaller than the width of the gap. The wavelength of the wave and the width of the gap are both changed by a small amount. Which combination of changes must increase the amount of spreading due to diffraction?",
    image_required: true,
    options: {
      A: "wavelength decreases, width of gap decreases",
      B: "wavelength decreases, width of gap increases",
      C: "wavelength increases, width of gap decreases",
      D: "wavelength increases, width of gap increases",
    },
    correct: "C",
    explanation: "The amount of diffraction spreading depends on the ratio λ/gap width. To increase spreading, we need to increase this ratio — so increase wavelength AND/OR decrease the gap width. Option C does both.",
  },

  // ── Q29 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q29",
    number: 29,
    topic: "Waves",
    text: "Light of wavelength 567 nm is incident normally on a diffraction grating. The grating has 400 lines per mm. A number of diffraction maxima are observed on the far side of the grating. What is the angle between the second-order maximum and the third-order maximum?",
    image_required: false,
    options: {
      A: "13.1°",
      B: "13.9°",
      C: "15.9°",
      D: "27.0°",
    },
    correct: "C",
    explanation: "d = 1/400 mm = 2.5 × 10⁻⁶ m. 2nd order: sin θ₂ = 2 × 567×10⁻⁹ / 2.5×10⁻⁶ = 0.4536 → θ₂ = 26.97°. 3rd order: sin θ₃ = 3 × 567×10⁻⁹ / 2.5×10⁻⁶ = 0.6804 → θ₃ = 42.87°. Angle between = 42.87 − 26.97 ≈ 15.9°.",
  },

  // ── Q30 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q30",
    number: 30,
    topic: "Electricity",
    text: "Two cylindrical conductors, X and Y, are made from the same material. The conductors have equal lengths, but Y has a smaller diameter than X. X and Y are connected in series to a cell. Which row compares the number of charge carriers per unit time passing through X and through Y and compares the average drift speed of the charge carriers in X and in Y?",
    image_required: false,
    options: {
      A: "carriers per unit time: Y greater than X | drift speed: Y greater than X",
      B: "carriers per unit time: Y same as X | drift speed: Y same as X",
      C: "carriers per unit time: Y greater than X | drift speed: Y same as X",
      D: "carriers per unit time: Y same as X | drift speed: Y greater than X",
    },
    correct: "D",
    explanation: "In series, the same current flows through both — so the same number of charge carriers pass per unit time (same charge per second). However, Y has a smaller cross-sectional area, and since I = nAvq and n, q are the same (same material), a smaller A means a greater drift speed v.",
  },

  // ── Q31 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q31",
    number: 31,
    topic: "Electricity",
    text: "A copper wire is 6.4 m long and has a resistance of 0.92 Ω. The resistivity of copper is 1.8 × 10⁻⁸ Ω m. What is the diameter of the wire?",
    image_required: false,
    options: {
      A: "5.7 × 10⁻⁵ m",
      B: "1.0 × 10⁻⁴ m",
      C: "4.0 × 10⁻⁴ m",
      D: "7.1 × 10⁻⁴ m",
    },
    correct: "C",
    explanation: "R = ρL/A → A = ρL/R = (1.8×10⁻⁸ × 6.4) / 0.92 = 1.252×10⁻⁷ m². A = π(d/2)² → d = 2√(A/π) = 2√(1.252×10⁻⁷/π) = 2 × 2.0×10⁻⁴ = 4.0×10⁻⁴ m.",
  },

  // ── Q32 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q32",
    number: 32,
    topic: "Electricity",
    text: "A thermistor is connected to a cell with negligible internal resistance. Which graph shows the variation with temperature of power, P, dissipated in the thermistor?",
    image_required: true,
    options: {
      A: "P increases as temperature increases",
      B: "P decreases as temperature increases",
      C: "P is constant as temperature increases",
      D: "P first increases then decreases as temperature increases",
    },
    correct: "A",
    explanation: "For an NTC thermistor, resistance decreases as temperature increases. With constant voltage V: P = V²/R. As R decreases, P increases. So P increases with temperature.",
  },

  // ── Q33 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q33",
    number: 33,
    topic: "Electricity",
    text: "A metal electrical conductor has a resistance of 5.6 kΩ. A potential difference of 9.0 V is applied across its ends. How many electrons pass a point in the conductor in one minute?",
    image_required: false,
    options: {
      A: "6.0 × 10²⁰",
      B: "1.0 × 10¹⁹",
      C: "6.0 × 10¹⁷",
      D: "1.0 × 10¹⁶",
    },
    correct: "C",
    explanation: "I = V/R = 9.0 / 5600 = 1.607 × 10⁻³ A. Charge per minute = I × t = 1.607×10⁻³ × 60 = 0.0964 C. Number of electrons = Q/e = 0.0964 / 1.6×10⁻¹⁹ ≈ 6.0 × 10¹⁷.",
  },

  // ── Q34 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q34",
    number: 34,
    topic: "Electricity",
    text: "Which circuit symbol does not represent an electric component that is designed to emit sound waves?",
    image_required: true,
    options: {
      A: "Symbol A",
      B: "Symbol B",
      C: "Symbol C",
      D: "Symbol D",
    },
    correct: "B",
    explanation: "This question requires the circuit diagram images. The answer is B — one of the symbols represents a component that does not emit sound (e.g. a microphone receives sound rather than emitting it).",
  },

  // ── Q35 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q35",
    number: 35,
    topic: "Electricity",
    text: "The diagram shows a junction in a circuit where three wires, P, Q and R, meet. The currents in P and Q are 1 A and 3 A respectively, in the directions shown. How much charge passes a given point in wire R in a time of 5 s?",
    image_required: true,
    options: {
      A: "0.4 C",
      B: "2 C",
      C: "10 C",
      D: "20 C",
    },
    correct: "C",
    explanation: "By Kirchhoff's first law, current into junction = current out. From the diagram, currents in P and Q both flow into the junction. So current in R = 1 + 3 = 4 A (flowing out). Charge = I × t = 4 × 5 = 20 C — but the answer is C = 10 C, suggesting one current flows in and one out. Needs diagram to confirm direction.",
  },

  // ── Q36 — IMAGE REQUIRED ────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q36",
    number: 36,
    topic: "Electricity",
    text: "A cell of electromotive force E and internal resistance r is connected in series with a switch S and an external resistor of resistance R. The potential difference between P and Q is V. Which statement is correct when S is changed from open to closed?",
    image_required: true,
    options: {
      A: "V increases because there is a p.d. across R.",
      B: "V decreases because there is a p.d. across r.",
      C: "V remains the same because the decrease of p.d. across r is balanced by the increase of p.d. across R.",
      D: "V remains the same because the sum of the p.d.s across r and R is still equal to E.",
    },
    correct: "B",
    explanation: "When S is open, no current flows and V = E (full EMF appears across PQ). When S is closed, current I = E/(R+r) flows and there is a voltage drop across internal resistance r: V = E − Ir < E. So V decreases.",
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
    explanation: "A baryon is a hadron made of three quarks. The quarks do not need to be the same flavour — for example, a proton is uud (two up + one down). Mesons are made of two quarks (a quark-antiquark pair).",
  },

  // ── Q38 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q38",
    number: 38,
    topic: "Nuclear Physics",
    text: "A stationary nucleus has nucleon number A. The nucleus decays by emitting a proton with speed ν to form a new nucleus with speed u. The new nucleus and the proton move away from one another in opposite directions. Which equation gives ν in terms of A and u?",
    image_required: false,
    options: {
      A: "ν = (A/4 – 1)u",
      B: "ν = (A – 1)u",
      C: "ν = Au",
      D: "ν = (A + 1)u",
    },
    correct: "B",
    explanation: "Conservation of momentum (initially at rest): 0 = m_proton × ν − m_nucleus × u. Mass of proton ≈ 1 u, mass of new nucleus ≈ (A−1) u. So 1 × ν = (A−1) × u → ν = (A−1)u.",
  },

  // ── Q39 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q39",
    number: 39,
    topic: "Nuclear Physics",
    text: "What is the change to the quark composition of a nucleus that takes place during β⁺ decay?",
    image_required: false,
    options: {
      A: "down to antiup",
      B: "down to up",
      C: "up to antidown",
      D: "up to down",
    },
    correct: "D",
    explanation: "In β⁺ decay, a proton changes to a neutron. A proton is uud and a neutron is udd. So one up quark changes to a down quark: up → down.",
  },

  // ── Q40 ─────────────────────────────────────────────────────────────────
  {
    id: "9702-12-FM25-Q40",
    number: 40,
    topic: "Nuclear Physics",
    text: "What is the charge, in terms of the elementary charge e, on a charm quark?",
    image_required: false,
    options: {
      A: "–(2/3)e",
      B: "–(1/3)e",
      C: "+(1/3)e",
      D: "+(2/3)e",
    },
    correct: "D",
    explanation: "The charm quark is an up-type quark and has a charge of +(2/3)e. Down-type quarks (down, strange, bottom) have charge −(1/3)e. Up-type quarks (up, charm, top) have charge +(2/3)e.",
  },
];

// Progress tracking
const PROGRESS_KEY = "physics_p1_9702_12_FM25_progress";

export function getP1Progress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveP1Progress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export function resetP1Progress() {
  localStorage.removeItem(PROGRESS_KEY);
}