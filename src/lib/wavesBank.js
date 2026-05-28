/**
 * wavesBank.js — waves question bank shim for Scheme Whisperer ingestion.
 */
export const WAVES_QUESTIONS = [
  {
    id: "9702-22-ON17-Q4a",
    label: "Question 4(a)",
    paper_ref: "9702/22 · Oct/Nov 2017",
    topic: "Waves",
    topic_key: "waves",
    text: "State the conditions required for the formation of a stationary wave.",
    total_marks: 2,
    mark_scheme: "B1: two waves travelling at the same speed in opposite directions overlap. B1: the waves are the same type and have the same frequency or wavelength.",
    prompt: (answer) => `Question: State the conditions for a stationary wave. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, mark_2: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
];