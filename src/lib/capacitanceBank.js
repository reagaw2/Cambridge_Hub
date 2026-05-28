/**
 * capacitanceBank.js — capacitance question bank shim for Scheme Whisperer ingestion.
 */
export const CAPACITANCE_QUESTIONS = [
  {
    id: "w25_44_Q6ai",
    label: "Question 6(a)(i)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "State what is meant by rectification.",
    total_marks: 1,
    mark_scheme: "B1: conversion of alternating current to direct current.",
    prompt: (answer) => `Question: State what is meant by rectification. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
  {
    id: "w25_44_Q6aii",
    label: "Question 6(a)(ii)",
    paper_ref: "9702/44 · Oct/Nov 2025",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "State the name of the type of rectification produced by a bridge rectifier circuit.",
    total_marks: 1,
    mark_scheme: "B1: full-wave rectification.",
    prompt: (answer) => `Question: State the type of rectification. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
  {
    id: "9702-41-ALA26-Q6a",
    label: "Question 6(a)",
    paper_ref: "9702/41 · ALA Mock Apr 2026",
    topic: "Capacitance",
    topic_key: "capacitance",
    text: "Define the capacitance of a parallel-plate capacitor.",
    total_marks: 2,
    mark_scheme: "M1: capacitance = Q/V. A1: charge on one plate divided by pd between the plates.",
    prompt: (answer) => `Question: Define capacitance. Student answer: ${answer}`,
    response_schema: { type: "object", properties: { marks_earned: { type: "number" }, mark_1: { type: "object" }, mark_2: { type: "object" }, cambridge_insight: { type: "string" }, next_step: { type: "string" } } },
  },
];