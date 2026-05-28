/**
 * oscillationsBank.js — re-export shim
 * The oscillations questions live as inline objects in each topic page.
 * This bank collects the ones already declared in their dedicated pages
 * for use by the Scheme Whisperer ingestion.
 */

// Questions already declared in their individual page files — collected here
// for bulk ingestion into Supabase via the Scheme Whisperer.
export const OSCILLATIONS_QUESTIONS = [
  {
    id: "w25_44_Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "State what is meant by the frequency of the oscillations of an oscillating object.",
    total_marks: 1,
    mark_scheme: "B1: number of oscillations per unit time.",
    prompt: (answer) => `Question: State what is meant by the frequency of the oscillations of an oscillating object. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
  {
    id: "w25_44_Q4biv",
    label: "Question 4(b)(iv)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Describe the interchange between kinetic energy and potential energy during the oscillations.",
    total_marks: 3,
    mark_scheme: "B1: kinetic energy maximum at zero displacement. B1: potential energy zero at zero displacement. B1: kinetic plus potential energy is constant.",
    prompt: (answer) => `Question: Describe the interchange between kinetic energy and potential energy. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, mark_2: { type: "object" }, mark_3: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
  {
    id: "9702-41-ALA26-Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "State, by reference to simple harmonic motion, what is meant by angular frequency.",
    total_marks: 1,
    mark_scheme: "B1: 2π times frequency OR 2π divided by period.",
    prompt: (answer) => `Question: State what is meant by angular frequency. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
  {
    id: "9702-41-ALA26-Q4bii",
    label: "Question 4(b)(ii)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Oscillations",
    topic_key: "oscillations",
    text: "Show that the load on the metal strip is undergoing simple harmonic motion.",
    total_marks: 3,
    mark_scheme: "B1: displacement measured from equilibrium. B1: acceleration proportional to displacement. B1: acceleration and displacement in opposite directions.",
    prompt: (answer) => `Question: Show that the load is undergoing SHM. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, mark_2: { type: "object" }, mark_3: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
];