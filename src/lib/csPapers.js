/**
 * csPapers.js — CS exam paper registry for Exam Mode.
 * Each paper entry pulls real question objects from the CS practice banks
 * so that prompts, mark schemes, and schemas are always in sync.
 *
 * TIME: 90 seconds per mark (CS Paper 1 comfort margin).
 * Add new papers here as more sessions are extracted.
 */

import { DATA_REP_QUESTIONS } from "@/lib/csDataRepBank";
import { NETWORKS_QUESTIONS } from "@/lib/csNetworksBank";
import { DATA_SECURITY_QUESTIONS } from "@/lib/csDataSecurityBank";
import { COMP_QUESTIONS } from "@/lib/csCompAndCompBank";
import { ETHICS_QUESTIONS } from "@/lib/csEthicsBank";
import { DATA_INTEGRITY_QUESTIONS } from "@/lib/csDataIntegrityBank";
import { LT_QUESTIONS } from "@/lib/csLTBank";
import { OS_QUESTIONS } from "@/lib/csOSBank";

/** All CS bank arrays combined — used for lookup by ID */
const ALL_CS_QUESTIONS = [
  ...DATA_REP_QUESTIONS,
  ...NETWORKS_QUESTIONS,
  ...DATA_SECURITY_QUESTIONS,
  ...COMP_QUESTIONS,
  ...ETHICS_QUESTIONS,
  ...DATA_INTEGRITY_QUESTIONS,
  ...LT_QUESTIONS,
  ...OS_QUESTIONS,
];

function findQ(id) {
  const q = ALL_CS_QUESTIONS.find(q => q.id === id);
  if (!q) throw new Error(`CS exam: question "${id}" not found in banks`);
  return q;
}

// ── 9618/13 · Oct/Nov 2025 ────────────────────────────────────────────────
const N25_13_IDS = [
  "Q_9618_13_N25_001",  // Data Representation — 2 marks
  "Q_9618_13_N25_002",  // Data Representation — 2 marks
  "Q_9618_13_N25_003",  // Networks           — 3 marks
  "Q_9618_13_N25_004",  // Networks           — 1 mark
  "Q_9618_13_N25_005",  // Data Security      — 4 marks
  "Q_9618_13_N25_006",  // Computers          — 4 marks
  "Q_9618_13_N25_007",  // Ethics             — 2 marks
  "Q_9618_13_N25_008",  // Data Integrity     — 3 marks
  "Q_9618_13_N25_009",  // Computers          — 4 marks
  "Q_9618_13_N25_010",  // Language Trans.    — 2 marks
  "Q_9618_13_N25_011",  // Language Trans.    — 3 marks
  "Q_9618_13_N25_012",  // Operating Systems  — 3 marks
];

export const CS_PAPERS = [
  {
    id: "9618/13/O/N/25",
    subject: "cs",
    session: "Nov 2025",
    variant: "13",
    code: "9618",
    displayName: "9618/13 · Nov 2025",
    paperLabel: "13 — Theory Fundamentals",
    secondsPerMark: 90,
    questions: N25_13_IDS.map(findQ),
  },
  // Add more CS papers here as new sessions are extracted
];

/** Lookup a CS paper by its ID */
export function getCSPaper(paperId) {
  return CS_PAPERS.find(p => p.id === paperId) ?? null;
}

export const CS_EXAM_SESSIONS = ["Nov 2025"];
export const CS_EXAM_VARIANTS = ["13"];