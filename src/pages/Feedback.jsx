import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Flame } from "lucide-react";
import { recordAttempt, addToReviewBank } from "../lib/topicStore";

function RingProgress({ value, max }) {
  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  );
}

function detectSituation(feedback, isQ3, maxMarks) {
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  if (!fullMarks) return null;

  const previousScore = parseInt(sessionStorage.getItem("previous_score") ?? "-1", 10);
  const consecutiveFull = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);

  if (previousScore === 0) return "comeback";

  if (isQ3) {
    const predictionFeedback = (feedback.prediction_feedback ?? "").toLowerCase();
    const positiveWords = ["accurate", "correct", "right", "spot on", "exactly", "identified", "knew", "well done", "impressive", "strong"];
    if (positiveWords.some(w => predictionFeedback.includes(w))) return "prediction";
  }

  if (consecutiveFull >= 3) return "mastery";

  return null;
}

// Question metadata map — used to add questions to the review bank
const QUESTION_META = {
  // ── Physical Quantities & Units ────────────────────────────────────────
  "9702-22-W19-Q1a": { question_id: "9702-22-W19-Q1a", topic: "Physical Quantities & Units", question_text: "Distinguish between vector and scalar quantities.", mark_scheme: "B1: a scalar quantity has magnitude only. B1: a vector quantity has both magnitude and direction.", total_marks: 2 },
  // ── Waves ──────────────────────────────────────────────────────────────
  "9702-22-ON17-Q4a": { question_id: "9702-22-ON17-Q4a", topic: "Waves", question_text: "State the conditions required for the formation of a stationary wave.", mark_scheme: "B1: two waves travelling at the same speed in opposite directions overlap. B1: the waves are the same type and have the same frequency or wavelength.", total_marks: 2 },
  // ── Kinematics ─────────────────────────────────────────────────────────
  "9702-22-ON19-Q2a": { question_id: "9702-22-ON19-Q2a", topic: "Kinematics", question_text: "Define acceleration.", mark_scheme: "B1: change in velocity divided by time taken.", total_marks: 1 },
  "9702-23-ON24-Q1a": { question_id: "9702-23-ON24-Q1a", topic: "Kinematics", question_text: "Define acceleration.", mark_scheme: "B1: rate of change of velocity.", total_marks: 1 },
  "9702-21-MJ24-Q2a": { question_id: "9702-21-MJ24-Q2a", topic: "Kinematics", question_text: "Define velocity.", mark_scheme: "B1: change in displacement divided by time taken.", total_marks: 1 },
  "9702-23-MJ24-Q2a": { question_id: "9702-23-MJ24-Q2a", topic: "Kinematics", question_text: "Define displacement from a point.", mark_scheme: "B1: distance from the point in a straight line in a given direction.", total_marks: 1 },
  "9702-21-MJ22-Q1a": { question_id: "9702-21-MJ22-Q1a", topic: "Kinematics", question_text: "Define velocity.", mark_scheme: "B1: change in displacement divided by time taken.", total_marks: 1 },
  "9702-22-MJ22-Q3a-v2": { question_id: "9702-22-MJ22-Q3a-v2", topic: "Kinematics", question_text: "Define velocity.", mark_scheme: "B1: change in displacement divided by time taken.", total_marks: 1 },
  "9702-23-ON21-Q3a": { question_id: "9702-23-ON21-Q3a", topic: "Kinematics", question_text: "Define velocity.", mark_scheme: "B1: change in displacement divided by time taken.", total_marks: 1 },
  "9702-22-FM24-Q2a": { question_id: "9702-22-FM24-Q2a", topic: "Kinematics", question_text: "Define acceleration.", mark_scheme: "B1: rate of change of velocity.", total_marks: 1 },
  "9702-21-MJ25-Q1a": { question_id: "9702-21-MJ25-Q1a", topic: "Kinematics", question_text: "Define acceleration.", mark_scheme: "B1: rate of change of velocity.", total_marks: 1 },
  "9702-22-ON23-Q1b": { question_id: "9702-22-ON23-Q1b", topic: "Kinematics", question_text: "Under certain conditions, the distance s moved in a straight line by an object in time t is given by s = ½at² where a is the acceleration of the object. State two conditions under which the above expression applies to the motion of the object.", mark_scheme: "B1: initial speed or velocity is zero. B1: acceleration is constant or uniform and in a straight line.", total_marks: 2 },
  "9702-22-ON23-Q1ci": { question_id: "9702-22-ON23-Q1ci", topic: "Kinematics", question_text: "Compare, qualitatively, the magnitude of the acceleration of the car at time t = 8.0 s and at time t = 14.0 s.", mark_scheme: "B1: magnitude of acceleration at t = 8.0 s is less than that at t = 14.0 s.", total_marks: 1 },
  "9702-22-ON23-Q1cii-dir": { question_id: "9702-22-ON23-Q1cii-dir", topic: "Kinematics", question_text: "Compare, qualitatively, the direction of the acceleration of the car at time t = 8.0 s and at time t = 14.0 s.", mark_scheme: "B1: direction of acceleration at t = 8.0 s is opposite to that at t = 14.0 s.", total_marks: 1 },
  "9702-22-FM22-Q2a": { question_id: "9702-22-FM22-Q2a", topic: "Kinematics", question_text: "Explain, briefly, why the horizontal component of the velocity of a droplet of water remains constant as it moves from P to Q.", mark_scheme: "B1: force on droplet of water in horizontal direction is zero.", total_marks: 1 },
  "9702-22-FM22-Q2d": { question_id: "9702-22-FM22-Q2d", topic: "Kinematics", question_text: "For the movement of a droplet of water from P to Q, state and explain whether the displacement of the droplet is less than, more than or the same as the distance along its path.", mark_scheme: "B1: displacement is the straight-line distance from P to Q so less than the distance along the path.", total_marks: 1 },
  "9702-22-MJ22-Q3d": { question_id: "9702-22-MJ22-Q3d", topic: "Kinematics", question_text: "State what is represented by the gradient of the velocity-time graph.", mark_scheme: "B1: acceleration of the ball.", total_marks: 1 },
  "9702-22-MJ22-Q3ei": { question_id: "9702-22-MJ22-Q3ei", topic: "Kinematics", question_text: "A second ball is thrown with the same velocity and from the same height. The mass of the second ball is greater. Assume air resistance is negligible. Compare the magnitudes of the accelerations of the two balls.", mark_scheme: "B1: magnitudes of accelerations are equal or the same.", total_marks: 1 },
  "9702-22-MJ22-Q3eii": { question_id: "9702-22-MJ22-Q3eii", topic: "Kinematics", question_text: "A second ball is thrown with the same velocity and from the same height. The mass of the second ball is greater. Assume air resistance is negligible. Compare the speeds with which the two balls hit the ground.", mark_scheme: "B1: speeds are equal or the same.", total_marks: 1 },
  "9702-21-MJ25-Q1cii": { question_id: "9702-21-MJ25-Q1cii", topic: "Kinematics", question_text: "By considering energy, state and explain the effect of the change in release angle on the speed at which the object reaches the ground.", mark_scheme: "B1: the total initial energy is the same. B1: change in gravitational potential energy is the same so speed is the same.", total_marks: 2 },
  // ── Forces & Equilibrium ───────────────────────────────────────────────
  "9702-22-ON19-Q2bi": { question_id: "9702-22-ON19-Q2bi", topic: "Forces & Equilibrium", question_text: "Explain why the force due to air resistance acting on the ball may be neglected when calculating the time taken for the ball to reach the beam of light.", mark_scheme: "B1: weight is much greater than force due to air resistance OR air resistance is negligible compared to weight.", total_marks: 1 },
  "9702-23-ON19-Q2c": { question_id: "9702-23-ON19-Q2c", topic: "Forces & Equilibrium", question_text: "A different ball is released from the same position. This ball has the same diameter but a much lower density. The force due to air resistance cannot be neglected as the ball falls. State and explain the change, if any, to the time interval during which the beam of light is broken by the ball.", mark_scheme: "B1: average resultant force or acceleration or speed of the low density ball is less. B1: so time interval is longer.", total_marks: 2 },
  "9702-22-ON18-Q1e": { question_id: "9702-22-ON18-Q1e", topic: "Forces & Equilibrium", question_text: "In practice, significant air resistance acts on the ball. Explain why the actual time taken for the ball to reach maximum height is less than the time calculated when air resistance is assumed to be negligible.", mark_scheme: "B1: air resistance acts in opposite direction to velocity OR average resultant force is larger than weight alone.", total_marks: 1 },
  "9702-23-ON23-Q2b": { question_id: "9702-23-ON23-Q2b", topic: "Forces & Equilibrium", question_text: "The speed of the ball just after striking the wall is less than its speed just before striking the wall. State what this indicates about the nature of the collision of the ball with the wall.", mark_scheme: "B1: the collision is inelastic.", total_marks: 1 },
  "9702-21-MJ22-Q1c": { question_id: "9702-21-MJ22-Q1c", topic: "Forces & Equilibrium", question_text: "A planet has an atmosphere that causes a viscous force to act on a moving rock. State and explain the variation, if any, in the resultant force acting on the rock as it moves vertically upwards.", mark_scheme: "B1: speed or velocity decreases so viscous force decreases. B1: viscous force decreases and weight is constant so resultant force decreases.", total_marks: 2 },
  "9702-23-MJ22-Q2c": { question_id: "9702-23-MJ22-Q2c", topic: "Forces & Equilibrium", question_text: "By considering energy changes, state and explain how the final kinetic energy of the arrow as it hits the target compares with its initial kinetic energy immediately after release. A numerical calculation is not required.", mark_scheme: "M1: gravitational potential energy has decreased. A1: total energy is conserved so kinetic energy has increased.", total_marks: 2 },
  "9702-22-FM21-Q1ci": { question_id: "9702-22-FM21-Q1ci", topic: "Forces & Equilibrium", question_text: "Define force.", mark_scheme: "B1: force equals rate of change of momentum.", total_marks: 1 },
  "9702-22-FM24-Q2ci": { question_id: "9702-22-FM24-Q2ci", topic: "Forces & Equilibrium", question_text: "Describe and explain the variation of the viscous drag force acting on the diver in the water as he moves downwards.", mark_scheme: "B1: as the diver moves down their speed decreases. B1: so viscous force or drag force decreases.", total_marks: 2 },
  "9702-23-MJ21-Q2bi": { question_id: "9702-23-MJ21-Q2bi", topic: "Forces & Equilibrium", question_text: "Explain, with reference to forces acting on the stone, the shape of the speed-time curve as the stone falls.", mark_scheme: "B1: air resistance increases with speed or with time. B1: resultant force decreases as speed increases so acceleration decreases. B1: when air resistance equals the weight the speed becomes constant.", total_marks: 3 },
  "9702-21-ON22-Q2ci": { question_id: "9702-21-ON22-Q2ci", topic: "Forces & Equilibrium", question_text: "Explain why the polystyrene ball leaves the spring with a greater speed than the steel ball.", mark_scheme: "B1: same elastic potential energy or same initial kinetic energy and polystyrene ball has smaller mass so greater speed OR same average force and smaller mass so greater average acceleration so greater speed.", total_marks: 1 },
  "9702-21-ON22-Q2cii": { question_id: "9702-21-ON22-Q2cii", topic: "Forces & Equilibrium", question_text: "Explain why the polystyrene ball takes a longer time to reach the ground than the steel ball.", mark_scheme: "B1: less average vertical acceleration or smaller average vertical component of resultant force so takes longer time to reach ground.", total_marks: 1 },
  // ── Electric Fields (new) ──────────────────────────────────────────────
  "9702-23-S17-Q3a": { question_id: "9702-23-S17-Q3a", topic: "Electric Fields", question_text: "Define electric field strength.", mark_scheme: "B1: force per unit positive charge.", total_marks: 1 },
  "9702-23-S17-Q3c": { question_id: "9702-23-S17-Q3c", topic: "Electric Fields", question_text: "An α-particle moves from A to B in the electric field. Describe and explain how the change in the kinetic energy of the α-particle compares with that of the electron.", mark_scheme: "B1: charge on alpha is opposite to electron. B1: KE change of alpha is negative. B1: charge of alpha is greater so larger change in KE.", total_marks: 3 },
  "9702-23-W19-Q3a-i": { question_id: "9702-23-W19-Q3a-i", topic: "Electric Fields", question_text: "State the property of an object that experiences a force when the object is placed in a gravitational field.", mark_scheme: "B1: mass.", total_marks: 1 },
  "9702-23-W19-Q3a-ii": { question_id: "9702-23-W19-Q3a-ii", topic: "Electric Fields", question_text: "State the property of an object that experiences a force when the object is placed in an electric field.", mark_scheme: "B1: charge.", total_marks: 1 },
  "9702-23-W18-Q6a": { question_id: "9702-23-W18-Q6a", topic: "Electric Fields", question_text: "Define the coulomb.", mark_scheme: "B1: the coulomb is an ampere second.", total_marks: 1 },
  "9702-21-S18-Q7c": { question_id: "9702-21-S18-Q7c", topic: "Electric Fields", question_text: "State and briefly explain whether β⁻ particles from the same source will all follow the same path inside the electric field.", mark_scheme: "M1: beta particles have range of different speeds/energies. A1: so they follow different paths.", total_marks: 2 },
  "9702-23-W17-Q5a": { question_id: "9702-23-W17-Q5a", topic: "Electric Fields", question_text: "Define electric field strength.", mark_scheme: "B1: force per unit positive charge.", total_marks: 1 },
  "9702-23-W21-Q4f-ii": { question_id: "9702-23-W21-Q4f-ii", topic: "Electric Fields", question_text: "State and explain the differences between the electric force on the β⁻ particle and the electric force on the α-particle in the electric field.", mark_scheme: "B1: particles have opposite charges. B1: forces in opposite directions. B1: beta has less charge so less force.", total_marks: 3 },
  "9702-22-W17-Q5a": { question_id: "9702-22-W17-Q5a", topic: "Electric Fields", question_text: "Define the coulomb.", mark_scheme: "B1: the coulomb is an ampere second.", total_marks: 1 },
  "9702-22-S19-Q6a": { question_id: "9702-22-S19-Q6a", topic: "Electric Fields", question_text: "State what is meant by a field line in an electric field.", mark_scheme: "B1: the path or direction in which a free positive charge will move.", total_marks: 1 },
  "9702-22-S19-Q6b": { question_id: "9702-22-S19-Q6b", topic: "Electric Fields", question_text: "An electric field has two regions X and Y. The field strength in X is less than in Y. Describe a difference between the pattern of field lines in X and in Y.", mark_scheme: "B1: field lines closer together in Y / further apart in X.", total_marks: 1 },
  "9702-21-W18-Q5a": { question_id: "9702-21-W18-Q5a", topic: "Electric Fields", question_text: "State what is meant by an electric field.", mark_scheme: "B1: a region of space where a force acts on a stationary charge.", total_marks: 1 },
  "9702-21-W17-Q6a": { question_id: "9702-21-W17-Q6a", topic: "Electric Fields", question_text: "Define electric field strength.", mark_scheme: "B1: force per unit positive charge.", total_marks: 1 },
  "9702-21-W19-Q6a": { question_id: "9702-21-W19-Q6a", topic: "Electric Fields", question_text: "Define electric potential difference.", mark_scheme: "B1: work done per unit charge.", total_marks: 1 },
  "9702-22-M19-Q4a": { question_id: "9702-22-M19-Q4a", topic: "Electric Fields", question_text: "Define electric field strength.", mark_scheme: "B1: force per unit positive charge.", total_marks: 1 },
  // ── Nuclear Physics (new) ──────────────────────────────────────────────
  "9702-23-W21-Q4f-iii": { question_id: "9702-23-W21-Q4f-iii", topic: "Nuclear Physics", question_text: "State the name of another lepton that is produced at the same time as the β⁻ particle.", mark_scheme: "B1: electron antineutrino.", total_marks: 1 },
  "9702-21-W18-Q5c-ii": { question_id: "9702-21-W18-Q5c-ii", topic: "Nuclear Physics", question_text: "The total mass of the plutonium nucleus and the α-particle is less than that of the original nucleus X. Explain this difference in mass.", mark_scheme: "B1: mass-energy is conserved. B1: energy released as gamma radiation / KE of alpha / KE of plutonium.", total_marks: 2 },
  // ── Forces & Equilibrium ───────────────────────────────────────────────
  "9702-22-MJ24-Q2ci": { question_id: "9702-22-MJ24-Q2ci", topic: "Forces & Equilibrium", question_text: "Describe and explain the variation with time of the magnitude of the acceleration of the skydiver between time t₂ and time t₃.", mark_scheme: "B1: drag force decreases as speed decreases. B1: as speed decreases resultant force decreases so magnitude of acceleration decreases to zero.", total_marks: 2 },
  "q1": {
    question_id: "q1",
    topic: "Gravitational Fields",
    question_text: "Describe the gravitational field in the region close to the surface of a planet.",
    mark_scheme: "B1: radial field. B1: directed towards centre of planet.",
    total_marks: 2
  },
  "q2": {
    question_id: "q2",
    topic: "Gravitational Fields",
    question_text: "Explain why the gravitational field strength g can be considered constant close to the surface of a planet.",
    mark_scheme: "B1: changes in height are much smaller than radius of planet. B1: so (radius + height)² ≈ radius².",
    total_marks: 2
  },
  "q3": {
    question_id: "q3",
    topic: "Gravitational Fields",
    question_text: "A student states that the gravitational field strength at the surface of a planet is 9.81 N kg⁻¹. State what is meant by gravitational field strength.",
    mark_scheme: "B1: force per unit mass.",
    total_marks: 1
  },
  "w25_44_Q8a": {
    question_id: "w25_44_Q8a",
    topic: "Nuclear Physics",
    question_text: "State what is meant by a tracer.",
    mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.",
    total_marks: 2
  },
  "w25_44_Q8bii": {
    question_id: "w25_44_Q8bii",
    topic: "Nuclear Physics",
    question_text: "In the decay equation of oxygen-15, a particle Z is produced alongside the daughter nucleus and a positron. State the name of particle Z.",
    mark_scheme: "B1: electron neutrino.",
    total_marks: 1
  },
  "w25_44_Q8ci": {
    question_id: "w25_44_Q8ci",
    topic: "Nuclear Physics",
    question_text: "Define the activity of a sample.",
    mark_scheme: "B1: number of nuclear disintegrations per unit time.",
    total_marks: 1
  },
  "w25_44_Q1a": {
    question_id: "w25_44_Q1a",
    topic: "Gravitational Fields",
    question_text: "State Newton's law of gravitation.",
    mark_scheme: "B1: proportional to product of masses. B1: inversely proportional to square of separation.",
    total_marks: 2
  },
  "w25_44_Q2ai": {
    question_id: "w25_44_Q2ai",
    topic: "Thermal Physics",
    question_text: "The equation of state for an ideal gas is pV = NkT. State the meaning of each of the symbols p, V, N, k and T.",
    mark_scheme: "B1: p = pressure, V = volume, k = Boltzmann constant. B1: N = number of molecules. B1: T = thermodynamic temperature.",
    total_marks: 3
  },
  "w25_44_Q3a": {
    question_id: "w25_44_Q3a",
    topic: "Thermal Physics",
    question_text: "With reference to molecular kinetic energy and molecular potential energy, explain what is meant by the internal energy of an ideal gas.",
    mark_scheme: "B1: total kinetic energy associated with random motion of molecules. B1: potential energy of molecules is zero for an ideal gas.",
    total_marks: 2
  },
  "w25_44_Q4a": {
    question_id: "w25_44_Q4a",
    topic: "Oscillations",
    question_text: "State what is meant by the frequency of the oscillations of an oscillating object.",
    mark_scheme: "B1: number of oscillations per unit time.",
    total_marks: 1
  },
  "w25_44_Q4biv": {
    question_id: "w25_44_Q4biv",
    topic: "Oscillations",
    question_text: "Describe the interchange between kinetic energy and potential energy during the oscillations.",
    mark_scheme: "B1: kinetic energy maximum at zero displacement. B1: potential energy zero at zero displacement. B1: kinetic energy plus potential energy is constant.",
    total_marks: 3
  },
  "w25_44_Q5a": {
    question_id: "w25_44_Q5a",
    topic: "Electric Fields",
    question_text: "Explain why the electric potential near an isolated proton is positive.",
    mark_scheme: "B1: potential defined as zero at infinity. B1: proton has positive charge and repels another positive charge. B1: work done moving positive charges together.",
    total_marks: 3
  },
  "w25_44_Q6ai": {
    question_id: "w25_44_Q6ai",
    topic: "Capacitance",
    question_text: "State what is meant by rectification.",
    mark_scheme: "B1: conversion of alternating current to direct current.",
    total_marks: 1
  },
  "w25_44_Q6aii": {
    question_id: "w25_44_Q6aii",
    topic: "Capacitance",
    question_text: "State the name of the type of rectification produced by a bridge rectifier circuit.",
    mark_scheme: "B1: full-wave rectification.",
    total_marks: 1
  },
  "w25_44_Q7a": {
    question_id: "w25_44_Q7a",
    topic: "Electromagnetic Induction",
    question_text: "State Lenz's law of electromagnetic induction.",
    mark_scheme: "M1: direction of induced e.m.f. A1: is such as to produce effects that oppose the change that caused it.",
    total_marks: 2
  },
  "w25_44_Q9a": {
    question_id: "w25_44_Q9a",
    topic: "Quantum Physics",
    question_text: "State what is meant by the photoelectric effect.",
    mark_scheme: "M1: emission of electrons from a metal surface. A1: when electromagnetic radiation is incident on the surface.",
    total_marks: 2
  },
  "w25_44_Q10a": {
    question_id: "w25_44_Q10a",
    topic: "Astrophysics",
    question_text: "State what is meant by redshift.",
    mark_scheme: "B1: recession of galaxy causes emitted light to shift. B1: increase in observed wavelength or decrease in observed frequency.",
    total_marks: 2
  },
  "w25_44_Q10b": {
    question_id: "w25_44_Q10b",
    topic: "Astrophysics",
    question_text: "Explain how observations of redshift lead to the idea that the universe is expanding.",
    mark_scheme: "B1: distant galaxies show redshift so galaxies are moving apart. B1: galaxies moving apart means universe is expanding.",
    total_marks: 2
  },
  "w25_44_Q10c": {
    question_id: "w25_44_Q10c",
    topic: "Astrophysics",
    question_text: "Explain how Hubble's law leads to the Big Bang theory of the origin of the universe.",
    mark_scheme: "B1: speed of recession proportional to distance. B1+B1: any two of — more distant galaxies represent further back in time; all matter was once very close together; all matter was once moving apart very fast.",
    total_marks: 3
  },
  "9702-41-ALA26-Q1a": {
    question_id: "9702-41-ALA26-Q1a",
    topic: "Gravitational Fields",
    question_text: "State Newton's law of gravitation.",
    mark_scheme: "B1: force proportional to product of masses and inversely proportional to square of separation. B1: force acts between point masses.",
    total_marks: 2
  },
  "9702-41-ALA26-Q1bi": {
    question_id: "9702-41-ALA26-Q1bi",
    topic: "Gravitational Fields",
    question_text: "Each planet orbits at constant speed. Explain whether the planets are in equilibrium.",
    mark_scheme: "B1: direction of motion changes so there is acceleration / resultant force — therefore NOT in equilibrium.",
    total_marks: 1
  },
  "9702-41-ALA26-Q2a": {
    question_id: "9702-41-ALA26-Q2a",
    topic: "Thermal Physics",
    question_text: "Use one of the assumptions of the kinetic theory of gases to explain why the potential energy of the molecules of an ideal gas is zero.",
    mark_scheme: "B1: no intermolecular forces so no potential energy.",
    total_marks: 1
  },
  "9702-41-ALA26-Q2bi": {
    question_id: "9702-41-ALA26-Q2bi",
    topic: "Thermal Physics",
    question_text: "State the meaning of the symbol mean square speed in the expression for average translational kinetic energy.",
    mark_scheme: "B1: mean square speed of the molecules.",
    total_marks: 1
  },
  "9702-41-ALA26-Q2bii": {
    question_id: "9702-41-ALA26-Q2bii",
    topic: "Thermal Physics",
    question_text: "In the expression EK = (3/2)kT, state the meaning of the symbol T.",
    mark_scheme: "B1: kelvin / thermodynamic / absolute temperature.",
    total_marks: 1
  },
  "9702-41-ALA26-Q3a": {
    question_id: "9702-41-ALA26-Q3a",
    topic: "Thermal Physics",
    question_text: "State what is meant by specific latent heat.",
    mark_scheme: "B1: thermal energy per unit mass to change state. B1: at constant temperature.",
    total_marks: 2
  },
  "9702-41-ALA26-Q3bii": {
    question_id: "9702-41-ALA26-Q3bii",
    topic: "Thermal Physics",
    question_text: "Explain why, although the power of the heater is changed, the rate of loss of thermal energy to the surroundings may be assumed to be constant.",
    mark_scheme: "B1: temperature difference between liquid and surroundings does not change so rate of heat loss is the same.",
    total_marks: 1
  },
  "9702-41-ALA26-Q4a": {
    question_id: "9702-41-ALA26-Q4a",
    topic: "Oscillations",
    question_text: "State, by reference to simple harmonic motion, what is meant by angular frequency.",
    mark_scheme: "B1: angular frequency = 2π × frequency or 2π / period.",
    total_marks: 1
  },
  "9702-41-ALA26-Q4bii": {
    question_id: "9702-41-ALA26-Q4bii",
    topic: "Oscillations",
    question_text: "Show that the load on the metal strip is undergoing simple harmonic motion.",
    mark_scheme: "B1: displacement measured from equilibrium. B1: acceleration proportional to displacement. B1: acceleration and displacement in opposite directions.",
    total_marks: 3
  },
  "9702-41-ALA26-Q5a": {
    question_id: "9702-41-ALA26-Q5a",
    topic: "Electric Fields",
    question_text: "State the relationship between electric field and electric potential.",
    mark_scheme: "M1: E = negative potential gradient. A1: field points in direction of decreasing potential.",
    total_marks: 2
  },
  "9702-41-ALA26-Q5b": {
    question_id: "9702-41-ALA26-Q5b",
    topic: "Electric Fields",
    question_text: "Explain why it is NOT possible for the total electric potential and the resultant electric field to simultaneously be zero at point P.",
    mark_scheme: "B1: for V=0 charges must be opposite signs. B1: for E=0 charges must be same sign. B1: contradiction — impossible simultaneously.",
    total_marks: 3
  },
  "9702-41-ALA26-Q6a": {
    question_id: "9702-41-ALA26-Q6a",
    topic: "Capacitance",
    question_text: "Define the capacitance of a parallel-plate capacitor.",
    mark_scheme: "M1: C = Q/V. A1: Q is charge on one plate, V is p.d. between the plates.",
    total_marks: 2
  },
  "9702-41-ALA26-Q8ai": {
    question_id: "9702-41-ALA26-Q8ai",
    topic: "Astrophysics",
    question_text: "A distant galaxy is moving away from the Earth. Explain how the positions of the lines in the emission spectrum seen by an observer on the Earth differ from the original positions.",
    mark_scheme: "B1: movement causes change in observed frequency / redshift. B1: observed frequency lower / lines shift to longer wavelength.",
    total_marks: 2
  },
  "9702-41-ALA26-Q11a": {
    question_id: "9702-41-ALA26-Q11a",
    topic: "Astrophysics",
    question_text: "State what is meant by the luminosity of a star.",
    mark_scheme: "B1: total power of radiation emitted by the star.",
    total_marks: 1
  },
  "9702-41-ALA26-Q9a": {
    question_id: "9702-41-ALA26-Q9a",
    topic: "Nuclear Physics",
    question_text: "Polonium-211 decays by alpha emission to form a stable isotope of lead. Write a complete nuclear equation for this decay.",
    mark_scheme: "B1: Pb-207, proton number 82. B1: alpha particle mass 4, proton number 2.",
    total_marks: 2
  },
  "9702-41-ALA26-Q9cii": {
    question_id: "9702-41-ALA26-Q9cii",
    topic: "Nuclear Physics",
    question_text: "Suggest why the total amount of energy released by the decay process is greater than the energy given to the alpha particles alone.",
    mark_scheme: "B1: lead nuclei have recoil kinetic energy OR gamma photons are also emitted.",
    total_marks: 1
  }
};

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback, isQ2, isQ3, student_prediction, isReview,
    topicKey, questionId, nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  // Fall back to gravitational fields defaults for backwards compat
  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/physics";

  // Derive maxMarks strictly from QUESTION_META when questionId is present
  const metaEntry = questionId ? QUESTION_META[questionId] : null;
  const maxMarks = metaEntry ? metaEntry.total_marks : (isQ3 ? 1 : 2);

  console.log("[Feedback] questionId:", questionId, "| maxMarks:", maxMarks, "| metaEntry:", metaEntry);
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;

  // Hooks must be called unconditionally
  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });
        if (!fullMarks && questionId && QUESTION_META[questionId]) {
          addToReviewBank({
            ...QUESTION_META[questionId],
            first_attempt_score: marksEarned,
            first_attempt_feedback: feedback.cambridge_insight ?? "",
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) return null;

  const marks = [feedback.mark_1, feedback.mark_2, feedback.mark_3].filter(Boolean);

  function handleNext() {
    // If coming from review session, go back to review
    if (isReview) {
      navigate("/review");
      return;
    }

    sessionStorage.setItem("previous_score", String(marksEarned));

    if (fullMarks) {
      const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + 1;
      const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1;
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm));

      const situation = detectSituation(feedback, isQ3, maxMarks);

      // Use passed nextFullRoute, or fall back to old GF logic
      const nextDest = nextFullRoute ?? (isQ3 ? "/physics" : fmc === 1 ? "/similar-question" : "/familiarity-check");

      const topicDisplayName = metaEntry?.topic ?? resolvedTopicKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      if (situation) {
        navigate("/reflection", { state: { situation, nextDest, feedbackState: state, topicName: topicDisplayName } });
      } else {
        navigate(nextDest);
      }
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      const retryDest = nextRetryRoute ?? (isQ3 ? resolvedBack : isQ2 ? "/similar-question" : "/physics");
      navigate(retryDest);
    }
  }

  const buttonLabel = isReview ? (fullMarks ? "Next review question →" : "Try again") : (fullMarks ? "Try a similar question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">CAIE Physics</span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44 · May/Jun 2025"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">

          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
            <RingProgress value={marksEarned} max={maxMarks} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Marks earned</p>
              <p className="font-mono text-sm text-foreground/60">{marksEarned} out of {maxMarks}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mark Breakdown</h3>
            {marks.map((mark, i) => (
              <div key={i} className={`pl-4 border-l-2 ${mark.earned ? "border-primary" : "border-red-400/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {mark.earned
                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />
                  }
                  <span className="font-mono text-xs text-muted-foreground">B1 — "{mark.keyword}"</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{mark.feedback}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-l-4 border-border border-l-primary rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Cambridge Insight</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback.cambridge_insight}</p>
          </div>

          {isQ3 && student_prediction && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Prediction</h3>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Next Step</p>
            <p className="text-sm text-primary leading-relaxed font-medium">{feedback.next_step}</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {buttonLabel}
          </button>

          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Answer contributes to your streak</span>
          </div>

        </div>
      </div>
    </div>
  );
}