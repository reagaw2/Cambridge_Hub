const KEY = "written_starred_questions_v1";

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function writeAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function isStarred(questionId) {
  return !!readAll()[questionId];
}

export function starQuestion(questionId, { topic = "", questionText = "", markScheme = "", feedback = null, answer = "" } = {}) {
  const all = readAll();
  all[questionId] = {
    questionId,
    topic,
    questionText,
    markScheme,
    feedback,
    answer,
    teacherQuestion: all[questionId]?.teacherQuestion ?? "",
    teacherResponse: all[questionId]?.teacherResponse ?? "",
    starredAt: new Date().toISOString(),
  };
  writeAll(all);
  return all;
}

export function unstarQuestion(questionId) {
  const all = readAll();
  delete all[questionId];
  writeAll(all);
  return all;
}

export function saveTeacherQuestion(questionId, teacherQuestion) {
  const all = readAll();
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherQuestion };
    writeAll(all);
  }
  return all;
}

export function saveTeacherResponse(questionId, teacherResponse) {
  const all = readAll();
  if (all[questionId]) {
    all[questionId] = { ...all[questionId], teacherResponse };
    writeAll(all);
  }
  return all;
}

export function getAllStarred() {
  return Object.values(readAll()).sort((a, b) => new Date(a.starredAt) - new Date(b.starredAt));
}