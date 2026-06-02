import { getSessionUserId } from "@/lib/userSession";

function localKey(paperId) {
  return `p1_scratch_${getSessionUserId()}_${(paperId ?? "").replace(/[\/\s]/g, "_")}`;
}

function readLocal(paperId) {
  try { return JSON.parse(localStorage.getItem(localKey(paperId)) ?? "{}"); } catch { return {}; }
}

function writeLocal(paperId, data) {
  try { localStorage.setItem(localKey(paperId), JSON.stringify(data)); } catch {}
}

export async function loadScratchpadForPaper(_paperId) {
  // No remote sync — strokes are ephemeral scratch work
}

export function getStrokesForQuestion(paperId, questionId, side) {
  const paperData = readLocal(paperId);
  return paperData?.[questionId]?.[side] ?? [];
}

export function saveStrokes(paperId, questionId, side, strokes) {
  const paperData = readLocal(paperId);
  if (!paperData[questionId]) paperData[questionId] = {};
  paperData[questionId][side] = strokes;
  writeLocal(paperId, paperData);
}